/**
 * V2 Track-based Compiler
 *
 * Primary exports for V2 track-based episode preparation.
 * Use prepareTrackEpisode() to convert TrackEpisodeIR to RuntimeEvents.
 */

// Preparation
export { prepareTrackEpisode } from "./prepare";
export type { PreparedTrackEpisode } from "./prepare";

// Lowering
export {
    lowerTrackEvent,
    lowerTrackEvents,
    lowerEpisode,
    createLoweringContext,
} from "./lowering";
export type { PluginLowering, LoweringContext } from "./lowering";
