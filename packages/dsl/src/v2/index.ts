// V2 DSL public API

export { episode, EpisodeBuilder } from "./episode.js";
export type {
  DeviceOptions,
  TrackBuilder,
  TrackFn,
  TrackFactory,
} from "./episode.js";

export {
  CameraTrackBuilder,
  CameraPointBuilder,
  CameraSpanBuilder,
} from "./camera-track.js";
export type {
  CameraSetOptions,
  CameraAnimateOptions,
  CameraFocusOptions,
  CameraTrackOptions,
  CameraShakeOptions,
  CameraResetOptions,
  CameraZoomOptions,
  CameraPanOptions,
  CameraPunchZoomOptions,
  CameraDutchTiltOptions,
  CameraFlashOptions,
  CameraWhipPanOptions,
  CameraLayoutOptions,
  CameraTarget,
} from "./camera-track.js";

export {
  AudioTrackBuilder,
  AudioPointBuilder,
  AudioSpanBuilder,
} from "./audio-track.js";
export type {
  BgmOptions,
  PlayOptions,
  CrossfadeOptions,
  FadeOutOptions,
} from "./audio-track.js";

export { OSTrackBuilder, OSPointBuilder } from "./os-track.js";
export type {
  OSStateOptions,
  BatteryOptions,
  NetworkOptions,
  NotificationOptions,
} from "./os-track.js";

export { DeviceTrackBuilderV2, DevicePointBuilderV2 } from "./device-track.js";
export type {
  DeviceEventMetaOptions,
  SfxOverride,
  TransitionOptions,
  NotificationShowOptions,
} from "./device-track.js";

export {
  parseTimeToFrames,
  parseDurationToFrames,
  framesToSeconds,
  framesToTimeString,
} from "./utils/time.js";
