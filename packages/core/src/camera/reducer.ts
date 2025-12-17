/**
 * Camera Reducer
 * 
 * Applies CameraRuntimeEvent to WorldState.camera
 * 
 * This is a CORE reducer - cameras are not plugins, they're platform features.
 * Every episode has camera moves, and cameras affect all apps equally.
 * 
 * Events handled:
 * - ZOOM: Scale camera with origin
 * - PAN: Translate camera
 * - SHAKE: Apply screen shake effect
 * - FOCUS: Focus on an anchor
 * - RESET: Return to default camera
 * - CUT: Instant camera change (no animation)
 * 
 * @see docs/FUCKING_MESS.md Section 7 Gap #3
 */

import type { WorldState } from "../types";
import type { CameraRuntimeEvent } from "../types/runtime-event";

// =============================================================================
// TYPE GUARDS
// =============================================================================

function isCameraEvent(event: unknown): event is CameraRuntimeEvent {
    return (event as any)?.kind === "CAMERA";
}

// =============================================================================
// REDUCER
// =============================================================================

/**
 * Camera reducer - applies camera events to world state
 * 
 * Uses the existing CameraController for effect application.
 * This reducer adds effects to camera.activeEffects array.
 * 
 * @param draft - Immer draft of WorldState (mutable)
 * @param event - RuntimeEvent (checked for kind: "CAMERA")
 */
export function cameraReducer(draft: WorldState, event: unknown): void {
    if (!isCameraEvent(event)) return;

    // Ensure camera state exists
    if (!draft.camera) {
        // Create minimal camera state
        (draft as any).camera = {
            transform: {
                scale: 1,
                originX: 0.5,
                originY: 0.5,
                translateX: 0,
                translateY: 0,
                rotation: 0,
                shakeX: 0,
                shakeY: 0,
            },
            activeEffects: [],
        };
    }

    const camera = draft.camera as any;
    const { type, payload, at } = event;
    const p = payload as Record<string, unknown>;

    // Generate unique effect ID
    const effectId = `${type}_${at}`;
    const duration = (p?.duration as number) ?? 30;

    switch (type) {
        // =====================================================================
        // ZOOM
        // =====================================================================
        case "ZOOM": {
            camera.activeEffects.push({
                id: effectId,
                effect: { type: "zoom" },
                startFrame: at,
                endFrame: at + duration,
                type: "zoom",
                targetScale: p?.scale ?? 1,
                originX: p?.originX ?? 0.5,
                originY: p?.originY ?? 0.5,
                duration,
                easing: p?.easing ?? "ease-out",
            });
            break;
        }

        // =====================================================================
        // PAN
        // =====================================================================
        case "PAN": {
            camera.activeEffects.push({
                id: effectId,
                effect: { type: "pan" },
                startFrame: at,
                endFrame: at + duration,
                type: "pan",
                targetX: p?.translateX ?? 0,
                targetY: p?.translateY ?? 0,
                relative: p?.relative ?? false,
                duration,
                easing: p?.easing ?? "ease-out",
            });
            break;
        }

        // =====================================================================
        // SHAKE
        // =====================================================================
        case "SHAKE": {
            camera.activeEffects.push({
                id: effectId,
                effect: { type: "shake" },
                startFrame: at,
                endFrame: at + duration,
                type: "shake",
                intensity: p?.intensity ?? 5,
                frequency: p?.frequency ?? 15,
                decay: p?.decay ?? 0.8,
                duration,
            });
            break;
        }

        // =====================================================================
        // FOCUS (on anchor)
        // =====================================================================
        case "FOCUS":
        case "ANCHOR_FOCUS": {
            camera.focusedAnchor = p?.anchorId ?? null;
            camera.activeEffects.push({
                id: effectId,
                effect: { type: "focus" },
                startFrame: at,
                endFrame: at + duration,
                type: "anchor_focus",
                anchor: p?.anchorId ?? "",
                preset: p?.preset ?? "medium",
                targetScale: p?.scale ?? 1.2,
                duration,
                easing: p?.easing ?? "ease-out",
            });
            break;
        }

        // =====================================================================
        // RESET
        // =====================================================================
        case "RESET": {
            camera.activeEffects.push({
                id: effectId,
                effect: { type: "reset" },
                startFrame: at,
                endFrame: at + duration,
                type: "reset",
                targetScale: 1,
                targetX: 0,
                targetY: 0,
                duration,
                easing: p?.easing ?? "ease-out",
            });
            camera.focusedAnchor = null;
            break;
        }

        // =====================================================================
        // CUT (instant, no animation)
        // =====================================================================
        case "CUT": {
            // Apply instantly - no effect, just update transform
            if (p?.scale != null) camera.transform.scale = p.scale;
            if (p?.translateX != null) camera.transform.translateX = p.translateX;
            if (p?.translateY != null) camera.transform.translateY = p.translateY;
            break;
        }

        // =====================================================================
        // SET_LAYOUT (for multi-device modes)
        // =====================================================================
        case "SET_LAYOUT": {
            // Store layout mode - renderer will use this
            camera.layoutMode = p?.mode ?? "SINGLE";
            break;
        }

        default:
            // Unknown camera event type - log for debugging
            console.warn(`[camera-reducer] Unknown camera event type: ${type}`);
    }
}

export default cameraReducer;
