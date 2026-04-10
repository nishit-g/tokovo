/**
 * V2 Track-based Compiler
 *
 * Primary exports for V2 track-based episode preparation.
 * Use prepareTrackEpisode() to convert TrackEpisodeIR to RuntimeEvents.
 */

// Preparation
export { prepareTrackEpisode } from "./prepare.js";
export type { PreparedTrackEpisode } from "./prepare.js";
export { collectEpisodeAssetRefs } from "./asset-refs.js";

// Lowering
export {
    lowerTrackEvent,
    lowerTrackEvents,
    lowerEpisode,
    createLoweringContext,
} from "./lowering.js";
export type { PluginLowering, LoweringContext } from "./lowering.js";

export {
  CompilerError,
  CompilerSchemaValidationError,
  PluginLowererMissingError,
  RuntimeValidationError,
} from "./errors.js";
