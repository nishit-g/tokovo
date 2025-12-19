/**
 * Camera Module - Re-exports from @tokovo/device-camera
 * 
 * @deprecated Import from "@tokovo/device-camera" instead
 */

// =============================================================================
// Types (from device-camera)
// =============================================================================
export type {
    CameraEffect,
    CameraEffectType,
    ZoomEffect,
    ShakeEffect,
    FocusEffect,
    TrackEffect,
    ResetEffect,
    CameraTransform,
    CameraState,
    EasingType,
} from "@tokovo/device-camera";

export { DEFAULT_CAMERA_STATE, DEFAULT_TRANSFORM } from "@tokovo/device-camera";

// =============================================================================
// Anchors (from device-camera)
// =============================================================================
export type {
    Rect,
    AnchorFraming,
    AnchorSnapshot,
    ResolvedAnchor,
    AnchorProvider,
} from "@tokovo/device-camera";

export {
    registerAnchorProvider,
    getAnchorProvider,
    getAnchorsForApp,
    getAnchorFraming,
    resolveAnchorWithFallback,
    resolveAnchorFully,
} from "@tokovo/device-camera";

// =============================================================================
// Processors (from device-camera)
// =============================================================================
export type { EffectProcessor, EffectProcessorContext } from "@tokovo/device-camera";

export { processActiveEffects, registerCameraProcessor } from "@tokovo/device-camera";

// =============================================================================
// Utils (from device-camera)
// =============================================================================
export { applyEasing, easingFunctions, lerp, seededRandom } from "@tokovo/device-camera";

// =============================================================================
// Reducer (from device-camera)
// =============================================================================
export { cameraReducer } from "@tokovo/device-camera";

// =============================================================================
// Presets (from device-camera)
// =============================================================================
export type {
    CameraPreset,
    CameraTarget,
    CameraTimeline,
    TimelineStep,
    ShotPresetId,
} from "@tokovo/device-camera";

export { getPreset, getShotPreset, composeTimeline, getPresetNames } from "@tokovo/device-camera";

// =============================================================================
// Lowering (from device-camera)
// =============================================================================
export { cameraV2Lowering, CAMERA_EVENT_TYPES } from "@tokovo/device-camera";
