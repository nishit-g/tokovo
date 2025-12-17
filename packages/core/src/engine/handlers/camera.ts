/**
 * Camera Handler - Processes CAMERA events
 * 
 * @description Handles camera movements, effects, and layout changes.
 */

import type { WorldState } from "../../types";
import type { CameraEvent, HandlerContext } from "./types";
import { CameraController, createActiveEffect } from "../../camera";
import { DEFAULT_CAMERA_STATE, DEFAULT_CAMERA_TRANSFORM } from "../../types";
import { TIMING } from "../../constants";

// Camera controller instance
const cameraController = new CameraController(TIMING.FPS_DEFAULT);

/**
 * Process camera event and update camera state
 */
export function processCameraEvent(
    draft: WorldState,
    event: CameraEvent,
    ctx: HandlerContext
): void {
    // Ensure camera state exists with all required properties
    if (!draft.camera || !draft.camera.activeEffects) {
        draft.camera = { ...DEFAULT_CAMERA_STATE };
    }
    // Ensure layout exists
    if (!draft.camera.layout) {
        draft.camera.layout = {
            mode: "SINGLE",
            primaryDeviceId: draft.camera.activeDeviceId || Object.keys(draft.devices)[0] || "main_phone"
        };
    }

    const e = event as any; // For accessing optional fields

    switch (event.type) {
        case "SET_VIEW":
            // Legacy support - just update base view
            draft.camera.baseView = e.view?.type;
            draft.camera.appId = e.view?.appId;
            break;

        case "CUT":
            // Hard cut - reset all effects
            draft.camera.activeEffects = [];
            draft.camera.transform = { ...DEFAULT_CAMERA_TRANSFORM };

            // Switch to new device if specified
            if (e.toDeviceId) {
                draft.camera.activeDeviceId = e.toDeviceId;
                draft.camera.layout.primaryDeviceId = e.toDeviceId;
            }

            // Update base view if specified
            if (e.toView) {
                draft.camera.baseView = e.toView === "app" ? "APP_VIEW" : "TRANSITION";
            }
            break;

        case "LAYOUT":
            // Change view layout mode
            draft.camera.layout = {
                mode: e.mode,
                primaryDeviceId: e.primaryDeviceId,
                secondaryDeviceId: e.secondaryDeviceId,
                pipPosition: e.pipPosition,
                pipScale: e.pipScale,
            };
            // Update active device to match primary
            draft.camera.activeDeviceId = e.primaryDeviceId;
            break;

        case "ZOOM":
        case "PAN":
        case "SHAKE":
        case "FOCUS":
        case "ANCHOR_FOCUS":
        case "ANCHOR_TRACK":
        case "RESET": {
            // Create active effect and add to list
            const activeEffect = createActiveEffect(e, `effect_${ctx.eventIndex}_${event.at}`);
            if (activeEffect) {
                draft.camera.activeEffects.push(activeEffect);
            }
            break;
        }
    }
}

// Export the camera controller for use in replay
export { cameraController };
