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

export {
  parseTimeToFrames,
  parseDurationToFrames,
  framesToSeconds,
  framesToTimeString,
} from "./utils";

export type {
  TypingBuilder,
  MessageHandle,
  EpisodeConfig,
  EpisodeDefinition,
} from "./types";

export { messages, dsl } from "./helpers";

export * as v2 from "./core";

export { episode as trackEpisode } from "./core";
