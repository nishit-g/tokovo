/**
 * Device Camera Plugin - TokovoPluginContract Implementation
 *
 * Implements the full enterprise plugin contract for the camera system.
 * The camera plugin is a CONSUMER of anchors (provided by apps like WhatsApp),
 * not a PROVIDER. Therefore, anchors is set to undefined.
 *
 * @module device-camera/plugin
 */

import type { TokovoPluginContract } from "@tokovo/core/src/types/plugin-contract";
import { cameraReducer } from "./reducer";
import { cameraV2Lowering, CAMERA_EVENT_TYPES } from "./lowering";

const cameraViews = {
  AppRoot: () => null,
};

export const DeviceCameraPlugin: TokovoPluginContract<"camera"> = {
  id: "camera",
  version: "1.0.0",
  displayName: "Device Camera",

  reducer: cameraReducer as any,
  views: cameraViews,

  lowering: {
    handles: CAMERA_EVENT_TYPES as unknown as string[],
    lower: cameraV2Lowering as any,
  },

  anchors: undefined,
};

export { DeviceCameraPlugin as default };

import { PluginManager } from "@tokovo/core";

let _registered = false;

export function registerCameraPlugin(): void {
  if (_registered) return;
  _registered = true;

  PluginManager.register(DeviceCameraPlugin);
}
