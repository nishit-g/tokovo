/**
 * WhatsApp Types - Barrel Export
 *
 * Re-exports all type definitions for the WhatsApp plugin.
 */

// Messages
export type {
  WhatsAppMessageType,
  WhatsAppSystemMessageType,
  BaseMessage,
  WhatsAppReaction,
  ReplyToData,
  LinkPreviewData,
  WhatsAppMessage,
} from "./messages.js";

// Conversation
export type { WhatsAppGroupMember, WhatsAppConversation } from "./conversation.js";

// State
export type {
  WhatsAppState,
  WhatsAppScreenId,
  WhatsAppChatFilter,
} from "./state.js";

export type {
  WhatsAppMediaTransferState,
  WhatsAppMediaPlaybackState,
  WhatsAppMediaLifecycle,
  WhatsAppMediaViewerState,
} from "./media.js";

export type {
  WhatsAppMessageGesture,
  WhatsAppGesturePhase,
  WhatsAppGestureState,
  WhatsAppReplyComposerState,
} from "./interactions.js";

export type {
  WhatsAppStatusUpdate,
  WhatsAppStatusViewerState,
  WhatsAppChannelUpdate,
  WhatsAppChannel,
  WhatsAppCallDirection,
  WhatsAppCallMode,
  WhatsAppCallLogEntry,
  WhatsAppCommunity,
  WhatsAppAccountProfile,
  WhatsAppSettings,
} from "./product.js";

export type {
  WhatsAppEventType,
  WhatsAppTrackEvent,
  WhatsAppEventMap,
  WhatsAppEventPayload,
  WhatsAppTypedEvent,
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
  ReadPayload,
  MessageDeletedPayload,
  MessageEditedPayload,
  MessageForwardedPayload,
  MediaLifecyclePayload,
  MediaViewerOpenedPayload,
  MediaViewerClosedPayload,
  StatusViewerOpenedPayload,
  StatusViewerAdvancedPayload,
  StatusViewerClosedPayload,
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
  MessageDeliveryFailedPayload,
  MessageRetryPayload,
} from "./events.js";
export { isWhatsAppEvent, getEventPayload, assertEventType } from "./events.js";

import "./module-augmentation.js";
