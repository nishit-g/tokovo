import type { EpisodeDefinition } from "../types/episode-definition.js";
import appShowcaseEpisodes from "./apps/index.js";
import systemShowcaseEpisodes from "./system/index.js";

/**
 * Enterprise showcase catalog.
 *
 * Legacy showcase episodes were moved to `src/legacy/showcases`.
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
