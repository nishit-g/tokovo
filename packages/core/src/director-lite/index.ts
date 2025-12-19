/**
 * DirectorLite - Re-exports from @tokovo/device-camera
 * 
 * Legacy backward compatibility layer.
 * All new code should import directly from @tokovo/device-camera.
 * 
 * @deprecated Import from "@tokovo/device-camera" instead
 */

export {
    deriveDirectorEffects,
    extractSignals,
    ViralDramaV1,
} from "@tokovo/device-camera";

export type {
    DirectorSignal,
    DirectorSignalType,
    DirectorLayoutModel,
    DirectorOutput,
    DerivedCameraEffect,
    DirectorDebug,
    DeriveContext,
    DirectorStrategy,
    Rule,
    // Note: LayoutRect is exported from ../types/layout (via @tokovo/core types barrel)
} from "@tokovo/device-camera";

