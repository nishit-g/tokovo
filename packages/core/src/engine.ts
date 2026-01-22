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
import { TIMING } from "./constants";
import { EventIndex, getEventsUpTo } from "./utils/event-utils";

// Import directly from handler files (avoid circular imports)
import { ReducerRegistry } from "./engine/registry";
import { EngineConfig } from "./engine/config";
import { EngineLogger } from "./engine/logger";
import {
  processCameraEvent,
  processAudioEvent,
  handleAutoSounds,
  processOSEvent,
  processCallEvent,
  processTouchEvent,
  HandlerContext,
} from "./engine/handlers";

// Re-export for backward compatibility
export { ReducerRegistry } from "./engine/registry";
export type {
  DeviceReducer,
  AppReducer,
  FeatureReducer,
} from "./engine/registry";
export { EngineConfig } from "./engine/config";
export { EngineLogger } from "./engine/logger";

// =============================================================================
// REPLAY CONTEXT
// =============================================================================

/**
 * Context for replay execution with mode-based error handling.
 */
export interface ReplayContext {
  mode: "preview" | "render";
  errors?: Array<{
    event: TimelineEvent;
    error: Error;
    frame: number;
  }>;
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
  if (!initial) {
    console.warn("[Engine] Replay called with undefined initial state");
    return {
      devices: {},
      appState: {},
      camera: { ...DEFAULT_CAMERA_STATE },
      audio: { ...DEFAULT_AUDIO_STATE },
    };
  }

  // Ensure initial state has proper camera and audio state
  const initialWithCamera: WorldState = {
    ...initial,
    camera:
      initial.camera && "activeEffects" in initial.camera
        ? initial.camera
        : {
            ...DEFAULT_CAMERA_STATE,
            baseView: (initial.camera as any)?.type || "APP_VIEW",
            appId: (initial.camera as any)?.appId,
          },
    audio: initial.audio || { ...DEFAULT_AUDIO_STATE },
  };

  // Filter events up to current time - use index if provided for O(1) lookup
  const relevant = eventIndex
    ? getEventsUpTo(eventIndex, t)
    : events.filter((e) => e.at <= t);

  // Event handler dispatch
  const handleEvent = (
    draft: WorldState,
    event: TimelineEvent,
    index: number,
  ): void => {
    const handlerCtx: HandlerContext = {
      frame: t,
      eventIndex: index,
      mode: ctx.mode,
    };

    // V2 IR App Events - dispatch directly to app reducers
    const v2AppKinds = [
      "MessageReceived",
      "MessageSent",
      "TypingStarted",
      "TypingEnded",
      "ImageReceived",
      "ImageSent",
      "VideoReceived",
      "VideoSent",
      "VoiceReceived",
      "VoiceSent",
      "GifReceived",
      "GifSent",
      "StickerReceived",
      "StickerSent",
      "DocumentReceived",
      "DocumentSent",
      "ContactReceived",
      "ContactSent",
      "LocationReceived",
      "LocationSent",
      "React",
      "ReadMessages",
      "MessageDeleted",
      "MessageEdited",
      "MessageForwarded",
      "DateSeparator",
      "ConversationOpened",
      "NavigateScreen",
    ];

    if (v2AppKinds.includes(event.kind as string)) {
      const e = event as any;
      const reducer = ReducerRegistry.getAppReducer(e.appId);
      reducer?.(draft, event);
      return;
    }

    // V2 Camera Events - normalize kind to type
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
      processCameraEvent(draft, cameraEvent as any, handlerCtx);
      return;
    }

    // System Events
    switch (event.kind) {
      case "DEVICE":
        if (ReducerRegistry.deviceReducer) {
          draft.devices = ReducerRegistry.deviceReducer(draft.devices, event);
        }
        const devType = (event as any).type;
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
        processOSEvent(draft, event as any, handlerCtx);
        break;

      case "TOUCH":
        processTouchEvent(draft, event as any, handlerCtx);
        break;

      case "CALL":
        processCallEvent(draft, event as any, handlerCtx);
        break;
    }

    // AutoSound derivation runs for ALL events
    handleAutoSounds(draft, event, handlerCtx);
  };

  // Apply events with error handling
  const stateAfterEvents = relevant.reduce((state, event, index) => {
    return produce(state, (draft) => {
      try {
        handleEvent(draft, event, index);
      } catch (error) {
        const pluginId = (event as any).appId || event.kind;

        if (ctx.mode === "render") {
          throw new PluginError(
            pluginId,
            event,
            error instanceof Error ? error : new Error(String(error)),
          );
        } else {
          console.error(
            `[Engine] Event handler failed at frame ${event.at}:`,
            event,
            error,
          );
          if (ctx.errors) {
            ctx.errors.push({
              event,
              error: error instanceof Error ? error : new Error(String(error)),
              frame: event.at,
            });
          }
        }
      }
    });
  }, initialWithCamera);

  // Compute camera transforms
  return produce(stateAfterEvents, (draft) => {
    draft.camera.activeEffects = draft.camera.activeEffects.filter(
      (ae) => t <= ae.endFrame + TIMING.EFFECT_CLEANUP_BUFFER,
    );

    if (!draft.camera.deviceTransforms) {
      draft.camera.deviceTransforms = {};
    }

    for (const deviceId of Object.keys(draft.devices)) {
      const deviceEffects = draft.camera.activeEffects.filter(
        (ae) => !ae.deviceId || ae.deviceId === deviceId,
      );
      // Camera transform is now computed in renderer using device-camera processors
      // Here we just store the default transform
      draft.camera.deviceTransforms[deviceId] = DEFAULT_CAMERA_TRANSFORM as any;
    }

    const activeDeviceId =
      draft.camera.activeDeviceId || Object.keys(draft.devices)[0];
    draft.camera.transform =
      draft.camera.deviceTransforms[activeDeviceId] ||
      (DEFAULT_CAMERA_TRANSFORM as any);
  });
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

// Legacy export for handleAutoSounds (used in some places)
export { handleAutoSounds };
