/**
 * DSL Author Module
 * 
 * Public API for authoring episodes.
 */

export { episode, EpisodeBuilder, DeviceFn, CameraFn, SceneFn } from "./episode-builder";
export { DeviceBuilder, BeatFn } from "./device-builder";
export { BeatBuilder, MessageOptions } from "./beat-builder";
export { CameraBuilder, CameraEvent, ZoomOptions, ShakeOptions, PIPOptions } from "./camera-builder";
export { SceneBuilder, SceneDeviceBuilder, SceneDeviceAction } from "./scene-builder";
export { audio, PlaySoundOptions, BackgroundMusicOptions, FadeVolumeOptions } from "./audio-builder";
export { spotify, SpotifyTrackInfo, DEMO_TRACKS } from "./spotify-builder";
