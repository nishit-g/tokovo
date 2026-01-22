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

export type {
  WhatsAppRuntimeEvent,
  WhatsAppRuntimeEventBase,
  WhatsAppRuntimeEventKind,
  MessageReceivedRuntimeEvent,
  MessageSentRuntimeEvent,
  ImageReceivedRuntimeEvent,
  ImageSentRuntimeEvent,
  VideoReceivedRuntimeEvent,
  VideoSentRuntimeEvent,
  TypingRuntimeEvent,
  ReactRuntimeEvent,
  NavigateScreenRuntimeEvent,
  ConversationOpenedRuntimeEvent,
  GenericWhatsAppRuntimeEvent,
} from "./runtime-events";
export {
  isWhatsAppRuntimeEvent,
  getPayloadSafe,
  RUNTIME_KIND_TO_EVENT_TYPE,
} from "./runtime-events";

import "./module-augmentation";
