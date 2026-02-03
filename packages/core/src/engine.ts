/**
 * Engine - Core replay loop
 *
 * @description Computes WorldState at time t by applying timeline events.
 * Now uses modular handlers from ./engine/handlers/.
 *
 * Dev Mode (browser console):
 *   window.__TOKOVO_LOG_EVENTS = true;  // Log events
 *   window.__TOKOVO_LOG_PERF = true;    // Log timing
 */

import { produce } from "immer";
import {
  TimelineEvent,
  WorldState,
  DEFAULT_BASE_CAMERA_STATE,
  DEFAULT_CAMERA_TRANSFORM,
  DEFAULT_AUDIO_STATE,
} from "./types";
import type { CameraTransform } from "./types/camera";
import { getConfig, TokovoConfigType, getNotificationsConfig } from "./config";

let cachedConfig: TokovoConfigType | null = null;

function getCachedConfig(): TokovoConfigType {
  if (!cachedConfig) {
    cachedConfig = getConfig();
  }
  return cachedConfig;
}

export function invalidateConfigCache(): void {
  cachedConfig = null;
}
import {
  EventIndex,
  KeyframedEventIndex,
  getEventsUpTo,
  getEventsUpToKeyframed,
  getEventsInRange,
} from "./utils/event-utils";
import {
  StateCache,
  getCachedStateForFrame,
  cacheStateAtKeyframe,
} from "./utils/state-cache";

import { ReducerRegistry } from "./engine/registry";
import { createScopedLogger } from "./logger";
import {
  processCameraEvent,
  handleAutoSounds,
  cleanupExpiredSounds,
  HandlerContext,
} from "./engine/handlers";
import {
  EventHandlerRegistry,
  EventHandlerContext,
} from "./engine/event-handlers";
import { MiddlewareRegistry, MiddlewareContext } from "./engine/middleware";
import { LifecycleManager, LifecycleContext } from "./engine/lifecycle";
import {
  hasBuiltInHandler,
  getBuiltInHandler,
} from "./engine/built-in-handlers";

const log = createScopedLogger("engine");
const sortedEventCache = new WeakMap<TimelineEvent[], TimelineEvent[]>();

export { ReducerRegistry } from "./engine/registry";
export type {
  DeviceReducer,
  AppReducer,
  FeatureReducer,
} from "./engine/registry";
export { EngineConfig } from "./engine/config";
export { EngineLogger } from "./engine/logger";
export {
  createEventIndex,
  createKeyframedEventIndex,
  type KeyframedEventIndex,
} from "./utils/event-utils";
export {
  createStateCache,
  getCachedStateForFrame,
  cacheStateAtKeyframe,
  invalidateCacheAfter,
  clearStateCache,
  type StateCache,
} from "./utils/state-cache";

// =============================================================================
// REPLAY CONTEXT
// =============================================================================

/**
 * Context for replay execution with mode-based error handling.
 */
export interface ReplayContext {
  mode: "preview" | "render";
  gracefulDegradation?: boolean;
  fps?: number;
  errors?: Array<{
    event: TimelineEvent;
    error: Error;
    frame: number;
    skipped: boolean;
  }>;
  stats?: {
    totalEvents: number;
    processedEvents: number;
    skippedEvents: number;
  };
}

/**
 * Plugin error wrapper for better debugging
 */
export class PluginError extends Error {
  constructor(
    public pluginId: string,
    public event: TimelineEvent,
    public cause: Error,
  ) {
    super(
      `[${pluginId}] Reducer failed at frame ${event.at}: ${cause.message}`,
    );
    this.name = "PluginError";
  }
}

const DEFAULT_REPLAY_CONTEXT: ReplayContext = { mode: "preview" };

// =============================================================================
// REPLAY FUNCTION
// =============================================================================

/**
 * Replay function - computes WorldState at time t by applying all events.
 *
 * DETERMINISM CONTRACT:
 * Given same `initial`, `events`, and `t`, output is always identical.
 * No side effects except dev logging.
 *
 * @param initial - Initial world state
 * @param events - Events to apply
 * @param t - Target frame number
 * @param ctx - Optional context with mode for error handling
 * @param eventIndex - Optional pre-computed index for O(1) event lookup
 */
export function replay(
  initial: WorldState,
  events: TimelineEvent[],
  t: number,
  ctx: ReplayContext = DEFAULT_REPLAY_CONTEXT,
  eventIndex?: EventIndex,
): WorldState {
  if (t < 0) {
    log.warn(`Replay called with negative t: ${t}, using t=0`);
    t = 0;
  }

  if (!events || events.length === 0) {
    return ensureInitialState(initial);
  }

  const lifecycleCtx: LifecycleContext = { frame: t, mode: ctx.mode };
  LifecycleManager.notifyBeforeReplay(lifecycleCtx);

  if (!initial) {
    log.warn("Replay called with undefined initial state");
    const emptyState = {
      devices: {},
      appState: {},
      camera: { ...DEFAULT_BASE_CAMERA_STATE },
      audio: { ...DEFAULT_AUDIO_STATE },
    };
    LifecycleManager.notifyAfterReplay(emptyState, lifecycleCtx);
    return emptyState;
  }

  // Ensure initial state has proper camera and audio state
  const initialWithCamera: WorldState = {
    ...initial,
    camera: initial.camera
      ? { ...DEFAULT_BASE_CAMERA_STATE, ...initial.camera }
      : { ...DEFAULT_BASE_CAMERA_STATE },
    audio: initial.audio || { ...DEFAULT_AUDIO_STATE },
  };

  // Filter events up to current time - use index if provided for O(1) lookup
  const relevant = eventIndex
    ? getEventsUpTo(eventIndex, t)
    : getSortedEvents(events).filter((e) => e.at <= t);

  // Apply all events and finalize in a single Immer produce (perf: avoids double structural sharing)
  const finalState = produce(initialWithCamera, (draft) => {
    // Pre-allocate context objects once (perf: avoid allocation per event)
    const handlerCtx: HandlerContext = {
      frame: t,
      eventIndex: 0,
      mode: ctx.mode,
      fps: ctx.fps ?? 30,
    };
    const registryCtx: EventHandlerContext = {
      frame: t,
      eventIndex: 0,
      mode: ctx.mode,
    };
    const middlewareCtx: MiddlewareContext = {
      frame: t,
      eventIndex: 0,
      mode: ctx.mode,
      gracefulDegradation: ctx.gracefulDegradation,
    };

    // Process all events
    for (let i = 0; i < relevant.length; i++) {
      const event = relevant[i];
      // Mutate index only (perf: reuse context objects)
      handlerCtx.eventIndex = i;
      registryCtx.eventIndex = i;
      middlewareCtx.eventIndex = i;

      try {
        processEventWithMiddleware(
          draft,
          event,
          t,
          ctx,
          handlerCtx,
          registryCtx,
          middlewareCtx,
        );
      } catch (error) {
        const eventWithAppId = event as TimelineEvent & { appId?: string };
        const pluginId = eventWithAppId.appId || event.kind;

        if (ctx.mode === "render" && !ctx.gracefulDegradation) {
          throw new PluginError(
            pluginId,
            event,
            error instanceof Error ? error : new Error(String(error)),
          );
        } else {
          log.error(`Event handler failed at frame ${event.at}`, error, {
            pluginId,
            eventKind: event.kind,
          });
          if (ctx.errors) {
            ctx.errors.push({
              event,
              error: error instanceof Error ? error : new Error(String(error)),
              frame: event.at,
              skipped: true,
            });
          }
        }
      }
    }

    // Finalize state inline (merged from separate produce call)
    const config = getCachedConfig();
    // Only filter activeEffects if it exists (extended CameraState from device-camera)
    const cameraWithEffects = draft.camera as {
      activeEffects?: Array<{ endFrame: number }>;
    };
    if (Array.isArray(cameraWithEffects.activeEffects)) {
      cameraWithEffects.activeEffects = cameraWithEffects.activeEffects.filter(
        (effect) => t <= effect.endFrame + config.timing.effectCleanupBuffer,
      );
    }

    if (!draft.camera.deviceTransforms) {
      draft.camera.deviceTransforms = {};
    }

    // Use for...in to avoid Object.keys() allocation
    let firstDeviceId: string | undefined;
    for (const deviceId in draft.devices) {
      if (Object.hasOwn(draft.devices, deviceId)) {
        if (!firstDeviceId) firstDeviceId = deviceId;
        draft.camera.deviceTransforms[deviceId] =
          DEFAULT_CAMERA_TRANSFORM as CameraTransform;
      }
    }

    const activeDeviceId = draft.camera.activeDeviceId || firstDeviceId;
    draft.camera.transform = activeDeviceId
      ? draft.camera.deviceTransforms[activeDeviceId] ||
        DEFAULT_CAMERA_TRANSFORM
      : DEFAULT_CAMERA_TRANSFORM;
  });

  LifecycleManager.notifyAfterReplay(finalState, lifecycleCtx);
  return finalState;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Create default initial world state
 */
export function createInitialWorld(
  partial: Partial<WorldState> = {},
): WorldState {
  return {
    devices: {},
    appState: {},
    camera: { ...DEFAULT_BASE_CAMERA_STATE },
    audio: { ...DEFAULT_AUDIO_STATE },
    ...partial,
  };
}

export { handleAutoSounds };

export function replayIncremental(
  initial: WorldState,
  events: TimelineEvent[],
  t: number,
  ctx: ReplayContext = DEFAULT_REPLAY_CONTEXT,
  eventIndex?: KeyframedEventIndex,
  stateCache?: StateCache,
): WorldState {
  if (t < 0) {
    log.warn(`replayIncremental called with negative t: ${t}, using t=0`);
    t = 0;
  }

  if (!events || events.length === 0) {
    return ensureInitialState(initial);
  }

  if (!eventIndex || !stateCache) {
    return replay(initial, events, t, ctx, eventIndex);
  }

  const lifecycleCtx: LifecycleContext = { frame: t, mode: ctx.mode };
  LifecycleManager.notifyBeforeReplay(lifecycleCtx);

  const cached = getCachedStateForFrame(stateCache, t);
  if (cached && cached.fromFrame === t) {
    LifecycleManager.notifyAfterReplay(cached.state, lifecycleCtx);
    return cached.state;
  }

  let startState: WorldState;
  let startFrame: number;
  let eventsToApply: TimelineEvent[];

  if (cached) {
    startState = cached.state;
    startFrame = cached.fromFrame;
    eventsToApply = getEventsInRange(eventIndex, startFrame + 1, t);
  } else {
    startState = ensureInitialState(initial);
    startFrame = -1;
    eventsToApply = getEventsUpToKeyframed(eventIndex, t);
  }

  if (eventsToApply.length === 0 && cached) {
    const result = finalizeState(cached.state, t);
    LifecycleManager.notifyAfterReplay(result, lifecycleCtx);
    return result;
  }

  const stateAfterEvents = produce(startState, (draft) => {
    const handlerCtx: HandlerContext = {
      frame: t,
      eventIndex: 0,
      mode: ctx.mode,
      fps: ctx.fps ?? 30,
    };
    const registryCtx: EventHandlerContext = {
      frame: t,
      eventIndex: 0,
      mode: ctx.mode,
    };
    const middlewareCtx: MiddlewareContext = {
      frame: t,
      eventIndex: 0,
      mode: ctx.mode,
    };

    for (let i = 0; i < eventsToApply.length; i++) {
      const event = eventsToApply[i];
      handlerCtx.eventIndex = i;
      registryCtx.eventIndex = i;
      middlewareCtx.eventIndex = i;

      try {
        processEventWithMiddleware(
          draft,
          event,
          t,
          ctx,
          handlerCtx,
          registryCtx,
          middlewareCtx,
        );
      } catch (error) {
        handleEventError(error, event, ctx);
      }
    }
  });

  const finalState = finalizeState(stateAfterEvents, t);
  cacheStateAtKeyframe(stateCache, t, finalState);

  LifecycleManager.notifyAfterReplay(finalState, lifecycleCtx);
  return finalState;
}

function ensureInitialState(initial: WorldState): WorldState {
  if (!initial) {
    return {
      devices: {},
      appState: {},
      camera: { ...DEFAULT_BASE_CAMERA_STATE },
      audio: { ...DEFAULT_AUDIO_STATE },
    };
  }

  return {
    ...initial,
    camera: initial.camera
      ? { ...DEFAULT_BASE_CAMERA_STATE, ...initial.camera }
      : { ...DEFAULT_BASE_CAMERA_STATE },
    audio: initial.audio || { ...DEFAULT_AUDIO_STATE },
  };
}

function getSortedEvents(events: TimelineEvent[]): TimelineEvent[] {
  const cached = sortedEventCache.get(events);
  if (cached) {
    return cached;
  }

  if (events.length <= 1 || isSortedByFrame(events)) {
    sortedEventCache.set(events, events);
    return events;
  }

  const withIndex = events.map((event, index) => ({ event, index }));
  withIndex.sort((a, b) => {
    if (a.event.at !== b.event.at) {
      return a.event.at - b.event.at;
    }
    const orderA = getDeclarationOrder(a.event, a.index);
    const orderB = getDeclarationOrder(b.event, b.index);
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.index - b.index;
  });

  const sorted = withIndex.map((entry) => entry.event);
  sortedEventCache.set(events, sorted);
  return sorted;
}

function isSortedByFrame(events: TimelineEvent[]): boolean {
  let lastAt = -Infinity;
  let lastOrder = -Infinity;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const order = getDeclarationOrder(event, i);
    if (event.at < lastAt) {
      return false;
    }
    if (event.at === lastAt && order < lastOrder) {
      return false;
    }
    lastAt = event.at;
    lastOrder = order;
  }

  return true;
}

function getDeclarationOrder(event: TimelineEvent, fallback: number): number {
  const order = (event as { _declarationOrder?: number })._declarationOrder;
  return typeof order === "number" && Number.isFinite(order) ? order : fallback;
}

function handleEventError(
  error: unknown,
  event: TimelineEvent,
  ctx: ReplayContext,
): void {
  const eventWithAppId = event as TimelineEvent & { appId?: string };
  const pluginId = eventWithAppId.appId || event.kind;
  const wrappedError =
    error instanceof Error ? error : new Error(String(error));

  if (ctx.mode === "render" && !ctx.gracefulDegradation) {
    throw new PluginError(pluginId, event, wrappedError);
  }

  log.error(`Event handler failed at frame ${event.at}`, wrappedError, {
    pluginId,
    eventKind: event.kind,
    frame: event.at,
  });

  if (ctx.errors) {
    ctx.errors.push({
      event,
      error: wrappedError,
      frame: event.at,
      skipped: true,
    });
  }

  if (ctx.stats) {
    ctx.stats.skippedEvents++;
  }
}

function processEventCore(
  draft: WorldState,
  event: TimelineEvent,
  index: number,
  t: number,
  ctx: ReplayContext,
  handlerCtx: HandlerContext,
  registryCtx: EventHandlerContext,
): void {
  if (EventHandlerRegistry.hasHandler(event.kind as string)) {
    EventHandlerRegistry.handle(draft, event, registryCtx);
    handleAutoSounds(draft, event, handlerCtx);
    return;
  }

  if (event.kind === "APP") {
    const eventWithAppId = event as TimelineEvent & { appId?: string };
    const appId = eventWithAppId.appId;
    if (appId) {
      const reducer = ReducerRegistry.getAppReducer(appId);
      reducer?.(draft, event);
    } else {
      log.warn("APP event missing appId", { event, frame: t, eventIndex: index });
    }
    handleAutoSounds(draft, event, handlerCtx);
    return;
  }

  const appIdForKind = ReducerRegistry.getAppIdForEventKind(
    event.kind as string,
  );
  if (appIdForKind) {
    const reducer = ReducerRegistry.getAppReducer(appIdForKind);
    reducer?.(draft, event);
    handleAutoSounds(draft, event, handlerCtx);
    return;
  }

  if (
    typeof event.kind === "string" &&
    (event.kind.startsWith("Camera") || event.kind.startsWith("Anchor"))
  ) {
    const type = event.kind.replace("Camera", "").toUpperCase();
    const normalizedType =
      type === "ANCHORFOCUS"
        ? "ANCHOR_FOCUS"
        : type === "ANCHORTRACK"
          ? "ANCHOR_TRACK"
          : type;

    const cameraEvent = {
      ...event,
      kind: "CAMERA" as const,
      type: normalizedType,
    };
    processCameraEvent(
      draft,
      cameraEvent as Parameters<typeof processCameraEvent>[1],
      handlerCtx,
    );
    handleAutoSounds(draft, event, handlerCtx);
    return;
  }

  if (hasBuiltInHandler(event.kind as string)) {
    const handler = getBuiltInHandler(event.kind as string);
    if (!handler) {
      handleAutoSounds(draft, event, handlerCtx);
      return;
    }
    handler(draft, event, index, handlerCtx);
    handleAutoSounds(draft, event, handlerCtx);
    return;
  }

  log.debug(`No handler registered for event kind: ${event.kind}`, {
    frame: t,
    eventIndex: index,
  });
  handleAutoSounds(draft, event, handlerCtx);
}

function processEventWithMiddleware(
  draft: WorldState,
  event: TimelineEvent,
  t: number,
  ctx: ReplayContext,
  handlerCtx: HandlerContext,
  registryCtx: EventHandlerContext,
  middlewareCtx: MiddlewareContext,
): void {
  MiddlewareRegistry.execute(event, draft, middlewareCtx, () => {
    processEventCore(
      draft,
      event,
      handlerCtx.eventIndex,
      t,
      ctx,
      handlerCtx,
      registryCtx,
    );
  });
}

function finalizeState(state: WorldState, t: number): WorldState {
  return produce(state, (draft) => {
    const config = getCachedConfig();
    // Only filter activeEffects if it exists (extended CameraState from device-camera)
    const cameraWithEffects = draft.camera as {
      activeEffects?: Array<{ endFrame: number }>;
    };
    if (Array.isArray(cameraWithEffects.activeEffects)) {
      cameraWithEffects.activeEffects = cameraWithEffects.activeEffects.filter(
        (effect) => t <= effect.endFrame + config.timing.effectCleanupBuffer,
      );
    }

    cleanupExpiredSounds(draft, t);
    cleanupExpiredNotifications(draft, t, getNotificationsConfig().cleanupDelayFrames);

    if (!draft.camera.deviceTransforms) {
      draft.camera.deviceTransforms = {};
    }

    let firstDeviceId: string | undefined;
    for (const deviceId in draft.devices) {
      if (Object.hasOwn(draft.devices, deviceId)) {
        if (!firstDeviceId) firstDeviceId = deviceId;
        draft.camera.deviceTransforms[deviceId] =
          DEFAULT_CAMERA_TRANSFORM as CameraTransform;
      }
    }

    const activeDeviceId = draft.camera.activeDeviceId || firstDeviceId;
    draft.camera.transform = activeDeviceId
      ? draft.camera.deviceTransforms[activeDeviceId] ||
        DEFAULT_CAMERA_TRANSFORM
      : DEFAULT_CAMERA_TRANSFORM;
  });
}

function cleanupExpiredNotifications(
  draft: WorldState,
  frame: number,
  cleanupDelayFrames: number,
): void {
  for (const deviceId in draft.devices) {
    if (!Object.hasOwn(draft.devices, deviceId)) {
      continue;
    }
    const device = draft.devices[deviceId];
    if (!device?.notifications || device.notifications.length === 0) {
      continue;
    }

    device.notifications = device.notifications.filter((notification) => {
      const dismissed = notification.state === "dismissed";
      const expired =
        notification.expiresAtFrame !== undefined &&
        frame > notification.expiresAtFrame;

      if (!dismissed && !expired) {
        return true;
      }

      const effectiveEndFrame =
        notification.dismissedAtFrame ??
        notification.expiresAtFrame ??
        0;
      return effectiveEndFrame > frame - cleanupDelayFrames;
    });
  }
}
