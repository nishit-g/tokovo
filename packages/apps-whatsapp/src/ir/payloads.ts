/**
 * WhatsApp Payloads
 *
 * Strongly-typed payloads for WhatsApp track events.
 * Uses module augmentation to extend @tokovo/ir types.
 */

import type { TrackMessageRef, TrackEventBase, TrackEvent } from "@tokovo/ir";

// =============================================================================
// WHATSAPP PAYLOADS
// =============================================================================

export interface WhatsAppPayloads {
    MESSAGE_RECEIVED: {
        conversationId: string;
        from: string;
        text: string;
        silent?: boolean;
        replyTo?: TrackMessageRef;
    };
    MESSAGE_SENT: {
        conversationId: string;
        text: string;
        silent?: boolean;
    };
    TYPING_START: {
        conversationId: string;
        actor: string;
    };
    TYPING_END: {
        conversationId: string;
        actor: string;
    };
    IMAGE_RECEIVED: {
        conversationId: string;
        from: string;
        url: string;
        caption?: string;
        height?: number;
    };
    IMAGE_SENT: {
        conversationId: string;
        url: string;
        caption?: string;
    };
    VIDEO_RECEIVED: {
        conversationId: string;
        from: string;
        url: string;
        durationSeconds: number;
        thumbnail?: string;
    };
    VOICE_RECEIVED: {
        conversationId: string;
        from: string;
        durationSeconds: number;
    };
    GIF_RECEIVED: {
        conversationId: string;
        from: string;
        url: string;
    };
    REACT: {
        messageRef: TrackMessageRef;
        emoji: string;
    };
    READ: {
        conversationId: string;
    };
}

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

// =============================================================================
// MODULE AUGMENTATION
// =============================================================================

declare module "@tokovo/ir" {
    interface AppPayloadRegistry {
        app_whatsapp: WhatsAppPayloads;
    }

    interface AppTrackEventRegistry {
        app_whatsapp: WhatsAppTrackEvent;
    }
}

// =============================================================================
// TYPE GUARD
// =============================================================================

export function isWhatsAppEvent(e: TrackEvent): e is WhatsAppTrackEvent {
    return (e as { kind: string }).kind === "APP" &&
        (e as { appId?: string }).appId === "app_whatsapp";
}
