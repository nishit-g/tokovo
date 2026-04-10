import storyEpisodes from "@tokovo/episodes/stories";
import appShowcaseEpisodes from "@tokovo/episodes/showcases/apps";
import systemShowcaseEpisodes from "@tokovo/episodes/showcases/system";
import {
  legacyProductionEpisodes,
  legacyShowcaseEpisodes,
} from "@tokovo/episodes/legacy";
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
  registerEpisodeCatalog(registry, storyEpisodes);
  registerEpisodeCatalog(registry, appShowcaseEpisodes);
  registerEpisodeCatalog(registry, systemShowcaseEpisodes);
  registerEpisodeCatalog(registry, legacyProductionEpisodes);
  registerEpisodeCatalog(registry, legacyShowcaseEpisodes);
  registerEpisodeCatalog(registry, v2Episodes);
  registerEpisodeCatalog(registry, testEpisodes);
  return registry;
}
