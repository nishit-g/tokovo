/**
 * Call V2 Lowering Handler
 * 
 * Transforms DSL IR events into runtime timeline operations.
 */

import type { CallTrackEvent } from "../ir/call-event";

// =============================================================================
// LOWERING HANDLER
// =============================================================================

/**
 * Lower call DSL events to runtime events
 * Call events are 1:1 mappings (no expansion needed)
 */
export function callV2Lowering(
    event: CallTrackEvent,
    _ctx: { fps: number }
): any[] {
    console.log("[callV2Lowering] ✨ Lowering CALL event:", event.type, "at", event.at);

    // Call events map directly to runtime events
    // Spread first, then override essential fields to ensure they're correct
    const { _declarationOrder, ...rest } = event;
    const result = [{
        ...rest,
        at: event.at,
        kind: "CALL" as const,
        deviceId: event.deviceId,
        type: event.type,
    }];

    console.log("[callV2Lowering] 📤 Output:", result);
    return result;
}

// =============================================================================
// EVENT TYPES FOR REGISTRATION
// =============================================================================

export const CALL_EVENT_TYPES = [
    "INCOMING",
    "ANSWER",
    "DECLINE",
    "END",
    "TOGGLE_MUTE",
    "TOGGLE_SPEAKER",
    "TOGGLE_HOLD",
] as const;
