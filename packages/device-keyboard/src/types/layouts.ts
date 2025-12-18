/**
 * Keyboard Layout Types
 * 
 * Layout configuration for different keyboard modes.
 */

// =============================================================================
// LAYOUT TYPES
// =============================================================================

export type KeyboardLayout = "qwerty" | "numbers" | "symbols" | "emoji";

export interface KeyConfig {
    /** Key identifier (e.g., "a", "shift", "space") */
    id: string;
    /** Display label (if different from id) */
    label?: string;
    /** Width multiplier (1 = standard key width) */
    width?: number;
    /** Is this a special key (shift, backspace, etc.) */
    isSpecial?: boolean;
    /** Icon name for special keys */
    icon?: KeyIconName;
}

export type KeyIconName =
    | "shift"
    | "backspace"
    | "globe"
    | "emoji"
    | "mic"
    | "return"
    | "search";

export interface KeyRowConfig {
    /** Keys in this row */
    keys: (string | KeyConfig)[];
    /** Row type for styling */
    type: "standard" | "mixed" | "bottom";
}

export interface KeyboardLayoutConfig {
    /** Layout identifier */
    id: KeyboardLayout;
    /** Display name */
    displayName: string;
    /** Rows of keys */
    rows: KeyRowConfig[];
}
