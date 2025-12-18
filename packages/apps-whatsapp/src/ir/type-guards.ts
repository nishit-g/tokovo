/**
 * WhatsApp Type Guards
 * 
 * Runtime type narrowing functions for safe event handling.
 */

import type { TrackEvent } from "@tokovo/ir";
import type { WhatsAppTrackEvent } from "./track-event";
import { GROUP_EVENT_TYPES } from "./group-ops";

// =============================================================================
// EVENT TYPE GUARDS
// =============================================================================

/**
 * Check if event is a WhatsApp event.
 */
export function isWhatsAppEvent(e: TrackEvent): e is WhatsAppTrackEvent {
    return (e as { kind: string }).kind === "APP" &&
        (e as { appId?: string }).appId === "app_whatsapp";
}

/**
 * Check if event is a WhatsApp group event.
 */
export function isWhatsAppGroupEvent(eventType: string): boolean {
    return eventType.startsWith("whatsapp.GROUP_");
}

/**
 * Check if event is MESSAGE_RECEIVED type.
 */
export function isMessageReceived(e: WhatsAppTrackEvent): e is WhatsAppTrackEvent & { type: "MESSAGE_RECEIVED" } {
    return e.type === "MESSAGE_RECEIVED";
}

/**
 * Check if event is MESSAGE_SENT type.
 */
export function isMessageSent(e: WhatsAppTrackEvent): e is WhatsAppTrackEvent & { type: "MESSAGE_SENT" } {
    return e.type === "MESSAGE_SENT";
}

/**
 * Check if event is TYPING_START type.
 */
export function isTypingStart(e: WhatsAppTrackEvent): e is WhatsAppTrackEvent & { type: "TYPING_START" } {
    return e.type === "TYPING_START";
}

/**
 * Check if event is TYPING_END type.
 */
export function isTypingEnd(e: WhatsAppTrackEvent): e is WhatsAppTrackEvent & { type: "TYPING_END" } {
    return e.type === "TYPING_END";
}

// Re-export group-ops type guards
export {
    isGroupMemberAddPayload,
    isGroupMemberRemovePayload,
    isGroupAdminChangePayload,
} from "./group-ops";
