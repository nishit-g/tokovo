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
    DEFAULT_AUDIO_STATE,
} from "./types";
import { TIMING } from "./constants";

// Import directly from handler files (avoid circular imports)
import { ReducerRegistry } from "./engine/registry";
import { EngineConfig } from "./engine/config";
import { EngineLogger } from "./engine/logger";
import {
    processCameraEvent,
    processAudioEvent,
    handleAutoSounds,
    processOSEvent,
    processNotificationEvent,
    processCallEvent,
    processTouchEvent,
    cameraController,
    HandlerContext,
} from "./engine/handlers";

// Re-export for backward compatibility
export { ReducerRegistry } from "./engine/registry";
export type { DeviceReducer, AppReducer, FeatureReducer } from "./engine/registry";
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
        public cause: Error
    ) {
        super(`[${pluginId}] Reducer failed at frame ${event.at}: ${cause.message}`);
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
 */
export function replay(
    initial: WorldState,
    events: TimelineEvent[],
    t: number,
    ctx: ReplayContext = DEFAULT_REPLAY_CONTEXT
): WorldState {
    if (!initial) {
        console.warn("[Engine] Replay called with undefined initial state");
        return {
            devices: {},
            conversations: {},
            appState: {},
            camera: { ...DEFAULT_CAMERA_STATE },
            audio: { ...DEFAULT_AUDIO_STATE }
        };
    }

    // Ensure initial state has proper camera and audio state
    const initialWithCamera: WorldState = {
        ...initial,
        camera: initial.camera && 'activeEffects' in initial.camera
            ? initial.camera
            : {
                ...DEFAULT_CAMERA_STATE,
                baseView: (initial.camera as any)?.type || "APP_VIEW",
                appId: (initial.camera as any)?.appId,
            },
        audio: initial.audio || { ...DEFAULT_AUDIO_STATE },
    };

    // Filter events up to current time
    const relevant = events.filter(e => e.at <= t);

    // Event handler dispatch
    const handleEvent = (draft: WorldState, event: TimelineEvent, index: number): void => {
        const handlerCtx: HandlerContext = {
            frame: t,
            eventIndex: index,
            mode: ctx.mode,
        };

        // === V2 NATIVE HANDLERS (@tokovo/ir) ===
        if (event.kind === "MessageReceived") {
            const e = event as any; // IR types have different field names
            const reducer = ReducerRegistry.getAppReducer(e.appId);
            const legacyEvent: any = {
                at: e.at,
                kind: "APP",
                type: "MESSAGE_RECEIVED",
                appId: e.appId,
                conversationId: e.conversationId,
                from: e.from,
                text: e.text,
                payload: { from: e.from, text: e.text, conversationId: e.conversationId },
            };
            reducer?.(draft, legacyEvent);
        }

        if (event.kind === "MessageSent") {
            const e = event as any;
            const reducer = ReducerRegistry.getAppReducer(e.appId);
            const legacyEvent: any = {
                at: e.at,
                kind: "APP",
                type: "MESSAGE_SENT",
                appId: e.appId,
                conversationId: e.conversationId,
                text: e.text,
                payload: { text: e.text, conversationId: e.conversationId },
            };
            reducer?.(draft, legacyEvent);
        }


        if (event.kind === "TypingStarted") {
            const e = event as import("@tokovo/ir").TypingStartedOp;
            const reducer = ReducerRegistry.getAppReducer(e.appId);
            const legacyEvent: any = {
                at: e.at,
                kind: "APP",
                type: "TYPING_START",
                appId: e.appId,
                conversationId: e.conversationId,
                from: e.actor,
                deviceId: e.deviceId, // Pass deviceId for keyboard visibility
                payload: { actor: e.actor, conversationId: e.conversationId },
            };
            reducer?.(draft, legacyEvent);
        }

        if (event.kind === "TypingEnded") {
            const e = event as import("@tokovo/ir").TypingEndedOp;
            const reducer = ReducerRegistry.getAppReducer(e.appId);
            const legacyEvent: any = {
                at: e.at,
                kind: "APP",
                type: "TYPING_END",
                appId: e.appId,
                conversationId: e.conversationId,
                from: e.actor,
                deviceId: e.deviceId, // Pass deviceId for keyboard visibility
                payload: { actor: e.actor, conversationId: e.conversationId },
            };
            reducer?.(draft, legacyEvent);
        }

        // Handle V2 Camera Ops
        if (typeof event.kind === "string" && (event.kind.startsWith("Camera") || event.kind.startsWith("Anchor"))) {
            const type = event.kind.replace("Camera", "").toUpperCase();
            const normalizedType = type === "ANCHORFOCUS" ? "ANCHOR_FOCUS"
                : type === "ANCHORTRACK" ? "ANCHOR_TRACK"
                    : type === "SHAKE" ? "SHAKE"
                        : type;

            const legacyEvent: any = {
                ...event,
                kind: "CAMERA",
                type: normalizedType,
                scale: (event as any).scale,
                originX: (event as any).originX,
                originY: (event as any).originY,
                align: (event as any).align,
                translateX: (event as any).translateX || ((event as any).originX ? ((event as any).originX - 0.5) * 1000 : 0)
            };
            processCameraEvent(draft, legacyEvent, handlerCtx);
        }

        // === V1 LEGACY HANDLERS ===
        switch (event.kind) {
            case "DEVICE":
                if (ReducerRegistry.deviceReducer) {
                    draft.devices = ReducerRegistry.deviceReducer(draft.devices, event);
                }
                const devType = (event as any).type;
                if (devType && (devType.includes("NOTIFICATION") || devType.startsWith("SHOW_") || devType.startsWith("DISMISS_") || devType.startsWith("TAP_") || devType.startsWith("SWIPE_") || devType.startsWith("CLEAR_ALL") || devType.includes("DYNAMIC_ISLAND"))) {
                    // Try feature reducer first (from device-notifications plugin)
                    const notifReducer = ReducerRegistry.getFeatureReducer(devType);
                    if (notifReducer) {
                        notifReducer(draft, event, index);
                    } else {
                        // Fallback to legacy handler (mostly no-op now)
                        processNotificationEvent(draft, event as any, handlerCtx);
                    }
                }
                break;

            case "APP":
                const reducer = ReducerRegistry.getAppReducer(event.appId);
                reducer?.(draft, event);
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
        return produce(state, draft => {
            try {
                handleEvent(draft, event, index);
            } catch (error) {
                const pluginId = (event as any).appId || event.kind;

                if (ctx.mode === "render") {
                    throw new PluginError(
                        pluginId,
                        event,
                        error instanceof Error ? error : new Error(String(error))
                    );
                } else {
                    console.error(`[Engine] Event handler failed at frame ${event.at}:`, event, error);
                    if (ctx.errors) {
                        ctx.errors.push({
                            event,
                            error: error instanceof Error ? error : new Error(String(error)),
                            frame: event.at
                        });
                    }
                }
            }
        });
    }, initialWithCamera);

    // Compute camera transforms
    return produce(stateAfterEvents, draft => {
        draft.camera.activeEffects = draft.camera.activeEffects.filter(
            ae => t <= ae.endFrame + TIMING.EFFECT_CLEANUP_BUFFER
        );

        if (!draft.camera.deviceTransforms) {
            draft.camera.deviceTransforms = {};
        }

        for (const deviceId of Object.keys(draft.devices)) {
            const deviceEffects = draft.camera.activeEffects.filter(
                ae => !ae.deviceId || ae.deviceId === deviceId
            );
            const deviceCameraState = { ...draft.camera, activeEffects: deviceEffects };
            draft.camera.deviceTransforms[deviceId] = cameraController.computeTransform(deviceCameraState, t);
        }

        const activeDeviceId = draft.camera.activeDeviceId || Object.keys(draft.devices)[0];
        draft.camera.transform = draft.camera.deviceTransforms[activeDeviceId]
            || cameraController.computeTransform(draft.camera, t);
    });
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
        conversations: {},
        appState: {},
        camera: { ...DEFAULT_CAMERA_STATE },
        audio: { ...DEFAULT_AUDIO_STATE },
        ...partial,
    };
}

// Legacy export for handleAutoSounds (used in some places)
export { handleAutoSounds };
