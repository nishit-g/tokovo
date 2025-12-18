/**
 * Call IR Event Types
 * 
 * Typed events for call state changes.
 */

import type { CallEventType } from "../types";

// =============================================================================
// IR EVENT
// =============================================================================

export interface CallTrackEvent {
    kind: "CALL";
    deviceId: string;
    type: CallEventType;
    at: number;
    _declarationOrder: number;
    [key: string]: any;
}

// =============================================================================
// TYPE GUARD
// =============================================================================

const CALL_EVENT_TYPES = new Set<string>([
    "INCOMING",
    "ANSWER",
    "DECLINE",
    "END",
    "TOGGLE_MUTE",
    "TOGGLE_SPEAKER",
    "TOGGLE_HOLD",
]);

export function isCallEvent(event: any): event is CallTrackEvent {
    return event?.kind === "CALL" && CALL_EVENT_TYPES.has(event?.type);
}
