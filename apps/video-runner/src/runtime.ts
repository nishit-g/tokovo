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
import { registerCameraPlugin } from "@tokovo/device-camera";
import { registerKeyboardPlugin } from "@tokovo/device-keyboard";

import productionEpisodes from "@tokovo/episodes/production";
import showcaseEpisodes from "@tokovo/episodes/showcases";
import testEpisodes from "@tokovo/episodes/tests";
import {
  createEpisodeRegistry,
  type EpisodeRegistry,
  type EpisodeDefinition,
} from "@tokovo/episodes";

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

function registerEpisodeCatalog(
  registry: EpisodeRegistry,
  episodes: EpisodeDefinition[],
): void {
  for (const ep of episodes) {
    registry.register(ep);
  }
}

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
  registerNotificationPlugin(tokovoRegistries.engine);
  registerCameraPlugin(pluginManager, tokovoRegistries.engine);
  registerKeyboardPlugin(tokovoRegistries.engine);
  registerBuiltInAnchorProviders(tokovoRegistries.plugins.anchors);

  const episodeRegistry = createEpisodeRegistry();
  registerEpisodeCatalog(episodeRegistry, productionEpisodes);
  registerEpisodeCatalog(episodeRegistry, showcaseEpisodes);
  registerEpisodeCatalog(episodeRegistry, testEpisodes);

  return {
    tokovoRegistries,
    deviceRegistries,
    pluginManager,
    rendererRegistries,
    episodeRegistry,
  };
}

let _runtime: VideoRunnerRuntime | undefined;

export function getVideoRunnerRuntime(): VideoRunnerRuntime {
  if (!_runtime) _runtime = createVideoRunnerRuntime();
  return _runtime;
}

export function resetVideoRunnerRuntimeForTesting(): void {
  _runtime = undefined;
}

