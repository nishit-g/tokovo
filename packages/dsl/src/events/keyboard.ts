/**
 * Keyboard Event Factories
 * 
 * Low-level event creators for keyboard simulation.
 * Used by showcases and DSL builders.
 */

import { TimelineEvent, KeyboardLayout } from "@tokovo/core";

/**
 * Keyboard event factories
 */
export const keyboard = {
    /**
     * Show the virtual keyboard
     */
    show: (at: number, deviceId: string, layout: KeyboardLayout = "qwerty"): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "SHOW",
        deviceId,
        layout,
    } as TimelineEvent),

    /**
     * Hide the virtual keyboard
     */
    hide: (at: number, deviceId: string): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "HIDE",
        deviceId,
    } as TimelineEvent),

    /**
     * Type a single character
     */
    typeChar: (at: number, deviceId: string, char: string): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "TYPE_CHAR",
        deviceId,
        char,
    } as TimelineEvent),

    /**
     * Delete last character (backspace)
     */
    backspace: (at: number, deviceId: string): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "BACKSPACE",
        deviceId,
    } as TimelineEvent),

    /**
     * Set text directly
     */
    setText: (at: number, deviceId: string, text: string): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "SET_TEXT",
        deviceId,
        text,
    } as TimelineEvent),

    /**
     * Clear all text
     */
    clear: (at: number, deviceId: string): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "CLEAR",
        deviceId,
    } as TimelineEvent),

    /**
     * Key down (for visual highlight)
     */
    keyDown: (at: number, deviceId: string, key: string): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "KEY_DOWN",
        deviceId,
        key,
    } as TimelineEvent),

    /**
     * Key up (end visual highlight)
     */
    keyUp: (at: number, deviceId: string): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "KEY_UP",
        deviceId,
    } as TimelineEvent),
};
