// V2 DSL public API

export { episode, EpisodeBuilder } from "./episode";
export type { DeviceOptions, TrackBuilder, TrackFn, TrackFactory } from "./episode";

export {
  CameraTrackBuilder,
  CameraPointBuilder,
  CameraSpanBuilder,
} from "./camera-track";
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
} from "./camera-track";

export {
  AudioTrackBuilder,
  AudioPointBuilder,
  AudioSpanBuilder,
} from "./audio-track";
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

export {
  parseTimeToFrames,
  parseDurationToFrames,
  framesToSeconds,
  framesToTimeString,
} from "./utils/time";
