import type { EpisodeDefinition } from "../../types/index.js";
import releaseEpisodes from "./release.js";
import showcaseEpisodes from "./showcase.js";

type TokovoCatalogProfile = "release" | "showcase";

export const catalogEpisodesByProfile: Record<
  TokovoCatalogProfile,
  readonly EpisodeDefinition[]
> = {
  release: releaseEpisodes,
  showcase: showcaseEpisodes,
};

export {
  releaseEpisodes,
  showcaseEpisodes,
};
