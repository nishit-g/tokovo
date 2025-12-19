/**
 * @tokovo/device-camera
 * 
 * Enterprise-grade cinematic camera system for Tokovo.
 * 
 * @module device-camera
 */

// =============================================================================
// Types (Discriminated Unions)
// =============================================================================
export * from "./types";

// =============================================================================
// Anchors (Semantic Targeting)
// =============================================================================
export * from "./anchors";

// =============================================================================
// Processors (Effect Registry)
// =============================================================================
export {
    processActiveEffects,
    registerCameraProcessor,
} from "./processors";

export type { EffectProcessor, EffectProcessorContext } from "./processors";

// =============================================================================
// Director-Lite (Auto Camera)
// =============================================================================
export * from "./director-lite";

// =============================================================================
// Reducer (State Management)
// =============================================================================
export { cameraReducer } from "./reducer";

// =============================================================================
// Utils (Pure Functions)
// =============================================================================
export {
    applyEasing,
    easingFunctions,
    lerp,
    clamp,
    getProgress,
    seededRandom,
} from "./utils";

// =============================================================================
// Presets (Shot Library)
// =============================================================================
export {
    getPreset,
    getShotPreset,
    composeTimeline,
    getPresetNames,
} from "./presets";

export type {
    CameraPreset,
    CameraTarget,
    CameraTimeline,
    TimelineStep,
    ShotPresetId,
} from "./presets";

// =============================================================================
// Lowering (DSL → Runtime)
// =============================================================================
export { cameraV2Lowering, CAMERA_EVENT_TYPES } from "./lowering";

// =============================================================================
// Plugin (Integration)
// =============================================================================
export { DeviceCameraPlugin, registerCameraPlugin } from "./plugin";
