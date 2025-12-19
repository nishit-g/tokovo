/**
 * Camera Reducer
 * 
 * Processes camera runtime events and stores effects in state.
 * Works with Immer for immutable updates.
 * 
 * @module device-camera/reducer
 */

import type {
    CameraEffect,
    ZoomEffect,
    ShakeEffect,
    FocusEffect,
    TrackEffect,
    ResetEffect,
    CameraState,
    DEFAULT_TRANSFORM,
} from "../types";

// =============================================================================
// TYPES
// =============================================================================

interface CameraRuntimeEvent {
    kind: "CAMERA";
    type: string;
    at: number;
    duration?: number;
    payload?: Record<string, unknown>;
}

interface WorldState {
    camera?: CameraState;
    [key: string]: unknown;
}

// =============================================================================
// DEFAULTS
// =============================================================================

const DEFAULT_CAMERA_STATE: CameraState = {
    activeEffects: [],
    transform: {
        scale: 1,
        translateX: 0,
        translateY: 0,
        originX: 0.5,
        originY: 0.5,
        rotation: 0,
        shakeX: 0,
        shakeY: 0,
    },
    focusedAnchor: null,
};

// =============================================================================
// REDUCER
// =============================================================================

/**
 * Camera reducer - processes camera events and stores effects.
 * 
 * @param draft - Immer draft of world state
 * @param event - Camera runtime event
 */
export function cameraReducer(
    draft: WorldState,
    event: CameraRuntimeEvent
): void {
    if (event.kind !== "CAMERA") return;

    // Ensure camera state exists
    if (!draft.camera) {
        draft.camera = { ...DEFAULT_CAMERA_STATE };
    }

    const camera = draft.camera;
    const at = event.at;
    const p = event.payload ?? {};
    const duration = (event.duration as number) ?? (p.duration as number) ?? 30;
    const effectId = `${event.type.toLowerCase()}_${at}`;

    switch (event.type) {
        // =================================================================
        // ZOOM (from animate() DSL method)
        // =================================================================
        case "ZOOM": {
            const effect: ZoomEffect = {
                type: "zoom",
                id: effectId,
                startFrame: at,
                endFrame: at + duration,
                targetScale: (p.scale as number) ?? 1,
                targetX: (p.translateX as number) ?? (p.x as number) ?? 0,
                targetY: (p.translateY as number) ?? (p.y as number) ?? 0,
                originX: (p.originX as number) ?? undefined,
                originY: (p.originY as number) ?? undefined,
                easing: (p.easing as ZoomEffect["easing"]) ?? "ease-out",
            };
            camera.activeEffects.push(effect);
            break;
        }

        // =================================================================
        // SHAKE
        // =================================================================
        case "SHAKE": {
            const effect: ShakeEffect = {
                type: "shake",
                id: effectId,
                startFrame: at,
                endFrame: at + duration,
                intensity: (p.intensity as number) ?? 5,
                intensityX: (p.intensityX as number) ?? undefined,
                intensityY: (p.intensityY as number) ?? undefined,
                frequency: (p.frequency as number) ?? 15,
                decay: (p.decay as number) ?? 0.8,
            };
            camera.activeEffects.push(effect);
            break;
        }

        // =================================================================
        // ANCHOR_FOCUS (from focus() DSL method)
        // =================================================================
        case "FOCUS":
        case "ANCHOR_FOCUS": {
            camera.focusedAnchor = (p.anchorId as string) ?? null;

            const effect: FocusEffect = {
                type: "focus",
                id: effectId,
                startFrame: at,
                endFrame: at + duration,
                anchorId: (p.anchorId as string) ?? "",
                scale: (p.scale as number) ?? undefined,
                preset: (p.preset as string) ?? "medium",
                padding: (p.padding as number) ?? undefined,
                easing: (p.easing as FocusEffect["easing"]) ?? "ease-out",
            };
            camera.activeEffects.push(effect);
            break;
        }

        // =================================================================
        // ANCHOR_TRACK (from track() DSL method)
        // =================================================================
        case "TRACK":
        case "ANCHOR_TRACK": {
            const effect: TrackEffect = {
                type: "track",
                id: effectId,
                startFrame: at,
                endFrame: at + duration,
                anchorId: (p.anchorId as string) ?? "",
                scale: (p.scale as number) ?? 1.05,
                smoothing: (p.smoothing as number) ?? 0.1,
            };
            camera.activeEffects.push(effect);
            break;
        }

        // =================================================================
        // RESET
        // =================================================================
        case "RESET": {
            camera.focusedAnchor = null;

            const effect: ResetEffect = {
                type: "reset",
                id: effectId,
                startFrame: at,
                endFrame: at + duration,
                easing: (p.easing as ResetEffect["easing"]) ?? "ease-out",
            };
            camera.activeEffects.push(effect);
            break;
        }

        // =================================================================
        // CUT (instant change, no animation)
        // =================================================================
        case "CUT":
        case "SET_VIEW": {
            // For instant cuts, we directly modify the transform
            // and clear any conflicting effects
            camera.transform = {
                ...camera.transform,
                scale: (p.scale as number) ?? camera.transform.scale,
                translateX: (p.x as number) ?? camera.transform.translateX,
                translateY: (p.y as number) ?? camera.transform.translateY,
                rotation: (p.rotation as number) ?? camera.transform.rotation,
            };

            if (p.originX !== undefined) {
                camera.transform.originX = p.originX as number;
            }
            if (p.originY !== undefined) {
                camera.transform.originY = p.originY as number;
            }
            break;
        }

        default:
            console.warn(`[device-camera] Unknown camera event type: ${event.type}`);
    }
}
