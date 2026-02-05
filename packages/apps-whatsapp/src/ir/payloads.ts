/**
 * WhatsApp Payloads
 *
 * Re-exports the canonical event types from types/events.ts
 * and provides legacy exports for backward compatibility.
 */
import type { WhatsAppEventMap } from "../types/events";

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

export type WhatsAppPayloads = WhatsAppEventMap;

declare module "@tokovo/ir" {
  interface AppPayloadRegistry {
    app_whatsapp: WhatsAppPayloads;
  }
}
