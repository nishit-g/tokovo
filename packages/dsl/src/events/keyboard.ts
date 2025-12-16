/**
 * Keyboard Event Factories
 * 
 * Low-level event creators for keyboard simulation.
 * Used by showcases and DSL builders.
 */

import { TimelineEvent, KeyboardLayout, SeededRNG } from "@tokovo/core";
import { createTrace } from "@tokovo/ir";
import { Tracer } from "../tracer";

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
        trace: createTrace(Tracer.capture()),
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
        trace: createTrace(Tracer.capture()),
        deviceId,
    } as TimelineEvent),

    /**
     * Type a single character (V2)
     */
    typeChar: (at: number, deviceId: string, char: string): TimelineEvent => ({
        at,
        kind: "KeyboardType",
        trace: createTrace(Tracer.capture()),
        text: char,
        deviceId,
    } as TimelineEvent),

    /**
     * Delete last character (backspace)
     */
    backspace: (at: number, deviceId: string): TimelineEvent => ({
        at,
        kind: "KeyboardInput",
        type: "keyDown",
        trace: createTrace(Tracer.capture()),
        key: "Backspace",
        deviceId,
    } as TimelineEvent),

    /**
     * Set text directly
     */
    setText: (at: number, deviceId: string, text: string): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "SET_TEXT",
        trace: createTrace(Tracer.capture()),
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
        trace: createTrace(Tracer.capture()),
        deviceId,
    } as TimelineEvent),

    /**
     * Key down (for visual highlight) (V2)
     */
    keyDown: (at: number, deviceId: string, key: string): TimelineEvent => ({
        at,
        kind: "KeyboardInput",
        type: "keyDown",
        trace: createTrace(Tracer.capture()),
        key,
        deviceId,
    } as TimelineEvent),

    /**
     * Key up (end visual highlight) (V2)
     */
    keyUp: (at: number, deviceId: string): TimelineEvent => ({
        at,
        kind: "KeyboardInput",
        type: "keyUp",
        trace: createTrace(Tracer.capture()),
        key: "", // Key up clears current key
        deviceId,
    } as TimelineEvent),

    /**
     * Generate a realistic typing sequence
     */
    /**
     * Generate a realistic, smart typing sequence
     * 
     * - Automatically switches layouts (123, ABC)
     * - Uses seeded RNG for deterministic variance
     */
    type: (at: number, deviceId: string, text: string, options?: { speed?: "fast" | "normal" | "slow", variance?: number, seed?: number }): TimelineEvent[] => {
        const trace = createTrace(Tracer.capture());
        const events: TimelineEvent[] = [];
        let t = at;

        // Deterministic RNG
        const seed = options?.seed || 123456;
        // Simple hash of text to vary seed if not provided, for different texts
        const textHash = text.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
        const rng = new SeededRNG(seed + textHash);

        const speedMap = { fast: 2, normal: 3, slow: 5 };
        const baseSpeed = speedMap[options?.speed || "normal"];
        const variance = options?.variance || 0;

        // Smart Layout State
        let currentLayout: "qwerty" | "numbers" = "qwerty"; // default

        // Helpers
        const isNumberOrSymbol = (char: string) => /[0-9\-/:;()$&@"\.,?!']/.test(char);
        const getLayoutForChar = (char: string): "qwerty" | "numbers" => {
            if (char === " ") return currentLayout; // Space works on likely both, or we assume stickiness
            return isNumberOrSymbol(char) ? "numbers" : "qwerty";
        };

        for (const char of text) {
            const requiredLayout = getLayoutForChar(char);

            // Switch Layout if needed
            if (requiredLayout !== currentLayout) {
                const switchKey = currentLayout === "qwerty" ? "123" : "ABC";

                // Press Switch Key
                events.push(keyboard.keyDown(t, deviceId, switchKey));
                t += Math.floor(baseSpeed * 0.5);

                // Switch Action
                events.push({
                    at: t,
                    kind: "KEYBOARD",
                    type: "SHOW", // SHOW updates layout too
                    trace,
                    deviceId,
                    layout: requiredLayout
                } as any);

                // Release Switch Key
                events.push(keyboard.keyUp(t, deviceId));

                currentLayout = requiredLayout;
                t += baseSpeed + rng.nextInt(0, variance);
            }

            // Normal Key Press
            // Press - V2
            events.push(keyboard.keyDown(t, deviceId, char));

            // Commit char (Input Change happens here) - V2
            events.push(keyboard.typeChar(t, deviceId, char));

            t += Math.floor(baseSpeed * 0.5);

            // Release - V2
            events.push(keyboard.keyUp(t, deviceId));

            // Delay next char
            t += baseSpeed + (variance > 0 ? rng.nextInt(0, variance) : 0);
        }

        return events;
    }
};
