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
import { TimelineEvent, WorldState, createDefaultAudioState } from "./types.js";
import { TokovoConfigType } from "./config/index.js";
import {
  EventIndex,
  KeyframedEventIndex,
  compareEvents,
  getEventsUpTo,
  getEventsUpToKeyframed,
  getEventsInRange,
} from "./utils/event-utils.js";
import { StateCache, getCachedStateForFrame, cacheStateAtKeyframe } from "./utils/state-cache.js";

import { createScopedLogger } from "./logger/index.js";
import { handleAutoSounds, cleanupExpiredSounds, HandlerContext } from "./engine/handlers/index.js";
import type { EventHandlerContext } from "./engine/event-handlers.js";
import type { MiddlewareContext } from "./engine/middleware.js";
import type { LifecycleContext } from "./engine/lifecycle.js";
import { hasBuiltInHandler, getBuiltInHandler } from "./engine/built-in-handlers.js";
import type { EngineRegistries } from "./engine/registries.js";
import { getAppStateForDevice, getDeviceIdsForAppState } from "./utils/app-state.js";

const log = createScopedLogger("engine");
const sortedEventCache = new WeakMap<TimelineEvent[], TimelineEvent[]>();

export type { DeviceReducer, AppReducer, FeatureReducer } from "./engine/registry.js";
export { createReducerRegistry } from "./engine/registry.js";
export { EngineConfig } from "./engine/config.js";
export {
  createEventIndex,
  createKeyframedEventIndex,
  type KeyframedEventIndex,
} from "./utils/event-utils.js";
export {
  createStateCache,
  getCachedStateForFrame,
  cacheStateAtKeyframe,
  invalidateCacheAfter,
  clearStateCache,
  type StateCache,
} from "./utils/state-cache.js";

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
  registries: EngineRegistries;
  config: TokovoConfigType;
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
    super(`[${pluginId}] Reducer failed at frame ${event.at}: ${cause.message}`);
    this.name = "PluginError";
  }
}

// =============================================================================
// UNCACHED PREVIEW REPLAY
// =============================================================================

/**
 * Computes preview WorldState without a cache. Release rendering is required to
 * use replayIncremental() with prepared indexes and a StateCache.
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
function replayUncachedPreview(
  initial: WorldState,
  events: TimelineEvent[],
  t: number,
  ctx: ReplayContext,
  eventIndex?: EventIndex,
): WorldState {
  if (ctx.mode === "render") {
    throw new Error(
      "Uncached replay is disabled in render mode. Use replayIncremental() with a StateCache.",
    );
  }
  if (t < 0) {
    log.warn(`Uncached preview replay called with negative t: ${t}, using t=0`);
    t = 0;
  }

  const registries = ctx.registries;

  if (!events || events.length === 0) {
    return requireInitialWorld(initial);
  }

  const lifecycleCtx: LifecycleContext = { frame: t, mode: ctx.mode };
  registries.lifecycle.notifyBeforeReplay(lifecycleCtx);

  // Filter events up to current time - use index if provided for O(1) lookup
  const relevant = eventIndex
    ? getEventsUpTo(eventIndex, t)
    : getSortedEvents(events).filter((e) => e.at <= t);

  // Apply all events and finalize in a single Immer produce (perf: avoids double structural sharing)
  const finalState = produce(initial, (draft) => {
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
          registries,
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
    cleanupExpiredSounds(draft, t);
  });

  registries.lifecycle.notifyAfterReplay(finalState, lifecycleCtx);
  return finalState;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Create default initial world state
 */
export function createInitialWorld(partial: Partial<WorldState> = {}): WorldState {
  return {
    devices: {},
    appInstances: {},
    capabilityState: {},
    audio: createDefaultAudioState(),
    ...partial,
  };
}

export { handleAutoSounds };

export function replayIncremental(
  initial: WorldState,
  events: TimelineEvent[],
  t: number,
  ctx: ReplayContext,
  eventIndex?: KeyframedEventIndex,
  stateCache?: StateCache,
): WorldState {
  if (t < 0) {
    log.warn(`replayIncremental called with negative t: ${t}, using t=0`);
    t = 0;
  }

  const registries = ctx.registries;

  if (!events || events.length === 0) {
    return requireInitialWorld(initial);
  }

  if (!eventIndex || !stateCache) {
    if (ctx.mode === "render") {
      throw new Error(
        "replayIncremental() requires a KeyframedEventIndex and StateCache in render mode.",
      );
    }
    return replayUncachedPreview(initial, events, t, ctx, eventIndex);
  }

  const lifecycleCtx: LifecycleContext = { frame: t, mode: ctx.mode };
  registries.lifecycle.notifyBeforeReplay(lifecycleCtx);

  const cached = getCachedStateForFrame(stateCache, t);
  if (cached && cached.fromFrame === t) {
    registries.lifecycle.notifyAfterReplay(cached.state, lifecycleCtx);
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
    startState = requireInitialWorld(initial);
    startFrame = -1;
    eventsToApply = getEventsUpToKeyframed(eventIndex, t);
  }

  if (eventsToApply.length === 0 && cached) {
    const result = finalizeState(cached.state, t, ctx.config);
    registries.lifecycle.notifyAfterReplay(result, lifecycleCtx);
    return result;
  }

  const finalState = produce(startState, (draft) => {
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
          registries,
          handlerCtx,
          registryCtx,
          middlewareCtx,
        );
      } catch (error) {
        handleEventError(error, event, ctx);
      }
    }

    // Single-pass finalize in incremental replay (perf: avoid second Immer produce)
    finalizeDraftState(draft, t, ctx.config);
  });
  cacheStateAtKeyframe(stateCache, t, finalState);

  registries.lifecycle.notifyAfterReplay(finalState, lifecycleCtx);
  return finalState;
}

function requireInitialWorld(initial: WorldState): WorldState {
  if (!initial) {
    throw new Error("WORLD_STATE_REQUIRED: replay requires an initial world");
  }
  return initial;
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
  withIndex.sort((a, b) => compareEvents(a.event, b.event, a.index, b.index));

  const sorted = withIndex.map((entry) => entry.event);
  sortedEventCache.set(events, sorted);
  return sorted;
}

function isSortedByFrame(events: TimelineEvent[]): boolean {
  if (events.length <= 1) return true;
  let lastEvent = events[0];
  let lastIndex = 0;

  for (let i = 1; i < events.length; i++) {
    const event = events[i];
    if (compareEvents(lastEvent, event, lastIndex, i) > 0) {
      return false;
    }
    lastEvent = event;
    lastIndex = i;
  }

  return true;
}

function handleEventError(error: unknown, event: TimelineEvent, ctx: ReplayContext): void {
  const eventWithAppId = event as TimelineEvent & { appId?: string };
  const pluginId = eventWithAppId.appId || event.kind;
  const wrappedError = error instanceof Error ? error : new Error(String(error));

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
  registries: EngineRegistries,
  handlerCtx: HandlerContext,
  registryCtx: EventHandlerContext,
): void {
  if (registries.eventHandlers.hasHandler(event.kind as string)) {
    registries.eventHandlers.handle(draft, event, registryCtx);
    handleAutoSounds(draft, event, handlerCtx);
    return;
  }

  if (event.kind === "APP") {
    const eventWithAppId = event as TimelineEvent & {
      appId?: string;
      deviceId?: string;
    };
    const appId = eventWithAppId.appId;
    if (appId) {
      const reducer = registries.reducers.getAppReducer(appId);
      if (reducer) {
        runAppReducerForDevice(draft, event, appId, eventWithAppId.deviceId, reducer);
      }
    } else {
      log.warn("APP event missing appId", {
        event,
        frame: t,
        eventIndex: index,
      });
    }
    handleAutoSounds(draft, event, handlerCtx);
    return;
  }

  const appIdForKind = registries.reducers.getAppIdForEventKind(event.kind as string);
  if (appIdForKind) {
    const reducer = registries.reducers.getAppReducer(appIdForKind);
    if (reducer) {
      runAppReducerForDevice(
        draft,
        event,
        appIdForKind,
        (event as TimelineEvent & { deviceId?: string }).deviceId,
        reducer,
      );
    }
    handleAutoSounds(draft, event, handlerCtx);
    return;
  }

  if (hasBuiltInHandler(event.kind as string, registries.reducers)) {
    const handler = getBuiltInHandler(event.kind as string, registries.reducers);
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

function runAppReducerForDevice(
  draft: WorldState,
  event: TimelineEvent,
  appId: string,
  deviceId: string | undefined,
  reducer: import("./engine/registry.js").AppReducer,
): void {
  const scopedDeviceIds = getDeviceIdsForAppState(draft, appId);
  if (!deviceId) {
    throw new Error(`APP_EVENT_DEVICE_REQUIRED: event for "${appId}" must declare deviceId`);
  }
  if (
    !scopedDeviceIds.includes(deviceId) ||
    getAppStateForDevice(draft, appId, deviceId) === undefined
  ) {
    throw new Error(
      `APP_INSTANCE_MISSING: app "${appId}" is not mounted on device "${deviceId}"; mounted devices: ${scopedDeviceIds.join(", ") || "none"}`,
    );
  }
  reducer(draft, event);
}

function processEventWithMiddleware(
  draft: WorldState,
  event: TimelineEvent,
  t: number,
  ctx: ReplayContext,
  registries: EngineRegistries,
  handlerCtx: HandlerContext,
  registryCtx: EventHandlerContext,
  middlewareCtx: MiddlewareContext,
): void {
  registries.middleware.execute(event, draft, middlewareCtx, () => {
    processEventCore(
      draft,
      event,
      handlerCtx.eventIndex,
      t,
      ctx,
      registries,
      handlerCtx,
      registryCtx,
    );
  });
}

function finalizeState(state: WorldState, t: number, config: TokovoConfigType): WorldState {
  return produce(state, (draft) => {
    finalizeDraftState(draft, t, config);
  });
}

function finalizeDraftState(draft: WorldState, t: number, _config: TokovoConfigType): void {
  cleanupExpiredSounds(draft, t);
}
