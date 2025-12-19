/**
 * @tokovo/core - Enterprise Core Package
 * 
 * @description Central exports for the Tokovo engine runtime.
 * Domain-organized modules with clean barrel exports.
 */

// =============================================================================
// TYPES - All type definitions (includes camera types from device-camera)
// =============================================================================
export * from "./types";

// =============================================================================
// ENGINE - Replay loop and handlers
// =============================================================================
export * from "./engine";

// =============================================================================
// CAMERA - Re-exports from device-camera (named exports only to avoid conflicts)
// =============================================================================
// Note: Camera types are already exported via ./types which imports from device-camera.
// Only export utilities that aren't in types.ts:
export {
    cameraReducer,
    cameraV2Lowering,
    CAMERA_EVENT_TYPES,
    processActiveEffects,
    registerCameraProcessor,
    applyEasing,
    easingFunctions,
    lerp,
    seededRandom,
    getPreset,
    getShotPreset,
    composeTimeline,
    getPresetNames,
    registerAnchorProvider,
    getAnchorProvider,
    getAnchorsForApp,
    getAnchorFraming,
    resolveAnchorWithFallback,
    resolveAnchorFully,
} from "./camera";

// =============================================================================
// AUDIO - Sound system
// =============================================================================
export * from "./audio";

// =============================================================================
// REGISTRIES - All registration systems
// =============================================================================
export * from "./registries";

// =============================================================================
// NOTIFICATIONS - Notification system
// =============================================================================
export * from "./notifications";

// =============================================================================
// PLUGIN - Plugin system
// =============================================================================
export * from "./plugin";

// =============================================================================
// UTILS - Utilities
// =============================================================================
export * from "./utils";

// =============================================================================
// DIRECTOR LITE - Automatic camera
// =============================================================================
export * from "./director-lite";

// =============================================================================
// ANCHORS - Semantic positioning
// =============================================================================
export * from "./anchors";

// =============================================================================
// CONSTANTS & TOKENS
// =============================================================================
export * from "./constants";
export * from "./tokens";

// =============================================================================
// COMPONENTS
// =============================================================================
export * from "./components/AppSurface";

// =============================================================================
// EPISODE PREPARATION
// =============================================================================
export * from "./prepare";
