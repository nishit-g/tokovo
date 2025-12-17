/**
 * V2 DSL - Track-based episode authoring
 * 
 * @description The new track-based DSL that replaces beats.
 * Each track (camera, audio, os, app) is independent and uses
 * explicit timing with at() and span().
 * 
 * @see docs-v2/DSL_REVAMP.md
 */

// Episode builder
export { episode, EpisodeBuilder, DeviceOptions, TrackBuilder, TrackFn } from "./episode";

// Track builders
export { CameraTrackBuilder, CameraPointBuilder, CameraSpanBuilder } from "./camera-track";
export type {
    CameraSetOptions,
    CameraAnimateOptions,
    CameraFocusOptions,
    CameraTrackOptions,
    CameraShakeOptions,
    CameraResetOptions,
} from "./camera-track";

export { AudioTrackBuilder, AudioPointBuilder, AudioSpanBuilder } from "./audio-track";
export type {
    BgmOptions,
    PlayOptions,
    CrossfadeOptions,
    FadeOutOptions,
} from "./audio-track";

export { OSTrackBuilder, OSPointBuilder } from "./os-track";
export type {
    OSStateOptions,
    BatteryOptions,
    NetworkOptions,
    NotificationOptions,
} from "./os-track";

// Utilities
export { parseTimeToFrames, parseDurationToFrames, framesToSeconds, framesToTimeString } from "./utils/time";
