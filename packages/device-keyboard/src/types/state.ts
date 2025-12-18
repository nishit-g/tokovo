/**
 * Keyboard State Types
 * 
 * State shape for the virtual keyboard.
 * Lives in world.devices[deviceId].keyboard
 */

import type { KeyboardLayout } from "./layouts";

// =============================================================================
// KEYBOARD STATE
// =============================================================================

export interface KeyboardState {
    // Visibility
    visible: boolean;
    visibilityChangedAt: number;

    // Layout
    layout: KeyboardLayout;

    // Current Key Press
    currentKey: string | null;
    keyPressedAt: number | null;

    // Input Text
    inputText: string;
    cursorPosition: number;
    cursorVisible: boolean;

    // Selection (NEW)
    selectionStart: number | null;
    selectionEnd: number | null;

    // Typing Animation (NEW)
    typingQueue: string[];
    typingSpeed: number;          // chars per minute
    lastTypedAt: number | null;

    // Autocomplete (NEW)
    suggestions: string[];
    highlightedSuggestion: number | null;

    // Visual Feedback (NEW)
    keyPressVisual: KeyPressVisual | null;
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
    visibilityChangedAt: 0,

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

    // Typing Animation
    typingQueue: [],
    typingSpeed: 80,
    lastTypedAt: null,

    // Autocomplete
    suggestions: [],
    highlightedSuggestion: null,

    // Visual Feedback
    keyPressVisual: null,
};

// =============================================================================
// HELPERS
// =============================================================================

export function createKeyboardInitialState(): KeyboardState {
    return { ...DEFAULT_KEYBOARD_STATE };
}
