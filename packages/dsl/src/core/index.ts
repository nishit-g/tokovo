/**
 * Core DSL Module
 *
 * Primary API for episode authoring using the track-based DSL.
 * This is the recommended way to create episodes.
 *
 * @example
 * ```typescript
 * import { episode, CameraTrackBuilder } from "@tokovo/dsl";
 *
 * const ir = episode("demo", { fps: 30, duration: "30s" })
 *   .device("phone", "iphone16", { app: "app_whatsapp" })
 *   .camera(cam => cam.at("0s").set({ scale: 1 }))
 *   .build();
 * ```
 */

// Episode builder
export { episode, EpisodeBuilder } from "./episode";

export type {
    DeviceOptions,
    TrackBuilder,
    TrackFn,
} from "./episode";

// Track builders
export {
    CameraTrackBuilder,
    CameraPointBuilder,
    CameraSpanBuilder,
    AudioTrackBuilder,
    AudioPointBuilder,
    AudioSpanBuilder,
    OSTrackBuilder,
    OSPointBuilder,
} from "./tracks";

// Track options types
export type {
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
} from "./tracks";
