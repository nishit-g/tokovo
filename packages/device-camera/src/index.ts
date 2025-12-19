/**
 * @tokovo/device-camera
 * 
 * Enterprise-grade cinematic camera system for Tokovo.
 * 
 * @module device-camera
 */

// =============================================================================
// Types
// =============================================================================
export * from "./types";

// =============================================================================
// Reducer
// =============================================================================
export { cameraReducer } from "./reducer";

// =============================================================================
// Processors
// =============================================================================
export {
    processActiveEffects,
    registerCameraProcessor,
} from "./processors";

export type { EffectProcessor, EffectProcessorContext } from "./processors";

// =============================================================================
// Director-Lite (export everything)
// =============================================================================
export * from "./director-lite";

// =============================================================================
// Utils
// =============================================================================
export {
    applyEasing,
    easingFunctions,
    lerp,
    seededRandom,
    clamp,
    getProgress,
} from "./utils";

// =============================================================================
// Plugin
// =============================================================================
export { DeviceCameraPlugin, registerCameraPlugin } from "./plugin";

// =============================================================================
// Presets (Legacy support)
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
