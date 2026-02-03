import { createTokovoRegistries, PluginManagerClass } from "@tokovo/core";
import { registerWhatsAppPlugin } from "@tokovo/apps-whatsapp";
import { registerDevicesPlugin } from "@tokovo/devices";
import { registerNotificationPlugin } from "@tokovo/device-notifications";
import { registerKeyboardPlugin } from "@tokovo/device-keyboard";
import { registerCameraPlugin } from "@tokovo/device-camera";

export const tokovoRegistries = createTokovoRegistries();
export const pluginManager = new PluginManagerClass(tokovoRegistries.plugins);

registerDevicesPlugin(tokovoRegistries);
registerWhatsAppPlugin(pluginManager);
registerNotificationPlugin(tokovoRegistries.engine);
registerKeyboardPlugin(tokovoRegistries.engine);
registerCameraPlugin(pluginManager, tokovoRegistries.engine);
