import {
  createTokovoRegistries,
  PluginManagerClass,
  type TokovoRegistries,
} from "@tokovo/react";
import { registerBuiltInAnchorProviders } from "@tokovo/renderer";
import { registerWhatsAppPlugin } from "@tokovo/apps-whatsapp";
import { registerXPlugin } from "@tokovo/apps-x";
import { registerIMessagePlugin } from "@tokovo/apps-imessage";
import {
  createDeviceRegistries,
  registerDevicesPlugin,
  type DeviceRegistries,
} from "@tokovo/devices";
import { registerNotificationPlugin } from "@tokovo/device-notifications";
import { registerKeyboardPlugin } from "@tokovo/device-keyboard";
import { registerCameraPlugin } from "@tokovo/device-camera";

export type StudioRuntime = {
  tokovoRegistries: TokovoRegistries;
  deviceRegistries: DeviceRegistries;
  pluginManager: PluginManagerClass;
  rendererRegistries: {
    plugins: TokovoRegistries["plugins"];
    devices: DeviceRegistries;
  };
};

export function createStudioRuntime(): StudioRuntime {
  const tokovoRegistries = createTokovoRegistries();
  const deviceRegistries = createDeviceRegistries();
  const pluginManager = new PluginManagerClass(tokovoRegistries.plugins);
  const rendererRegistries = {
    plugins: tokovoRegistries.plugins,
    devices: deviceRegistries,
  };

  registerDevicesPlugin(tokovoRegistries, deviceRegistries);
  registerWhatsAppPlugin(pluginManager);
  registerXPlugin(pluginManager);
  registerIMessagePlugin(pluginManager);
  registerNotificationPlugin(tokovoRegistries.engine);
  registerKeyboardPlugin(tokovoRegistries.engine);
  registerCameraPlugin(pluginManager, tokovoRegistries.engine);
  registerBuiltInAnchorProviders(tokovoRegistries.plugins.anchors);

  return { tokovoRegistries, deviceRegistries, pluginManager, rendererRegistries };
}

