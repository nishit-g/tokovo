export type {
  KeyboardState,
  KeyboardType,
  ReturnKeyType,
  KeyPressState,
  TypingAnimation,
} from "@tokovo/core";

import { DEFAULT_KEYBOARD_STATE } from "@tokovo/core";

export function createKeyboardInitialState() {
  return { ...DEFAULT_KEYBOARD_STATE };
}
