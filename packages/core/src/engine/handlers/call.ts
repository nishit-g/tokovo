/**
 * Call Handler - Processes CALL events
 * 
 * @description Handles incoming calls, answers, declines, and call controls.
 */

import type { WorldState } from "../../types";
import type { CallEvent, HandlerContext } from "./types";

/**
 * Process call event and update device call state
 */
export function processCallEvent(
    draft: WorldState,
    event: CallEvent,
    _ctx: HandlerContext
): void {
    const e = event as any;
    const deviceId = e.deviceId || Object.keys(draft.devices)[0];
    const device = draft.devices[deviceId];
    if (!device) return;

    switch (event.type) {
        case "INCOMING":
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

        case "ANSWER":
            if (device.call) {
                device.call.status = "active";
                device.call.answeredAt = event.at;
            }
            break;

        case "DECLINE":
            if (device.call) {
                device.call.status = "declined";
                device.call.endedAt = event.at;
            }
            break;

        case "END":
            if (device.call) {
                device.call.status = "ended";
                device.call.endedAt = event.at;
            }
            break;

        case "TOGGLE_MUTE":
            if (device.call) {
                device.call.isMuted = !device.call.isMuted;
            }
            break;

        case "TOGGLE_SPEAKER":
            if (device.call) {
                device.call.isSpeakerOn = !device.call.isSpeakerOn;
            }
            break;

        case "TOGGLE_HOLD":
            if (device.call) {
                device.call.isOnHold = !device.call.isOnHold;
            }
            break;
    }
}
