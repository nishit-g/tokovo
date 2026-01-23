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
  DEFAULT_CAMERA_STATE,
  DEFAULT_CAMERA_TRANSFORM,
  DEFAULT_AUDIO_STATE,
} from "./types";
import type { CameraTransform } from "@tokovo/device-camera";
import { getConfig, TokovoConfigType } from "./config";

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
import { EngineConfig } from "./engine/config";
import { EngineLogger } from "./engine/logger";
import { createScopedLogger } from "./logger";
import {
  processCameraEvent,
  processAudioEvent,
  handleAutoSounds,
  cleanupExpiredSounds,
  processOSEvent,
  processCallEvent,
  HandlerContext,
} from "./engine/handlers";
import {
  EventHandlerRegistry,
  EventHandlerContext,
} from "./engine/event-handlers";
import { MiddlewareRegistry, MiddlewareContext } from "./engine/middleware";
import { LifecycleManager, LifecycleContext } from "./engine/lifecycle";

const log = createScopedLogger("engine");

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
  const lifecycleCtx: LifecycleContext = { frame: t, mode: ctx.mode };
  LifecycleManager.notifyBeforeReplay(lifecycleCtx);

  if (!initial) {
    log.warn("Replay called with undefined initial state");
    const emptyState = {
      devices: {},
      appState: {},
      camera: { ...DEFAULT_CAMERA_STATE },
      audio: { ...DEFAULT_AUDIO_STATE },
    };
    LifecycleManager.notifyAfterReplay(emptyState, lifecycleCtx);
    return emptyState;
  }

  // Ensure initial state has proper camera and audio state
  // Handle legacy camera format { type, appId } vs new CameraState
  interface LegacyCameraConfig {
    type?: string;
    appId?: string;
  }
  const legacyCamera = initial.camera as LegacyCameraConfig | undefined;
  const initialWithCamera: WorldState = {
    ...initial,
    camera:
      initial.camera && "activeEffects" in initial.camera
        ? initial.camera
        : {
            ...DEFAULT_CAMERA_STATE,
            baseView: (legacyCamera?.type || "APP_VIEW") as
              | "APP_VIEW"
              | "TRANSITION",
            appId: legacyCamera?.appId,
          },
    audio: initial.audio || { ...DEFAULT_AUDIO_STATE },
  };

  // Filter events up to current time - use index if provided for O(1) lookup
  const relevant = eventIndex
    ? getEventsUpTo(eventIndex, t)
    : events.filter((e) => e.at <= t);

  // Apply all events in a single Immer produce (not per-event)
  const stateAfterEvents = produce(initialWithCamera, (draft) => {
    for (let i = 0; i < relevant.length; i++) {
      const event = relevant[i];
      try {
        processEventWithMiddleware(draft, event, i, t, ctx);
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
  });

  const finalState = produce(stateAfterEvents, (draft) => {
    const config = getCachedConfig();
    draft.camera.activeEffects = draft.camera.activeEffects.filter(
      (ae) => t <= ae.endFrame + config.timing.effectCleanupBuffer,
    );

    if (!draft.camera.deviceTransforms) {
      draft.camera.deviceTransforms = {};
    }

    for (const deviceId of Object.keys(draft.devices)) {
      const deviceEffects = draft.camera.activeEffects.filter(
        (ae) => !ae.deviceId || ae.deviceId === deviceId,
      );
      draft.camera.deviceTransforms[deviceId] =
        DEFAULT_CAMERA_TRANSFORM as CameraTransform;
    }

    const activeDeviceId =
      draft.camera.activeDeviceId || Object.keys(draft.devices)[0];
    draft.camera.transform =
      draft.camera.deviceTransforms[activeDeviceId] || DEFAULT_CAMERA_TRANSFORM;
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
    camera: { ...DEFAULT_CAMERA_STATE },
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
    for (let i = 0; i < eventsToApply.length; i++) {
      const event = eventsToApply[i];
      try {
        processEventWithMiddleware(draft, event, i, t, ctx);
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
      camera: { ...DEFAULT_CAMERA_STATE },
      audio: { ...DEFAULT_AUDIO_STATE },
    };
  }

  interface LegacyCameraConfig {
    type?: string;
    appId?: string;
  }
  const legacyCamera = initial.camera as LegacyCameraConfig | undefined;

  return {
    ...initial,
    camera:
      initial.camera && "activeEffects" in initial.camera
        ? initial.camera
        : {
            ...DEFAULT_CAMERA_STATE,
            baseView: (legacyCamera?.type || "APP_VIEW") as
              | "APP_VIEW"
              | "TRANSITION",
            appId: legacyCamera?.appId,
          },
    audio: initial.audio || { ...DEFAULT_AUDIO_STATE },
  };
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

  switch (event.kind) {
    case "DEVICE":
      if (ReducerRegistry.deviceReducer) {
        draft.devices = ReducerRegistry.deviceReducer(draft.devices, event);
      }
      const devEvent = event as TimelineEvent & { type?: string };
      const devType = devEvent.type;
      if (
        devType &&
        (devType.includes("NOTIFICATION") ||
          devType.startsWith("SHOW_") ||
          devType.startsWith("DISMISS_") ||
          devType.startsWith("TAP_") ||
          devType.startsWith("SWIPE_") ||
          devType.startsWith("CLEAR_ALL") ||
          devType.includes("DYNAMIC_ISLAND"))
      ) {
        const notifReducer = ReducerRegistry.getFeatureReducer(devType);
        if (notifReducer) {
          notifReducer(draft, event, index);
        }
      }
      break;

    case "CAMERA":
      processCameraEvent(draft, event, handlerCtx);
      break;

    case "AUDIO":
      processAudioEvent(draft, event, handlerCtx);
      break;

    case "KEYBOARD": {
      const kbReducer = ReducerRegistry.getFeatureReducer("KEYBOARD");
      if (kbReducer) {
        kbReducer(draft, event, index);
      }
      break;
    }

    case "OS":
      processOSEvent(draft, event, handlerCtx);
      break;

    case "CALL":
      processCallEvent(draft, event, handlerCtx);
      break;
  }

  handleAutoSounds(draft, event, handlerCtx);
}

function processEventWithMiddleware(
  draft: WorldState,
  event: TimelineEvent,
  index: number,
  t: number,
  ctx: ReplayContext,
): void {
  const handlerCtx: HandlerContext = {
    frame: t,
    eventIndex: index,
    mode: ctx.mode,
    fps: ctx.fps ?? 30,
  };

  const registryCtx: EventHandlerContext = {
    frame: t,
    eventIndex: index,
    mode: ctx.mode,
  };

  const middlewareCtx: MiddlewareContext = {
    frame: t,
    eventIndex: index,
    mode: ctx.mode,
  };

  MiddlewareRegistry.execute(event, draft, middlewareCtx, () => {
    processEventCore(draft, event, index, t, ctx, handlerCtx, registryCtx);
  });
}

function finalizeState(state: WorldState, t: number): WorldState {
  return produce(state, (draft) => {
    const config = getCachedConfig();
    draft.camera.activeEffects = draft.camera.activeEffects.filter(
      (ae) => t <= ae.endFrame + config.timing.effectCleanupBuffer,
    );

    cleanupExpiredSounds(draft, t);

    if (!draft.camera.deviceTransforms) {
      draft.camera.deviceTransforms = {};
    }

    const deviceIds = Object.keys(draft.devices);
    for (const deviceId of deviceIds) {
      draft.camera.deviceTransforms[deviceId] =
        DEFAULT_CAMERA_TRANSFORM as CameraTransform;
    }

    const activeDeviceId = draft.camera.activeDeviceId || deviceIds[0];
    draft.camera.transform =
      draft.camera.deviceTransforms[activeDeviceId] || DEFAULT_CAMERA_TRANSFORM;
  });
}
