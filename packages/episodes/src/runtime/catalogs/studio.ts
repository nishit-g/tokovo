import type { EpisodeDefinition } from "../../types/index.js";
import { releaseEpisodes } from "./release.js";
import appShowcaseEpisodes from "../../showcases/apps/index.js";
import systemShowcaseEpisodes from "../../showcases/system/index.js";
import testEpisodes from "../../tests/index.js";

export const studioEpisodes: EpisodeDefinition[] = [
  ...releaseEpisodes,
  ...appShowcaseEpisodes,
  ...systemShowcaseEpisodes,
  ...testEpisodes,
];

export default studioEpisodes;
