/**
 * Input Handler
 * 
 * Handles CLEAR, SET_TEXT, CURSOR_MOVE, SELECT_RANGE, PASTE events.
 */

import type { KeyboardState } from "../../types/state";
import type { KeyboardPayloads } from "../../ir/payloads";

// =============================================================================
// CLEAR HANDLER
// =============================================================================

export function handleClear(
    keyboard: KeyboardState,
    _payload: KeyboardPayloads["CLEAR"],
    _frame: number
): void {
    keyboard.inputText = "";
    keyboard.cursorPosition = 0;
    keyboard.selectionStart = null;
    keyboard.selectionEnd = null;
}

// =============================================================================
// SET TEXT HANDLER
// =============================================================================

export function handleSetText(
    keyboard: KeyboardState,
    payload: KeyboardPayloads["SET_TEXT"],
    _frame: number
): void {
    keyboard.inputText = payload.text;
    keyboard.cursorPosition = payload.text.length;
    keyboard.selectionStart = null;
    keyboard.selectionEnd = null;
}

// =============================================================================
// CURSOR MOVE HANDLER
// =============================================================================

export function handleCursorMove(
    keyboard: KeyboardState,
    payload: KeyboardPayloads["CURSOR_MOVE"],
    _frame: number
): void {
    const { position } = payload;
    keyboard.cursorPosition = Math.max(0, Math.min(position, keyboard.inputText.length));
    keyboard.selectionStart = null;
    keyboard.selectionEnd = null;
}

// =============================================================================
// SELECT RANGE HANDLER
// =============================================================================

export function handleSelectRange(
    keyboard: KeyboardState,
    payload: KeyboardPayloads["SELECT_RANGE"],
    _frame: number
): void {
    const { start, end } = payload;
    keyboard.selectionStart = Math.max(0, Math.min(start, keyboard.inputText.length));
    keyboard.selectionEnd = Math.max(0, Math.min(end, keyboard.inputText.length));
    keyboard.cursorPosition = keyboard.selectionEnd;
}

// =============================================================================
// ACCEPT SUGGESTION HANDLER
// =============================================================================

export function handleAcceptSuggestion(
    keyboard: KeyboardState,
    payload: KeyboardPayloads["ACCEPT_SUGGESTION"],
    _frame: number
): void {
    const { index, word } = payload;

    // Use provided word or get from suggestions array
    const suggestion = word ?? keyboard.suggestions[index];
    if (!suggestion) return;

    // Find the last word in input and replace it
    const text = keyboard.inputText;
    const lastSpaceIndex = text.lastIndexOf(" ");

    if (lastSpaceIndex === -1) {
        // Replace entire input
        keyboard.inputText = suggestion + " ";
    } else {
        // Replace last word
        keyboard.inputText = text.slice(0, lastSpaceIndex + 1) + suggestion + " ";
    }

    keyboard.cursorPosition = keyboard.inputText.length;
    keyboard.selectionStart = null;
    keyboard.selectionEnd = null;
}

// =============================================================================
// PASTE HANDLER
// =============================================================================

export function handlePaste(
    keyboard: KeyboardState,
    payload: KeyboardPayloads["PASTE"],
    _frame: number
): void {
    const { text } = payload;

    // If there's a selection, replace it
    if (keyboard.selectionStart !== null && keyboard.selectionEnd !== null) {
        const before = keyboard.inputText.slice(0, keyboard.selectionStart);
        const after = keyboard.inputText.slice(keyboard.selectionEnd);
        keyboard.inputText = before + text + after;
        keyboard.cursorPosition = keyboard.selectionStart + text.length;
    } else {
        // Insert at cursor
        const before = keyboard.inputText.slice(0, keyboard.cursorPosition);
        const after = keyboard.inputText.slice(keyboard.cursorPosition);
        keyboard.inputText = before + text + after;
        keyboard.cursorPosition += text.length;
    }

    keyboard.selectionStart = null;
    keyboard.selectionEnd = null;
}
