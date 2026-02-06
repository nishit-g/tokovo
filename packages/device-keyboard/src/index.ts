export type {
  KeyboardState,
  KeyboardType,
  ReturnKeyType,
  KeyPressState,
} from "./runtime/state.js";
export { createKeyboardInitialState } from "./runtime/state.js";

export { keyboardReducer } from "./runtime/reducer.js";
export type { KeyboardEvent } from "./runtime/reducer.js";

export {
  isKeyboardVisible,
  getInputText,
  getCursorPosition,
  isKeyActive,
  getKeyboardSlideProgress,
  getKeyboardHeight,
  getSuggestions,
  getTypedTextProgress,
} from "./runtime/selectors.js";

export { KeyboardTrackBuilder } from "./dsl/keyboard-builder.js";
export type { TypeOptions, KeyboardTrackEvent } from "./dsl/keyboard-builder.js";

export { Keyboard, Key, KeyRow } from "./ui/index.js";

export {
  keyboardColors,
  keyboardTypography,
  keyboardSpacing,
  keyboardShadows,
  keyboardLayouts,
  keyboardTokens,
  keyboardThemes,
  getKeyboardColors,
  createKeyboardShadows,
  createKeyboardTokens,
} from "./ui/tokens.js";
export type {
  KeyboardTokens,
  KeyboardTheme,
  KeyboardColorTokens,
} from "./ui/tokens.js";

export {
  qwertyLayout,
  numericLayout,
  phoneLayout,
  emailLayout,
  layoutRegistry,
  getLayout,
} from "./ui/layouts.js";
export type { KeyboardLayout, SpecialKeyConfig } from "./ui/layouts.js";

export { registerKeyboardPlugin } from "./plugin.js";
