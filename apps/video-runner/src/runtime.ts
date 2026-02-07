import {
  createTokovoRegistries,
  PluginManagerClass,
  type TokovoRegistries,
} from "@tokovo/react";
import { registerOSAnchorProviders } from "@tokovo/renderer";
import { registerWhatsAppPlugin } from "@tokovo/apps-whatsapp";
import { registerXPlugin } from "@tokovo/apps-x";
import { registerIMessagePlugin } from "@tokovo/apps-imessage";
import { registerLinkedInPlugin } from "@tokovo/apps-linkedin";
import {
  createDeviceRegistries,
  registerDevicesPlugin,
  type DeviceRegistries,
} from "@tokovo/devices";
import { registerNotificationPlugin } from "@tokovo/device-notifications";
import { registerCameraPlugin } from "@tokovo/device-camera";
import { registerKeyboardPlugin } from "@tokovo/device-keyboard";
import { registerOverlayPlugin } from "@tokovo/overlay";

import { type EpisodeRegistry } from "@tokovo/episodes";
import { createVideoRunnerEpisodeRegistry } from "./episode-registry";

export type VideoRunnerRuntime = {
  tokovoRegistries: TokovoRegistries;
  deviceRegistries: DeviceRegistries;
  pluginManager: PluginManagerClass;
  rendererRegistries: {
    plugins: TokovoRegistries["plugins"];
    devices: DeviceRegistries;
  };
  episodeRegistry: EpisodeRegistry;
};

export function createVideoRunnerRuntime(): VideoRunnerRuntime {
  const tokovoRegistries = createTokovoRegistries();
  const deviceRegistries = createDeviceRegistries();
  const pluginManager = new PluginManagerClass(tokovoRegistries.plugins);
  const rendererRegistries = {
    plugins: tokovoRegistries.plugins,
    devices: deviceRegistries,
  };

  // Plugins are registered explicitly. Nothing should self-register at import time.
  registerDevicesPlugin(tokovoRegistries, deviceRegistries);
  registerWhatsAppPlugin(pluginManager);
  registerXPlugin(pluginManager);
  registerIMessagePlugin(pluginManager);
  registerLinkedInPlugin(pluginManager);
  registerNotificationPlugin(tokovoRegistries.engine);
  registerCameraPlugin(pluginManager, tokovoRegistries.engine);
  registerKeyboardPlugin(tokovoRegistries.engine);
  registerOverlayPlugin(tokovoRegistries.engine);
  registerOSAnchorProviders(tokovoRegistries.plugins.anchors);

  const episodeRegistry = createVideoRunnerEpisodeRegistry();

  return {
    tokovoRegistries,
    deviceRegistries,
    pluginManager,
    rendererRegistries,
    episodeRegistry,
  };
}
