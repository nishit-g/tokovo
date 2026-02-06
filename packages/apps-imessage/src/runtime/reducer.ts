import type { WorldState, TimelineEvent } from "@tokovo/core";
import { IMESSAGE_APP_ID } from "../constants";
import type {
  IMessageConversation,
  IMessageMessage,
  IMessageMessageKind,
  IMessageMessageStatus,
  IMessageState,
} from "../types";
import type { IMessageEventType, IMessageEventPayload } from "../types/events";

function syncViewMode(state: IMessageState): void {
  switch (state.currentScreen) {
    case "chat":
      state.viewMode = "CHAT";
      state.conversationId = state.activeConversationId ?? undefined;
      return;
    case "info":
    case "media":
      state.viewMode = "FULLSCREEN";
      state.conversationId = undefined;
      return;
    case "list":
    default:
      state.viewMode = "FEED";
      state.conversationId = undefined;
      return;
  }
}

function asPayload<T extends IMessageEventType>(
  payload: Record<string, unknown>,
): IMessageEventPayload<T> {
  return payload as unknown as IMessageEventPayload<T>;
}

function getAppState(draft: WorldState): IMessageState {
  if (!draft.appState) {
    draft.appState = {};
  }
  if (!draft.appState.app_imessage) {
    draft.appState.app_imessage = {
      viewMode: "FEED",
      conversationId: undefined,
      currentScreen: "list",
      activeConversationId: undefined,
      statusBarTheme: "dark",
      conversations: {},
    };
  }
  const state = draft.appState.app_imessage as IMessageState;
  state.viewMode ??= "FEED";
  state.conversationId ??= undefined;
  state.currentScreen ??= "list";
  syncViewMode(state);
  return state;
}

function ensureConversation(
  state: IMessageState,
  conversationId: string,
): IMessageConversation {
  if (!state.conversations) {
    state.conversations = {};
  }
  if (!state.conversations[conversationId]) {
    state.conversations[conversationId] = {
      id: conversationId,
      transport: "imessage",
      participants: [],
      messages: [],
      typing: {},
      unreadCount: 0,
      isGroup: false,
    };
  }
  return state.conversations[conversationId] as IMessageConversation;
}

function addMessage(conversation: IMessageConversation, message: IMessageMessage): void {
  conversation.messages.push(message);
  if (!conversation.messagesById) {
    conversation.messagesById = {};
  }
  conversation.messagesById[message.id] = message;
  conversation.lastMessageAt = message.timestamp;
}

function getMessageById(
  conversation: IMessageConversation,
  messageId?: string,
): IMessageMessage | undefined {
  if (!messageId) return undefined;
  // Use array find to get the actual message object that's in the messages array
  // This ensures mutations are reflected when accessing via messages[]
  return conversation.messages.find((m) => m.id === messageId);
}

function getMessageByRef(
  conversation: IMessageConversation,
  messageRef?: { index?: number | "last" },
): IMessageMessage | undefined {
  if (!messageRef) return undefined;
  if (messageRef.index === "last") {
    return conversation.messages[conversation.messages.length - 1];
  }
  if (typeof messageRef.index === "number") {
    return conversation.messages[messageRef.index];
  }
  return undefined;
}

function inferKind(
  text?: string,
  attachments?: Array<{ kind: string }> | undefined,
  isSystem?: boolean,
): IMessageMessageKind {
  if (isSystem) return "system";
  if (attachments && attachments.length > 0) {
    const primary = attachments[0]?.kind;
    if (primary === "voice") return "voice";
    if (primary === "sticker") return "sticker";
    if (primary === "gif") return "gif";
    if (primary === "contact") return "contact";
    if (primary === "calendar") return "calendar";
    if (primary === "link") return "link";
    if (primary === "location") return "location";
    if (primary === "payment") return "payment";
    return "media";
  }
  return text ? "text" : "system";
}

function createMessage(params: {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  fromMe: boolean;
  text?: string;
  attachments?: IMessageMessage["attachments"];
  timestamp: number;
  status?: IMessageMessageStatus;
  effect?: IMessageMessage["effect"];
  replyTo?: IMessageMessage["replyTo"];
  mentions?: string[];
  isSystem?: boolean;
  systemType?: string;
  systemText?: string;
}): IMessageMessage {
  const {
    id,
    conversationId,
    senderId,
    senderName,
    fromMe,
    text,
    attachments,
    timestamp,
    status,
    effect,
    replyTo,
    mentions,
    isSystem,
    systemType,
    systemText,
  } = params;
  return {
    id,
    conversationId,
    senderId,
    senderName,
    fromMe,
    kind: inferKind(text, attachments as Array<{ kind: string }> | undefined, isSystem),
    text,
    attachments,
    timestamp,
    tapbacks: [],
    effect,
    replyTo,
    mentions,
    status,
    isSystem,
    systemType,
    systemText,
  };
}

function applyStatus(
  conversation: IMessageConversation,
  messageId: string,
  status: IMessageMessageStatus,
): void {
  const message = getMessageById(conversation, messageId);
  if (message) {
    message.status = status;
  }
}

function addSystemMessage(
  conversation: IMessageConversation,
  at: number,
  text: string,
  systemType: string,
): void {
  const messageId = `sys_${at}_${conversation.messages.length}`;
  addMessage(
    conversation,
    createMessage({
      id: messageId,
      conversationId: conversation.id,
      senderId: "system",
      senderName: "System",
      fromMe: false,
      text,
      timestamp: at,
      isSystem: true,
      systemType,
      systemText: text,
    }),
  );
}

export function iMessageReducer(draft: WorldState, event: TimelineEvent): void {
  if (event.kind !== "APP") return;
  const appEvent = event as TimelineEvent & {
    appId?: string;
    type?: string;
    payload?: Record<string, unknown>;
  };
  if (appEvent.appId !== IMESSAGE_APP_ID) return;

  const state = getAppState(draft);
  const type = appEvent.type as IMessageEventType | undefined;
  if (!type) return;

  const payload = (appEvent.payload ?? {}) as Record<string, unknown>;
  const at = event.at ?? 0;
  const conversationId = (payload as { conversationId?: string }).conversationId;

  switch (type) {
    case "IMESSAGE_CONVERSATION_CREATE": {
      const convPayload = asPayload<"IMESSAGE_CONVERSATION_CREATE">(payload);
      const conv = convPayload.conversation;
      state.conversations ??= {};
      state.conversations[conv.id] = {
        ...conv,
        participants: conv.participants ?? [],
        messages: conv.messages ?? [],
        typing: conv.typing ?? {},
        unreadCount: conv.unreadCount ?? 0,
      };
      break;
    }
    case "IMESSAGE_CONVERSATION_UPDATE": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const update = asPayload<"IMESSAGE_CONVERSATION_UPDATE">(payload);
      if (typeof update.title === "string") conv.title = update.title;
      if (typeof update.avatar === "string") conv.avatar = update.avatar;
      if (update.transport) conv.transport = update.transport;
      break;
    }
    case "IMESSAGE_CONVERSATION_OPEN": {
      if (!conversationId) return;
      ensureConversation(state, conversationId);
      state.currentScreen = "chat";
      state.activeConversationId = conversationId;
      const conv = ensureConversation(state, conversationId);
      conv.unreadCount = 0;
      syncViewMode(state);
      break;
    }
    case "IMESSAGE_CONVERSATION_PIN": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      conv.pinned = true;
      break;
    }
    case "IMESSAGE_CONVERSATION_UNPIN": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      conv.pinned = false;
      break;
    }
    case "IMESSAGE_CONVERSATION_MUTE": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const mute = asPayload<"IMESSAGE_CONVERSATION_MUTE">(payload);
      conv.mutedUntil = mute.until;
      break;
    }
    case "IMESSAGE_CONVERSATION_UNMUTE": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      conv.mutedUntil = undefined;
      break;
    }
    case "IMESSAGE_MESSAGE_SEND": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const msg = asPayload<"IMESSAGE_MESSAGE_SEND">(payload);
      const messageId = msg.messageId ?? `msg_${at}_${conv.messages.length}`;
      addMessage(
        conv,
        createMessage({
          id: messageId,
          conversationId,
          senderId: "me",
          senderName: "Me",
          fromMe: true,
          text: msg.text,
          attachments: msg.attachments,
          timestamp: at,
          status: "sent",
          effect: msg.effect ? { bubble: msg.effect } : undefined,
          replyTo: msg.replyTo,
          mentions: msg.mentions,
        }),
      );
      break;
    }
    case "IMESSAGE_MESSAGE_RECEIVE": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const msg = asPayload<"IMESSAGE_MESSAGE_RECEIVE">(payload);
      const messageId = msg.messageId ?? `msg_${at}_${conv.messages.length}`;
      addMessage(
        conv,
        createMessage({
          id: messageId,
          conversationId,
          senderId: msg.from,
          senderName: msg.from,
          fromMe: false,
          text: msg.text,
          attachments: msg.attachments,
          timestamp: at,
          status: conv.transport === "imessage" ? "delivered" : "sent",
          replyTo: msg.replyTo,
          mentions: msg.mentions,
        }),
      );
      if (!msg.silent) {
        conv.unreadCount += 1;
      }
      break;
    }
    case "IMESSAGE_MESSAGE_EDIT": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const msg = asPayload<"IMESSAGE_MESSAGE_EDIT">(payload);
      const target = getMessageById(conv, msg.messageId);
      if (target) {
        target.text = msg.newText ?? target.text;
      }
      break;
    }
    case "IMESSAGE_MESSAGE_DELETE": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const msg = asPayload<"IMESSAGE_MESSAGE_DELETE">(payload);
      const target = getMessageById(conv, msg.messageId);
      if (target) {
        target.text = msg.deletedForEveryone
          ? "You deleted this message"
          : "This message was deleted";
        target.kind = "system";
        target.isSystem = true;
        target.systemType = "message_deleted";
      }
      break;
    }
    case "IMESSAGE_MESSAGE_STATUS_SET": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const msg = asPayload<"IMESSAGE_MESSAGE_STATUS_SET">(payload);
      if (conv.transport === "imessage") {
        applyStatus(conv, msg.messageId, msg.status);
      }
      break;
    }
    case "IMESSAGE_TAPBACK_ADD": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const tap = asPayload<"IMESSAGE_TAPBACK_ADD">(payload);
      const target =
        getMessageById(conv, tap.messageId) ||
        getMessageByRef(conv, tap.messageRef);
      if (target) {
        // Initialize tapbacks array if undefined
        if (!target.tapbacks) {
          target.tapbacks = [];
        }
        const fromMe = tap.fromMe ?? true;
        target.tapbacks = target.tapbacks.filter(
          (t) => !(t.type === tap.type && t.fromMe === fromMe),
        );
        target.tapbacks.push({ type: tap.type, fromMe });
      }
      break;
    }
    case "IMESSAGE_TAPBACK_REMOVE": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const tap = asPayload<"IMESSAGE_TAPBACK_REMOVE">(payload);
      const target =
        getMessageById(conv, tap.messageId) ||
        getMessageByRef(conv, tap.messageRef);
      if (target) {
        // Initialize tapbacks array if undefined
        if (!target.tapbacks) {
          target.tapbacks = [];
        }
        const fromMe = tap.fromMe ?? true;
        target.tapbacks = target.tapbacks.filter(
          (t) => !(t.type === tap.type && t.fromMe === fromMe),
        );
      }
      break;
    }
    case "IMESSAGE_TYPING_START": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const typing = asPayload<"IMESSAGE_TYPING_START">(payload);
      conv.typing[typing.actor] = true;
      break;
    }
    case "IMESSAGE_TYPING_END": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const typing = asPayload<"IMESSAGE_TYPING_END">(payload);
      conv.typing[typing.actor] = false;
      break;
    }
    case "IMESSAGE_MESSAGE_READ": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      if (conv.transport !== "imessage") {
        conv.unreadCount = 0;
        break;
      }
      const read = asPayload<"IMESSAGE_MESSAGE_READ">(payload);
      if (read.messageId) {
        applyStatus(conv, read.messageId, "read");
      } else {
        conv.messages.forEach((m) => {
          if (m.fromMe) m.status = "read";
        });
      }
      conv.unreadCount = 0;
      break;
    }
    case "IMESSAGE_GROUP_MEMBER_ADD": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      conv.isGroup = true;
      const member = asPayload<"IMESSAGE_GROUP_MEMBER_ADD">(payload).member;
      if (!conv.participants.find((p) => p.id === member.id)) {
        conv.participants.push(member);
      }
      addSystemMessage(
        conv,
        at,
        `${member.name} joined the group`,
        "group_member_added",
      );
      break;
    }
    case "IMESSAGE_GROUP_MEMBER_REMOVE":
    case "IMESSAGE_GROUP_MEMBER_LEAVE": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const data = asPayload<"IMESSAGE_GROUP_MEMBER_REMOVE">(payload);
      conv.participants = conv.participants.filter(
        (p) => p.id !== data.memberId,
      );
      const name = data.memberName ?? data.memberId;
      addSystemMessage(
        conv,
        at,
        `${name} left the group`,
        "group_member_removed",
      );
      break;
    }
    case "IMESSAGE_GROUP_NAME_CHANGE": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const data = asPayload<"IMESSAGE_GROUP_NAME_CHANGE">(payload);
      conv.title = data.name;
      addSystemMessage(
        conv,
        at,
        `Group name changed to "${data.name}"`,
        "group_name_changed",
      );
      break;
    }
    case "IMESSAGE_GROUP_AVATAR_CHANGE": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const data = asPayload<"IMESSAGE_GROUP_AVATAR_CHANGE">(payload);
      conv.avatar = data.avatar;
      addSystemMessage(
        conv,
        at,
        "Group photo updated",
        "group_avatar_changed",
      );
      break;
    }
    case "IMESSAGE_SET_SCREEN": {
      const data = asPayload<"IMESSAGE_SET_SCREEN">(payload);
      state.currentScreen = data.screen;
      if (data.conversationId) {
        state.activeConversationId = data.conversationId;
      } else if (data.screen === "list") {
        state.activeConversationId = undefined;
      }
      syncViewMode(state);
      break;
    }
    case "IMESSAGE_SET_DRAFT": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const data = asPayload<"IMESSAGE_SET_DRAFT">(payload);
      conv.draft = data.text;
      break;
    }
    case "IMESSAGE_CLEAR_DRAFT": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      conv.draft = "";
      break;
    }
    case "IMESSAGE_OPEN_MEDIA": {
      if (!conversationId) return;
      state.currentScreen = "media";
      state.activeConversationId = conversationId;
      syncViewMode(state);
      break;
    }
    case "IMESSAGE_SET_THEME_MODE": {
      const data = asPayload<"IMESSAGE_SET_THEME_MODE">(payload);
      state.themeMode = data.mode;
      break;
    }
    case "IMESSAGE_MESSAGE_UNSEND": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const unsend = asPayload<"IMESSAGE_MESSAGE_UNSEND">(payload);
      const target = conv.messages.find((m) => m.id === unsend.messageId);
      if (target) {
        target.isUnsent = true;
        target.text = undefined;
        target.attachments = undefined;
      }
      break;
    }
    case "IMESSAGE_SEARCH_START": {
      const search = asPayload<"IMESSAGE_SEARCH_START">(payload);
      state.searchQuery = search.query;
      break;
    }
    case "IMESSAGE_SEARCH_CLEAR": {
      state.searchQuery = undefined;
      break;
    }
    case "IMESSAGE_SCREEN_EFFECT": {
      const effect = asPayload<"IMESSAGE_SCREEN_EFFECT">(payload);
      state.activeScreenEffect = effect.effect;
      break;
    }
    default:
      break;
  }
}
