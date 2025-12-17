/**
 * Touch Handler - Processes TOUCH events
 * 
 * @description Handles taps, long presses, and drag gestures.
 */

import type { WorldState } from "../../types";
import type { TouchEvent, HandlerContext } from "./types";

/** Duration in frames to keep touch indicators visible */
const TOUCH_EXPIRE_FRAMES = 15;

/**
 * Process touch event and update world touches state
 */
export function processTouchEvent(
    draft: WorldState,
    event: TouchEvent,
    ctx: HandlerContext
): void {
    // Initialize touches array if needed
    if (!draft.touches) {
        draft.touches = [];
    }

    // Remove expired touches
    draft.touches = draft.touches.filter(touch => ctx.frame - touch.startedAt < TOUCH_EXPIRE_FRAMES);

    const touchId = `touch_${event.at}_${Math.random().toString(36).slice(2, 6)}`;
    const e = event as any;

    switch (event.type) {
        case "TAP":
            draft.touches.push({
                id: touchId,
                x: e.x ?? 0,
                y: e.y ?? 0,
                startedAt: event.at,
                type: "tap",
            });
            break;

        case "LONG_PRESS":
            draft.touches.push({
                id: touchId,
                x: e.x ?? 0,
                y: e.y ?? 0,
                startedAt: event.at,
                type: "long_press",
            });
            break;

        case "DRAG":
            draft.touches.push({
                id: touchId,
                x: e.startX ?? 0,
                y: e.startY ?? 0,
                startedAt: event.at,
                type: "drag",
                endX: e.endX ?? 0,
                endY: e.endY ?? 0,
            });
            break;
    }
}
