import type { EpisodeDefinition } from "../../types/index.js";
import storyEpisodes from "../../stories/index.js";
import v2Episodes from "../../v2/index.js";

export const releaseEpisodes: EpisodeDefinition[] = [
  ...storyEpisodes,
  ...v2Episodes,
];

export default releaseEpisodes;
