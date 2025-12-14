/**
 * Typing Simulation with Humanizer
 * 
 * Generates realistic typing sequences with:
 * - Variable timing
 * - Typo simulation using adjacent keys
 * - Backspace correction
 */

import { TimelineEvent } from "@tokovo/core";
import { keyboard } from "./keyboard";

/**
 * Adjacent keys for typo simulation
 */
const ADJACENT_KEYS: Record<string, string[]> = {
    a: ["q", "w", "s", "z"], b: ["v", "g", "h", "n"], c: ["x", "d", "f", "v"],
    d: ["s", "e", "r", "f", "c", "x"], e: ["w", "r", "d", "s"], f: ["d", "r", "t", "g", "v", "c"],
    g: ["f", "t", "y", "h", "b", "v"], h: ["g", "y", "u", "j", "n", "b"], i: ["u", "o", "k", "j"],
    j: ["h", "u", "i", "k", "m", "n"], k: ["j", "i", "o", "l", "m"], l: ["k", "o", "p"],
    m: ["n", "j", "k"], n: ["b", "h", "j", "m"], o: ["i", "p", "l", "k"],
    p: ["o", "l"], q: ["w", "a"], r: ["e", "t", "f", "d"],
    s: ["a", "w", "e", "d", "x", "z"], t: ["r", "y", "g", "f"], u: ["y", "i", "j", "h"],
    v: ["c", "f", "g", "b"], w: ["q", "e", "s", "a"], x: ["z", "s", "d", "c"],
    y: ["t", "u", "h", "g"], z: ["a", "s", "x"],
};

/**
 * Typing speed presets (frames per character at 30fps)
 */
export const TYPING_SPEEDS = {
    slow: 10,     // 3 chars/sec
    casual: 5,    // 6 chars/sec
    fast: 3,      // 10 chars/sec
    angry: 2,     // 15 chars/sec
};

export type TypingSpeed = keyof typeof TYPING_SPEEDS;

export interface TypingOptions {
    /** Frames between characters */
    framesPerChar?: number;
    /** Speed preset (overrides framesPerChar) */
    speed?: TypingSpeed;
    /** Specific character positions to have typos */
    typoPositions?: number[];
    /** Random typo rate (0-1) */
    typoRate?: number;
    /** Seed for deterministic typos */
    seed?: number;
}

/**
 * Generate typing events with humanized timing and optional typos
 * 
 * @param startFrame - Frame to start typing
 * @param deviceId - Target device
 * @param text - Text to type
 * @param options - Typing simulation options
 * @returns Array of timeline events
 */
export function generateTyping(
    startFrame: number,
    deviceId: string,
    text: string,
    options: TypingOptions = {}
): TimelineEvent[] {
    const framesPerChar = options.speed
        ? TYPING_SPEEDS[options.speed]
        : (options.framesPerChar ?? 5);

    const typoPositions = new Set(options.typoPositions ?? []);
    const typoRate = options.typoRate ?? 0;

    const events: TimelineEvent[] = [];
    let frame = startFrame;

    // Simple seeded random for deterministic typos
    let seed = options.seed ?? 12345;
    const seededRandom = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
    };

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const lowerChar = char.toLowerCase();

        // Check if this position should have a typo
        const shouldTypo = typoPositions.has(i) ||
            (typoRate > 0 && seededRandom() < typoRate && ADJACENT_KEYS[lowerChar]);

        if (shouldTypo && ADJACENT_KEYS[lowerChar]) {
            // Pick wrong key (deterministically)
            const wrongKey = ADJACENT_KEYS[lowerChar][0];

            // Type wrong key
            events.push(keyboard.typeChar(frame, deviceId, wrongKey));
            frame += framesPerChar;

            // Quick pause then backspace
            events.push(keyboard.backspace(frame, deviceId));
            frame += 3;
        }

        // Type correct character
        events.push(keyboard.typeChar(frame, deviceId, char));
        frame += framesPerChar;
    }

    return events;
}

/**
 * Get the frame where typing ends
 */
export function getTypingEndFrame(
    startFrame: number,
    text: string,
    options: TypingOptions = {}
): number {
    const framesPerChar = options.speed
        ? TYPING_SPEEDS[options.speed]
        : (options.framesPerChar ?? 5);

    const typoCount = options.typoPositions?.length ??
        Math.floor(text.length * (options.typoRate ?? 0));

    // Each typo adds extra frames for backspace
    return startFrame + (text.length * framesPerChar) + (typoCount * (framesPerChar + 3));
}
