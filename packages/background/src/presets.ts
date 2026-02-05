/**
 * Background Presets
 * 
 * Built-in background presets for common use cases.
 */

import type { BackgroundPreset, BackgroundPresetId } from "./types";

// =============================================================================
// PRESET DEFINITIONS
// =============================================================================

export const BACKGROUND_PRESETS: Record<BackgroundPresetId, BackgroundPreset> = {
    "ambient-night": {
        id: "ambient-night",
        name: "Ambient Night",
        description: "Moody dark blue with subtle purple tones",
        config: {
            type: "gradient",
            gradient: "radial-gradient(ellipse at center, #1a1a3a 0%, #0a0a1f 50%, #050510 100%)",
            opacity: 1,
        },
    },

    "neon-city": {
        id: "neon-city",
        name: "Neon City",
        description: "Cyberpunk-inspired pink and cyan gradient",
        config: {
            type: "gradient",
            gradient: "linear-gradient(135deg, #1a0a2e 0%, #2a1a4e 30%, #1a2a4e 70%, #0a1a2e 100%)",
            opacity: 1,
        },
    },

    "minimal-dark": {
        id: "minimal-dark",
        name: "Minimal Dark",
        description: "Clean near-black background",
        config: {
            type: "solid",
            color: "#0a0a0f",
            opacity: 1,
        },
    },

    "minimal-gradient": {
        id: "minimal-gradient",
        name: "Minimal Gradient",
        description: "Subtle purple to coral gradient",
        config: {
            type: "gradient",
            gradient: "linear-gradient(160deg, #1a1a2e 0%, #2a1a3a 50%, #3a2a3a 100%)",
            opacity: 1,
        },
    },

    "sunset-glow": {
        id: "sunset-glow",
        name: "Sunset Glow",
        description: "Warm orange to purple gradient like a sunset",
        config: {
            type: "gradient",
            gradient: "linear-gradient(180deg, #1a0a1a 0%, #2a1a2a 20%, #4a2a3a 50%, #3a2a4a 80%, #1a1a3a 100%)",
            opacity: 1,
        },
    },

    "deep-space": {
        id: "deep-space",
        name: "Deep Space",
        description: "Dark cosmic background with stars feeling",
        config: {
            type: "gradient",
            gradient: "radial-gradient(ellipse at 20% 30%, #1a1a3a 0%, #050510 40%, #000005 100%)",
            opacity: 1,
        },
    },

    "studio-light": {
        id: "studio-light",
        name: "Studio Light",
        description: "Professional dark grey studio background",
        config: {
            type: "gradient",
            gradient: "radial-gradient(ellipse at center, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)",
            opacity: 1,
        },
    },

    "forest-night": {
        id: "forest-night",
        name: "Forest Night",
        description: "Dark green mysterious forest vibe",
        config: {
            type: "gradient",
            gradient: "linear-gradient(170deg, #0a1a0f 0%, #0a150a 30%, #051005 70%, #020502 100%)",
            opacity: 1,
        },
    },

    "ocean-depth": {
        id: "ocean-depth",
        name: "Ocean Depth",
        description: "Deep ocean blue gradient",
        config: {
            type: "gradient",
            gradient: "linear-gradient(180deg, #0a1a2a 0%, #0a1520 40%, #050a15 70%, #020508 100%)",
            opacity: 1,
        },
    },

    "warm-noir": {
        id: "warm-noir",
        name: "Warm Noir",
        description: "Cinematic warm black with subtle sepia",
        config: {
            type: "gradient",
            gradient: "radial-gradient(ellipse at center, #1a1512 0%, #0f0d0a 50%, #050403 100%)",
            opacity: 1,
        },
    },

    "particles-slow": {
        id: "particles-slow",
        name: "Particles Slow",
        description: "Dark background with floating particles",
        config: {
            type: "particles",
            color: "#0a0a1a",
            opacity: 1,
        },
    },

    "none": {
        id: "none",
        name: "None",
        description: "No background (transparent)",
        config: {
            type: "solid",
            color: "#000000",
            opacity: 0,
        },
    },
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get a preset by ID
 */
export function getPreset(id: BackgroundPresetId): BackgroundPreset | undefined {
    return BACKGROUND_PRESETS[id];
}

/**
 * List all available preset IDs
 */
export function listPresets(): BackgroundPresetId[] {
    return Object.keys(BACKGROUND_PRESETS) as BackgroundPresetId[];
}

/**
 * Check if a string is a valid preset ID
 */
export function isPresetId(value: string): value is BackgroundPresetId {
    return value in BACKGROUND_PRESETS;
}
