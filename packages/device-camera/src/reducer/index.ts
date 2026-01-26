/**
 * Camera Reducer - Processes runtime events into typed effects
 *
 * Uses discriminated union types directly - no legacy wrappers.
 *
 * @module device-camera/reducer
 */

import type { CameraTransform } from "@tokovo/core";
import { DEFAULT_CAMERA_TRANSFORM as DEFAULT_TRANSFORM } from "@tokovo/core";
import {
  CameraEffect,
  ZoomEffect,
  ShakeEffect,
  FocusEffect,
  TrackEffect,
  ResetEffect,
  PunchZoomEffect,
  DutchTiltEffect,
  FlashEffect,
  WhipPanEffect,
  CameraState,
  DEFAULT_CAMERA_STATE,
  EasingType,
} from "../types";

import type { ViewLayoutMode } from "@tokovo/core";

// =============================================================================
// EVENT TYPES
// =============================================================================

interface CameraEvent {
  kind: "CAMERA";
  type: string;
  at: number;
  [key: string]: unknown;
}

// =============================================================================
// REDUCER
// =============================================================================

/**
 * Process a camera event and update state.
 * Creates properly typed effects directly - no conversion needed.
 */
export function cameraReducer(
  draft: { camera?: CameraState },
  event: CameraEvent,
): void {
  if (event.kind !== "CAMERA") return;

  // Ensure camera state exists
  if (!draft.camera) {
    draft.camera = { ...DEFAULT_CAMERA_STATE };
  }

  const at = event.at;
  const duration = (event.duration as number) ?? 30;
  const easing = (event.easing as EasingType) ?? "ease-out";

  const normalizedType = event.type.toLowerCase().replace(/_/g, "-");

  switch (normalizedType) {
    // =================================================================
    // ZOOM - Scale and translate
    // =================================================================
    case "zoom": {
      const effect: ZoomEffect = {
        type: "zoom",
        id: `zoom_${at}`,
        startFrame: at,
        endFrame: at + duration,
        targetScale: (event.scale as number) ?? 1,
        targetX: (event.translateX as number) ?? 0,
        targetY: (event.translateY as number) ?? 0,
        originX: event.originX as number | undefined,
        originY: event.originY as number | undefined,
        easing,
      };
      draft.camera.activeEffects.push(effect);
      break;
    }

    // =================================================================
    // SHAKE - Screen shake
    // =================================================================
    case "shake": {
      const effect: ShakeEffect = {
        type: "shake",
        id: `shake_${at}`,
        startFrame: at,
        endFrame: at + duration,
        intensity: (event.intensity as number) ?? 5,
        intensityX: event.intensityX as number | undefined,
        intensityY: event.intensityY as number | undefined,
        frequency: (event.frequency as number) ?? 15,
        decay: (event.decay as number) ?? 0.8,
        easing,
      };
      draft.camera.activeEffects.push(effect);
      break;
    }

    // =================================================================
    // focus - Semantic anchor focus (one-time)
    // =================================================================
    case "focus":
    case "anchor-focus": {
      const effect: FocusEffect = {
        type: "focus",
        id: `focus_${at}`,
        startFrame: at,
        endFrame: at + duration,
        anchorId:
          (event.anchorId as string) ?? (event.anchor as string) ?? "device",
        scale: event.scale as number | undefined,
        preset: event.preset as string | undefined,
        easing,
      };
      draft.camera.activeEffects.push(effect);
      break;
    }

    // =================================================================
    // track - Continuous anchor following
    // =================================================================
    case "track":
    case "anchor-track": {
      const effect: TrackEffect = {
        type: "track",
        id: `track_${at}`,
        startFrame: at,
        endFrame: at + duration,
        anchorId:
          (event.anchorId as string) ?? (event.anchor as string) ?? "device",
        scale: (event.scale as number) ?? 1.05,
        smoothing: (event.smoothing as number) ?? 0.18,
        easing,
      };
      draft.camera.activeEffects.push(effect);
      break;
    }

    // =================================================================
    // reset - Return to neutral
    // =================================================================
    case "reset": {
      const effect: ResetEffect = {
        type: "reset",
        id: `reset_${at}`,
        startFrame: at,
        endFrame: at + duration,
        easing,
        spring: event.spring as string | undefined,
      };
      draft.camera.activeEffects.push(effect);
      break;
    }

    // =================================================================
    // punch-zoom - Quick zoom with spring bounce
    // =================================================================
    case "punch-zoom": {
      const effect: PunchZoomEffect = {
        type: "punch-zoom",
        id: `punch-zoom_${at}`,
        startFrame: at,
        endFrame: at + duration,
        intensity: (event.intensity as number) ?? 0.15,
        direction: (event.direction as "in" | "out") ?? "in",
        spring: (event.spring as string) ?? "punch",
        easing,
      };
      draft.camera.activeEffects.push(effect);
      break;
    }

    // =================================================================
    // dutch-tilt - Z-axis rotation for tension
    // =================================================================
    case "dutch-tilt": {
      const effect: DutchTiltEffect = {
        type: "dutch-tilt",
        id: `dutch-tilt_${at}`,
        startFrame: at,
        endFrame: at + duration,
        angle: (event.angle as number) ?? 5,
        spring: (event.spring as string) ?? "dramatic",
        easing,
      };
      draft.camera.activeEffects.push(effect);
      break;
    }

    // =================================================================
    // flash - Screen flash effect
    // =================================================================
    case "flash": {
      const effect: FlashEffect = {
        type: "flash",
        id: `flash_${at}`,
        startFrame: at,
        endFrame: at + duration,
        color: (event.color as string) ?? "white",
        intensity: (event.intensity as number) ?? 1,
        easing,
      };
      draft.camera.activeEffects.push(effect);
      break;
    }

    // =================================================================
    // whip-pan - Fast pan transition
    // =================================================================
    case "whip-pan": {
      const effect: WhipPanEffect = {
        type: "whip-pan",
        id: `whip-pan_${at}`,
        startFrame: at,
        endFrame: at + duration,
        direction:
          (event.direction as "left" | "right" | "up" | "down") ?? "left",
        blur: (event.blur as number) ?? 20,
        easing,
      };
      draft.camera.activeEffects.push(effect);
      break;
    }

    // =================================================================
    // cut - Instant camera change
    // =================================================================
    case "cut": {
      // Clear non-persistent effects only (preserve ambient effects)
      draft.camera.activeEffects = draft.camera.activeEffects.filter(
        (effect: CameraEffect) => effect.persistent === true,
      );
      draft.camera.transform = { ...DEFAULT_TRANSFORM };

      // Update device if specified
      if (event.toDeviceId) {
        draft.camera.activeDeviceId = event.toDeviceId as string;
      }
      break;
    }

    // =================================================================
    // set-view - Legacy view change
    // =================================================================
    case "set-view": {
      const view = event.view as { type?: string; appId?: string } | undefined;
      if (view?.type) {
        draft.camera.baseView = view.type as "APP_VIEW" | "TRANSITION";
        draft.camera.appId = view.appId;
      }
      break;
    }

    // =================================================================
    // layout - Change view layout mode
    // =================================================================
    case "layout": {
      draft.camera.layout = {
        mode: (event.mode as ViewLayoutMode) ?? "SINGLE",
        primaryDeviceId: (event.primaryDeviceId ??
          draft.camera.activeDeviceId) as string,
        secondaryDeviceId: event.secondaryDeviceId as string | undefined,
      };
      break;
    }
  }
}

// =============================================================================
// EFFECT CLEANUP
// =============================================================================

/**
 * Remove expired effects from state.
 * Call periodically to prevent memory growth.
 */
export function cleanupExpiredEffects(
  state: CameraState,
  currentFrame: number,
): void {
  // Keep effects that end after current frame (still active or future)
  state.activeEffects = state.activeEffects.filter(
    (effect: CameraEffect) => effect.endFrame > currentFrame,
  );
}

/**
 * Get only active effects at a specific frame.
 */
export function getActiveEffects(
  state: CameraState,
  frame: number,
): CameraEffect[] {
  return state.activeEffects.filter(
    (effect: CameraEffect) =>
      frame >= effect.startFrame && frame < effect.endFrame,
  );
}
