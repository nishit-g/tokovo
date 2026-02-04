import { createTokovoRegistries, PluginManagerClass } from "@tokovo/react";
import { registerWhatsAppPlugin } from "@tokovo/apps-whatsapp";
import { createDeviceRegistries, registerDevicesPlugin } from "@tokovo/devices";
import { registerNotificationPlugin } from "@tokovo/device-notifications";
import { registerCameraPlugin } from "@tokovo/device-camera";
import { registerKeyboardPlugin } from "@tokovo/device-keyboard";

export const tokovoRegistries = createTokovoRegistries();
export const deviceRegistries = createDeviceRegistries();
export const pluginManager = new PluginManagerClass(tokovoRegistries.plugins);
export const rendererRegistries = {
  plugins: tokovoRegistries.plugins,
  devices: deviceRegistries,
};

registerDevicesPlugin(tokovoRegistries, deviceRegistries);
registerWhatsAppPlugin(pluginManager);
registerNotificationPlugin(tokovoRegistries.engine);
registerCameraPlugin(pluginManager, tokovoRegistries.engine);
registerKeyboardPlugin(tokovoRegistries.engine);
