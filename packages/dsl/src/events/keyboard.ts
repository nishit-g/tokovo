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
    /**
     * Key up (end visual highlight)
     */
    keyUp: (at: number, deviceId: string): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "KEY_UP",
        deviceId,
    } as TimelineEvent),

    /**
     * Generate a realistic typing sequence
     */
    type: (at: number, deviceId: string, text: string, options?: { speed?: "fast" | "normal" | "slow", variance?: number }): TimelineEvent[] => {
        const events: TimelineEvent[] = [];
        let t = at;
        const speedMap = { fast: 2, normal: 3, slow: 5 };
        const baseSpeed = speedMap[options?.speed || "normal"];

        // Ensure keyboard is shown? (This is tricky if we don't know state. Usually better to be explicit or have a 'ensureVisible' flag)
        // For now, raw typing.

        for (const char of text) {
            // Check for layout switching if needed (simplified: just type)
            // Ideally we'd switch to numeric if char is digit.

            // Press
            events.push({
                at: t,
                kind: "KEYBOARD",
                type: "KEY_DOWN",
                deviceId,
                key: char
            } as TimelineEvent);

            // Commit char (Input Change happens here)
            events.push({
                at: t,
                kind: "KEYBOARD",
                type: "TYPE_CHAR",
                deviceId,
                char
            } as TimelineEvent);

            t += Math.floor(baseSpeed * 0.5);

            // Release
            events.push({
                at: t,
                kind: "KEYBOARD",
                type: "KEY_UP",
                deviceId
            } as TimelineEvent);

            // Delay next char
            t += baseSpeed + (options?.variance ? Math.floor(Math.random() * options.variance) : 0);
        }

        return events;
    }
};
