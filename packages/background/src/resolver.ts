/**
 * Background Resolver
 *
 * Resolves background configurations with preset expansion,
 * fallback handling, and validation.
 */

import type { BackgroundConfig, ResolvedBackgroundConfig, BackgroundPresetId } from "./types.js";
import { DEFAULT_BACKGROUND_CONFIG, FALLBACK_COLOR } from "./types.js";
import { BACKGROUND_PRESETS, isPresetId } from "./presets.js";

// =============================================================================
// RESOLVER
// =============================================================================

/**
 * Resolve a background configuration.
 *
 * - Expands preset references
 * - Applies defaults
 * - Validates paths
 * - Returns safe fallback on errors
 */
export function resolveBackground(
  config?: BackgroundConfig | BackgroundPresetId | null,
): ResolvedBackgroundConfig {
  // No config = default
  if (!config) {
    return {
      ...DEFAULT_BACKGROUND_CONFIG,
      _resolved: true,
    };
  }

  // String = preset ID
  if (typeof config === "string") {
    if (isPresetId(config)) {
      const preset = BACKGROUND_PRESETS[config];
      return {
        ...DEFAULT_BACKGROUND_CONFIG,
        ...preset.config,
        _resolved: true,
      };
    }

    throw new Error(`BACKGROUND_PRESET_MISSING: backdrop profile "${config}" is not registered.`);
  }

  // Object config
  let resolved: BackgroundConfig = { ...DEFAULT_BACKGROUND_CONFIG, ...config };

  // Expand preset if specified
  if (config.preset && isPresetId(config.preset)) {
    const preset = BACKGROUND_PRESETS[config.preset];
    resolved = {
      ...DEFAULT_BACKGROUND_CONFIG,
      ...preset.config,
      ...config, // User overrides take priority
    };
  } else if (config.preset) {
    throw new Error(
      `BACKGROUND_PRESET_MISSING: backdrop profile "${config.preset}" is not registered.`,
    );
  }

  // Validate and clean
  resolved = validateAndClean(resolved);

  return {
    ...resolved,
    _resolved: true,
  };
}

// =============================================================================
// VALIDATION
// =============================================================================

function validateAndClean(config: BackgroundConfig): BackgroundConfig {
  const cleaned = { ...config };

  // Clamp opacity
  if (cleaned.opacity !== undefined) {
    cleaned.opacity = Math.max(0, Math.min(1, cleaned.opacity));
  }

  // Clamp blur
  if (cleaned.blur !== undefined) {
    cleaned.blur = Math.max(0, cleaned.blur);
  }

  // Validate type-specific requirements
  switch (cleaned.type) {
    case "solid":
      if (!cleaned.color) {
        cleaned.color = FALLBACK_COLOR;
      }
      break;

    case "gradient":
      if (!cleaned.gradient) {
        throw new Error(
          "BACKGROUND_GRADIENT_INVALID: gradient backgrounds require a gradient definition.",
        );
      }
      break;

    case "image":
    case "video":
      if (!cleaned.src) {
        throw new Error(
          `BACKGROUND_ASSET_MISSING: background type "${cleaned.type}" requires src.`,
        );
      }
      break;
  }

  return cleaned;
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Create a simple background config from a preset ID
 */
export function fromPreset(presetId: BackgroundPresetId): BackgroundConfig {
  return { preset: presetId, type: "solid" }; // type is overridden by preset
}

/**
 * Create an image background config
 */
export function fromImage(
  src: string,
  options?: Partial<Omit<BackgroundConfig, "type" | "src">>,
): BackgroundConfig {
  return {
    type: "image",
    src,
    ...options,
  };
}

/**
 * Create a video background config
 */
export function fromVideo(
  src: string,
  options?: Partial<Omit<BackgroundConfig, "type" | "src">>,
): BackgroundConfig {
  return {
    type: "video",
    src,
    ...options,
  };
}

/**
 * Create a gradient background config
 */
export function fromGradient(
  gradient: string,
  options?: Partial<Omit<BackgroundConfig, "type" | "gradient">>,
): BackgroundConfig {
  return {
    type: "gradient",
    gradient,
    ...options,
  };
}
