export type {
  KeyboardState,
  KeyboardType,
  ReturnKeyType,
  KeyPressState,
} from "./runtime/state";
export { createKeyboardInitialState } from "./runtime/state";

export { keyboardReducer } from "./runtime/reducer";
export type { KeyboardEvent } from "./runtime/reducer";

export {
  isKeyboardVisible,
  getInputText,
  getCursorPosition,
  isKeyActive,
  getKeyboardSlideProgress,
  getKeyboardHeight,
  getSuggestions,
  getTypedTextProgress,
} from "./runtime/selectors";

export { KeyboardTrackBuilder } from "./dsl/keyboard-builder";
export type { TypeOptions, KeyboardTrackEvent } from "./dsl/keyboard-builder";

export { Keyboard, Key, KeyRow } from "./ui";

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
} from "./ui/tokens";
export type {
  KeyboardTokens,
  KeyboardTheme,
  KeyboardColorTokens,
} from "./ui/tokens";

export {
  qwertyLayout,
  numericLayout,
  phoneLayout,
  emailLayout,
  layoutRegistry,
  getLayout,
} from "./ui/layouts";
export type { KeyboardLayout, SpecialKeyConfig } from "./ui/layouts";

export { registerKeyboardPlugin } from "./plugin";
