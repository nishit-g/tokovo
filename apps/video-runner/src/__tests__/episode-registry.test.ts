import { describe, expect, it } from "vitest";
import { createVideoRunnerEpisodeRegistry } from "../episode-registry";
import { resolveEpisodeCatalogType } from "@tokovo/episodes";
import appShowcaseEpisodes from "@tokovo/episodes/showcases/apps";
import systemShowcaseEpisodes from "@tokovo/episodes/showcases/system";
import storyEpisodes from "@tokovo/episodes/stories";

describe("video-runner enterprise episode registry", () => {
  it("loads curated and legacy catalogs together", () => {
    const registry = createVideoRunnerEpisodeRegistry();
    const episodes = registry.all();

    expect(
      episodes.some(
        (episode) =>
          episode.meta.id === "whatsapp-flagship-v2" &&
          resolveEpisodeCatalogType(episode.meta) === "app_showcase_flagship",
      ),
    ).toBe(true);

    expect(
      episodes.some(
        (episode) =>
          episode.meta.id === "whatsapp-story-v2" &&
          resolveEpisodeCatalogType(episode.meta) === "story",
      ),
    ).toBe(true);

    expect(
      episodes.some(
        (episode) =>
          episode.meta.id === "flirty-whatsapp-romance" &&
          resolveEpisodeCatalogType(episode.meta) === "legacy",
      ),
    ).toBe(true);
  });

  it("loads the full new-only curated wave", () => {
    const registry = createVideoRunnerEpisodeRegistry();
    const ids = new Set(registry.all().map((episode) => episode.meta.id));

    expect(appShowcaseEpisodes).toHaveLength(21);
    expect(systemShowcaseEpisodes).toHaveLength(7);
    expect(storyEpisodes).toHaveLength(8);

    for (const episode of [...appShowcaseEpisodes, ...systemShowcaseEpisodes, ...storyEpisodes]) {
      expect(ids.has(episode.meta.id)).toBe(true);
    }
  });
});
