export * from "./types";
export * from "./anchors";

export { processActiveEffects, registerCameraProcessor } from "./processors";
export type { EffectProcessor, EffectProcessorContext } from "./processors";

export { cameraReducer } from "./reducer";

export {
  applyEasing,
  easingFunctions,
  lerp,
  clamp,
  getProgress,
  seededRandom,
} from "./utils";

export { cameraV2Lowering, CAMERA_EVENT_TYPES } from "./lowering";

export { DeviceCameraPlugin, registerCameraPlugin } from "./plugin";

export { CameraDirector } from "./director/director";

export { applyCameraEffects } from "./director/applier";

export {
  BehaviorRegistry,
  FLUID_TENNIS_CASUAL,
  FLUID_TENNIS_ENERGETIC,
  FLUID_TENNIS_DRAMATIC,
} from "./director/behaviors";

export type {
  CameraEvent,
  CameraEventType,
  CameraEventPriority,
  CameraEventPayload,
  MessageEventPayload,
  NotificationEventPayload,
  TypingEventPayload,
  CallEventPayload,
  CustomEventPayload,
  CameraEffect,
  CameraEffectType,
  CameraEffectParams,
  CameraContext,
  BehaviorFunction,
  BehaviorPreset,
  BehaviorConfig,
  CameraDirectorOptions,
  CameraDirectorResult,
  OverrideFunction,
} from "./director/types";

export type { FluidTennisConfig } from "./director/behaviors";
