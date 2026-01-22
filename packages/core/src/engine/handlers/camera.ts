/**
 * Camera Handler - Processes CAMERA events
 *
 * @description Handles camera movements, effects, and layout changes.
 * Uses device-camera reducer for effect processing.
 */

import type { WorldState, ViewLayoutMode, PIPPosition } from "../../types";
import type { CameraEvent, HandlerContext } from "./types";
import { cameraReducer } from "@tokovo/device-camera";
import { DEFAULT_CAMERA_STATE, DEFAULT_CAMERA_TRANSFORM } from "../../types";

interface CameraEventPayload {
  view?: { type: string; appId?: string };
  toDeviceId?: string;
  toView?: string;
  mode?: string;
  primaryDeviceId?: string;
  secondaryDeviceId?: string;
  pipPosition?: string;
  pipScale?: number;
}

function normalizeLayoutMode(mode: string | undefined): ViewLayoutMode {
  if (!mode) return "SINGLE";
  const upper = mode.toUpperCase();
  if (upper === "SPLIT") return "SPLIT_HORIZONTAL";
  if (
    upper === "SPLIT_HORIZONTAL" ||
    upper === "SPLIT_VERTICAL" ||
    upper === "SINGLE" ||
    upper === "PIP"
  ) {
    return upper as ViewLayoutMode;
  }
  return "SINGLE";
}

export function processCameraEvent(
  draft: WorldState,
  event: CameraEvent,
  ctx: HandlerContext,
): void {
  if (!draft.camera || !draft.camera.activeEffects) {
    draft.camera = { ...DEFAULT_CAMERA_STATE };
  }
  if (!draft.camera.layout) {
    draft.camera.layout = {
      mode: "SINGLE",
      primaryDeviceId:
        draft.camera.activeDeviceId ||
        Object.keys(draft.devices)[0] ||
        "main_phone",
    };
  }

  const payload = event as CameraEvent & CameraEventPayload;

  switch (event.type as string) {
    case "SET_VIEW":
      if (payload.view?.type) {
        draft.camera.baseView = payload.view.type as "APP_VIEW" | "TRANSITION";
      }
      draft.camera.appId = payload.view?.appId;
      break;

    case "CUT":
      draft.camera.activeEffects = [];
      draft.camera.transform = { ...DEFAULT_CAMERA_TRANSFORM };

      if (payload.toDeviceId) {
        draft.camera.activeDeviceId = payload.toDeviceId;
        draft.camera.layout.primaryDeviceId = payload.toDeviceId;
      }

      if (payload.toView) {
        draft.camera.baseView =
          payload.toView === "app" ? "APP_VIEW" : "TRANSITION";
      }
      break;

    case "LAYOUT":
      draft.camera.layout = {
        mode: normalizeLayoutMode(payload.mode),
        primaryDeviceId:
          payload.primaryDeviceId || draft.camera.layout.primaryDeviceId,
        secondaryDeviceId: payload.secondaryDeviceId,
        pipPosition: payload.pipPosition as PIPPosition | undefined,
        pipScale: payload.pipScale,
      };
      if (payload.primaryDeviceId) {
        draft.camera.activeDeviceId = payload.primaryDeviceId;
      }
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
      cameraReducer(
        draft as unknown as Parameters<typeof cameraReducer>[0],
        event as unknown as Parameters<typeof cameraReducer>[1],
      );
      break;
    }
  }
}
