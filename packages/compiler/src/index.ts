/**
 * @tokovo/compiler
 *
 * Episode compilation - converts DSL output to runtime events.
 *
 * Track-based:
 * ```ts
 * import { prepareTrackEpisode } from "@tokovo/compiler";
 * const ir = episode(...).build();
 * const prepared = prepareTrackEpisode(ir, plugins);
 * ```
 */

// =============================================================================
// V2 TRACK-BASED (RECOMMENDED)
// =============================================================================

export {
  prepareTrackEpisode,
  lowerTrackEvent,
  lowerTrackEvents,
  lowerEpisode,
  createLoweringContext,
} from "./v2";

export type {
  PreparedTrackEpisode,
  PluginLowering,
  LoweringContext,
} from "./v2";
