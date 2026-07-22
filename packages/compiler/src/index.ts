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

export {
  prepareTrackEpisode,
  collectEpisodeAssetRefs,
  lowerTrackEvent,
  lowerTrackEvents,
  lowerEpisode,
  lowerEpisodeWithCapabilities,
  createLoweringContext,
} from "./v2/index.js";

export type {
  PreparedTrackEpisode,
  PluginLowering,
  LoweringContext,
  LoweredEpisodeCapabilities,
} from "./v2/index.js";

export {
  CinematicProgramPreparationError,
  prepareCinematicPrograms,
  selectPreparedCameraProgram,
} from "./vnext/index.js";
export type {
  CinematicProgramsIR,
  PreparedCinematicPrograms,
} from "./vnext/index.js";

export type {
  CompilerPlugin,
  CompilerContext,
  RenderTrackDefinition,
  TrackRenderProps,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ComponentType,
} from "./plugins/types.js";

export { AudioDirectorPlugin } from "./plugins/audio-director.plugin.js";
export type { AudioDirectorPluginOptions } from "./plugins/audio-director.plugin.js";
export { OSDirectorPlugin } from "./plugins/os-director.plugin.js";
export type { OSDirectorPluginOptions } from "./plugins/os-director.plugin.js";
export { TypingIndicatorPlugin } from "./plugins/typing-indicator.plugin.js";
export type {
  TypingIndicatorPluginOptions,
  CharacterTypingProfile,
} from "./plugins/typing-indicator.plugin.js";
