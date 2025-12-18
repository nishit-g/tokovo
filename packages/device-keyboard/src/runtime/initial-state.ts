/**
 * Keyboard Initial State Factory
 */

import type { KeyboardState } from "../types/state";
import { DEFAULT_KEYBOARD_STATE } from "../types/state";

export function createKeyboardInitialState(): KeyboardState {
    return { ...DEFAULT_KEYBOARD_STATE };
}
