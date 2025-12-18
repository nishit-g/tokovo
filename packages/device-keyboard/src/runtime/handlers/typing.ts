/**
 * Typing Handler
 * 
 * Handles TYPE, KEY_DOWN, KEY_UP events.
 */

import type { KeyboardState } from "../../types/state";
import type { KeyboardPayloads } from "../../ir/payloads";

// =============================================================================
// TYPE HANDLER
// =============================================================================

/**
 * Handle TYPE event - character-by-character typing.
 * The lowering layer expands this into individual KEY_DOWN events.
 * This handler is for direct TYPE events (instant mode).
 */
export function handleType(
    keyboard: KeyboardState,
    payload: KeyboardPayloads["TYPE"],
    frame: number
): void {
    const { text } = payload;

    // Append text at cursor position
    const before = keyboard.inputText.slice(0, keyboard.cursorPosition);
    const after = keyboard.inputText.slice(keyboard.cursorPosition);

    keyboard.inputText = before + text + after;
    keyboard.cursorPosition += text.length;
    keyboard.lastTypedAt = frame;

    // Clear selection after typing
    keyboard.selectionStart = null;
    keyboard.selectionEnd = null;
}

// =============================================================================
// KEY DOWN HANDLER
// =============================================================================

export function handleKeyDown(
    keyboard: KeyboardState,
    payload: KeyboardPayloads["KEY_DOWN"],
    frame: number
): void {
    const { key } = payload;

    keyboard.currentKey = key;
    keyboard.keyPressedAt = frame;

    // Set up visual feedback
    keyboard.keyPressVisual = {
        key,
        scale: 1.15,
        startFrame: frame,
    };

    // Special key: Backspace
    if (key === "⌫" || key === "Backspace") {
        if (keyboard.cursorPosition > 0) {
            const before = keyboard.inputText.slice(0, keyboard.cursorPosition - 1);
            const after = keyboard.inputText.slice(keyboard.cursorPosition);
            keyboard.inputText = before + after;
            keyboard.cursorPosition -= 1;
        }
        return;
    }

    // Regular character key
    if (key.length === 1 || key === " ") {
        const char = key === "space" ? " " : key;
        const before = keyboard.inputText.slice(0, keyboard.cursorPosition);
        const after = keyboard.inputText.slice(keyboard.cursorPosition);

        keyboard.inputText = before + char + after;
        keyboard.cursorPosition += 1;
        keyboard.lastTypedAt = frame;
    }
}

// =============================================================================
// KEY UP HANDLER
// =============================================================================

export function handleKeyUp(
    keyboard: KeyboardState,
    _payload: KeyboardPayloads["KEY_UP"],
    _frame: number
): void {
    keyboard.currentKey = null;
    keyboard.keyPressedAt = null;
    keyboard.keyPressVisual = null;
}

// =============================================================================
// BACKSPACE HANDLER
// =============================================================================

export function handleBackspace(
    keyboard: KeyboardState,
    payload: KeyboardPayloads["BACKSPACE"],
    frame: number
): void {
    const count = payload.count ?? 1;

    for (let i = 0; i < count; i++) {
        if (keyboard.cursorPosition > 0) {
            const before = keyboard.inputText.slice(0, keyboard.cursorPosition - 1);
            const after = keyboard.inputText.slice(keyboard.cursorPosition);
            keyboard.inputText = before + after;
            keyboard.cursorPosition -= 1;
        }
    }

    keyboard.currentKey = "⌫";
    keyboard.keyPressedAt = frame;
}
