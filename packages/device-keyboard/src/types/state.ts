/**
 * Keyboard State Types
 * 
 * State shape for the virtual keyboard.
 * Lives in world.devices[deviceId].keyboard
 */

import type { KeyboardLayout } from "./layouts";

// =============================================================================
// TYPING SCHEDULE (Enterprise Pattern)
// =============================================================================

/**
 * Entry in the typing schedule - represents one keystroke
 */
export interface TypingScheduleEntry {
    key: string;
    frame: number;
}

/**
 * Active typing sequence - allows renderer to derive state from frame
 */
export interface TypingSchedule {
    entries: TypingScheduleEntry[];
    text: string;
    startFrame: number;
    endFrame: number;
}

// =============================================================================
// KEYBOARD STATE
// =============================================================================

export interface KeyboardState {
    // Visibility
    visible: boolean;
    visibilityChangedAt: number;

    // Layout
    layout: KeyboardLayout;

    // Current Key Press (legacy - kept for backward compat, derived from schedule in renderer)
    currentKey: string | null;
    keyPressedAt: number | null;

    // Input Text (legacy - kept for backward compat, derived from schedule in renderer)
    inputText: string;
    cursorPosition: number;
    cursorVisible: boolean;

    // Selection
    selectionStart: number | null;
    selectionEnd: number | null;

    // Autocomplete
    suggestions: string[];
    highlightedSuggestion: number | null;

    // Visual Feedback
    keyPressVisual: KeyPressVisual | null;

    // Enterprise: Typing Schedule (derived state in renderer)
    typingSchedule: TypingSchedule | null;
}

export interface KeyPressVisual {
    key: string;
    scale: number;
    startFrame: number;
}

// =============================================================================
// DEFAULT STATE
// =============================================================================

export const DEFAULT_KEYBOARD_STATE: KeyboardState = {
    // Visibility
    visible: false,
    visibilityChangedAt: -1,

    // Layout
    layout: "qwerty",

    // Current Key Press
    currentKey: null,
    keyPressedAt: null,

    // Input Text
    inputText: "",
    cursorPosition: 0,
    cursorVisible: true,

    // Selection
    selectionStart: null,
    selectionEnd: null,

    // Autocomplete
    suggestions: [],
    highlightedSuggestion: null,

    // Visual Feedback
    keyPressVisual: null,

    // Enterprise: Typing Schedule
    typingSchedule: null,
};

// =============================================================================
// HELPERS
// =============================================================================

export function createKeyboardInitialState(): KeyboardState {
    return { ...DEFAULT_KEYBOARD_STATE };
}
