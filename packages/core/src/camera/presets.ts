/**
 * Cinematic Camera Presets
 * 
 * Pre-configured motion profiles for common scenarios.
 * Presets provide consistent look-and-feel across episodes.
 * 
 * USAGE:
 * ```ts
 * const preset = CAMERA_PRESETS["tense-chat"];
 * // Apply preset values to camera behavior
 * ```
 */

// =============================================================================
// PRESET TYPES
// =============================================================================

/**
 * Numeric preset configuration
 */
export interface CameraPreset {
    /** Display name */
    name: string;

    /** Follow lag factor: 0.1 (tight) to 0.9 (loose/cinematic) */
    followLag: number;

    /** Push-in intensity for new messages: 0.01 (subtle) to 0.15 (dramatic) */
    pushInIntensity: number;

    /** Pan speed multiplier: 0.5 (slow) to 2.0 (fast) */
    panSpeed: number;

    /** Default easing function */
    easing: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "cinematic";

    /** Shake intensity for reactions/emphasis: 0 (none) to 10 (strong) */
    shakeIntensity: number;

    /** Minimum time between camera moves (frames) */
    cooldownFrames: number;

    /** Whether to auto-follow new messages */
    autoFollow: boolean;

    /** Description for documentation */
    description: string;
}

// =============================================================================
// PRESET DEFINITIONS
// =============================================================================

export const CAMERA_PRESETS: Record<string, CameraPreset> = {
    /**
     * Calm Chat
     * - Slow, smooth, minimal movement
     * - Ideal for: normal conversations, casual chat
     */
    "calm-chat": {
        name: "Calm Chat",
        followLag: 0.8,
        pushInIntensity: 0.02,
        panSpeed: 0.5,
        easing: "cinematic",
        shakeIntensity: 0,
        cooldownFrames: 60, // 2 seconds
        autoFollow: true,
        description: "Slow, smooth, minimal movement for relaxed conversations",
    },

    /**
     * Tense Chat
     * - Faster, tighter, more reactive
     * - Ideal for: arguments, drama, confrontation
     */
    "tense-chat": {
        name: "Tense Chat",
        followLag: 0.3,
        pushInIntensity: 0.08,
        panSpeed: 1.2,
        easing: "ease-out",
        shakeIntensity: 3,
        cooldownFrames: 20,
        autoFollow: true,
        description: "Faster, tighter framing for tense conversations",
    },

    /**
     * Fast Chat
     * - Rapid exchanges, minimal lag
     * - Ideal for: rapid-fire texting, jokes, banter
     */
    "fast-chat": {
        name: "Fast Chat",
        followLag: 0.1,
        pushInIntensity: 0.05,
        panSpeed: 2.0,
        easing: "ease-in-out",
        shakeIntensity: 1,
        cooldownFrames: 10,
        autoFollow: true,
        description: "Quick, reactive camera for rapid exchanges",
    },

    /**
     * Dramatic
     * - Maximum intensity for reveals and emotional moments
     * - Ideal for: breakups, confessions, plot twists
     */
    "dramatic": {
        name: "Dramatic",
        followLag: 0.5,
        pushInIntensity: 0.12,
        panSpeed: 0.8,
        easing: "cinematic",
        shakeIntensity: 5,
        cooldownFrames: 45,
        autoFollow: true,
        description: "High intensity framing for emotional moments",
    },

    /**
     * Static
     * - No automatic camera movement
     * - Ideal for: showcase, manual camera control
     */
    "static": {
        name: "Static",
        followLag: 1.0,
        pushInIntensity: 0,
        panSpeed: 0,
        easing: "linear",
        shakeIntensity: 0,
        cooldownFrames: 9999,
        autoFollow: false,
        description: "No automatic camera movement - fully manual",
    },

    /**
     * Documentary
     * - Somewhat detached, observational
     * - Ideal for: recaps, explanations, tutorials
     */
    "documentary": {
        name: "Documentary",
        followLag: 0.7,
        pushInIntensity: 0.03,
        panSpeed: 0.6,
        easing: "ease-out",
        shakeIntensity: 0,
        cooldownFrames: 90,
        autoFollow: true,
        description: "Detached, observational framing for recaps",
    },
};

// =============================================================================
// PRESET HELPERS
// =============================================================================

/**
 * Get a preset by name (case-insensitive)
 * Falls back to "calm-chat" if not found
 */
export function getPreset(name: string): CameraPreset {
    const normalized = name.toLowerCase().replace(/\s+/g, "-");
    return CAMERA_PRESETS[normalized] || CAMERA_PRESETS["calm-chat"];
}

/**
 * List all available preset names
 */
export function listPresets(): string[] {
    return Object.keys(CAMERA_PRESETS);
}

/**
 * Blend two presets together
 * Useful for gradual transitions (e.g., conversation escalating)
 * 
 * @param from - Starting preset
 * @param to - Ending preset  
 * @param t - Blend factor 0-1 (0 = from, 1 = to)
 */
export function blendPresets(
    from: CameraPreset,
    to: CameraPreset,
    t: number
): CameraPreset {
    const blend = Math.max(0, Math.min(1, t));

    return {
        name: `${from.name} → ${to.name}`,
        followLag: lerp(from.followLag, to.followLag, blend),
        pushInIntensity: lerp(from.pushInIntensity, to.pushInIntensity, blend),
        panSpeed: lerp(from.panSpeed, to.panSpeed, blend),
        easing: blend < 0.5 ? from.easing : to.easing,
        shakeIntensity: lerp(from.shakeIntensity, to.shakeIntensity, blend),
        cooldownFrames: Math.round(lerp(from.cooldownFrames, to.cooldownFrames, blend)),
        autoFollow: blend < 0.5 ? from.autoFollow : to.autoFollow,
        description: `Blend: ${from.name} to ${to.name}`,
    };
}

/**
 * Linear interpolation helper
 */
function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default CAMERA_PRESETS;
