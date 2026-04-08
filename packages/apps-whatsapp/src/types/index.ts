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
  PollMessage,
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
} from "./messages.js";

// Conversation
export type { WhatsAppGroupMember, WhatsAppConversation } from "./conversation.js";

// State
export type { WhatsAppState } from "./state.js";
export { asWhatsAppConversations, asWhatsAppState } from "./state.js";

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
} from "./events.js";
export { isWhatsAppEvent, getEventPayload, assertEventType } from "./events.js";

import "./module-augmentation.js";
