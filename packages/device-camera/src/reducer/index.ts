/**
 * Camera Reducer - Processes runtime events into typed effects
 *
 * Uses discriminated union types directly - no legacy wrappers.
 *
 * @module device-camera/reducer
 */

import {
  CameraEffect,
  ZoomEffect,
  ShakeEffect,
  FocusEffect,
  TrackEffect,
  ResetEffect,
  CameraState,
  DEFAULT_CAMERA_STATE,
  DEFAULT_TRANSFORM,
  EasingType,
} from "../types";

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

  switch (event.type) {
    // =================================================================
    // ZOOM - Scale and translate
    // =================================================================
    case "ZOOM": {
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
    case "SHAKE": {
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
    // focus/FOCUS/ANCHOR_FOCUS - Semantic anchor focus (one-time)
    // =================================================================
    case "focus":
    case "FOCUS":
    case "ANCHOR_FOCUS": {
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
    // track/TRACK/ANCHOR_TRACK - Continuous anchor following
    // =================================================================
    case "track":
    case "TRACK":
    case "ANCHOR_TRACK": {
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
    // RESET - Return to neutral
    // =================================================================
    case "RESET": {
      const effect: ResetEffect = {
        type: "reset",
        id: `reset_${at}`,
        startFrame: at,
        endFrame: at + duration,
        easing,
      };
      draft.camera.activeEffects.push(effect);
      break;
    }

    // =================================================================
    // CUT - Instant camera change
    // =================================================================
    case "CUT": {
      // Clear non-persistent effects only (preserve ambient effects)
      draft.camera.activeEffects = draft.camera.activeEffects.filter(
        (effect) => effect.persistent === true,
      );
      draft.camera.transform = { ...DEFAULT_TRANSFORM };

      // Update device if specified
      if (event.toDeviceId) {
        draft.camera.activeDeviceId = event.toDeviceId as string;
      }
      break;
    }

    // =================================================================
    // SET_VIEW - Legacy view change
    // =================================================================
    case "SET_VIEW": {
      const view = event.view as { type?: string; appId?: string } | undefined;
      if (view) {
        draft.camera.baseView = view.type;
        draft.camera.appId = view.appId;
      }
      break;
    }

    // =================================================================
    // LAYOUT - Change view layout mode
    // =================================================================
    case "LAYOUT": {
      draft.camera.layout = {
        mode: (event.mode as "SINGLE" | "PIP" | "SPLIT") ?? "SINGLE",
        primaryDeviceId: event.primaryDeviceId as string | undefined,
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
    (effect) => effect.endFrame > currentFrame,
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
    (effect) => frame >= effect.startFrame && frame < effect.endFrame,
  );
}
