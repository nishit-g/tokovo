import type { StudioStoryKitEpisodeDescriptor } from "./studio.js";
import { megaV2EpisodeWhatsAppStoryKitConfig } from "../production/mega-v2-episode-whatsapp.story-kit.js";
import { megaXStoryKitConfig } from "../production/mega-x.story-kit.js";
import { storyKitCrossoverShowcaseConfig } from "../production/story-kit-crossover-showcase.story-kit.js";

export const studioStoryKitEpisodes: readonly StudioStoryKitEpisodeDescriptor[] = [
  {
    id: megaV2EpisodeWhatsAppStoryKitConfig.id,
    title: megaV2EpisodeWhatsAppStoryKitConfig.title,
    exportName: "megaV2EpisodeWhatsAppStoryKitConfig",
    relativeEpisodePath:
      "packages/episodes/src/production/mega-v2-episode-whatsapp.episode.ts",
    relativeSetupPath:
      "packages/episodes/src/production/mega-v2-episode-whatsapp.story-kit.ts",
    config: megaV2EpisodeWhatsAppStoryKitConfig,
  },
  {
    id: megaXStoryKitConfig.id,
    title: megaXStoryKitConfig.title,
    exportName: "megaXStoryKitConfig",
    relativeEpisodePath: "packages/episodes/src/production/mega-x.episode.ts",
    relativeSetupPath: "packages/episodes/src/production/mega-x.story-kit.ts",
    config: megaXStoryKitConfig,
  },
  {
    id: storyKitCrossoverShowcaseConfig.id,
    title: storyKitCrossoverShowcaseConfig.title,
    exportName: "storyKitCrossoverShowcaseConfig",
    relativeEpisodePath:
      "packages/episodes/src/production/story-kit-crossover-showcase.episode.ts",
    relativeSetupPath:
      "packages/episodes/src/production/story-kit-crossover-showcase.story-kit.ts",
    config: storyKitCrossoverShowcaseConfig,
  },
] as const;
