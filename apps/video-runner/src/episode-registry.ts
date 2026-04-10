import productionEpisodes from "@tokovo/episodes/production";
import showcaseEpisodes from "@tokovo/episodes/showcases";
import v2Episodes from "@tokovo/episodes/v2";
import testEpisodes from "@tokovo/episodes/tests";
import {
  createEpisodeRegistry,
  type EpisodeRegistry,
  type EpisodeDefinition,
} from "@tokovo/episodes";

function registerEpisodeCatalog(
  registry: EpisodeRegistry,
  episodes: readonly EpisodeDefinition[],
): void {
  for (const ep of episodes) {
    registry.register(ep);
  }
}

export function createVideoRunnerEpisodeRegistry(): EpisodeRegistry {
  const registry = createEpisodeRegistry();
  registerEpisodeCatalog(registry, productionEpisodes);
  registerEpisodeCatalog(registry, showcaseEpisodes);
  registerEpisodeCatalog(registry, v2Episodes);
  registerEpisodeCatalog(registry, testEpisodes);
  return registry;
}
