/**
 * Tracks Module
 *
 * Exports all track builders for camera, audio, and OS control.
 */

export {
    CameraTrackBuilder,
    CameraPointBuilder,
    CameraSpanBuilder,
} from "./camera";

export type {
    CameraSetOptions,
    CameraAnimateOptions,
    CameraFocusOptions,
    CameraTrackOptions,
    CameraShakeOptions,
    CameraResetOptions,
} from "./camera";

export {
    AudioTrackBuilder,
    AudioPointBuilder,
    AudioSpanBuilder,
} from "./audio";

export type {
    BgmOptions,
    PlayOptions,
    CrossfadeOptions,
    FadeOutOptions,
} from "./audio";

export {
    OSTrackBuilder,
    OSPointBuilder,
} from "./os";

export type {
    NetworkType,
    OSStateOptions,
    BatteryOptions,
    NetworkOptions,
    NotificationOptions,
} from "./os";
