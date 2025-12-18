/**
 * Key Types
 * 
 * Types for individual key configuration and state.
 */

// =============================================================================
// KEY PROPS
// =============================================================================

export interface KeyProps {
    /** Key label to display */
    label: string;
    /** Whether this key is currently pressed */
    isPressed: boolean;
    /** Width in pixels (design space) */
    width?: number;
    /** Is this a special key (shift, backspace, etc.) */
    isSpecial?: boolean;
    /** Theme variant */
    variant: "light" | "dark";
    /** Is this key displaying an icon instead of text */
    isIcon?: boolean;
}

export interface KeyPopupProps {
    /** Character to display in popup */
    label: string;
    /** Theme variant */
    variant: "light" | "dark";
    /** Key width for sizing */
    keyWidth: number;
}

export interface KeyRowProps {
    /** Keys in this row */
    keys: string[];
    /** Currently pressed key */
    currentKey: string | null;
    /** Theme variant */
    variant: "light" | "dark";
    /** Row index (0-3) */
    rowIndex: number;
}

// =============================================================================
// SPECIAL KEYS
// =============================================================================

export const SPECIAL_KEYS = [
    "⇧",      // Shift
    "⌫",      // Backspace
    "123",    // Numbers
    "ABC",    // Letters
    "🌐",     // Globe/Language
    "return", // Return/Enter
    "#+=",    // Symbols
] as const;

export type SpecialKey = typeof SPECIAL_KEYS[number];

export function isSpecialKey(key: string): boolean {
    return SPECIAL_KEYS.includes(key as SpecialKey);
}
