import type { EpisodeDefinition } from "../../types/episode-definition.js";
import fixedSystemShowcaseEpisodes from "./fixed.js";

/**
 * System showcases.
 *
 * Curated system showcase catalog for preview and validation.
 */
export const systemShowcaseEpisodes: EpisodeDefinition[] = [
  ...fixedSystemShowcaseEpisodes,
];

export default systemShowcaseEpisodes;

export { fixedSystemShowcaseEpisodes };
