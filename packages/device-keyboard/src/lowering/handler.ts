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
    // TYPE events get expanded - use TYPING_SEQUENCE for efficiency
    if (event.type === "TYPE") {
        const { text, speed, variation } = event.payload;
        const baseDelay = getFrameDelay(speed ?? "normal", ctx.fps);
        const duration = (event as { duration?: number }).duration;

        // Calculate timing
        if (duration && duration > 0) {
            // Span-based: emit single TYPING_SEQUENCE event
            const charSpan = duration / text.length;

            // Build schedule with frame timing for each character
            const schedule = text.split("").map((key, i) => {
                const charStartFrame = Math.round(event.at + i * charSpan);
                return {
                    key,
                    frame: variation ? applyVariation(charStartFrame, event.at + i) : charStartFrame,
                };
            });

            // Single event with schedule - renderer derives state from frame
            return [{
                kind: "APP",
                appId: "keyboard",
                type: "TYPING_SEQUENCE",
                schedule,
                text,
                startFrame: event.at,
                endFrame: event.at + duration,
                at: event.at,
                deviceId: event.deviceId,
            }];
        } else {
            // Point-based: use speed, emit individual events for precise timing
            const events: RuntimeKeyboardEvent[] = [];
            text.split("").forEach((char, i) => {
                const charAt = event.at + i * baseDelay;
                const finalAt = variation ? applyVariation(charAt, event.at + i) : charAt;

                // KEY_DOWN
                events.push({
                    kind: "APP",
                    appId: "keyboard",
                    type: "KEY_DOWN",
                    key: char,
                    at: finalAt,
                    deviceId: event.deviceId,
                });

                // KEY_UP
                events.push({
                    kind: "APP",
                    appId: "keyboard",
                    type: "KEY_UP",
                    key: char,
                    at: finalAt + 2,
                    deviceId: event.deviceId,
                });
            });
            return events;
        }
    }

    // All other events pass through
    const { payload, ...rest } = event;
    return [{
        kind: "APP",
        appId: "keyboard",
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
    kind: "APP";
    appId: "keyboard";
    type: string;
    at: number;
    deviceId: string;
    [key: string]: unknown;
}

// =============================================================================
// EXPORT
// =============================================================================

export const keyboardV2Lowering = {
    eventKinds: ["APP"],
    targets: ["keyboard"],
    lower: lowerKeyboardEvent,
};
