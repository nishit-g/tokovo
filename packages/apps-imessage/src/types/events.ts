import type { TrackEventBase } from "@tokovo/ir";
import type {
  IMessageAttachment,
  IMessageBubbleEffect,
  IMessageMessageStatus,
  IMessageTapbackType,
  MessageReference,
} from "./messages.js";
import type { IMessageScreen, IMessageThemeMode } from "./state.js";
import type { IMessageParticipant, IMessageConversation } from "./conversation.js";

export interface ConversationCreatePayload {
  conversation: IMessageConversation;
}

export interface ConversationUpdatePayload {
  conversationId: string;
  title?: string;
  avatar?: string;
  transport?: "imessage" | "sms";
}

export interface ConversationOpenPayload {
  conversationId: string;
}

export interface ConversationMutePayload {
  conversationId: string;
  until?: number;
}

export interface MessageSendPayload {
  conversationId: string;
  text?: string;
  attachments?: IMessageAttachment[];
  messageId?: string;
  replyTo?: MessageReference;
  mentions?: string[];
  effect?: IMessageBubbleEffect;
  typed?: boolean;
  charDelay?: number;
}

export interface MessageReceivePayload {
  conversationId: string;
  from: string;
  text?: string;
  attachments?: IMessageAttachment[];
  messageId?: string;
  replyTo?: MessageReference;
  mentions?: string[];
  silent?: boolean;
}

export interface MessageEditPayload {
  conversationId: string;
  messageId: string;
  newText?: string;
}

export interface MessageDeletePayload {
  conversationId: string;
  messageId: string;
  deletedForEveryone?: boolean;
}

export interface MessageStatusPayload {
  conversationId: string;
  messageId: string;
  status: IMessageMessageStatus;
}

export interface TapbackPayload {
  conversationId: string;
  messageId?: string;
  messageRef?: MessageReference;
  type: IMessageTapbackType;
  fromMe?: boolean;
}

export interface TypingPayload {
  conversationId: string;
  actor: string;
}

export interface MessageReadPayload {
  conversationId: string;
  messageId?: string;
}

export interface GroupMemberPayload {
  conversationId: string;
  member: IMessageParticipant;
  actor?: string;
}

export interface GroupMemberRemovePayload {
  conversationId: string;
  memberId: string;
  memberName?: string;
  actor?: string;
}

export interface GroupNameChangePayload {
  conversationId: string;
  name: string;
  actor?: string;
}

export interface GroupAvatarChangePayload {
  conversationId: string;
  avatar: string;
  actor?: string;
}

export interface ScreenPayload {
  screen: IMessageScreen;
  conversationId?: string;
}

export interface DraftPayload {
  conversationId: string;
  text: string;
}

export interface OpenMediaPayload {
  conversationId: string;
  messageId: string;
}

export interface SetThemeModePayload {
  mode: IMessageThemeMode;
}

/** Unsend a message with poof animation */
export interface MessageUnsendPayload {
  conversationId: string;
  messageId: string;
}

/** Search events */
export interface SearchPayload {
  query: string;
}

/** Screen effect trigger */
export interface ScreenEffectPayload {
  effect: "balloons" | "confetti" | "lasers" | "fireworks" | "celebration" | "echo" | "spotlight" | "love";
  conversationId?: string;
}

export type IMessageEventMap = {
  IMESSAGE_CONVERSATION_CREATE: ConversationCreatePayload;
  IMESSAGE_CONVERSATION_UPDATE: ConversationUpdatePayload;
  IMESSAGE_CONVERSATION_OPEN: ConversationOpenPayload;
  IMESSAGE_CONVERSATION_PIN: ConversationOpenPayload;
  IMESSAGE_CONVERSATION_UNPIN: ConversationOpenPayload;
  IMESSAGE_CONVERSATION_MUTE: ConversationMutePayload;
  IMESSAGE_CONVERSATION_UNMUTE: ConversationMutePayload;
  IMESSAGE_MESSAGE_SEND: MessageSendPayload;
  IMESSAGE_MESSAGE_RECEIVE: MessageReceivePayload;
  IMESSAGE_MESSAGE_EDIT: MessageEditPayload;
  IMESSAGE_MESSAGE_DELETE: MessageDeletePayload;
  IMESSAGE_MESSAGE_UNSEND: MessageUnsendPayload;
  IMESSAGE_MESSAGE_STATUS_SET: MessageStatusPayload;
  IMESSAGE_TAPBACK_ADD: TapbackPayload;
  IMESSAGE_TAPBACK_REMOVE: TapbackPayload;
  IMESSAGE_TYPING_START: TypingPayload;
  IMESSAGE_TYPING_END: TypingPayload;
  IMESSAGE_MESSAGE_READ: MessageReadPayload;
  IMESSAGE_GROUP_MEMBER_ADD: GroupMemberPayload;
  IMESSAGE_GROUP_MEMBER_REMOVE: GroupMemberRemovePayload;
  IMESSAGE_GROUP_MEMBER_LEAVE: GroupMemberRemovePayload;
  IMESSAGE_GROUP_NAME_CHANGE: GroupNameChangePayload;
  IMESSAGE_GROUP_AVATAR_CHANGE: GroupAvatarChangePayload;
  IMESSAGE_SET_SCREEN: ScreenPayload;
  IMESSAGE_SET_DRAFT: DraftPayload;
  IMESSAGE_CLEAR_DRAFT: DraftPayload;
  IMESSAGE_OPEN_MEDIA: OpenMediaPayload;
  IMESSAGE_SET_THEME_MODE: SetThemeModePayload;
  IMESSAGE_SEARCH_START: SearchPayload;
  IMESSAGE_SEARCH_CLEAR: Record<string, never>;
  IMESSAGE_SCREEN_EFFECT: ScreenEffectPayload;
};

export type IMessageEventType = keyof IMessageEventMap;

export type IMessageEventPayload<T extends IMessageEventType = IMessageEventType> =
  IMessageEventMap[T];

export type IMessageTrackEvent = TrackEventBase & {
  kind: "APP";
  appId: "app_imessage";
  deviceId: string;
  conversationId?: string;
} & {
  [K in IMessageEventType]: {
    type: K;
    payload: IMessageEventMap[K];
  };
}[IMessageEventType];

export function isIMessageEvent(event: unknown): event is IMessageTrackEvent {
  return (
    typeof event === "object" &&
    event !== null &&
    (event as { kind?: string }).kind === "APP" &&
    (event as { appId?: string }).appId === "app_imessage"
  );
}
