/**
 * WhatsApp Types - Barrel Export
 *
 * Re-exports all type definitions for the WhatsApp plugin.
 */

// Messages
export type {
  WhatsAppMessageType,
  BaseMessage,
  TextMessage,
  ImageMessage,
  VideoMessage,
  VoiceMessage,
  GifMessage,
  SystemMessage,
  CallMessage,
  MissedCallMessage,
  ScreenshotAlertMessage,
  DeletedMessage,
  MessageData,
  WhatsAppReaction,
  ReplyToData,
  LinkPreviewData,
  WhatsAppMessage,
} from "./messages";

// Conversation
export type { WhatsAppGroupMember, WhatsAppConversation } from "./conversation";

// State
export type { WhatsAppState } from "./state";
export { asWhatsAppConversations, asWhatsAppState } from "./state";

export type {
  WhatsAppEventType,
  WhatsAppTrackEvent,
  WhatsAppEventMap,
  WhatsAppEventPayload,
  WhatsAppTypedEvent,
  MessageReference,
  ReplyToPayload,
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
} from "./events";
export { isWhatsAppEvent, getEventPayload, assertEventType } from "./events";

import "./module-augmentation";
