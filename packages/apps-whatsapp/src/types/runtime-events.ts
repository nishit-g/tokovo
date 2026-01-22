import type { WhatsAppEventType, WhatsAppEventMap } from "./events";

export interface WhatsAppRuntimeEventBase {
  at: number;
  appId: "app_whatsapp";
  deviceId: string;
  conversationId?: string;
  kind: string;
}

export type WhatsAppRuntimeEventKind =
  | "MessageReceived"
  | "MessageSent"
  | "TypingStarted"
  | "TypingEnded"
  | "ImageReceived"
  | "ImageSent"
  | "VideoReceived"
  | "VideoSent"
  | "VoiceReceived"
  | "VoiceSent"
  | "GifReceived"
  | "GifSent"
  | "StickerReceived"
  | "StickerSent"
  | "DocumentReceived"
  | "DocumentSent"
  | "ContactReceived"
  | "ContactSent"
  | "LocationReceived"
  | "LocationSent"
  | "React"
  | "ReadMessages"
  | "ConversationOpened"
  | "NavigateScreen"
  | "MessageDeleted"
  | "MessageEdited"
  | "MessageForwarded"
  | "DateSeparator"
  | "GroupMemberAdded"
  | "GroupMemberRemoved"
  | "ReactionAdded"
  | "MessageRead"
  | "VoiceMessageReceived"
  | "VoicePlay"
  | "VoicePause"
  | "PinConversation"
  | "UnpinConversation"
  | "MuteConversation"
  | "UnmuteConversation"
  | "ArchiveConversation"
  | "UnarchiveConversation"
  | "SetDraft";

export const RUNTIME_KIND_TO_EVENT_TYPE: Record<
  WhatsAppRuntimeEventKind,
  WhatsAppEventType
> = {
  MessageReceived: "MESSAGE_RECEIVED",
  MessageSent: "MESSAGE_SENT",
  TypingStarted: "TYPING_START",
  TypingEnded: "TYPING_END",
  ImageReceived: "IMAGE_RECEIVED",
  ImageSent: "IMAGE_SENT",
  VideoReceived: "VIDEO_RECEIVED",
  VideoSent: "VIDEO_SENT",
  VoiceReceived: "VOICE_RECEIVED",
  VoiceSent: "VOICE_SENT",
  GifReceived: "GIF_RECEIVED",
  GifSent: "GIF_SENT",
  StickerReceived: "STICKER_RECEIVED",
  StickerSent: "STICKER_SENT",
  DocumentReceived: "DOCUMENT_RECEIVED",
  DocumentSent: "DOCUMENT_SENT",
  ContactReceived: "CONTACT_RECEIVED",
  ContactSent: "CONTACT_SENT",
  LocationReceived: "LOCATION_RECEIVED",
  LocationSent: "LOCATION_SENT",
  React: "REACT",
  ReadMessages: "READ_MESSAGES",
  ConversationOpened: "CONVERSATION_OPENED",
  NavigateScreen: "NAVIGATE_SCREEN",
  MessageDeleted: "MESSAGE_DELETED",
  MessageEdited: "MESSAGE_EDITED",
  MessageForwarded: "MESSAGE_FORWARDED",
  DateSeparator: "DATE_SEPARATOR",
  GroupMemberAdded: "GROUP_MEMBER_ADDED",
  GroupMemberRemoved: "GROUP_MEMBER_REMOVED",
  ReactionAdded: "REACTION_ADDED",
  MessageRead: "MESSAGE_READ",
  VoiceMessageReceived: "VOICE_MESSAGE_RECEIVED",
  VoicePlay: "VOICE_PLAY",
  VoicePause: "VOICE_PAUSE",
  PinConversation: "PIN_CONVERSATION",
  UnpinConversation: "UNPIN_CONVERSATION",
  MuteConversation: "MUTE_CONVERSATION",
  UnmuteConversation: "UNMUTE_CONVERSATION",
  ArchiveConversation: "ARCHIVE_CONVERSATION",
  UnarchiveConversation: "UNARCHIVE_CONVERSATION",
  SetDraft: "SET_DRAFT",
};

export interface MessageReceivedRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "MessageReceived";
  from: string;
  text: string;
  payload: WhatsAppEventMap["MESSAGE_RECEIVED"];
}

export interface MessageSentRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "MessageSent";
  text: string;
  payload: WhatsAppEventMap["MESSAGE_SENT"];
}

export interface ImageReceivedRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "ImageReceived";
  from: string;
  url: string;
  caption?: string;
  payload: WhatsAppEventMap["IMAGE_RECEIVED"];
}

export interface ImageSentRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "ImageSent";
  url: string;
  caption?: string;
  payload: WhatsAppEventMap["IMAGE_SENT"];
}

export interface VideoReceivedRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "VideoReceived";
  from: string;
  url: string;
  duration?: number;
  payload: WhatsAppEventMap["VIDEO_RECEIVED"];
}

export interface VideoSentRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "VideoSent";
  url: string;
  duration?: number;
  payload: WhatsAppEventMap["VIDEO_SENT"];
}

export interface TypingRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "TypingStarted" | "TypingEnded";
  actor: string;
  payload: WhatsAppEventMap["TYPING_START"];
}

export interface ReactRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "React";
  payload: WhatsAppEventMap["REACT"];
}

export interface NavigateScreenRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "NavigateScreen";
  screen: string;
  payload: WhatsAppEventMap["NAVIGATE_SCREEN"] | { screen: string };
}

export interface ConversationOpenedRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "ConversationOpened";
  payload: WhatsAppEventMap["CONVERSATION_OPENED"];
}

export interface ReadMessagesRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "ReadMessages";
  payload: WhatsAppEventMap["READ_MESSAGES"];
}

export interface MessageDeletedRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "MessageDeleted";
  payload: WhatsAppEventMap["MESSAGE_DELETED"];
}

export interface MessageEditedRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "MessageEdited";
  payload: WhatsAppEventMap["MESSAGE_EDITED"];
}

export interface MessageForwardedRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "MessageForwarded";
  payload: WhatsAppEventMap["MESSAGE_FORWARDED"];
}

export interface DateSeparatorRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "DateSeparator";
  payload: WhatsAppEventMap["DATE_SEPARATOR"];
}

export interface VoicePlayRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "VoicePlay";
  payload: WhatsAppEventMap["VOICE_PLAY"];
}

export interface VoicePauseRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: "VoicePause";
  payload: WhatsAppEventMap["VOICE_PAUSE"];
}

export interface GenericWhatsAppRuntimeEvent extends WhatsAppRuntimeEventBase {
  kind: WhatsAppRuntimeEventKind;
  payload: Record<string, unknown>;
  [key: string]: unknown;
}

export type WhatsAppRuntimeEvent =
  | MessageReceivedRuntimeEvent
  | MessageSentRuntimeEvent
  | ImageReceivedRuntimeEvent
  | ImageSentRuntimeEvent
  | VideoReceivedRuntimeEvent
  | VideoSentRuntimeEvent
  | TypingRuntimeEvent
  | ReactRuntimeEvent
  | NavigateScreenRuntimeEvent
  | ConversationOpenedRuntimeEvent
  | ReadMessagesRuntimeEvent
  | MessageDeletedRuntimeEvent
  | MessageEditedRuntimeEvent
  | MessageForwardedRuntimeEvent
  | DateSeparatorRuntimeEvent
  | VoicePlayRuntimeEvent
  | VoicePauseRuntimeEvent
  | GenericWhatsAppRuntimeEvent;

export function isWhatsAppRuntimeEvent(
  event: unknown,
): event is WhatsAppRuntimeEvent {
  return (
    typeof event === "object" &&
    event !== null &&
    (event as { appId?: string }).appId === "app_whatsapp" &&
    typeof (event as { kind?: string }).kind === "string"
  );
}

export function getPayloadSafe<T extends Record<string, unknown>>(
  event: WhatsAppRuntimeEvent,
): T {
  return (event.payload ?? {}) as T;
}
