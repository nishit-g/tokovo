/**
 * Background Resolver
 *
 * Resolves background configurations with preset expansion and strict validation.
 */

import type { BackgroundConfig, ResolvedBackgroundConfig, BackgroundPresetId } from "./types.js";
import { DEFAULT_BACKGROUND_CONFIG } from "./types.js";
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
 * - Rejects incomplete or unregistered configurations
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
        ...validateAndClean(applyCommonDefaults(preset.config)),
        _resolved: true,
      };
    }

    throw new Error(`BACKGROUND_PRESET_MISSING: backdrop profile "${config}" is not registered.`);
  }

  // Object config
  let resolved: BackgroundConfig;

  // Expand preset if specified
  if (config.preset && isPresetId(config.preset)) {
    const preset = BACKGROUND_PRESETS[config.preset];
    resolved = {
      ...preset.config,
      ...config,
      // The governed profile owns the renderer kind. `type` is only present on
      // BackgroundConfig because non-preset configurations require it.
      type: preset.config.type,
    };
  } else if (config.preset) {
    throw new Error(
      `BACKGROUND_PRESET_MISSING: backdrop profile "${config.preset}" is not registered.`,
    );
  } else {
    resolved = { ...config };
  }

  resolved = validateAndClean(applyCommonDefaults(resolved));

  return {
    ...resolved,
    _resolved: true,
  };
}

function applyCommonDefaults(config: BackgroundConfig): BackgroundConfig {
  return {
    ...config,
    opacity: config.opacity ?? DEFAULT_BACKGROUND_CONFIG.opacity,
    blur: config.blur ?? DEFAULT_BACKGROUND_CONFIG.blur,
    position: config.position ?? DEFAULT_BACKGROUND_CONFIG.position,
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
        throw new Error("BACKGROUND_SOLID_INVALID: solid backgrounds require a color.");
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

    case "particles":
    case "ambient":
      break;

    default:
      throw new Error(
        `BACKGROUND_TYPE_UNREGISTERED: background type "${String(cleaned.type)}" is not registered.`,
      );
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
