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
  createLoweringContext,
} from "./v2/index.js";

export type {
  PreparedTrackEpisode,
  PluginLowering,
  LoweringContext,
} from "./v2/index.js";

export type {
  CompilerPlugin,
  CompilerContext,
  RenderTrackDefinition,
  TrackRenderProps,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  AnchorRegistry,
  AnchorInfo,
  ComponentType,
} from "./plugins/types.js";

export { LoggingPlugin } from "./plugins/logging.plugin.js";
export { CameraDirectorPlugin } from "./plugins/camera-director.plugin.js";
export type { CameraDirectorPluginOptions } from "./plugins/camera-director.plugin.js";
export { AudioDirectorPlugin } from "./plugins/audio-director.plugin.js";
export type { AudioDirectorPluginOptions } from "./plugins/audio-director.plugin.js";
export { OSDirectorPlugin } from "./plugins/os-director.plugin.js";
export type { OSDirectorPluginOptions } from "./plugins/os-director.plugin.js";
export { TypingIndicatorPlugin } from "./plugins/typing-indicator.plugin.js";
export type {
  TypingIndicatorPluginOptions,
  CharacterTypingProfile,
} from "./plugins/typing-indicator.plugin.js";
export { KeyboardPlugin } from "./plugins/keyboard.plugin.js";
export type {
  KeyboardPluginOptions,
  CharacterKeyboardProfile,
} from "./plugins/keyboard.plugin.js";
