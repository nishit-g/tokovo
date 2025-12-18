/**
 * Keyboard Lowering Handler
 * 
 * Transforms DSL track events into runtime events.
 */

import type { KeyboardTrackEvent } from "../ir/track-event";
import { getFrameDelay, applyVariation } from "../config/speeds";

// =============================================================================
// LOWERING HANDLER
// =============================================================================

export interface LoweringContext {
    fps: number;
}

/**
 * Lower a keyboard track event to runtime events.
 * 
 * Mainly handles TYPE events by expanding them into individual KEY_DOWN events.
 */
export function lowerKeyboardEvent(
    event: KeyboardTrackEvent,
    ctx: LoweringContext
): RuntimeKeyboardEvent[] {
    // TYPE events get expanded into individual key events
    if (event.type === "TYPE") {
        const { text, speed, variation } = event.payload;
        const baseDelay = getFrameDelay(speed ?? "normal", ctx.fps);
        const duration = (event as { duration?: number }).duration;

        const events: RuntimeKeyboardEvent[] = [];

        if (duration && duration > 0) {
            // Span-based: spread evenly across duration
            const charDelay = Math.floor(duration / text.length);

            text.split("").forEach((char, i) => {
                const delay = variation ? applyVariation(charDelay, event.at + i) : charDelay;
                events.push({
                    kind: "KEYBOARD",
                    type: "KEY_DOWN",
                    key: char,
                    at: event.at + i * delay,
                    deviceId: event.deviceId,
                });
            });
        } else {
            // Point-based: use speed
            text.split("").forEach((char, i) => {
                const delay = variation ? applyVariation(baseDelay, event.at + i) : baseDelay;
                events.push({
                    kind: "KEYBOARD",
                    type: "KEY_DOWN",
                    key: char,
                    at: event.at + i * delay,
                    deviceId: event.deviceId,
                });
            });
        }

        return events;
    }

    // All other events pass through
    const { payload, ...rest } = event;
    return [{
        kind: "KEYBOARD",
        type: event.type,
        ...payload,
        at: event.at,
        deviceId: event.deviceId,
    }];
}

// =============================================================================
// TYPES
// =============================================================================

interface RuntimeKeyboardEvent {
    kind: "KEYBOARD";
    type: string;
    at: number;
    deviceId: string;
    [key: string]: unknown;
}

// =============================================================================
// EXPORT
// =============================================================================

export const keyboardV2Lowering = {
    eventKinds: ["OS"],
    targets: ["keyboard"],
    lower: lowerKeyboardEvent,
};
