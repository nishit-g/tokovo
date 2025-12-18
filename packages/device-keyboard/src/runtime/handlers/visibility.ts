/**
 * Visibility Handler
 * 
 * Handles SHOW and HIDE events.
 */

import type { KeyboardState } from "../../types/state";
import type { KeyboardPayloads } from "../../ir/payloads";
import type { KeyboardLayout } from "../../types/layouts";

// =============================================================================
// SHOW HANDLER
// =============================================================================

export function handleShow(
    keyboard: KeyboardState,
    payload: KeyboardPayloads["SHOW"],
    frame: number
): void {
    keyboard.visible = true;
    keyboard.layout = (payload.layout ?? "qwerty") as KeyboardLayout;
    keyboard.visibilityChangedAt = frame;

    // Reset input state on show
    keyboard.inputText = "";
    keyboard.cursorPosition = 0;
    keyboard.selectionStart = null;
    keyboard.selectionEnd = null;
}

// =============================================================================
// HIDE HANDLER
// =============================================================================

export function handleHide(
    keyboard: KeyboardState,
    _payload: KeyboardPayloads["HIDE"],
    frame: number
): void {
    keyboard.visible = false;
    keyboard.currentKey = null;
    keyboard.keyPressedAt = null;
    keyboard.visibilityChangedAt = frame;
}

// =============================================================================
// LAYOUT SWITCH HANDLER
// =============================================================================

export function handleSwitchLayout(
    keyboard: KeyboardState,
    payload: KeyboardPayloads["SWITCH_LAYOUT"],
    _frame: number
): void {
    keyboard.layout = payload.layout;
}
