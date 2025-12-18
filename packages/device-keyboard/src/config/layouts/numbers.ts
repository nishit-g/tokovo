/**
 * Numbers Keyboard Layout
 */

import type { KeyboardLayoutConfig } from "../../types/layouts";

// =============================================================================
// NUMBERS ROWS
// =============================================================================

export const NUMBERS_ROWS = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["-", "/", ":", ";", "(", ")", "$", "&", "@", '"'],
    ["#+=", ".", ",", "?", "!", "'", "⌫"],
    ["ABC", "🌐", "space", "return"],
];

// =============================================================================
// LAYOUT CONFIG
// =============================================================================

export const NUMBERS_LAYOUT: KeyboardLayoutConfig = {
    id: "numbers",
    displayName: "Numbers",
    rows: [
        {
            keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
            type: "standard",
        },
        {
            keys: ["-", "/", ":", ";", "(", ")", "$", "&", "@", '"'],
            type: "standard",
        },
        {
            keys: [
                { id: "#+=", label: "#+=", width: 1.5, isSpecial: true },
                ".", ",", "?", "!", "'",
                { id: "backspace", label: "⌫", width: 1.3, isSpecial: true, icon: "backspace" },
            ],
            type: "mixed",
        },
        {
            keys: [
                { id: "ABC", label: "ABC", width: 1.5, isSpecial: true },
                { id: "globe", label: "🌐", width: 1, isSpecial: true, icon: "globe" },
                { id: "space", label: " ", width: 5.8, isSpecial: false },
                { id: "return", label: "return", width: 1.5, isSpecial: true, icon: "return" },
            ],
            type: "bottom",
        },
    ],
};
