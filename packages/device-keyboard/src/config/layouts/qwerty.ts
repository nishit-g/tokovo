/**
 * QWERTY Keyboard Layout
 */

import type { KeyboardLayoutConfig } from "../../types/layouts";

// =============================================================================
// QWERTY ROWS
// =============================================================================

export const QWERTY_ROWS = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"],
    ["123", "🌐", "space", "return"],
];

// =============================================================================
// LAYOUT CONFIG
// =============================================================================

export const QWERTY_LAYOUT: KeyboardLayoutConfig = {
    id: "qwerty",
    displayName: "QWERTY",
    rows: [
        {
            keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
            type: "standard",
        },
        {
            keys: ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
            type: "standard",
        },
        {
            keys: [
                { id: "shift", label: "⇧", width: 1.3, isSpecial: true, icon: "shift" },
                "z", "x", "c", "v", "b", "n", "m",
                { id: "backspace", label: "⌫", width: 1.3, isSpecial: true, icon: "backspace" },
            ],
            type: "mixed",
        },
        {
            keys: [
                { id: "123", label: "123", width: 1.5, isSpecial: true },
                { id: "globe", label: "🌐", width: 1, isSpecial: true, icon: "globe" },
                { id: "space", label: " ", width: 5.8, isSpecial: false },
                { id: "return", label: "return", width: 1.5, isSpecial: true, icon: "return" },
            ],
            type: "bottom",
        },
    ],
};

// =============================================================================
// KEY WIDTHS (pixels at design width 393px)
// =============================================================================

export const QWERTY_KEY_WIDTHS: Record<string, number> = {
    // Standard keys: 33px
    default: 33,
    // Shift and Backspace
    shift: 42,
    backspace: 42,
    // Bottom row
    "123": 48,
    ABC: 48,
    globe: 33,
    space: 192,
    return: 48,
    "#+=": 48,
};

export function getKeyWidth(key: string): number {
    return QWERTY_KEY_WIDTHS[key.toLowerCase()] ?? QWERTY_KEY_WIDTHS.default;
}
