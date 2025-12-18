/**
 * Call Reducer
 * 
 * Handles CALL events and updates device.call state.
 * Moved from logic/ to root for consistency with device-notifications pattern.
 */

import { ReducerRegistry } from "@tokovo/core";
import type { WorldState, TimelineEvent } from "@tokovo/core";

// =============================================================================
// CALL EVENT TYPES
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

// =============================================================================
// REDUCER
// =============================================================================

export function callReducer(
    draft: WorldState,
    event: TimelineEvent
): void {
    // Only handle CALL kind events
    if (event.kind !== "CALL") return;

    const deviceId = (event as any).deviceId || Object.keys(draft.devices)[0];
    const device = draft.devices[deviceId];
    if (!device) return;

    switch (event.type) {
        case "INCOMING": {
            const e = event as any;
            device.call = {
                status: "incoming",
                callerId: e.callerId,
                callerName: e.callerName,
                callerAvatar: e.callerAvatar,
                isVideo: e.isVideo ?? false,
                callType: e.callType ?? "voice",
                displayMode: e.displayMode ?? "fullscreen",
                callerMetadata: e.callerMetadata,
                startedAt: event.at,
                isMuted: false,
                isSpeakerOn: false,
                isOnHold: false,
            };
            break;
        }

        case "ANSWER": {
            if (device.call) {
                device.call.status = "active";
                device.call.answeredAt = event.at;
            }
            break;
        }

        case "DECLINE": {
            if (device.call) {
                device.call.status = "declined";
                device.call.endedAt = event.at;
            }
            break;
        }

        case "END": {
            if (device.call) {
                device.call.status = "ended";
                device.call.endedAt = event.at;
            }
            break;
        }

        case "TOGGLE_MUTE": {
            if (device.call) {
                device.call.isMuted = !device.call.isMuted;
            }
            break;
        }

        case "TOGGLE_SPEAKER": {
            if (device.call) {
                device.call.isSpeakerOn = !device.call.isSpeakerOn;
            }
            break;
        }

        case "TOGGLE_HOLD": {
            if (device.call) {
                device.call.isOnHold = !device.call.isOnHold;
            }
            break;
        }
    }
}

// =============================================================================
// REGISTER
// =============================================================================

// Auto-register with ReducerRegistry
ReducerRegistry.registerAppReducer("CALL", callReducer);
