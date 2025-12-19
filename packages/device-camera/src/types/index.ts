/**
 * Camera Types - Discriminated Union Effect System
 * 
 * @module device-camera/types
 */

// =============================================================================
// CORE TRANSFORM
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
// EASING
// =============================================================================

export type EasingType =
    | "linear"
    | "ease-in"
    | "ease-out"
    | "ease-in-out"
    | "bounce"
    | "elastic"
    | "cinematic"
    | "expoOut"
    | "spring";

// =============================================================================
// EFFECT BASE
// =============================================================================

interface EffectBase {
    id: string;
    startFrame: number;
    endFrame: number;
    easing?: EasingType;
    /** Target device (undefined = apply to all/primary device) */
    deviceId?: string;
}

// =============================================================================
// DISCRIMINATED UNION: CameraEffect
// =============================================================================

export type CameraEffectType = "zoom" | "shake" | "focus" | "track" | "reset";

/**
 * ZOOM - Scale and translate with origin
 */
export interface ZoomEffect extends EffectBase {
    type: "zoom";
    targetScale: number;
    targetX?: number;
    targetY?: number;
    originX?: number;
    originY?: number;
}

/**
 * SHAKE - Procedural screen shake
 */
export interface ShakeEffect extends EffectBase {
    type: "shake";
    intensity: number;
    intensityX?: number;
    intensityY?: number;
    frequency?: number;
    decay?: number;
}

/**
 * FOCUS - Semantic anchor focus (one-time)
 */
export interface FocusEffect extends EffectBase {
    type: "focus";
    anchorId: string;
    scale?: number;
    preset?: string;
}

/**
 * TRACK - Continuous anchor following
 */
export interface TrackEffect extends EffectBase {
    type: "track";
    anchorId: string;
    scale?: number;
    smoothing?: number;
}

/**
 * RESET - Return to neutral camera
 */
export interface ResetEffect extends EffectBase {
    type: "reset";
}

/**
 * Discriminated union of all camera effects.
 * TypeScript will narrow the type based on the `type` field.
 */
export type CameraEffect =
    | ZoomEffect
    | ShakeEffect
    | FocusEffect
    | TrackEffect
    | ResetEffect;

// =============================================================================
// CAMERA STATE
// =============================================================================

export interface CameraState {
    /** Active effects (processed each frame) */
    activeEffects: CameraEffect[];

    /** Current computed transform (updated by engine) */
    transform: CameraTransform;

    /** Active device ID */
    activeDeviceId?: string;

    /** Base view mode */
    baseView?: string;

    /** Current app being viewed */
    appId?: string;

    /** Layout mode */
    layout?: {
        mode: "SINGLE" | "PIP" | "SPLIT";
        primaryDeviceId?: string;
        secondaryDeviceId?: string;
    };
}

export const DEFAULT_CAMERA_STATE: CameraState = {
    activeEffects: [],
    transform: DEFAULT_TRANSFORM,
};

// =============================================================================
// LEGACY COMPATIBILITY (to be removed)
// =============================================================================

/** @deprecated Use CameraEffect directly */
export interface ActiveCameraEffect {
    id: string;
    effect: CameraEffect;
    startFrame: number;
    endFrame: number;
    deviceId?: string;
}
