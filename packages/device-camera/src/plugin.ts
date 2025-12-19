/**
 * Device Camera Plugin
 * 
 * Plugin contract for the camera system.
 * Registers reducer and provides camera capabilities.
 * 
 * @module device-camera/plugin
 */

import { cameraReducer } from "./reducer";

// =============================================================================
// PLUGIN DEFINITION
// =============================================================================

export interface DeviceCameraPluginContract {
    id: "camera";
    version: string;
    displayName: string;
    reducer: typeof cameraReducer;
}

export const DeviceCameraPlugin: DeviceCameraPluginContract = {
    id: "camera",
    version: "1.0.0",
    displayName: "Device Camera",
    reducer: cameraReducer,
};

// =============================================================================
// REGISTRATION
// =============================================================================

type ReducerRegistry = {
    register: (kind: string, reducer: typeof cameraReducer) => void;
};

/**
 * Register the camera plugin with the core engine.
 * 
 * @param reducerRegistry - The reducer registry from @tokovo/core
 */
export function registerCameraPlugin(reducerRegistry: ReducerRegistry): void {
    reducerRegistry.register("CAMERA", cameraReducer);
    console.log("[device-camera] Registered camera reducer");
}
