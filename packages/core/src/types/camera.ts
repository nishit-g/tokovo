/**
 * Camera Types - All camera and transform types
 * 
 * @description Camera effects, transforms, and multi-device layouts.
 */

import type { DeviceId, AppId } from "./device";

// =============================================================================
// EASING TYPES
// =============================================================================

export type EasingType =
    | "linear"
    | "ease-in"
    | "ease-out"
    | "ease-in-out"
    | "bounce"
    | "elastic"
    | "cinematic"
    | "expoOut";

// =============================================================================
// TRANSITION TYPES
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
// HIGHLIGHT TYPES
// =============================================================================

export type HighlightStyle =
    | "pulse"
    | "glow"
    | "shake"
    | "bounce"
    | "spotlight"
    | "scale";

// =============================================================================
// CAMERA EFFECT TYPES
// =============================================================================

export type CameraEffectType = "ZOOM" | "PAN" | "SHAKE" | "FOCUS" | "CUT" | "RESET";

export type FocusTarget =
    | { type: "app"; appId?: string }
    | { type: "notification"; notificationId?: string }
    | { type: "message"; messageId: string; conversationId?: string }
    | { type: "device"; deviceId?: string }
    | { type: "element"; selector: string }
    | { type: "point"; x: number; y: number };

// =============================================================================
// CAMERA EFFECTS
// =============================================================================

export interface CameraZoomEffect {
    type: "ZOOM";
    scale: number;
    originX?: number;
    originY?: number;
    duration: number;
    easing?: EasingType;
}

export interface CameraPanEffect {
    type: "PAN";
    translateX: number;
    translateY: number;
    relative?: boolean;
    duration: number;
    easing?: EasingType;
}

export interface CameraShakeEffect {
    type: "SHAKE";
    intensity: number;
    frequency: number;
    decay?: number;
    duration: number;
    seed?: number;
}

export interface CameraFocusEffect {
    type: "FOCUS";
    target: FocusTarget;
    scale?: number;
    duration: number;
    easing?: EasingType;
    holdDuration?: number;
}

export interface CameraCutEffect {
    type: "CUT";
    toDeviceId?: string;
    toView?: "app" | "lockscreen" | "homescreen";
    fadeMs?: number;
}

export interface CameraResetEffect {
    type: "RESET";
    duration: number;
    easing?: EasingType;
}

export interface CameraAnchorFocusEffect {
    type: "ANCHOR_FOCUS";
    anchor: string;
    preset?: string;
    scale?: number;
    duration: number;
    easing?: EasingType;
    shake?: number;
    resolvedRect?: { x: number; y: number; width: number; height: number };
    viewport?: { width: number; height: number };
}

export interface CameraAnchorTrackEffect {
    type: "ANCHOR_TRACK";
    anchor: string;
    duration: number;
    smoothing?: number;
    preset?: string;
    scale?: number;
    easing?: EasingType;
}

export interface CameraHoldEffect {
    type: "HOLD";
    duration: number;
}

export type CameraEffect =
    | CameraZoomEffect
    | CameraPanEffect
    | CameraShakeEffect
    | CameraFocusEffect
    | CameraAnchorFocusEffect
    | CameraAnchorTrackEffect
    | CameraHoldEffect
    | CameraCutEffect
    | CameraResetEffect;

// =============================================================================
// ACTIVE CAMERA EFFECT
// =============================================================================

export interface ActiveCameraEffect {
    id: string;
    effect: CameraEffect;
    startFrame: number;
    endFrame: number;
    deviceId?: string;
}

// =============================================================================
// CAMERA TRANSFORM
// =============================================================================

export interface CameraTransform {
    translateX: number;
    translateY: number;
    scale: number;
    rotation: number;
    originX: number;
    originY: number;
    shakeX: number;
    shakeY: number;
}

export const DEFAULT_CAMERA_TRANSFORM: CameraTransform = {
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotation: 0,
    originX: 0.5,
    originY: 0.5,
    shakeX: 0,
    shakeY: 0,
};

// =============================================================================
// MULTI-DEVICE LAYOUT
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
// CAMERA STATE
// =============================================================================

export interface CameraState {
    baseView: "APP_VIEW" | "TRANSITION";
    appId?: AppId;
    activeDeviceId: string;
    layout: ViewLayout;
    activeEffects: ActiveCameraEffect[];
    transform: CameraTransform;
    deviceTransforms: Record<DeviceId, CameraTransform>;
}

export const DEFAULT_CAMERA_STATE: CameraState = {
    baseView: "APP_VIEW",
    activeDeviceId: "main_phone",
    layout: { ...DEFAULT_VIEW_LAYOUT },
    activeEffects: [],
    transform: { ...DEFAULT_CAMERA_TRANSFORM },
    deviceTransforms: {},
};

// Legacy type
export interface CameraViewConfig {
    type: "APP_VIEW" | "TRANSITION";
    appId?: AppId;
}
