/**
 * WhatsApp Track Event Type
 * 
 * Type definition for WhatsApp-specific track events.
 */

import type { TrackEventBase } from "@tokovo/ir";
import type { WhatsAppPayloads } from "./payloads";

// =============================================================================
// WHATSAPP TRACK EVENT
// =============================================================================

export type WhatsAppTrackEvent = TrackEventBase & {
    kind: "APP";
    appId: "app_whatsapp";
    deviceId: string;
} & (
        | { type: "MESSAGE_RECEIVED"; payload: WhatsAppPayloads["MESSAGE_RECEIVED"] }
        | { type: "MESSAGE_SENT"; payload: WhatsAppPayloads["MESSAGE_SENT"] }
        | { type: "TYPING_START"; payload: WhatsAppPayloads["TYPING_START"] }
        | { type: "TYPING_END"; payload: WhatsAppPayloads["TYPING_END"] }
        | { type: "IMAGE_RECEIVED"; payload: WhatsAppPayloads["IMAGE_RECEIVED"] }
        | { type: "IMAGE_SENT"; payload: WhatsAppPayloads["IMAGE_SENT"] }
        | { type: "VIDEO_RECEIVED"; payload: WhatsAppPayloads["VIDEO_RECEIVED"] }
        | { type: "VOICE_RECEIVED"; payload: WhatsAppPayloads["VOICE_RECEIVED"] }
        | { type: "GIF_RECEIVED"; payload: WhatsAppPayloads["GIF_RECEIVED"] }
        | { type: "REACT"; payload: WhatsAppPayloads["REACT"] }
        | { type: "READ"; payload: WhatsAppPayloads["READ"] }
    );
