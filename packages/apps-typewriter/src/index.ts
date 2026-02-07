export { TypewriterPlugin, registerTypewriterPlugin } from "./plugin.js";
export { TypewriterTrackBuilder } from "./dsl/index.js";
export type { TypewriterState } from "./runtime/state.js";
export {
  TYPEWRITER_THEME_PRESETS,
  resolveTypewriterTheme,
  deepMerge,
} from "./theme/index.js";
export type {
  TypewriterThemeTokens,
  TypewriterThemeConfig,
  TypewriterThemePresetId,
  WrapMode,
  DeepPartial,
} from "./theme/index.js";
