/**
 * Camera Module - Re-exports from @tokovo/device-camera
 * 
 * Legacy backward compatibility layer.
 * All new code should import directly from @tokovo/device-camera.
 * 
 * @deprecated Import from "@tokovo/device-camera" instead
 */

// Re-export core types from device-camera
// NOTE: We don't re-export types that are already in core/types to avoid duplicates
export {
    // Processors
    processActiveEffects,
    registerCameraProcessor,

    // Utils
    applyEasing,
    easingFunctions,
    lerp,
    seededRandom,

    // Reducer
    cameraReducer,
} from "@tokovo/device-camera";

// Re-export types that might be needed but aren't in core already
export type {
    ZoomEffect,
    ShakeEffect,
    FocusEffect,
    TrackEffect,
    ResetEffect,
    EffectProcessor,
    EffectProcessorContext,
} from "@tokovo/device-camera";

// Presets (for whatsapp-director and other apps)
export {
    getPreset,
    getShotPreset,
    composeTimeline,
    getPresetNames,
} from "@tokovo/device-camera";

export type {
    CameraPreset,
    CameraTarget,
    CameraTimeline,
    TimelineStep,
    ShotPresetId,
} from "@tokovo/device-camera";
