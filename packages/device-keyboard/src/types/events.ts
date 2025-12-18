/**
 * Keyboard Event Type Constants
 * 
 * Namespaced event types for keyboard plugin.
 */

// =============================================================================
// EVENT TYPES
// =============================================================================

export const KEYBOARD_EVENT_TYPES = {
    // Visibility
    SHOW: "KEYBOARD_SHOW",
    HIDE: "KEYBOARD_HIDE",

    // Typing
    TYPE: "KEYBOARD_TYPE",
    KEY_DOWN: "KEYBOARD_KEY_DOWN",
    KEY_UP: "KEYBOARD_KEY_UP",

    // Input
    CLEAR: "KEYBOARD_CLEAR",
    SET_TEXT: "KEYBOARD_SET_TEXT",

    // Cursor & Selection
    CURSOR_MOVE: "KEYBOARD_CURSOR_MOVE",
    SELECT_RANGE: "KEYBOARD_SELECT_RANGE",

    // Layout
    SWITCH_LAYOUT: "KEYBOARD_SWITCH_LAYOUT",

    // Autocomplete
    ACCEPT_SUGGESTION: "KEYBOARD_ACCEPT_SUGGESTION",

    // Clipboard
    PASTE: "KEYBOARD_PASTE",
} as const;

export type KeyboardEventType = typeof KEYBOARD_EVENT_TYPES[keyof typeof KEYBOARD_EVENT_TYPES];

// =============================================================================
// IR EVENT KINDS
// =============================================================================

/**
 * IR event kinds for keyboard.
 * These are the `kind` values used at the IR level.
 */
export const KEYBOARD_IR_KINDS = {
    TYPE: "KeyboardType",
    INPUT: "KeyboardInput",
    SHOW: "KeyboardShow",
    HIDE: "KeyboardHide",
} as const;
