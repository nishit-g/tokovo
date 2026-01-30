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
} from "./plugins/types";

export { LoggingPlugin } from "./plugins/logging.plugin";
export { CameraDirectorPlugin } from "./plugins/camera-director.plugin";
export type { CameraDirectorPluginOptions } from "./plugins/camera-director.plugin";
export { AudioDirectorPlugin } from "./plugins/audio-director.plugin";
export type { AudioDirectorPluginOptions } from "./plugins/audio-director.plugin";
export { OSDirectorPlugin } from "./plugins/os-director.plugin";
export type { OSDirectorPluginOptions } from "./plugins/os-director.plugin";
export { TypingIndicatorPlugin } from "./plugins/typing-indicator.plugin";
export type {
  TypingIndicatorPluginOptions,
  CharacterTypingProfile,
} from "./plugins/typing-indicator.plugin";
export { KeyboardPlugin } from "./plugins/keyboard.plugin";
export type {
  KeyboardPluginOptions,
  CharacterKeyboardProfile,
} from "./plugins/keyboard.plugin";
