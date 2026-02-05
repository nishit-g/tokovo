/**
 * Background Layer Types
 * 
 * Enterprise-grade type definitions for background rendering system.
 */

// =============================================================================
// BACKGROUND TYPES
// =============================================================================

/**
 * Supported background types
 */
export type BackgroundType =
    | "solid"      // Solid color
    | "gradient"   // CSS gradient
    | "image"      // Static image
    | "video"      // Looping video
    | "particles"  // Generated particles
    | "ambient";   // Preset ambient animations

/**
 * Built-in preset IDs
 */
export type BackgroundPresetId =
    | "ambient-night"
    | "neon-city"
    | "minimal-dark"
    | "minimal-gradient"
    | "sunset-glow"
    | "deep-space"
    | "studio-light"
    | "forest-night"
    | "ocean-depth"
    | "warm-noir"
    | "particles-slow"
    | "none";

/**
 * Background configuration
 */
export interface BackgroundConfig {
    /** Background type */
    type: BackgroundType;

    // === For solid/gradient ===
    /** Solid color (hex or CSS color) */
    color?: string;
    /** CSS gradient string */
    gradient?: string;

    // === For image/video ===
    /** Static file path (relative to public folder) */
    src?: string;

    // === For presets ===
    /** Preset ID to apply */
    preset?: BackgroundPresetId;

    // === Common options ===
    /** Blur amount in pixels (default: 0) */
    blur?: number;
    /** Opacity 0-1 (default: 1) */
    opacity?: number;
    /** Scale factor (default: 1) */
    scale?: number;
    /** How to position/size the background */
    position?: "center" | "cover" | "contain" | "fill";

    // === Animation options ===
    /** Enable subtle parallax on camera moves */
    parallax?: boolean;
    /** React to audio levels */
    pulseWithAudio?: boolean;
}

/**
 * Internal resolved background config (after preset resolution)
 */
export interface ResolvedBackgroundConfig extends BackgroundConfig {
    /** Config is fully resolved (preset applied) */
    _resolved: true;
}

/**
 * Background preset definition
 */
export interface BackgroundPreset {
    id: BackgroundPresetId;
    name: string;
    description: string;
    config: Omit<BackgroundConfig, "preset">;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
    type: "solid",
    color: "#0a0a0f",
    opacity: 1,
    blur: 0,
    position: "cover",
};

export const FALLBACK_COLOR = "#0a0a0f";
