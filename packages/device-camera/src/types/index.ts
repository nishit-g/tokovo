/**
 * Camera Effect Types
 * 
 * Discriminated union types for type-safe effect handling.
 * Each effect type has a unique `type` discriminant.
 * 
 * @module device-camera/types
 */

// =============================================================================
// EASING TYPES
// =============================================================================

export type EasingType =
    | "linear"
    | "ease-in"
    | "ease-out"
    | "ease-in-out"
    | "bounce"
    | "cinematic"
    | "expoOut"
    | "spring";

// =============================================================================
// EFFECT TYPE DISCRIMINANT
// =============================================================================

export type CameraEffectType =
    | "zoom"
    | "shake"
    | "focus"
    | "track"
    | "reset";

// =============================================================================
// BASE EFFECT INTERFACE
// =============================================================================

export interface CameraEffectBase {
    id: string;
    type: CameraEffectType;
    startFrame: number;
    endFrame: number;
    easing?: EasingType;
}

// =============================================================================
// ZOOM EFFECT
// =============================================================================

export interface ZoomEffect extends CameraEffectBase {
    type: "zoom";
    targetScale: number;
    targetX?: number;
    targetY?: number;
    originX?: number;
    originY?: number;
}

// =============================================================================
// SHAKE EFFECT
// =============================================================================

export interface ShakeEffect extends CameraEffectBase {
    type: "shake";
    intensity: number;
    intensityX?: number;
    intensityY?: number;
    frequency?: number;
    decay?: number;
}

// =============================================================================
// FOCUS EFFECT (SEMANTIC ANCHOR)
// =============================================================================

export interface FocusEffect extends CameraEffectBase {
    type: "focus";
    anchorId: string;
    scale?: number;
    padding?: number;
    preset?: string;
}

// =============================================================================
// TRACK EFFECT (CONTINUOUS FOLLOW)
// =============================================================================

export interface TrackEffect extends CameraEffectBase {
    type: "track";
    anchorId: string;
    scale?: number;
    smoothing?: number;
}

// =============================================================================
// RESET EFFECT
// =============================================================================

export interface ResetEffect extends CameraEffectBase {
    type: "reset";
}

// =============================================================================
// DISCRIMINATED UNION
// =============================================================================

export type CameraEffect =
    | ZoomEffect
    | ShakeEffect
    | FocusEffect
    | TrackEffect
    | ResetEffect;

// =============================================================================
// CAMERA TRANSFORM
// =============================================================================

export interface CameraTransform {
    scale: number;
    translateX: number;
    translateY: number;
    originX: number;
    originY: number;
    rotation: number;
    shakeX: number;
    shakeY: number;
}

export const DEFAULT_TRANSFORM: CameraTransform = {
    scale: 1,
    translateX: 0,
    translateY: 0,
    originX: 0.5,
    originY: 0.5,
    rotation: 0,
    shakeX: 0,
    shakeY: 0,
};

// =============================================================================
// CAMERA STATE
// =============================================================================

export interface CameraState {
    activeEffects: CameraEffect[];
    transform: CameraTransform;
    focusedAnchor?: string | null;
}

// =============================================================================
// ANCHOR TYPES (local definitions to avoid core dependency issues)
// =============================================================================

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface AnchorSnapshot {
    anchors: Record<string, Rect>;
    deviceId: string;
    appId: string;
}
