/**
 * Call Handler - Processes CALL events
 *
 * @description Handles incoming calls, answers, declines, and call controls.
 */

import type { WorldState } from "../../types.js";
import type { CallEvent, HandlerContext } from "./types.js";

interface CallEventPayload {
  deviceId?: string;
  callerId?: string;
  callerName?: string;
  callerAvatar?: string;
  isVideo?: boolean;
  callType?: string;
  displayMode?: string;
  callerMetadata?: Record<string, unknown>;
}

export function processCallEvent(
  draft: WorldState,
  event: CallEvent,
  _ctx: HandlerContext,
): void {
  const payload = event as CallEvent & CallEventPayload;
  const deviceId = payload.deviceId || Object.keys(draft.devices)[0];
  const device = draft.devices[deviceId];
  if (!device) return;

  switch (event.type) {
    case "INCOMING":
      device.call = {
        status: "incoming",
        callerId: payload.callerId || "unknown",
        callerName: payload.callerName || "Unknown Caller",
        callerAvatar: payload.callerAvatar,
        isVideo: payload.isVideo ?? false,
        callType: (payload.callType ?? "voice") as "voice" | "video" | "group",
        displayMode: (payload.displayMode ?? "fullscreen") as
          | "fullscreen"
          | "compact"
          | "pip",
        callerMetadata: payload.callerMetadata,
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
