/**
 * Camera Types
 *
 * This file contains:
 * 1. Re-exports of effect types from @tokovo/device-camera (CameraEffect, CameraTransform, etc.)
 * 2. Core camera state types that belong in core (CameraState, ViewLayout, TransitionType, etc.)
 *
 * CameraState is part of WorldState and must live in core.
 * Effect types are defined in device-camera and re-exported here for convenience.
 */

import type { DeviceId, AppId } from "./device";

// Re-export all camera types from device-camera
export type {
  CameraEffect,
  CameraEffectType,
  ZoomEffect,
  ShakeEffect,
  FocusEffect,
  TrackEffect,
  ResetEffect,
  CameraTransform,
  EasingType,
} from "@tokovo/device-camera";

export { DEFAULT_TRANSFORM } from "@tokovo/device-camera";

// Alias for backward compatibility
export { DEFAULT_TRANSFORM as DEFAULT_CAMERA_TRANSFORM } from "@tokovo/device-camera";

// Import types for use in CameraState
import type { CameraEffect, CameraTransform } from "@tokovo/device-camera";
import { DEFAULT_TRANSFORM } from "@tokovo/device-camera";

// =============================================================================
// TRANSITION TYPES (not camera-specific, stays in core)
// =============================================================================

export type TransitionType =
  | "FADE"
  | "SLIDE_LEFT"
  | "SLIDE_RIGHT"
  | "SLIDE_UP"
  | "SLIDE_DOWN"
  | "ZOOM_IN"
  | "ZOOM_OUT"
  | "CROSS_DISSOLVE";

// =============================================================================
// HIGHLIGHT TYPES (not camera-specific, stays in core)
// =============================================================================

export type HighlightStyle =
  | "pulse"
  | "glow"
  | "shake"
  | "bounce"
  | "spotlight"
  | "scale";

// =============================================================================
// MULTI-DEVICE LAYOUT (stays in core - not camera-specific)
// Note: ViewLayoutMode and PIPPosition are defined in types/layout.ts
// =============================================================================

import type { ViewLayoutMode, PIPPosition } from "./layout";
export type { ViewLayoutMode, PIPPosition };

export interface ViewLayout {
  mode: ViewLayoutMode;
  primaryDeviceId: string;
  secondaryDeviceId?: string;
  pipPosition?: PIPPosition;
  pipScale?: number;
}

export const DEFAULT_VIEW_LAYOUT: ViewLayout = {
  mode: "SINGLE",
  primaryDeviceId: "main_phone",
};

// =============================================================================
// CAMERA STATE - Uses flat CameraEffect[] (no wrapper)
// =============================================================================

/**
 * Camera State
 *
 * IMPORTANT: activeEffects is now CameraEffect[] directly.
 * No more ActiveCameraEffect wrapper.
 *
 * Each CameraEffect has:
 * - type: discriminant ("zoom" | "shake" | "focus" | "track" | "reset")
 * - id: unique identifier
 * - startFrame / endFrame: timing
 * - effect-specific fields (targetScale, intensity, anchorId, etc.)
 */
export interface CameraState {
  /** Base view mode */
  baseView: "APP_VIEW" | "TRANSITION";

  /** Current app ID */
  appId?: AppId;

  /** Active device ID */
  activeDeviceId: string;

  /** Multi-device layout */
  layout: ViewLayout;

  /**
   * Active camera effects (flat, typed).
   * Each effect includes its own timing (startFrame/endFrame).
   * No wrapper needed - the effect IS the full specification.
   */
  activeEffects: CameraEffect[];

  /** Computed transform for primary device */
  transform: CameraTransform;

  /** Per-device transforms */
  deviceTransforms: Record<DeviceId, CameraTransform>;
}

export const DEFAULT_CAMERA_STATE: CameraState = {
  baseView: "APP_VIEW",
  activeDeviceId: "main_phone",
  layout: { ...DEFAULT_VIEW_LAYOUT },
  activeEffects: [],
  transform: { ...DEFAULT_TRANSFORM },
  deviceTransforms: {},
};
