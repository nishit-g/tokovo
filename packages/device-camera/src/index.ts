export * from "./types/index.js";
export * from "./anchors/index.js";

export { processActiveEffects, registerCameraProcessor } from "./processors/index.js";
export type { EffectProcessor, EffectProcessorContext } from "./processors/index.js";

export { cameraReducer } from "./reducer/index.js";

export {
  applyEasing,
  easingFunctions,
  lerp,
  clamp,
  getProgress,
  seededRandom,
} from "./utils/index.js";

export { cameraV2Lowering, CAMERA_EVENT_TYPES } from "./lowering/index.js";

export { DeviceCameraPlugin, registerCameraPlugin } from "./plugin.js";

export { CameraDirector } from "./director/director.js";

export { applyCameraEffects } from "./director/applier.js";

export {
  BehaviorRegistry,
  FLUID_TENNIS_CASUAL,
  FLUID_TENNIS_ENERGETIC,
  FLUID_TENNIS_DRAMATIC,
} from "./director/behaviors.js";

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
} from "./director/types.js";

export type { FluidTennisConfig } from "./director/behaviors.js";
