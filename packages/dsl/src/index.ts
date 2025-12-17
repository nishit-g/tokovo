/**
 * @tokovo/dsl
 *
 * Domain Specific Language for authoring Tokovo episodes.
 *
 * The DSL provides a fluent API for creating episode timelines
 * with track-based authoring for camera, audio, OS, and app events.
 *
 * @example
 * ```typescript
 * import { episode, CameraTrackBuilder } from "@tokovo/dsl";
 *
 * const ir = episode("demo", { fps: 30, duration: "30s" })
 *   .device("phone", "iphone16", { app: "app_whatsapp" })
 *   .camera(cam => cam.at("0s").set({ scale: 1 }))
 *   .audio(audio => audio.span("0s", "30s").bgm("lofi_chill"))
 *   .build();
 * ```
 */

// =============================================================================
// CORE: Track-based DSL (RECOMMENDED)
// =============================================================================

export {
    episode,
    EpisodeBuilder,
    CameraTrackBuilder,
    CameraPointBuilder,
    CameraSpanBuilder,
    AudioTrackBuilder,
    AudioPointBuilder,
    AudioSpanBuilder,
    OSTrackBuilder,
    OSPointBuilder,
} from "./core";

export type {
    DeviceOptions,
    TrackBuilder,
    TrackFn,
    CameraSetOptions,
    CameraAnimateOptions,
    CameraFocusOptions,
    CameraTrackOptions,
    CameraShakeOptions,
    CameraResetOptions,
    BgmOptions,
    PlayOptions,
    CrossfadeOptions,
    FadeOutOptions,
    NetworkType,
    OSStateOptions,
    BatteryOptions,
    NetworkOptions,
    NotificationOptions,
} from "./core";

// =============================================================================
// UTILS: Time parsing
// =============================================================================

export {
    parseTimeToFrames,
    parseDurationToFrames,
    framesToSeconds,
    framesToTimeString,
} from "./utils";

// =============================================================================
// TYPES
// =============================================================================

export type {
    TypingBuilder,
    MessageHandle,
    EpisodeConfig,
    EpisodeDefinition,
} from "./types";

// =============================================================================
// TRACER: Debug utility
// =============================================================================

export { Tracer } from "./tracer";

// =============================================================================
// HELPERS: Event factories (import from "@tokovo/dsl/helpers")
// =============================================================================

// Re-export common helpers at top level for convenience
export {
    keyboard,
    generateTyping,
    getTypingEndFrame,
    TYPING_SPEEDS,
    messages,
    dsl,
} from "./helpers";

export type {
    TypingSpeed,
    TypingOptions,
} from "./helpers";

// =============================================================================
// BACKWARD COMPATIBILITY: v2 namespace
// =============================================================================

// Re-export core as v2 for backward compatibility
export * as v2 from "./core";

// Alias for backward compatibility
export { episode as trackEpisode } from "./core";

// =============================================================================
// LEGACY: Beat-based DSL (DEPRECATED)
// =============================================================================

// Legacy exports are available via "@tokovo/dsl/legacy"
// Do not import legacy directly - it shows deprecation warnings
