/**
 * WhatsApp Payloads
 *
 * Re-exports the canonical event types from types/events.ts
 * and provides legacy exports for backward compatibility.
 */

import type { TrackMessageRef } from "@tokovo/ir";

export type {
  WhatsAppTrackEvent,
  WhatsAppEventType,
  WhatsAppEventMap,
  MessageReference,
  MessageReceivedPayload,
  MessageSentPayload,
  ImageReceivedPayload,
  ImageSentPayload,
  VideoReceivedPayload,
  VideoSentPayload,
  VoiceReceivedPayload,
  VoiceSentPayload,
  GifReceivedPayload,
  GifSentPayload,
  StickerReceivedPayload,
  StickerSentPayload,
  DocumentReceivedPayload,
  DocumentSentPayload,
  ContactReceivedPayload,
  ContactSentPayload,
  LocationReceivedPayload,
  LocationSentPayload,
  TypingPayload,
  ReactPayload,
  ReadPayload,
  MessageDeletedPayload,
  MessageEditedPayload,
  MessageForwardedPayload,
  NavigateScreenPayload,
  DateSeparatorPayload,
} from "../types/events";

export { isWhatsAppEvent } from "../types/events";

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
    typed?: boolean;
    charDelay?: number;
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
    duration?: number;
    thumbnail?: string;
  };
  VOICE_RECEIVED: {
    conversationId: string;
    from: string;
    duration: number;
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

declare module "@tokovo/ir" {
  interface AppPayloadRegistry {
    app_whatsapp: WhatsAppPayloads;
  }
}
