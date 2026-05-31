import type { EpisodeDefinition } from "../../types/episode-definition.js";
import fixedSystemShowcaseEpisodes from "./fixed.js";

/**
 * System showcases.
 *
 * Curated system showcase catalog for the studio showcase.
 */
export const systemShowcaseEpisodes: EpisodeDefinition[] = [
  ...fixedSystemShowcaseEpisodes,
];

export default systemShowcaseEpisodes;

export { fixedSystemShowcaseEpisodes };
