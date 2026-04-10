import type { EpisodeDefinition } from "../types/episode-definition.js";
import curatedStoryEpisodes from "./curated.js";

/**
 * Narrative / story catalog.
 *
 * This is the new replacement for the old broad "production" bucket.
 */
export const storyEpisodes: EpisodeDefinition[] = [...curatedStoryEpisodes];

export default storyEpisodes;

export { curatedStoryEpisodes };
