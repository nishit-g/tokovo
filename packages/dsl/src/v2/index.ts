// V2 DSL public API

export { episode, EpisodeBuilder } from "./episode.js";
export type {
  DeviceOptions,
  TrackBuilder,
  TrackFn,
  TrackFactory,
  HandPerformanceOptions,
  InputSessionOptions,
  NotificationIntentOptions,
  NotificationInteractionOptions,
} from "./episode.js";
export { NotificationPointBuilder, NotificationTrackBuilder } from "./episode.js";

export { createDefaultEpisodeCinematics } from "./default-cinematics.js";
export {
  HandPerformanceTrackBuilder,
  HandPerformancePointBuilder,
  HandPerformanceSpanBuilder,
} from "./hand-performance-track.js";
export type { HandCueOptions, HandTapOptions, HandSwipeOptions } from "./hand-performance-track.js";

export {
  cameraSubject,
  cinematicProgram,
  CinematicAuthoringError,
  CinematicPlanBuilder,
  CinematicProgramBuilder,
  CinematicShotBuilder,
} from "./cinematics.js";
export { cinematicShot, CinematicSequenceShot } from "./cinematic-plan-family.js";
export type {
  CameraDollyOptions,
  CameraMovementOptions,
  CameraOrbitOptions,
  CameraOutputOptions,
  CameraRigOptions,
  CameraShotFrameOptions,
  CinematicTime,
  CinematicProgramOptions,
  CinematicStageDevice,
  ScopedCameraSubjects,
} from "./cinematics.js";
export type {
  CameraFamilyOutputDefaultRig,
  CameraFamilyOutputDefinition,
  CameraLookDefinition,
  CameraLookModelDefinition,
  CameraSequenceDefinition,
  CameraSequenceBlend,
  CameraSequenceFrame,
  CameraSequenceFrameInput,
  CameraSequenceFramePreset,
  CameraSequenceGuard,
  CameraSequenceMissingPolicy,
  CameraSequenceMotion,
  CameraSequenceShotDefinition,
  CameraSequenceShotInput,
  CameraSequenceShotStyle,
  CameraSequenceTravel,
  CinematicPlanFamilyDefinition,
  CinematicPlanVariantDefinition,
} from "./cinematic-plan-family.js";
export { AudioTrackBuilder, AudioPointBuilder, AudioSpanBuilder } from "./audio-track.js";
export type { BgmOptions, PlayOptions, CrossfadeOptions, FadeOutOptions } from "./audio-track.js";

export { OSTrackBuilder, OSPointBuilder } from "./os-track.js";
export type { OSStateOptions, BatteryOptions, NetworkOptions } from "./os-track.js";

export { DeviceTrackBuilderV2, DevicePointBuilderV2 } from "./device-track.js";
export type { DeviceEventMetaOptions, SfxOverride, TransitionOptions } from "./device-track.js";

export { OverlayTrackBuilder, OverlayPointBuilder } from "./overlay-track.js";

export {
  parseTimeToFrames,
  parseDurationToFrames,
  framesToSeconds,
  framesToTimeString,
} from "./utils/time.js";
