import type { TrackEventBase } from "@tokovo/ir";
import type { WhatsAppMessageType } from "./messages.js";

export interface MessageReference {
  messageId?: string;
  id?: string;
  index?: number | "last";
}

export interface ReplyToPayload {
  messageId?: string;
  id?: string;
  text?: string;
  from?: string;
  type?: string;
  thumbnailUrl?: string;
}

export interface MessageReceivedPayload {
  conversationId: string;
  from: string;
  text: string;
  messageId?: string;
  replyTo?: ReplyToPayload;
  silent?: boolean;
  messageType?: WhatsAppMessageType;
  url?: string;
  caption?: string;
  systemType?: string;
  callType?: "voice" | "video";
  callDuration?: number;
}

export interface MessageSentPayload {
  conversationId: string;
  text: string;
  messageId?: string;
  replyTo?: ReplyToPayload;
  typed?: boolean;
  charDelay?: number;
  messageType?: WhatsAppMessageType;
  url?: string;
  caption?: string;
  durationSeconds?: number;
  systemType?: string;
  callType?: "voice" | "video";
  callDuration?: number;
}

export interface ImageReceivedPayload {
  conversationId: string;
  from: string;
  url: string;
  caption?: string;
  messageId?: string;
}

export interface ImageSentPayload {
  conversationId: string;
  url: string;
  caption?: string;
  messageId?: string;
}

export interface VideoReceivedPayload {
  conversationId: string;
  from: string;
  url: string;
  duration?: number;
  caption?: string;
  messageId?: string;
}

export interface VideoSentPayload {
  conversationId: string;
  url: string;
  duration?: number;
  caption?: string;
  messageId?: string;
}

export interface VoiceReceivedPayload {
  conversationId: string;
  from: string;
  duration: number;
  messageId?: string;
}

export interface VoiceSentPayload {
  conversationId: string;
  duration: number;
  messageId?: string;
}

export interface GifReceivedPayload {
  conversationId: string;
  from: string;
  url: string;
  messageId?: string;
}

export interface GifSentPayload {
  conversationId: string;
  url: string;
  messageId?: string;
}

export interface StickerReceivedPayload {
  conversationId: string;
  from: string;
  url: string;
  messageId?: string;
}

export interface StickerSentPayload {
  conversationId: string;
  url: string;
  messageId?: string;
}

export interface DocumentReceivedPayload {
  conversationId: string;
  from: string;
  url: string;
  fileName: string;
  fileSize?: number | string;
  fileType?: string;
  messageId?: string;
}

export interface DocumentSentPayload {
  conversationId: string;
  url: string;
  fileName: string;
  fileSize?: number | string;
  fileType?: string;
  messageId?: string;
}

export interface ContactReceivedPayload {
  conversationId: string;
  from: string;
  contactName: string;
  contactPhone?: string;
  contactAvatar?: string;
  contactAvatarUrl?: string;
  /** @deprecated Use contactName/contactPhone/contactAvatar instead. */
  name?: string;
  /** @deprecated Use contactName/contactPhone/contactAvatar instead. */
  phone?: string;
  /** @deprecated Use contactName/contactPhone/contactAvatar instead. */
  avatar?: string;
  messageId?: string;
}

export interface ContactSentPayload {
  conversationId: string;
  contactName: string;
  contactPhone?: string;
  contactAvatar?: string;
  contactAvatarUrl?: string;
  /** @deprecated Use contactName/contactPhone/contactAvatar instead. */
  name?: string;
  /** @deprecated Use contactName/contactPhone/contactAvatar instead. */
  phone?: string;
  /** @deprecated Use contactName/contactPhone/contactAvatar instead. */
  avatar?: string;
  messageId?: string;
}

export interface LocationReceivedPayload {
  conversationId: string;
  from: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  locationAddress?: string;
  mapThumbnailUrl?: string;
  /** @deprecated Use locationName/locationAddress instead. */
  label?: string;
  /** @deprecated Use locationName/locationAddress instead. */
  name?: string;
  /** @deprecated Use locationName/locationAddress instead. */
  address?: string;
  /** @deprecated Use latitude/longitude instead. */
  lat?: number;
  /** @deprecated Use latitude/longitude instead. */
  lng?: number;
  messageId?: string;
}

export interface LocationSentPayload {
  conversationId: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  locationAddress?: string;
  mapThumbnailUrl?: string;
  /** @deprecated Use locationName/locationAddress instead. */
  label?: string;
  /** @deprecated Use locationName/locationAddress instead. */
  name?: string;
  /** @deprecated Use locationName/locationAddress instead. */
  address?: string;
  /** @deprecated Use latitude/longitude instead. */
  lat?: number;
  /** @deprecated Use latitude/longitude instead. */
  lng?: number;
  messageId?: string;
}

export interface TypingPayload {
  conversationId: string;
  actor: string;
}

export interface ReactPayload {
  conversationId: string;
  emoji: string;
  messageRef?: MessageReference;
}

export interface ReadPayload {
  conversationId: string;
  messageId?: string;
}

export interface MessageDeletedPayload {
  conversationId: string;
  messageRef?: MessageReference;
  messageId?: string;
  deletedForEveryone?: boolean;
  deletedBy?: string;
}

export interface MessageEditedPayload {
  conversationId: string;
  messageRef?: MessageReference;
  messageId?: string;
  newText: string;
}

export interface MessageForwardedPayload {
  conversationId: string;
  messageRef?: MessageReference;
  messageId?: string;
  text?: string;
  messageType?: string;
  forwardedFrom?: string;
  imageUrl?: string;
  videoUrl?: string;
  gifUrl?: string;
}

export interface VoicePlayPayload {
  conversationId: string;
  messageId?: string;
  messageRef?: MessageReference;
  startAt?: number;
}

export interface VoicePausePayload {
  conversationId: string;
  messageId?: string;
}

export interface ConversationOpenedPayload {
  conversationId: string;
}

export interface NavigateScreenPayload {
  screen:
    | "chats"
    | "status"
    | "calls"
    | "communities"
    | "settings"
    | "profile"
    | "chat";
  conversationId?: string;
}

export interface DateSeparatorPayload {
  conversationId: string;
  text?: string;
}

export interface GroupMemberAddedPayload {
  conversationId: string;
  memberId: string;
  memberName: string;
  addedBy?: string;
}

export interface GroupMemberRemovedPayload {
  conversationId: string;
  memberId: string;
  memberName: string;
  removedBy?: string;
}

export interface PinPayload {
  conversationId: string;
}

export interface MutePayload {
  conversationId: string;
  until?: number;
}

export interface ArchivePayload {
  conversationId: string;
}

export interface DraftPayload {
  conversationId: string;
  text: string;
}

export interface ReactionAddedPayload {
  conversationId: string;
  messageId: string;
  emoji: string;
  fromMe?: boolean;
}

export interface MessageReadPayload {
  conversationId: string;
  messageId: string;
}

export interface VoiceMessageReceivedPayload {
  conversationId: string;
  from: string;
  duration: number;
  messageId?: string;
}

export type WhatsAppEventMap = {
  MESSAGE_RECEIVED: MessageReceivedPayload;
  MESSAGE_SENT: MessageSentPayload;
  IMAGE_RECEIVED: ImageReceivedPayload;
  IMAGE_SENT: ImageSentPayload;
  VIDEO_RECEIVED: VideoReceivedPayload;
  VIDEO_SENT: VideoSentPayload;
  VOICE_RECEIVED: VoiceReceivedPayload;
  VOICE_SENT: VoiceSentPayload;
  GIF_RECEIVED: GifReceivedPayload;
  GIF_SENT: GifSentPayload;
  STICKER_RECEIVED: StickerReceivedPayload;
  STICKER_SENT: StickerSentPayload;
  DOCUMENT_RECEIVED: DocumentReceivedPayload;
  DOCUMENT_SENT: DocumentSentPayload;
  CONTACT_RECEIVED: ContactReceivedPayload;
  CONTACT_SENT: ContactSentPayload;
  LOCATION_RECEIVED: LocationReceivedPayload;
  LOCATION_SENT: LocationSentPayload;
  TYPING_START: TypingPayload;
  TYPING_END: TypingPayload;
  REACT: ReactPayload;
  READ: ReadPayload;
  READ_MESSAGES: ReadPayload;
  MESSAGE_DELETED: MessageDeletedPayload;
  MESSAGE_EDITED: MessageEditedPayload;
  MESSAGE_FORWARDED: MessageForwardedPayload;
  VOICE_PLAY: VoicePlayPayload;
  VOICE_PAUSE: VoicePausePayload;
  CONVERSATION_OPENED: ConversationOpenedPayload;
  NAVIGATE_SCREEN: NavigateScreenPayload;
  GO_BACK: Record<string, never>;
  DATE_SEPARATOR: DateSeparatorPayload;
  GROUP_MEMBER_ADDED: GroupMemberAddedPayload;
  GROUP_MEMBER_REMOVED: GroupMemberRemovedPayload;
  PIN_CONVERSATION: PinPayload;
  UNPIN_CONVERSATION: PinPayload;
  MUTE_CONVERSATION: MutePayload;
  UNMUTE_CONVERSATION: MutePayload;
  ARCHIVE_CONVERSATION: ArchivePayload;
  UNARCHIVE_CONVERSATION: ArchivePayload;
  SET_DRAFT: DraftPayload;
  REACTION_ADDED: ReactionAddedPayload;
  MESSAGE_READ: MessageReadPayload;
  VOICE_MESSAGE_RECEIVED: VoiceMessageReceivedPayload;
};

export type WhatsAppEventType = keyof WhatsAppEventMap;

export type WhatsAppEventPayload<
  T extends WhatsAppEventType = WhatsAppEventType,
> = T extends keyof WhatsAppEventMap ? WhatsAppEventMap[T] : never;

export type WhatsAppTypedEvent<
  T extends WhatsAppEventType = WhatsAppEventType,
> = {
  type: T;
  payload: WhatsAppEventMap[T];
};

export type WhatsAppTrackEvent = TrackEventBase & {
  kind: "APP";
  appId: "app_whatsapp";
  deviceId: string;
  conversationId?: string;
} & (
    | { type: "MESSAGE_RECEIVED"; payload: MessageReceivedPayload }
    | { type: "MESSAGE_SENT"; payload: MessageSentPayload }
    | { type: "IMAGE_RECEIVED"; payload: ImageReceivedPayload }
    | { type: "IMAGE_SENT"; payload: ImageSentPayload }
    | { type: "VIDEO_RECEIVED"; payload: VideoReceivedPayload }
    | { type: "VIDEO_SENT"; payload: VideoSentPayload }
    | { type: "VOICE_RECEIVED"; payload: VoiceReceivedPayload }
    | { type: "VOICE_SENT"; payload: VoiceSentPayload }
    | { type: "GIF_RECEIVED"; payload: GifReceivedPayload }
    | { type: "GIF_SENT"; payload: GifSentPayload }
    | { type: "STICKER_RECEIVED"; payload: StickerReceivedPayload }
    | { type: "STICKER_SENT"; payload: StickerSentPayload }
    | { type: "DOCUMENT_RECEIVED"; payload: DocumentReceivedPayload }
    | { type: "DOCUMENT_SENT"; payload: DocumentSentPayload }
    | { type: "CONTACT_RECEIVED"; payload: ContactReceivedPayload }
    | { type: "CONTACT_SENT"; payload: ContactSentPayload }
    | { type: "LOCATION_RECEIVED"; payload: LocationReceivedPayload }
    | { type: "LOCATION_SENT"; payload: LocationSentPayload }
    | { type: "TYPING_START"; payload: TypingPayload }
    | { type: "TYPING_END"; payload: TypingPayload }
    | { type: "REACT"; payload: ReactPayload }
    | { type: "READ"; payload: ReadPayload }
    | { type: "READ_MESSAGES"; payload: ReadPayload }
    | { type: "MESSAGE_DELETED"; payload: MessageDeletedPayload }
    | { type: "MESSAGE_EDITED"; payload: MessageEditedPayload }
    | { type: "MESSAGE_FORWARDED"; payload: MessageForwardedPayload }
    | { type: "VOICE_PLAY"; payload: VoicePlayPayload }
    | { type: "VOICE_PAUSE"; payload: VoicePausePayload }
    | { type: "CONVERSATION_OPENED"; payload: ConversationOpenedPayload }
    | { type: "NAVIGATE_SCREEN"; payload: NavigateScreenPayload }
    | { type: "GO_BACK"; payload: Record<string, never> }
    | { type: "DATE_SEPARATOR"; payload: DateSeparatorPayload }
    | { type: "GROUP_MEMBER_ADDED"; payload: GroupMemberAddedPayload }
    | { type: "GROUP_MEMBER_REMOVED"; payload: GroupMemberRemovedPayload }
    | { type: "PIN_CONVERSATION"; payload: PinPayload }
    | { type: "UNPIN_CONVERSATION"; payload: PinPayload }
    | { type: "MUTE_CONVERSATION"; payload: MutePayload }
    | { type: "UNMUTE_CONVERSATION"; payload: MutePayload }
    | { type: "ARCHIVE_CONVERSATION"; payload: ArchivePayload }
    | { type: "UNARCHIVE_CONVERSATION"; payload: ArchivePayload }
    | { type: "SET_DRAFT"; payload: DraftPayload }
    | { type: "REACTION_ADDED"; payload: ReactionAddedPayload }
    | { type: "MESSAGE_READ"; payload: MessageReadPayload }
    | { type: "VOICE_MESSAGE_RECEIVED"; payload: VoiceMessageReceivedPayload }
  );

export function isWhatsAppEvent(event: unknown): event is WhatsAppTrackEvent {
  return (
    typeof event === "object" &&
    event !== null &&
    (event as { kind?: string }).kind === "APP" &&
    (event as { appId?: string }).appId === "app_whatsapp"
  );
}

export function getEventPayload<T extends WhatsAppEventType>(
  event: WhatsAppTrackEvent,
  expectedType: T,
): WhatsAppEventMap[T] | null {
  if (event.type === expectedType) {
    return event.payload as WhatsAppEventMap[T];
  }
  return null;
}

export function assertEventType<T extends WhatsAppEventType>(
  event: WhatsAppTrackEvent,
  expectedType: T,
): asserts event is WhatsAppTrackEvent & {
  type: T;
  payload: WhatsAppEventMap[T];
} {
  if (event.type !== expectedType) {
    throw new Error(`Expected event type ${expectedType}, got ${event.type}`);
  }
}
