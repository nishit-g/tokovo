/**
 * Camera Handler - Processes CAMERA events
 * 
 * @description Handles camera movements, effects, and layout changes.
 * Uses device-camera reducer for effect processing.
 */

import type { WorldState } from "../../types";
import type { CameraEvent, HandlerContext } from "./types";
import { cameraReducer } from "@tokovo/device-camera";
import { DEFAULT_CAMERA_STATE, DEFAULT_CAMERA_TRANSFORM } from "../../types";

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

    // Cast type to string for extended runtime compatibility
    // (lowering outputs lowercase 'focus'/'track' in addition to uppercase variants)
    switch (event.type as string) {
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
        case "focus":
        case "FOCUS":
        case "ANCHOR_FOCUS":
        case "track":
        case "TRACK":
        case "ANCHOR_TRACK":
        case "RESET": {
            // Delegate to device-camera reducer
            cameraReducer(draft as any, event as any);
            break;
        }
    }
}
