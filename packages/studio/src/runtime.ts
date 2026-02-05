import { createTokovoRegistries, PluginManagerClass } from "@tokovo/react";
import { registerBuiltInAnchorProviders } from "@tokovo/renderer";
import { registerWhatsAppPlugin } from "@tokovo/apps-whatsapp";
import { registerXPlugin } from "@tokovo/apps-x";
import { registerIMessagePlugin } from "@tokovo/apps-imessage";
import { createDeviceRegistries, registerDevicesPlugin } from "@tokovo/devices";
import { registerNotificationPlugin } from "@tokovo/device-notifications";
import { registerKeyboardPlugin } from "@tokovo/device-keyboard";
import { registerCameraPlugin } from "@tokovo/device-camera";

export const tokovoRegistries = createTokovoRegistries();
export const deviceRegistries = createDeviceRegistries();
export const pluginManager = new PluginManagerClass(tokovoRegistries.plugins);
export const rendererRegistries = {
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
