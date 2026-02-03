/**
 * Camera Types - Discriminated Union Effect System
 *
 * @module device-camera/types
 */

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
// SPRING PHYSICS CONFIGURATION
// =============================================================================

/**
 * Spring physics configuration for organic camera motion.
 * Based on Remotion spring() parameters.
 */
export interface SpringConfig {
  /** Resistance to motion. Higher = less bouncy. Default: 10 */
  damping: number;
  /** Spring stiffness. Higher = faster motion. Default: 100 */
  stiffness: number;
  /** Mass of the object. Higher = slower, more momentum. Default: 1 */
  mass: number;
  /** Allow overshoot past target. Default: true */
  overshootClamping?: boolean;
}

/**
 * Pre-configured spring feels for different camera moods.
 */
export const SPRING_PRESETS: Record<string, SpringConfig> = {
  /** Smooth, no bounce - for subtle reveals */
  smooth: { damping: 200, stiffness: 100, mass: 1 },
  /** Snappy, minimal bounce - for UI focus */
  snappy: { damping: 20, stiffness: 200, mass: 1 },
  /** Bouncy, playful overshoot - for emphasis */
  bouncy: { damping: 8, stiffness: 100, mass: 1 },
  /** Heavy, weighty motion - for dramatic moments */
  dramatic: { damping: 12, stiffness: 80, mass: 2 },
  /** Quick punch with settle - for impacts */
  punch: { damping: 15, stiffness: 300, mass: 0.8 },
  /** Cinematic, film-like motion */
  cinematic: { damping: 25, stiffness: 60, mass: 1.5 },
  /** Default balanced spring */
  default: { damping: 15, stiffness: 100, mass: 1 },
};

/**
 * Framing presets - how tight the camera frames the anchor.
 * Value is target fill percentage of viewport.
 */
export const FRAMING_PRESETS: Record<string, number> = {
  extreme: 0.9, // Very tight closeup
  tight: 0.75, // Close framing
  medium: 0.6, // Default balanced
  loose: 0.45, // Breathing room
  wide: 0.3, // Wide shot
  establish: 0.2, // Establishing shot
};

/**
 * Camera feel preset - combines spring + framing + intensity
 */
export interface CameraFeel {
  spring: SpringConfig;
  framing: number;
  shakeMultiplier: number;
}

export const CAMERA_FEELS: Record<string, CameraFeel> = {
  calm: {
    spring: SPRING_PRESETS.smooth,
    framing: FRAMING_PRESETS.loose,
    shakeMultiplier: 0.3,
  },
  dramatic: {
    spring: SPRING_PRESETS.dramatic,
    framing: FRAMING_PRESETS.tight,
    shakeMultiplier: 1.5,
  },
  action: {
    spring: SPRING_PRESETS.punch,
    framing: FRAMING_PRESETS.medium,
    shakeMultiplier: 2.0,
  },
  documentary: {
    spring: SPRING_PRESETS.cinematic,
    framing: FRAMING_PRESETS.wide,
    shakeMultiplier: 0.5,
  },
  intense: {
    spring: SPRING_PRESETS.snappy,
    framing: FRAMING_PRESETS.extreme,
    shakeMultiplier: 2.5,
  },
};

// =============================================================================
// EFFECT BASE
// =============================================================================

interface EffectBase {
  id: string;
  startFrame: number;
  endFrame: number;
  easing?: EasingType;
  /** Spring physics config or preset name (overrides easing when provided) */
  spring?: SpringConfig | string;
  /** Camera feel preset name */
  feel?: string;
  /** Target device (undefined = apply to all/primary device) */
  deviceId?: string;
  /** Persistent effects survive CUT events (e.g., ambient camera drift) */
  persistent?: boolean;
}

// =============================================================================
// DISCRIMINATED UNION: CameraEffect
// =============================================================================

export type CameraEffectType =
  | "zoom"
  | "shake"
  | "focus"
  | "track"
  | "reset"
  | "pan"
  | "dolly"
  | "ken-burns"
  | "punch-zoom"
  | "dutch-tilt"
  | "flash"
  | "whip-pan";

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
 * PAN - Horizontal/Vertical camera movement (no scale change)
 */
export interface PanEffect extends EffectBase {
  type: "pan";
  deltaX: number;
  deltaY: number;
}

/**
 * DOLLY - Cinematic zoom with subtle depth shift (Hitchcock effect)
 */
export interface DollyEffect extends EffectBase {
  type: "dolly";
  startScale: number;
  endScale: number;
  startTranslateY: number;
  endTranslateY: number;
}

/**
 * KEN BURNS - Slow zoom + pan for static images / dramatic effect
 */
export interface KenBurnsEffect extends EffectBase {
  type: "ken-burns";
  startScale: number;
  endScale: number;
  startOriginX: number;
  startOriginY: number;
  endOriginX: number;
  endOriginY: number;
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
 * PUNCH ZOOM - Quick zoom in with spring bounce back
 */
export interface PunchZoomEffect extends EffectBase {
  type: "punch-zoom";
  intensity: number;
  direction: "in" | "out";
  spring?: SpringConfig | string;
}

/**
 * DUTCH TILT - Z-axis rotation for unease/tension
 */
export interface DutchTiltEffect extends EffectBase {
  type: "dutch-tilt";
  angle: number;
  spring?: SpringConfig | string;
}

/**
 * FLASH - White/color flash overlay
 */
export interface FlashEffect extends EffectBase {
  type: "flash";
  color?: string;
  intensity?: number;
}

/**
 * WHIP PAN - Fast horizontal blur transition
 */
export interface WhipPanEffect extends EffectBase {
  type: "whip-pan";
  direction: "left" | "right" | "up" | "down";
  blur?: number;
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
  | ResetEffect
  | PanEffect
  | DollyEffect
  | KenBurnsEffect
  | PunchZoomEffect
  | DutchTiltEffect
  | FlashEffect
  | WhipPanEffect;

// =============================================================================
// RE-EXPORTS FROM CORE
// =============================================================================

export type {
  CameraTransform,
  ViewLayout,
  TransitionType,
  HighlightStyle,
} from "@tokovo/core";

export { DEFAULT_CAMERA_TRANSFORM, DEFAULT_VIEW_LAYOUT } from "@tokovo/core";

import type { BaseCameraState } from "@tokovo/core";
import { DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";

export interface CameraState extends BaseCameraState {
  activeEffects: CameraEffect[];
}

export const DEFAULT_CAMERA_STATE: CameraState = {
  ...DEFAULT_BASE_CAMERA_STATE,
  activeEffects: [],
};
