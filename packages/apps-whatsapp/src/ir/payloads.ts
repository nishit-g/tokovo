/**
 * WhatsApp Payloads
 *
 * Re-exports the canonical event types from types/events.ts.
 */
import type { WhatsAppEventMap } from "../types/events.js";

export type {
  WhatsAppTrackEvent,
  WhatsAppEventType,
  WhatsAppEventMap,
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
  ReadPayload,
  MessageDeletedPayload,
  MessageEditedPayload,
  MessageForwardedPayload,
  MediaLifecyclePayload,
  MediaViewerOpenedPayload,
  MediaViewerClosedPayload,
  GestureStartedPayload,
  GestureUpdatedPayload,
  GestureCompletedPayload,
  GestureCancelledPayload,
  ReplyComposerDismissedPayload,
  SetLocalePayload,
  ConversationOpenedPayload,
  NavigateScreenPayload,
  GroupMemberAddedPayload,
  GroupMemberRemovedPayload,
  GroupAdminChangedPayload,
  GroupInfoUpdatedPayload,
  PinPayload,
  MutePayload,
  ArchivePayload,
  DraftPayload,
  ReactionAddedPayload,
  MessageReadPayload,
} from "../types/events.js";

export { isWhatsAppEvent } from "../types/events.js";

export type WhatsAppPayloads = WhatsAppEventMap;

declare module "@tokovo/ir" {
  interface AppPayloadRegistry {
    app_whatsapp: WhatsAppPayloads;
  }
}
