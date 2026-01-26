import type { TokovoPluginContract } from "@tokovo/core";
import { PluginManager } from "@tokovo/core";
import { cameraReducer } from "./reducer";
import { cameraV2Lowering, CAMERA_EVENT_TYPES } from "./lowering";

const cameraViews = {
  AppRoot: () => null,
};

export const DeviceCameraPlugin: TokovoPluginContract<"camera"> = {
  id: "camera",
  version: "1.0.0",
  displayName: "Device Camera",
  reducer:
    cameraReducer as unknown as TokovoPluginContract<"camera">["reducer"],
  views: cameraViews,
  lowering: {
    handles: CAMERA_EVENT_TYPES as unknown as string[],
    lower: cameraV2Lowering as unknown as NonNullable<
      TokovoPluginContract<"camera">["lowering"]
    >["lower"],
  },
  anchors: undefined,
};

export { DeviceCameraPlugin as default };

let _registered = false;

export function registerCameraPlugin(): void {
  if (_registered) return;
  _registered = true;
  PluginManager.register(DeviceCameraPlugin);
}
