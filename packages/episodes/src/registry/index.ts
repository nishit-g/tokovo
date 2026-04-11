/**
 * Episode Registry Module
 * @see docs/architecture/episodes.md
 */
export {
  EpisodeRegistry,
  EpisodeRegistryDuplicateError,
  EpisodeRegistryValidationError,
  createEpisodeRegistry,
  getEpisodeRegistrySnapshot,
  validateEpisodeForRegistry,
} from "./episode-registry.js";
