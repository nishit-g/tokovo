import { createTokovoRegistries, PluginManagerClass } from "@tokovo/core";
import { registerWhatsAppPlugin } from "@tokovo/apps-whatsapp";
import { registerDevicesPlugin } from "@tokovo/devices";
import { registerNotificationPlugin } from "@tokovo/device-notifications";
import { registerCameraPlugin } from "@tokovo/device-camera";
import { registerKeyboardPlugin } from "@tokovo/device-keyboard";

export const tokovoRegistries = createTokovoRegistries();
export const pluginManager = new PluginManagerClass(tokovoRegistries.plugins);

registerDevicesPlugin(tokovoRegistries);
registerWhatsAppPlugin(pluginManager);
registerNotificationPlugin(tokovoRegistries.engine);
registerCameraPlugin(pluginManager, tokovoRegistries.engine);
registerKeyboardPlugin(tokovoRegistries.engine);
