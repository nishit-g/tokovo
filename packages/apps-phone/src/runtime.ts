/**
 * Phone App Runtime - Event Reducer
 * 
 * Handles CALL events and updates device.call state.
 */

import { AppReducer, WorldState, TimelineEvent, CallState } from "@tokovo/core";

/**
 * Phone app reducer - processes CALL events
 * 
 * Canonical 3-arg signature: (world, event, ctx?)
 * ctx is optional for backward compatibility with legacy replay()
 */
export const phoneReducer: AppReducer = (
    world: WorldState,
    event: TimelineEvent,
    _ctx?: { frame?: number; fps?: number }
): void => {
    // Alias for mutation (backward compat with draft naming)
    const draft = world;
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
};
