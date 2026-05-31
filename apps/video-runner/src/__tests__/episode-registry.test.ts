import { describe, expect, it } from "vitest";
import {
  createEpisodeRegistryForProfile,
  createEpisodeRegistryForProfiles,
  resolveEpisodeCatalogType,
} from "@tokovo/episodes";
import appShowcaseEpisodes from "@tokovo/episodes/showcases/apps";
import systemShowcaseEpisodes from "@tokovo/episodes/showcases/system";
import storyEpisodes from "@tokovo/episodes/stories";

describe("video-runner release episode registry", () => {
  it("loads the curated studio registry only", () => {
    const registry = createEpisodeRegistryForProfile("studio");
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
      episodes.some((episode) => episode.meta.id === "flirty-whatsapp-romance"),
    ).toBe(false);
  });

  it("loads the full curated studio wave", () => {
    const registry = createEpisodeRegistryForProfiles(["studio"]);
    const ids = new Set(registry.all().map((episode) => episode.meta.id));

    expect(appShowcaseEpisodes).toHaveLength(21);
    expect(systemShowcaseEpisodes).toHaveLength(7);
    expect(storyEpisodes).toHaveLength(8);

    for (const episode of [
      ...appShowcaseEpisodes,
      ...systemShowcaseEpisodes,
      ...storyEpisodes,
    ]) {
      expect(ids.has(episode.meta.id)).toBe(true);
    }

    expect(ids.has("render-service-smoke")).toBe(true);
  });
});
