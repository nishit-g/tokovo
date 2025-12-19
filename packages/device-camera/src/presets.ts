/**
 * Camera Presets - Shot preset definitions
 * 
 * @module device-camera/presets
 */

// =============================================================================
// TYPES
// =============================================================================

export interface CameraPreset {
    /** Name of the preset */
    name: string;

    /** Duration of the push-in effect in frames */
    pushInDuration: number;

    /** Intensity of push-in (scale multiplier) */
    pushInIntensity: number;

    /** Pan speed multiplier */
    panSpeed: number;

    /** Cooldown frames between camera moves */
    cooldownFrames: number;

    /** Shake intensity (0 = disabled) */
    shakeIntensity: number;

    /** Default easing */
    easing: "ease-out" | "ease-in-out" | "linear" | "cinematic";
}

export interface CameraTarget {
    /** Rectangle for targeting */
    rect?: { x: number; y: number; width: number; height: number };

    /** Normalized point (0-1) */
    point?: { x: number; y: number };
}

export interface TimelineStep {
    /** Primitive type */
    primitive: "FOLLOW" | "PUSH_IN" | "PULL_OUT" | "SNAP" | "HOLD" | "SHAKE";

    /** Duration in frames */
    duration: number;

    /** Target */
    target?: CameraTarget;

    /** Scale */
    scale?: number;

    /** Easing */
    easing?: "ease-out" | "ease-in-out" | "linear" | "cinematic";
}

export interface CameraTimeline {
    /** Unique ID */
    id: string;

    /** Steps in the timeline */
    steps: TimelineStep[];

    /** Total duration */
    totalDuration: number;
}

// =============================================================================
// PRESET DEFINITIONS
// =============================================================================

const PRESETS: Record<string, CameraPreset> = {
    /** Calm, slow camera for casual chat */
    "calm-chat": {
        name: "calm-chat",
        pushInDuration: 45,
        pushInIntensity: 0.05,
        panSpeed: 0.8,
        cooldownFrames: 60,
        shakeIntensity: 0,
        easing: "ease-out",
    },

    /** Dramatic camera for tense conversations */
    "dramatic": {
        name: "dramatic",
        pushInDuration: 30,
        pushInIntensity: 0.15,
        panSpeed: 1.2,
        cooldownFrames: 30,
        shakeIntensity: 2,
        easing: "cinematic",
    },

    /** Fast-paced for action/arguments */
    "action": {
        name: "action",
        pushInDuration: 15,
        pushInIntensity: 0.1,
        panSpeed: 1.5,
        cooldownFrames: 15,
        shakeIntensity: 5,
        easing: "ease-in-out",
    },

    /** Documentary style - minimal movement */
    "documentary": {
        name: "documentary",
        pushInDuration: 60,
        pushInIntensity: 0.03,
        panSpeed: 0.5,
        cooldownFrames: 90,
        shakeIntensity: 0,
        easing: "linear",
    },

    /** Default preset */
    "default": {
        name: "default",
        pushInDuration: 40,
        pushInIntensity: 0.08,
        panSpeed: 1.0,
        cooldownFrames: 45,
        shakeIntensity: 0,
        easing: "ease-out",
    },
};

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Get a camera preset by name
 */
export function getPreset(name: string): CameraPreset {
    return PRESETS[name] || PRESETS["default"];
}

/**
 * Get shot preset scale (for anchor effects)
 */
export function getShotPreset(preset?: string): number {
    switch (preset) {
        // v1 CORE (LOCKED)
        case "message": return 1.08;
        case "subtle": return 1.04;
        case "impact": return 1.35;
        case "snap": return 1.15;
        // v1 MOTION (LOCKED)
        case "operatorFollow": return 1.22;
        case "punchGlide": return 1.35;
        // v1 INTERRUPTION (LOCKED)
        case "interrupt": return 1.25;
        case "takeover": return 0.85;
        // v1 STRUCTURAL (LOCKED)
        case "reset": return 1.0;
        case "establish": return 0.9;
        // v2 (feature-flagged)
        case "suspenseHold": return 1.1;
        case "voyeur": return 0.92;
        case "isolation": return 0.88;
        case "whipSnap": return 1.18;
        case "floatFollow": return 1.15;
        case "panic": return 1.4;
        case "collapse": return 0.8;
        // Legacy (deprecated)
        case "dramatic": return 1.3;
        case "impactPunch": return 1.35;
        case "documentaryHold": return 1.05;
        case "documentary": return 1.0;
        default: return 1.15;
    }
}

/**
 * Compose a timeline from steps
 */
export function composeTimeline(id: string, steps: TimelineStep[]): CameraTimeline {
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    return {
        id,
        steps,
        totalDuration,
    };
}

/**
 * Get all available preset names
 */
export function getPresetNames(): string[] {
    return Object.keys(PRESETS);
}

/** Type alias for shot preset ID */
export type ShotPresetId = string;
