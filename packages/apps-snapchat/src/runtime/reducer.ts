import type { AppRuntimeEvent, PluginReducer, WorldState } from "@tokovo/core";
import { SNAPCHAT_APP_ID } from "../constants.js";
import type {
  SnapchatConversation,
  SnapchatMessage,
  SnapchatMessageKind,
  SnapchatState,
} from "../types/index.js";
import type { SnapchatEventMap, SnapchatEventType } from "../types/events.js";

type SnapchatReducerEvent = {
  [K in SnapchatEventType]: AppRuntimeEvent<typeof SNAPCHAT_APP_ID, K, SnapchatEventMap[K]> & {
    conversationId?: string;
  };
}[SnapchatEventType];

const SNAPCHAT_EVENT_TYPES: readonly SnapchatEventType[] = [
  "SNAPCHAT_CONVERSATION_CREATE",
  "SNAPCHAT_CONVERSATION_OPEN",
  "SNAPCHAT_MESSAGE_SEND",
  "SNAPCHAT_MESSAGE_RECEIVE",
  "SNAPCHAT_SNAP_SEND",
  "SNAPCHAT_SNAP_RECEIVE",
  "SNAPCHAT_SNAP_OPEN",
  "SNAPCHAT_TYPING_START",
  "SNAPCHAT_TYPING_END",
  "SNAPCHAT_STREAK_UPDATE",
  "SNAPCHAT_SET_SCREEN",
  "SNAPCHAT_SET_DRAFT",
  "SNAPCHAT_MESSAGE_STATUS_SET",
  "SNAPCHAT_SCREENSHOT",
  "SNAPCHAT_SAVE_MESSAGE",
];

function isSnapchatEvent(event: unknown): event is SnapchatReducerEvent {
  if (!event || typeof event !== "object") return false;
  const maybe = event as { kind?: string; appId?: string; type?: string; payload?: unknown };
  return (
    maybe.kind === "APP" &&
    maybe.appId === SNAPCHAT_APP_ID &&
    typeof maybe.type === "string" &&
    SNAPCHAT_EVENT_TYPES.includes(maybe.type as SnapchatEventType) &&
    maybe.payload !== undefined
  );
}

function syncViewMode(state: SnapchatState): void {
  switch (state.currentScreen) {
    case "chat":
      state.viewMode = "CHAT";
      state.conversationId = state.activeConversationId ?? undefined;
      return;
    case "snap_view":
      state.viewMode = "FULLSCREEN";
      state.conversationId = undefined;
      return;
    case "chat_list":
    default:
      state.viewMode = "FEED";
      state.conversationId = undefined;
      return;
  }
}

function createInitialSnapchatState(): SnapchatState {
  return {
    viewMode: "FEED",
    conversationId: undefined,
    currentScreen: "chat_list",
    activeConversationId: undefined,
    conversations: {},
    drafts: {},
    lastNavFrame: 0,
  };
}

function getAppState(draft: WorldState): SnapchatState {
  if (!draft.appState.app_snapchat) {
    draft.appState.app_snapchat = createInitialSnapchatState();
  }
  const state = draft.appState.app_snapchat as SnapchatState;
  state.viewMode ??= "FEED";
  state.conversationId ??= undefined;
  state.currentScreen ??= "chat_list";
  state.conversations ??= {};
  state.drafts ??= {};
  state.lastNavFrame ??= 0;
  syncViewMode(state);
  return state;
}

function ensureConversation(
  state: SnapchatState,
  conversationId: string,
): SnapchatConversation {
  state.conversations ??= {};
  if (!state.conversations[conversationId]) {
    state.conversations[conversationId] = {
      id: conversationId,
      participants: [],
      messages: [],
      typing: {},
      unreadCount: 0,
      isGroup: false,
      pinned: false,
      muted: false,
    };
  }
  return state.conversations[conversationId] as SnapchatConversation;
}

function inferKind(
  text?: string,
  attachments?: SnapchatMessage["attachments"],
  isSystem?: boolean,
): SnapchatMessageKind {
  if (isSystem) return "system";
  if (attachments && attachments.length > 0) {
    const primary = attachments[0]?.kind;
    if (primary === "voice") return "voice";
    if (primary === "sticker") return "sticker";
    return "snap";
  }
  return text ? "text" : "system";
}

function addMessage(conversation: SnapchatConversation, message: SnapchatMessage): void {
  conversation.messages.push(message);
  conversation.lastMessageAt = message.timestamp;
}

function createMessage(params: {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  fromMe: boolean;
  text?: string;
  attachments?: SnapchatMessage["attachments"];
  timestamp: number;
  status?: SnapchatMessage["status"];
  kind?: SnapchatMessageKind;
  isSystem?: boolean;
  systemType?: string;
  systemText?: string;
  snapType?: SnapchatMessage["snapType"];
  snapTimer?: number;
}): SnapchatMessage {
  return {
    id: params.id,
    conversationId: params.conversationId,
    senderId: params.senderId,
    senderName: params.senderName,
    fromMe: params.fromMe,
    kind: params.kind ?? inferKind(params.text, params.attachments, params.isSystem),
    text: params.text,
    attachments: params.attachments,
    timestamp: params.timestamp,
    status: params.status,
    isSystem: params.isSystem,
    systemType: params.systemType,
    systemText: params.systemText,
    snapType: params.snapType,
    snapTimer: params.snapTimer,
  };
}

function getMessageById(
  conversation: SnapchatConversation,
  messageId?: string,
): SnapchatMessage | undefined {
  if (!messageId) return undefined;
  return conversation.messages.find((m) => m.id === messageId);
}

function addSystemMessage(
  conversation: SnapchatConversation,
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

function resolveConversationId(event: SnapchatReducerEvent): string | undefined {
  if ("conversationId" in event.payload) {
    const fromPayload = event.payload.conversationId;
    if (typeof fromPayload === "string" && fromPayload.length > 0) {
      return fromPayload;
    }
  }
  return event.conversationId;
}

export const snapchatReducer: PluginReducer<typeof SNAPCHAT_APP_ID> = (
  draft,
  event,
): void => {
  if (!isSnapchatEvent(event)) return;

  const state = getAppState(draft);
  const at = event.at ?? 0;
  const conversationId = resolveConversationId(event);

  switch (event.type) {
    case "SNAPCHAT_CONVERSATION_CREATE": {
      const conv = event.payload.conversation;
      state.conversations ??= {};
      state.conversations[conv.id] = {
        ...conv,
        participants: conv.participants ?? [],
        messages: conv.messages ?? [],
        typing: conv.typing ?? {},
        unreadCount: conv.unreadCount ?? 0,
        pinned: conv.pinned ?? false,
        muted: conv.muted ?? false,
      };
      break;
    }
    case "SNAPCHAT_CONVERSATION_OPEN": {
      const targetConversationId = event.payload.conversationId;
      const conv = ensureConversation(state, targetConversationId);
      state.currentScreen = "chat";
      state.activeConversationId = targetConversationId;
      state.lastNavFrame = at;
      conv.unreadCount = 0;
      syncViewMode(state);
      break;
    }
    case "SNAPCHAT_MESSAGE_SEND": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const messageId = event.payload.messageId ?? `msg_${at}_${conv.messages.length}`;
      addMessage(
        conv,
        createMessage({
          id: messageId,
          conversationId,
          senderId: "me",
          senderName: "Me",
          fromMe: true,
          text: event.payload.text,
          attachments: event.payload.attachments,
          timestamp: at,
          status: "sent",
        }),
      );
      (state.drafts ??= {})[conversationId] = "";
      break;
    }
    case "SNAPCHAT_MESSAGE_RECEIVE": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const messageId = event.payload.messageId ?? `msg_${at}_${conv.messages.length}`;
      addMessage(
        conv,
        createMessage({
          id: messageId,
          conversationId,
          senderId: event.payload.from,
          senderName: event.payload.from,
          fromMe: false,
          text: event.payload.text,
          attachments: event.payload.attachments,
          timestamp: at,
          status: "delivered",
        }),
      );
      if (!event.payload.silent && state.activeConversationId !== conversationId) {
        conv.unreadCount += 1;
      }
      break;
    }
    case "SNAPCHAT_SNAP_SEND": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const messageId = event.payload.messageId ?? `snap_${at}_${conv.messages.length}`;
      addMessage(
        conv,
        createMessage({
          id: messageId,
          conversationId,
          senderId: "me",
          senderName: "Me",
          fromMe: true,
          timestamp: at,
          status: "sent",
          kind: "snap",
          snapType: event.payload.snapType,
          snapTimer: event.payload.timer ?? 5,
          attachments: event.payload.url
            ? [{ kind: event.payload.snapType === "video" ? "video" : "image", url: event.payload.url }]
            : undefined,
        }),
      );
      conv.lastSnapAt = at;
      break;
    }
    case "SNAPCHAT_SNAP_RECEIVE": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const messageId = event.payload.messageId ?? `snap_${at}_${conv.messages.length}`;
      addMessage(
        conv,
        createMessage({
          id: messageId,
          conversationId,
          senderId: event.payload.from,
          senderName: event.payload.from,
          fromMe: false,
          timestamp: at,
          status: "delivered",
          kind: "snap",
          snapType: event.payload.snapType,
          snapTimer: event.payload.timer ?? 5,
          attachments: event.payload.url
            ? [{ kind: event.payload.snapType === "video" ? "video" : "image", url: event.payload.url }]
            : undefined,
        }),
      );
      if (state.activeConversationId !== conversationId) {
        conv.unreadCount += 1;
      }
      conv.lastSnapAt = at;
      break;
    }
    case "SNAPCHAT_SNAP_OPEN": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const target = getMessageById(conv, event.payload.messageId);
      if (target) {
        target.snapOpened = true;
        target.status = "opened";
      }
      state.currentScreen = "snap_view";
      state.activeConversationId = conversationId;
      state.activeSnapId = event.payload.messageId;
      state.lastNavFrame = at;
      syncViewMode(state);
      break;
    }
    case "SNAPCHAT_TYPING_START": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      conv.typing[event.payload.actor] = true;
      break;
    }
    case "SNAPCHAT_TYPING_END": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      conv.typing[event.payload.actor] = false;
      break;
    }
    case "SNAPCHAT_STREAK_UPDATE": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      conv.streak = event.payload.streak;
      break;
    }
    case "SNAPCHAT_SET_SCREEN": {
      state.currentScreen = event.payload.screen;
      state.activeSnapId = event.payload.snapId;
      state.lastNavFrame = at;
      if (event.payload.conversationId) {
        state.activeConversationId = event.payload.conversationId;
        if (event.payload.screen === "chat") {
          ensureConversation(state, event.payload.conversationId).unreadCount = 0;
        }
      } else if (event.payload.screen === "chat_list") {
        state.activeConversationId = undefined;
      }
      syncViewMode(state);
      break;
    }
    case "SNAPCHAT_SET_DRAFT": {
      (state.drafts ??= {})[event.payload.conversationId] = event.payload.text;
      break;
    }
    case "SNAPCHAT_MESSAGE_STATUS_SET": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const target = getMessageById(conv, event.payload.messageId);
      if (target) {
        target.status = event.payload.status;
      }
      break;
    }
    case "SNAPCHAT_SCREENSHOT": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      if (event.payload.messageId) {
        const target = getMessageById(conv, event.payload.messageId);
        if (target) {
          target.screenshotted = true;
          target.status = "screenshot";
        }
      }
      addSystemMessage(conv, at, "Screenshot taken", "screenshot");
      break;
    }
    case "SNAPCHAT_SAVE_MESSAGE": {
      if (!conversationId) return;
      const conv = ensureConversation(state, conversationId);
      const target = getMessageById(conv, event.payload.messageId);
      if (target) {
        target.saved = true;
      }
      break;
    }
    default:
      break;
  }
};
