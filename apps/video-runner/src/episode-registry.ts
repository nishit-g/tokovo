import {
  createEpisodeRegistryForProfile,
  type EpisodeRegistry,
  resolveCatalogProfile,
} from "@tokovo/episodes";

export function createVideoRunnerEpisodeRegistry(): EpisodeRegistry {
  return createEpisodeRegistryForProfile(
    resolveCatalogProfile(process.env.TOKOVO_EPISODE_CATALOG_PROFILE, "studio"),
  );
}
