/**
 * Keyboard Anchor Provider
 * 
 * Provides camera anchor regions for keyboard elements.
 */

import type { AnchorProvider, AnchorSnapshot, LayoutRect, WorldState } from "@tokovo/core";

// =============================================================================
// CONSTANTS
// =============================================================================

const DEVICE_ID = "keyboard";

/**
 * Keyboard regions at design resolution (393px).
 * Scaled to 3x for 1170px export.
 */
const KEYBOARD_REGIONS = {
    /** Full keyboard area */
    keyboard: { x: 0, y: 1800, width: 1170, height: 732 },
    /** Prediction bar */
    predictionBar: { x: 0, y: 1800, width: 1170, height: 144 },
    /** Input field (above keyboard) */
    inputField: { x: 0, y: 1656, width: 1170, height: 144 },
    /** Key rows */
    keyRow0: { x: 18, y: 1944, width: 1134, height: 126 },
    keyRow1: { x: 54, y: 2070, width: 1062, height: 126 },
    keyRow2: { x: 18, y: 2196, width: 1134, height: 126 },
    keyRow3: { x: 18, y: 2322, width: 1134, height: 126 },
};

// =============================================================================
// ANCHOR PROVIDER
// =============================================================================

export const KeyboardAnchors: AnchorProvider = {
    appId: "device_keyboard",

    // Static framing definitions
    framing: {
        keyboard: {
            anchorPoint: { x: 0.5, y: 0.85 },
            paddingPx: 20,
            targetFill: 0.4,
        },
        predictionBar: {
            anchorPoint: { x: 0.5, y: 0.7 },
            paddingPx: 40,
            targetFill: 0.3,
        },
        inputField: {
            anchorPoint: { x: 0.5, y: 0.6 },
            paddingPx: 30,
            targetFill: 0.5,
        },
        activeKey: {
            anchorPoint: { x: 0.5, y: 0.5 },
            paddingPx: 50,
            targetFill: 0.15,
        },
        keyRow: {
            anchorPoint: { x: 0.5, y: 0.9 },
            paddingPx: 30,
            targetFill: 0.3,
        },
    },

    // Dynamic anchor extraction
    getAnchors(
        world: WorldState,
        _layout: unknown,
        deviceId: string
    ): AnchorSnapshot {
        const device = world.devices[deviceId];
        const kb = device?.keyboard;

        // If keyboard not visible, return empty
        if (!kb?.visible) {
            return {
                anchors: {},
                deviceId,
                appId: "device_keyboard",
            };
        }

        const anchors: Record<string, LayoutRect> = {
            keyboard: KEYBOARD_REGIONS.keyboard,
            predictionBar: KEYBOARD_REGIONS.predictionBar,
            inputField: KEYBOARD_REGIONS.inputField,
        };

        // Add active key anchor if a key is pressed
        if (kb.currentKey) {
            anchors.activeKey = getKeyRect(kb.currentKey);
        }

        return {
            anchors,
            deviceId,
            appId: "device_keyboard",
        };
    },
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get the bounding rect for a specific key.
 * 
 * @param key - Key character (e.g., "a", "⌫")
 * @returns Layout rect for the key
 */
function getKeyRect(key: string): LayoutRect {
    // Key dimensions at 3x
    const keyWidth = 99;    // 33 * 3
    const keyHeight = 126;  // 42 * 3

    // QWERTY layout positions (approximate)
    const qwertyPositions: Record<string, { row: number; col: number }> = {
        q: { row: 0, col: 0 }, w: { row: 0, col: 1 }, e: { row: 0, col: 2 },
        r: { row: 0, col: 3 }, t: { row: 0, col: 4 }, y: { row: 0, col: 5 },
        u: { row: 0, col: 6 }, i: { row: 0, col: 7 }, o: { row: 0, col: 8 },
        p: { row: 0, col: 9 },
        a: { row: 1, col: 0 }, s: { row: 1, col: 1 }, d: { row: 1, col: 2 },
        f: { row: 1, col: 3 }, g: { row: 1, col: 4 }, h: { row: 1, col: 5 },
        j: { row: 1, col: 6 }, k: { row: 1, col: 7 }, l: { row: 1, col: 8 },
        z: { row: 2, col: 1 }, x: { row: 2, col: 2 }, c: { row: 2, col: 3 },
        v: { row: 2, col: 4 }, b: { row: 2, col: 5 }, n: { row: 2, col: 6 },
        m: { row: 2, col: 7 },
        " ": { row: 3, col: 2 }, // Space bar
    };

    const pos = qwertyPositions[key.toLowerCase()] ?? { row: 1, col: 4 };
    const rowY = KEYBOARD_REGIONS.keyRow0.y + pos.row * (keyHeight + 36);
    const keyX = 18 + pos.col * (keyWidth + 9);

    return {
        x: keyX,
        y: rowY,
        width: key === " " ? 576 : keyWidth, // Space bar is wider
        height: keyHeight,
    };
}

export { getKeyRect };
