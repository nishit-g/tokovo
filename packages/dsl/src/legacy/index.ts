/**
 * Legacy DSL Module
 *
 * DEPRECATED: This module contains the beat-based DSL.
 * Use the track-based DSL from "@tokovo/dsl" instead.
 *
 * This module will be removed in a future version once
 * all episodes have been migrated to the track-based DSL.
 *
 * @deprecated Use track-based DSL from "@tokovo/dsl"
 */

// Log deprecation warning once
let warningShown = false;

function showDeprecationWarning(): void {
    if (!warningShown) {
        console.warn(
            "[DSL] The beat-based DSL is deprecated. " +
            "Please migrate to the track-based DSL. " +
            "Import from '@tokovo/dsl' instead of '@tokovo/dsl/legacy'."
        );
        warningShown = true;
    }
}

// Re-export with deprecation warnings
export {
    episode,
    EpisodeBuilder,
} from "./episode-builder";

export type {
    DeviceFn,
    CameraFn,
    SceneFn,
} from "./episode-builder";

export {
    DeviceBuilder,
} from "./device-builder";

export type {
    BeatFn,
} from "./device-builder";

export {
    BeatBuilder,
} from "./beat-builder";

export type {
    MessageOptions,
} from "./beat-builder";

export {
    CameraBuilder,
} from "./camera-builder";

export type {
    CameraEvent,
    ZoomOptions,
    ShakeOptions,
    PIPOptions,
} from "./camera-builder";

export {
    SceneBuilder,
    SceneDeviceBuilder,
} from "./scene-builder";

export type {
    SceneDeviceAction,
} from "./scene-builder";

export {
    audio,
} from "./audio-builder";

export type {
    PlaySoundOptions,
    BackgroundMusicOptions,
    FadeVolumeOptions,
} from "./audio-builder";

// Show warning on import
showDeprecationWarning();
