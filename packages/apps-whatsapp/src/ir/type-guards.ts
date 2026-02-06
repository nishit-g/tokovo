import type { TrackEvent } from "@tokovo/ir";
import type { WhatsAppTrackEvent } from "../types/events.js";

export function isWhatsAppEvent(
  e: TrackEvent,
): e is TrackEvent & { kind: "APP"; appId: "app_whatsapp" } {
  return (
    (e as { kind: string }).kind === "APP" &&
    (e as { appId?: string }).appId === "app_whatsapp"
  );
}

export function isWhatsAppGroupEvent(eventType: string): boolean {
  return eventType.startsWith("whatsapp.GROUP_");
}

export function isMessageReceived(
  e: WhatsAppTrackEvent,
): e is WhatsAppTrackEvent & { type: "MESSAGE_RECEIVED" } {
  return e.type === "MESSAGE_RECEIVED";
}

export function isMessageSent(
  e: WhatsAppTrackEvent,
): e is WhatsAppTrackEvent & { type: "MESSAGE_SENT" } {
  return e.type === "MESSAGE_SENT";
}

export function isTypingStart(
  e: WhatsAppTrackEvent,
): e is WhatsAppTrackEvent & { type: "TYPING_START" } {
  return e.type === "TYPING_START";
}

export function isTypingEnd(
  e: WhatsAppTrackEvent,
): e is WhatsAppTrackEvent & { type: "TYPING_END" } {
  return e.type === "TYPING_END";
}

export {
  isGroupMemberAddPayload,
  isGroupMemberRemovePayload,
  isGroupAdminChangePayload,
} from "./group-ops.js";
