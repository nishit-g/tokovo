import {
  createTokovoRuntime,
  getSharedTokovoRuntime,
  resolveCatalogProfile,
  type TokovoRuntime,
} from "@tokovo/episodes";

export type VideoRunnerRuntime = TokovoRuntime;

function getVideoRunnerCatalogProfile() {
  return resolveCatalogProfile(
    process.env.TOKOVO_EPISODE_CATALOG_PROFILE,
    "studio",
  );
}

export function createVideoRunnerRuntime(): VideoRunnerRuntime {
  return createTokovoRuntime(getVideoRunnerCatalogProfile());
}

export function getSharedVideoRunnerRuntime(): VideoRunnerRuntime {
  return getSharedTokovoRuntime(getVideoRunnerCatalogProfile());
}
