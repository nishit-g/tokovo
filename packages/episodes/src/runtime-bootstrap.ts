import { createTokovoRegistries, PluginManagerClass, type TokovoRegistries } from "@tokovo/react";
import { createDeviceRegistries, type DeviceRegistries } from "@tokovo/devices";
import { createScopedLogger, registerRuntimeObservability } from "@tokovo/core";

import { createEpisodeRegistry, type EpisodeRegistry } from "./registry/index.js";
import type { EpisodeDefinition } from "./types/index.js";
import { catalogEpisodesByProfile } from "./runtime/catalogs/index.js";
import {
  getRuntimeManifestEntryIds,
  registerTokovoRuntimeManifest,
} from "./runtime/plugin-manifest.js";

const log = createScopedLogger("app");

export type TokovoCatalogProfile = "release" | "studio";

export type TokovoRuntime = {
  tokovoRegistries: TokovoRegistries;
  deviceRegistries: DeviceRegistries;
  pluginManager: PluginManagerClass;
  rendererRegistries: {
    plugins: TokovoRegistries["plugins"];
    devices: DeviceRegistries;
  };
  episodeRegistry: EpisodeRegistry;
  catalogProfile: TokovoCatalogProfile;
};

const sharedRuntimes = new Map<TokovoCatalogProfile, TokovoRuntime>();

function registerEpisodeCatalog(
  registry: EpisodeRegistry,
  episodes: readonly EpisodeDefinition[],
): void {
  for (const episode of episodes) {
    registry.register(episode);
  }
}

export function resolveCatalogProfile(
  value: string | undefined,
  fallback: TokovoCatalogProfile = "release",
): TokovoCatalogProfile {
  if (value === "release" || value === "studio") {
    return value;
  }
  return fallback;
}

export function getEpisodeCatalog(profile: TokovoCatalogProfile): readonly EpisodeDefinition[] {
  return catalogEpisodesByProfile[profile];
}

export function getEpisodeCatalogForProfiles(
  profiles: readonly TokovoCatalogProfile[],
): EpisodeDefinition[] {
  const episodes = new Map<string, EpisodeDefinition>();

  for (const profile of profiles) {
    for (const episode of getEpisodeCatalog(profile)) {
      episodes.set(episode.meta.id, episode);
    }
  }

  return [...episodes.values()];
}

export function createEpisodeRegistryForProfiles(
  profiles: readonly TokovoCatalogProfile[],
): EpisodeRegistry {
  const registry = createEpisodeRegistry();
  registerEpisodeCatalog(registry, getEpisodeCatalogForProfiles(profiles));
  return registry;
}

export function createEpisodeRegistryForProfile(
  profile: TokovoCatalogProfile = "release",
): EpisodeRegistry {
  return createEpisodeRegistryForProfiles([profile]);
}

export function registerTokovoPlugins(input: {
  tokovoRegistries: TokovoRegistries;
  deviceRegistries: DeviceRegistries;
  pluginManager: PluginManagerClass;
}): void {
  const runtimeLog = log.withContext({
    event: "runtime.plugins.register",
  });

  runtimeLog.debug("Registering shared Tokovo plugins");
  registerTokovoRuntimeManifest({
    ...input,
    logger: runtimeLog,
  });
  runtimeLog.debug("Shared Tokovo plugins registered", {
    pluginCount: input.pluginManager.getAppIds().length,
    manifestEntryCount: getRuntimeManifestEntryIds().length,
  });
}

export function createTokovoRuntime(profile: TokovoCatalogProfile = "release"): TokovoRuntime {
  const runtimeLog = log.withContext({
    event: "runtime.bootstrap",
    catalogProfile: profile,
  });
  runtimeLog.debug("Creating Tokovo runtime");

  const tokovoRegistries = createTokovoRegistries();
  const deviceRegistries = createDeviceRegistries();
  const pluginManager = new PluginManagerClass(tokovoRegistries.plugins);
  const rendererRegistries = {
    plugins: tokovoRegistries.plugins,
    devices: deviceRegistries,
  };

  registerTokovoPlugins({
    tokovoRegistries,
    deviceRegistries,
    pluginManager,
  });
  registerRuntimeObservability(tokovoRegistries.engine);

  const episodeRegistry = createEpisodeRegistryForProfile(profile);

  runtimeLog.debug("Tokovo runtime ready", {
    pluginCount: pluginManager.getAppIds().length,
    episodeCount: episodeRegistry.count(),
    catalogProfile: profile,
  });

  return {
    tokovoRegistries,
    deviceRegistries,
    pluginManager,
    rendererRegistries,
    episodeRegistry,
    catalogProfile: profile,
  };
}

export function getSharedTokovoRuntime(profile: TokovoCatalogProfile = "release"): TokovoRuntime {
  const runtime = sharedRuntimes.get(profile);
  if (runtime) {
    log.debug("Reusing shared Tokovo runtime", {
      event: "runtime.bootstrap.cache_hit",
      catalogProfile: profile,
    });
    return runtime;
  }

  const created = createTokovoRuntime(profile);
  sharedRuntimes.set(profile, created);
  log.debug("Cached shared Tokovo runtime", {
    event: "runtime.bootstrap.cache_store",
    catalogProfile: profile,
  });
  return created;
}
