/**
 * Camera Types - Re-exports from @tokovo/device-camera
 * 
 * @description Single source of truth for camera types.
 * All camera types now live in @tokovo/device-camera.
 * 
 * @deprecated Import directly from "@tokovo/device-camera" instead
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
// =============================================================================

export type ViewLayoutMode =
    | "SINGLE"
    | "SPLIT_HORIZONTAL"
    | "SPLIT_VERTICAL"
    | "PIP";

export type PIPPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

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

// =============================================================================
// LEGACY TYPES (deprecated, for migration period only)
// =============================================================================

/** @deprecated Use FocusEffect with anchorId instead */
export type FocusTarget =
    | { type: "app"; appId?: string }
    | { type: "notification"; notificationId?: string }
    | { type: "message"; messageId: string; conversationId?: string }
    | { type: "device"; deviceId?: string }
    | { type: "element"; selector: string }
    | { type: "point"; x: number; y: number };

/** @deprecated Use CameraEffect directly. This wrapper type is removed. */
export interface ActiveCameraEffect {
    id: string;
    effect: unknown;
    startFrame: number;
    endFrame: number;
    deviceId?: string;
}

/** @deprecated */
export interface CameraViewConfig {
    type: "APP_VIEW" | "TRANSITION";
    appId?: AppId;
}
