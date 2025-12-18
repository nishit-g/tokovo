/**
 * Keyboard DSL Helpers
 * 
 * Convenience functions for common keyboard operations.
 */

import type { KeyboardLayout } from "../types/layouts";
import type { SpeedPreset } from "../config/speeds";

// =============================================================================
// HELPER TYPES
// =============================================================================

export interface TypingOptions {
    speed?: number | SpeedPreset;
    variation?: boolean;
    mistakes?: boolean;
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create a quick typing sequence.
 * Returns events for: show → type → hide
 */
export function createTypingSequence(
    deviceId: string,
    text: string,
    opts?: {
        showAt: number;
        typeStart: number;
        typeEnd: number;
        hideAt: number;
        speed?: number | SpeedPreset;
    }
) {
    return {
        show: {
            kind: "OS" as const,
            target: "keyboard" as const,
            type: "SHOW" as const,
            payload: { layout: "qwerty" as KeyboardLayout },
            at: opts?.showAt ?? 0,
            deviceId,
        },
        type: {
            kind: "OS" as const,
            target: "keyboard" as const,
            type: "TYPE" as const,
            payload: {
                text,
                speed: opts?.speed ?? "normal",
                variation: true,
            },
            at: opts?.typeStart ?? 30,
            duration: (opts?.typeEnd ?? 90) - (opts?.typeStart ?? 30),
            deviceId,
        },
        hide: {
            kind: "OS" as const,
            target: "keyboard" as const,
            type: "HIDE" as const,
            payload: {},
            at: opts?.hideAt ?? 120,
            deviceId,
        },
    };
}

/**
 * Generate individual keyDown events for each character.
 * Used by lowering to expand TYPE events.
 */
export function expandTypeToKeyEvents(
    text: string,
    startFrame: number,
    frameDelay: number,
    deviceId: string
): Array<{
    kind: "OS";
    target: "keyboard";
    type: "KEY_DOWN";
    payload: { key: string };
    at: number;
    deviceId: string;
}> {
    return text.split("").map((char, index) => ({
        kind: "OS" as const,
        target: "keyboard" as const,
        type: "KEY_DOWN" as const,
        payload: { key: char },
        at: startFrame + index * frameDelay,
        deviceId,
    }));
}
