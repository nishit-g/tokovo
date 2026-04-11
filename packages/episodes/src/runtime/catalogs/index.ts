import type { EpisodeDefinition } from "../../types/index.js";
import releaseEpisodes from "./release.js";
import studioEpisodes from "./studio.js";

type TokovoCatalogProfile = "release" | "studio";

export const catalogEpisodesByProfile: Record<
  TokovoCatalogProfile,
  readonly EpisodeDefinition[]
> = {
  release: releaseEpisodes,
  studio: studioEpisodes,
};

export {
  releaseEpisodes,
  studioEpisodes,
};
