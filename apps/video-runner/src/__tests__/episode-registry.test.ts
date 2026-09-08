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
  it("loads the curated showcase registry only", () => {
    const registry = createEpisodeRegistryForProfile("showcase");
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

    expect(episodes.some((episode) => episode.meta.id === "legacy-private-sample")).toBe(false);
  });

  it("loads the full curated showcase wave", () => {
    const registry = createEpisodeRegistryForProfiles(["showcase"]);
    const ids = new Set(registry.all().map((episode) => episode.meta.id));

    expect(appShowcaseEpisodes).toHaveLength(22);
    expect(systemShowcaseEpisodes).toHaveLength(11);
    expect(storyEpisodes).toHaveLength(13);

    for (const episode of [...appShowcaseEpisodes, ...systemShowcaseEpisodes, ...storyEpisodes]) {
      expect(ids.has(episode.meta.id)).toBe(true);
    }

    expect(ids.has("whatsapp-cinematic-flagship")).toBe(true);
    expect(ids.has("ping-sent-it")).toBe(true);
    expect(ids.has("render-service-smoke")).toBe(true);
  });
});
