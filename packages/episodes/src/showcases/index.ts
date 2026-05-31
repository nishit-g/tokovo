import type { EpisodeDefinition } from "../types/episode-definition.js";
import appShowcaseEpisodes from "./apps/index.js";
import systemShowcaseEpisodes from "./system/index.js";

/**
 * Production showcase catalog.
 *
 * Curated showcase catalogs for the active product surface.
 */
export const showcaseEpisodes: EpisodeDefinition[] = [
  ...appShowcaseEpisodes,
  ...systemShowcaseEpisodes,
];

export default showcaseEpisodes;

export {
  appShowcaseEpisodes,
  systemShowcaseEpisodes,
};
