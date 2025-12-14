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
// SHOT PRESETS (for Semantic Anchor System)
// =============================================================================

import type { EasingType } from "../types";

/**
 * Shot preset for semantic anchor-driven camera.
 * These are simpler than full CameraPresets — just the core motion parameters.
 *
 * USAGE: Apps reference by name, optionally override with deltas.
 * 
 * v1 PRESETS ARE SACRED. Do not modify their semantics.
 * v2 presets are expressive and feature-flagged.
 */
export interface ShotPreset {
    /** Zoom scale (1.0 = no zoom) */
    scale: number;

    /** Easing function */
    easing: EasingType;

    /** Optional shake intensity */
    shake?: number;

    /** Duration in frames */
    durationFrames: number;

    /** Hold at peak before returning (frames) */
    holdFrames?: number;

    // === v1 ADDITIONS ===

    /** Subtle camera drift (for breathing/anticipation) */
    drift?: number;

    // === TRACKING (for ANCHOR_TRACK effects) ===

    /** Whether this preset uses tracking (per-frame follow) */
    tracking?: boolean;

    /** Smoothing factor for tracking (0.08=slow, 0.18=operator, 0.6=whip) */
    smoothing?: number;

    /** For punchGlide: punch phase frames */
    punchFrames?: number;

    /** For punchGlide: glide phase frames */
    glideFrames?: number;

    // === VERSIONING ===

    /** If true, this is a v2 preset (feature-flagged, not in v1 ship set) */
    v2?: boolean;
}

/**
 * Global shot presets — shared across all apps.
 * Apps reference these by name. This is the "Tokovo look".
 *
 * ⚠️ v1 PRESETS ARE SACRED — Do not modify their values.
 * v2 presets are feature-flagged and require emotional state model.
 * 
 * v1 SHIP SET (8): message, subtle, impact, snap, operatorFollow, punchGlide, interrupt, reset
 */
export const SHOT_PRESETS = {
    // =========================================================================
    // 🟢 v1 CORE FLOW PRESETS (LOCKED — DO NOT MODIFY)
    // =========================================================================

    /**
     * MESSAGE - Default follow for new messages
     * @locked v1
     */
    message: {
        scale: 1.08,
        easing: "ease-out" as EasingType,
        shake: 0,
        durationFrames: 22,
    },

    /**
     * SUBTLE - Anticipation / breathing
     * @locked v1
     */
    subtle: {
        scale: 1.04,
        easing: "cinematic" as EasingType,
        shake: 0,
        durationFrames: 30,
        drift: 0.003,  // Subtle breathing motion
    },

    /**
     * IMPACT - Emotional hit (big reveal, breakup, confession)
     * @locked v1
     */
    impact: {
        scale: 1.35,
        easing: "expoOut" as EasingType,  // Fast deceleration
        shake: 6,
        durationFrames: 14,
    },

    /**
     * SNAP - Fast reaction (like, emoji, quick reply)
     * @locked v1
     */
    snap: {
        scale: 1.15,
        easing: "ease-out" as EasingType,
        shake: 1,
        durationFrames: 8,
    },

    // =========================================================================
    // 🟡 v1 MOTION / TRAVEL PRESETS (LOCKED)
    // =========================================================================

    /**
     * OPERATOR FOLLOW - Camera travels with content (webseries standard)
     * @locked v1
     */
    operatorFollow: {
        scale: 1.22,
        easing: "ease-out" as EasingType,
        shake: 0,
        durationFrames: 40,
        tracking: true,
        smoothing: 0.18,  // Operator feel
    },

    /**
     * PUNCH GLIDE - Punch in → glide follow (webseries signature)
     * @locked v1
     */
    punchGlide: {
        scale: 1.35,
        easing: "ease-out" as EasingType,
        shake: 3,
        durationFrames: 40,  // Total (punch: 10 + glide: 30)
        tracking: true,
        smoothing: 0.18,
        punchFrames: 10,
        glideFrames: 30,
    },

    // =========================================================================
    // 🟠 v1 INTERRUPTION PRESETS (LOCKED)
    // =========================================================================

    /**
     * INTERRUPT - Attention break (notification, typing interrupted)
     * @locked v1
     */
    interrupt: {
        scale: 1.25,
        easing: "ease-out" as EasingType,
        shake: 4,
        durationFrames: 10,
    },

    /**
     * TAKEOVER - Call/notification takes full control
     * @locked v1 (optional)
     */
    takeover: {
        scale: 0.85,
        easing: "ease-in" as EasingType,
        shake: 0,
        durationFrames: 20,
    },

    // =========================================================================
    // ⚪ v1 STRUCTURAL PRESETS (LOCKED)
    // =========================================================================

    /**
     * RESET - Return to neutral
     * @locked v1
     */
    reset: {
        scale: 1.0,
        easing: "ease-out" as EasingType,
        shake: 0,
        durationFrames: 20,
    },

    /**
     * ESTABLISH - Scene start (wide shot)
     * @locked v1 (optional)
     */
    establish: {
        scale: 0.9,
        easing: "cinematic" as EasingType,
        shake: 0,
        durationFrames: 30,
    },

    // =========================================================================
    // 🔵 v2 PSYCHOLOGICAL PRESETS (FEATURE-FLAGGED)
    // =========================================================================

    /**
     * SUSPENSE HOLD - Tension stretch
     * @v2 - Requires emotional state model
     */
    suspenseHold: {
        scale: 1.1,
        easing: "cinematic" as EasingType,
        shake: 0,
        durationFrames: 50,
        drift: 0.002,
        v2: true,
    },

    /**
     * VOYEUR - Distant observation
     * @v2 - Requires emotional state model
     */
    voyeur: {
        scale: 0.92,
        easing: "linear" as EasingType,
        shake: 0,
        durationFrames: 40,
        v2: true,
    },

    /**
     * ISOLATION - Emotional withdrawal
     * @v2 - Requires emotional state model
     */
    isolation: {
        scale: 0.88,
        easing: "ease-in" as EasingType,
        shake: 0,
        durationFrames: 35,
        v2: true,
    },

    // =========================================================================
    // 🟣 v2 DYNAMIC MOVEMENT PRESETS (FEATURE-FLAGGED)
    // =========================================================================

    /**
     * WHIP SNAP - Fast pan with overshoot
     * @v2 - Requires multi-anchor awareness
     */
    whipSnap: {
        scale: 1.18,
        easing: "ease-in-out" as EasingType,
        shake: 0,
        durationFrames: 6,
        tracking: true,
        smoothing: 0.6,
        v2: true,
    },

    /**
     * FLOAT FOLLOW - Slow emotional drift
     * @v2 - Requires emotional state model
     */
    floatFollow: {
        scale: 1.15,
        easing: "ease-out" as EasingType,
        shake: 0,
        durationFrames: 60,
        tracking: true,
        smoothing: 0.08,  // Very slow = dreamy
        v2: true,
    },

    // =========================================================================
    // 🔴 v2 META PRESETS (FEATURE-FLAGGED)
    // =========================================================================

    /**
     * PANIC - Loss of control
     * @v2 - Requires emotional state model
     */
    panic: {
        scale: 1.4,
        easing: "expoOut" as EasingType,
        shake: 10,
        durationFrames: 12,
        v2: true,
    },

    /**
     * COLLAPSE - Aftermath (pullback)
     * @v2 - Requires emotional state model
     */
    collapse: {
        scale: 0.8,
        easing: "ease-in-out" as EasingType,
        shake: 0,
        durationFrames: 40,
        v2: true,
    },

    // =========================================================================
    // 🗄️ LEGACY (DEPRECATED — use v1 equivalents)
    // =========================================================================

    /** @deprecated Use `impact` instead */
    dramatic: {
        scale: 1.3,
        easing: "ease-out" as EasingType,
        shake: 4,
        durationFrames: 25,
        v2: true,  // Feature-flagged out
    },

    /** @deprecated Use `voyeur` instead */
    documentary: {
        scale: 1.0,
        easing: "linear" as EasingType,
        shake: 2,
        durationFrames: 45,
        v2: true,
    },

    /** @deprecated Use `suspenseHold` instead */
    documentaryHold: {
        scale: 1.05,
        easing: "ease-out" as EasingType,
        shake: 0,
        durationFrames: 24,
        smoothing: 0.08,
        v2: true,
    },

    /** @deprecated Merged into `impact` */
    impactPunch: {
        scale: 1.35,
        easing: "ease-out" as EasingType,
        shake: 5,
        durationFrames: 10,
        smoothing: 0.6,
        v2: true,
    },
} as const;

export type ShotPresetId = keyof typeof SHOT_PRESETS;

// =============================================================================
// ANCHOR FRAMING CONFIGURATION (Layer 3: Semantic Interpretation)
// =============================================================================

/**
 * Framing instruction for how to position anchor in frame.
 * 
 * This is the PROPER PLACE for semantic interpretation ("lastMessage should
 * be in lower-third"). Camera Math (Layer 4) should NOT know about semantics.
 */
export interface AnchorFraming {
    /** Anchor point within frame: normalized 0-1 (x, y) */
    anchorPoint: { x: number; y: number };

    /** Padding around anchor in pixels */
    paddingPx?: number;

    /** Target fill: how much of frame the anchor should occupy (0-1) */
    targetFill?: number;
}

/**
 * Default framing by anchor type.
 * 
 * This defines WHERE in the frame each semantic anchor type should appear.
 * Camera Math receives this as a target rect + framing config — it just does
 * pure fit/clamp math without understanding "lastMessage" or "inputArea".
 * 
 * DESIGN: Semantic interpretation lives HERE (Layer 3), not in Camera Math (Layer 4).
 */
export const ANCHOR_FRAMING: Record<string, AnchorFraming> = {
    // Chat anchors
    lastMessage: {
        anchorPoint: { x: 0.5, y: 0.75 },  // Lower-third, slightly off-center
        paddingPx: 24,
        targetFill: 0.55,
    },
    inputArea: {
        anchorPoint: { x: 0.5, y: 0.9 },   // Very bottom of frame
        paddingPx: 16,
        targetFill: 0.4,
    },
    typingIndicator: {
        anchorPoint: { x: 0.5, y: 0.82 },  // Just above input
        paddingPx: 20,
        targetFill: 0.3,
    },

    // Call anchors
    callPoster: {
        anchorPoint: { x: 0.5, y: 0.4 },   // Upper portion for contact poster
        paddingPx: 32,
        targetFill: 0.65,
    },
    acceptButton: {
        anchorPoint: { x: 0.7, y: 0.85 },  // Lower right
        paddingPx: 40,
        targetFill: 0.25,
    },
    declineButton: {
        anchorPoint: { x: 0.3, y: 0.85 },  // Lower left
        paddingPx: 40,
        targetFill: 0.25,
    },

    // Notification anchors
    headsUpNotification: {
        anchorPoint: { x: 0.5, y: 0.1 },   // Top of frame
        paddingPx: 16,
        targetFill: 0.35,
    },
    dynamicIsland: {
        anchorPoint: { x: 0.5, y: 0.05 },  // Very top
        paddingPx: 8,
        targetFill: 0.15,
    },

    // Default fallback
    device: {
        anchorPoint: { x: 0.5, y: 0.5 },   // Center
        paddingPx: 0,
        targetFill: 1.0,
    },
};

/**
 * Get framing config for an anchor.
 * Falls back to device framing if anchor not found.
 */
export function getAnchorFraming(anchor: string): AnchorFraming {
    return ANCHOR_FRAMING[anchor] || ANCHOR_FRAMING.device;
}

/**
 * Get a shot preset by ID with optional overrides (deltas).
 *
 * @param id - Preset ID
 * @param overrides - Optional delta overrides (partial)
 * @returns Merged preset
 */
export function getShotPreset(
    id: ShotPresetId,
    overrides?: Partial<ShotPreset>
): ShotPreset {
    const base = SHOT_PRESETS[id];
    if (!overrides) return { ...base };

    return {
        ...base,
        ...overrides,
    };
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default CAMERA_PRESETS;
