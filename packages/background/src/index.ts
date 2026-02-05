/**
 * @tokovo/background
 * 
 * Enterprise-grade background layer system for Tokovo video rendering.
 * 
 * @example
 * // Using preset
 * <BackgroundLayer config="ambient-night" />
 * 
 * @example
 * // Using image
 * <BackgroundLayer config={{ type: "image", src: "/backgrounds/city.jpg", blur: 5 }} />
 * 
 * @example
 * // Using video
 * <BackgroundLayer config={{ type: "video", src: "/backgrounds/loop.mp4", opacity: 0.8 }} />
 */

// Main component
export { BackgroundLayer, PresetBackground, ImageBackground, VideoBackground } from "./BackgroundLayer";
export type { BackgroundLayerProps } from "./BackgroundLayer";

// Types
export type {
    BackgroundType,
    BackgroundPresetId,
    BackgroundConfig,
    ResolvedBackgroundConfig,
    BackgroundPreset,
} from "./types";
export { DEFAULT_BACKGROUND_CONFIG, FALLBACK_COLOR } from "./types";

// Presets
export { BACKGROUND_PRESETS, getPreset, listPresets, isPresetId } from "./presets";

// Resolver
export {
    resolveBackground,
    fromPreset,
    fromImage,
    fromVideo,
    fromGradient,
} from "./resolver";

// Renderers (for advanced usage)
export {
    SolidRenderer,
    GradientRenderer,
    ImageRenderer,
    VideoRenderer,
    ParticlesRenderer,
} from "./renderers";
