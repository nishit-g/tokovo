export { storyEpisodes as productionEpisodes } from "../stories/index.js";
import storyEpisodes from "../stories/index.js";

/**
 * Deprecated compatibility catalog.
 *
 * Stories are the new canonical narrative bucket. `production` remains a
 * compatibility alias during the catalog migration.
 */
export default storyEpisodes;
