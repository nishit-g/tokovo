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
import { registerInstagramPlugin } from "@tokovo/apps-instagram";
import { registerTypewriterPlugin } from "@tokovo/apps-typewriter";
import { registerSnapchatPlugin } from "@tokovo/apps-snapchat";
import { registerTeamsPlugin } from "@tokovo/apps-teams";
import {
  createDeviceRegistries,
  registerDevicesPlugin,
  type DeviceRegistries,
} from "@tokovo/devices";
import { registerNotificationPlugin } from "@tokovo/device-notifications";
import { registerCameraPlugin } from "@tokovo/device-camera";
import { registerKeyboardPlugin } from "@tokovo/device-keyboard";
import { registerOverlayPlugin } from "@tokovo/overlay";

import { createEpisodeRegistry, type EpisodeRegistry } from "@tokovo/episodes";

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

let sharedRenderRuntime: VideoRunnerRuntime | null = null;

export function createRenderRuntime(): VideoRunnerRuntime {
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
  registerLinkedInPlugin(pluginManager);
  registerInstagramPlugin(pluginManager);
  registerTypewriterPlugin(pluginManager);
  registerSnapchatPlugin(pluginManager);
  registerTeamsPlugin(pluginManager);
  registerNotificationPlugin(tokovoRegistries.engine);
  registerCameraPlugin(pluginManager, tokovoRegistries.engine);
  registerKeyboardPlugin(tokovoRegistries.engine);
  registerOverlayPlugin(tokovoRegistries.engine);
  registerOSAnchorProviders(tokovoRegistries.plugins.anchors);

  return {
    tokovoRegistries,
    deviceRegistries,
    pluginManager,
    rendererRegistries,
    episodeRegistry: createEpisodeRegistry(),
  };
}

export function getSharedRenderRuntime(): VideoRunnerRuntime {
  if (sharedRenderRuntime) {
    return sharedRenderRuntime;
  }

  sharedRenderRuntime = createRenderRuntime();
  return sharedRenderRuntime;
}
