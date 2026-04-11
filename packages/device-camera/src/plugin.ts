import type { TokovoPluginContract, EngineRegistries } from "@tokovo/core";
import type { PluginManagerClass } from "@tokovo/react";
import { cameraReducer } from "./reducer/index.js";
import { cameraV2Lowering, CAMERA_EVENT_TYPES } from "./lowering/index.js";

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

const registeredManagers = new WeakSet<PluginManagerClass>();
const registeredEngines = new WeakSet<EngineRegistries>();

export function registerCameraPlugin(
  pluginManager: PluginManagerClass,
  registries: EngineRegistries,
): void {
  if (!registeredManagers.has(pluginManager)) {
    registeredManagers.add(pluginManager);
    pluginManager.register(DeviceCameraPlugin);
  }

  if (!registeredEngines.has(registries)) {
    registeredEngines.add(registries);
    registries.reducers.registerFeatureReducer(
      "CAMERA",
      cameraReducer as unknown as Parameters<
        EngineRegistries["reducers"]["registerFeatureReducer"]
      >[1],
    );
  }
}

export const cameraRuntimeEntry = {
  id: "@tokovo/device-camera",
  scope: "engine" as const,
  register(input: {
    pluginManager: PluginManagerClass;
    tokovoRegistries: { engine: EngineRegistries };
  }): void {
    registerCameraPlugin(input.pluginManager, input.tokovoRegistries.engine);
  },
};
