import type { WorldState, TimelineEvent } from "@tokovo/core";
import { SNAPCHAT_APP_ID } from "../constants.js";
import type {
    SnapchatConversation,
    SnapchatMessage,
    SnapchatMessageKind,
    SnapchatState,
} from "../types/index.js";
import type { SnapchatEventType, SnapchatEventPayload } from "../types/events.js";

// =============================================================================
// HELPERS
// =============================================================================

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

function asPayload<T extends SnapchatEventType>(
    payload: Record<string, unknown>,
): SnapchatEventPayload<T> {
    return payload as unknown as SnapchatEventPayload<T>;
}

function getAppState(draft: WorldState): SnapchatState {
    if (!draft.appState) {
        draft.appState = {};
    }
    if (!draft.appState.app_snapchat) {
        draft.appState.app_snapchat = {
            viewMode: "FEED",
            conversationId: undefined,
            currentScreen: "chat_list",
            activeConversationId: undefined,
            conversations: {},
        };
    }
    const state = draft.appState.app_snapchat as SnapchatState;
    state.viewMode ??= "FEED";
    state.conversationId ??= undefined;
    state.currentScreen ??= "chat_list";
    syncViewMode(state);
    return state;
}

function ensureConversation(
    state: SnapchatState,
    conversationId: string,
): SnapchatConversation {
    if (!state.conversations) {
        state.conversations = {};
    }
    if (!state.conversations[conversationId]) {
        state.conversations[conversationId] = {
            id: conversationId,
            participants: [],
            messages: [],
            typing: {},
            unreadCount: 0,
            isGroup: false,
        };
    }
    return state.conversations[conversationId] as SnapchatConversation;
}

function inferKind(
    text?: string,
    attachments?: Array<{ kind: string }> | undefined,
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
        kind: params.kind ?? inferKind(
            params.text,
            params.attachments as Array<{ kind: string }> | undefined,
            params.isSystem,
        ),
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

// =============================================================================
// REDUCER
// =============================================================================

export function snapchatReducer(draft: WorldState, event: TimelineEvent): void {
    if (event.kind !== "APP") return;
    const appEvent = event as TimelineEvent & {
        appId?: string;
        type?: string;
        payload?: Record<string, unknown>;
    };
    if (appEvent.appId !== SNAPCHAT_APP_ID) return;

    const state = getAppState(draft);
    const type = appEvent.type as SnapchatEventType | undefined;
    if (!type) return;

    const payload = (appEvent.payload ?? {}) as Record<string, unknown>;
    const at = event.at ?? 0;
    const conversationId = (payload as { conversationId?: string }).conversationId;

    switch (type) {
        case "SNAPCHAT_CONVERSATION_CREATE": {
            const convPayload = asPayload<"SNAPCHAT_CONVERSATION_CREATE">(payload);
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
        case "SNAPCHAT_CONVERSATION_OPEN": {
            if (!conversationId) return;
            ensureConversation(state, conversationId);
            state.currentScreen = "chat";
            state.activeConversationId = conversationId;
            const conv = ensureConversation(state, conversationId);
            conv.unreadCount = 0;
            syncViewMode(state);
            break;
        }
        case "SNAPCHAT_MESSAGE_SEND": {
            if (!conversationId) return;
            const conv = ensureConversation(state, conversationId);
            const msg = asPayload<"SNAPCHAT_MESSAGE_SEND">(payload);
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
                }),
            );
            break;
        }
        case "SNAPCHAT_MESSAGE_RECEIVE": {
            if (!conversationId) return;
            const conv = ensureConversation(state, conversationId);
            const msg = asPayload<"SNAPCHAT_MESSAGE_RECEIVE">(payload);
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
                    status: "delivered",
                }),
            );
            if (!msg.silent) {
                conv.unreadCount += 1;
            }
            break;
        }
        case "SNAPCHAT_SNAP_SEND": {
            if (!conversationId) return;
            const conv = ensureConversation(state, conversationId);
            const snap = asPayload<"SNAPCHAT_SNAP_SEND">(payload);
            const messageId = snap.messageId ?? `snap_${at}_${conv.messages.length}`;
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
                    snapType: snap.snapType,
                    snapTimer: snap.timer ?? 5,
                    attachments: snap.url ? [{ kind: snap.snapType === "video" ? "video" : "image", url: snap.url }] : undefined,
                }),
            );
            conv.lastSnapAt = at;
            break;
        }
        case "SNAPCHAT_SNAP_RECEIVE": {
            if (!conversationId) return;
            const conv = ensureConversation(state, conversationId);
            const snap = asPayload<"SNAPCHAT_SNAP_RECEIVE">(payload);
            const messageId = snap.messageId ?? `snap_${at}_${conv.messages.length}`;
            addMessage(
                conv,
                createMessage({
                    id: messageId,
                    conversationId,
                    senderId: snap.from,
                    senderName: snap.from,
                    fromMe: false,
                    timestamp: at,
                    status: "delivered",
                    kind: "snap",
                    snapType: snap.snapType,
                    snapTimer: snap.timer ?? 5,
                    attachments: snap.url ? [{ kind: snap.snapType === "video" ? "video" : "image", url: snap.url }] : undefined,
                }),
            );
            conv.unreadCount += 1;
            conv.lastSnapAt = at;
            break;
        }
        case "SNAPCHAT_SNAP_OPEN": {
            if (!conversationId) return;
            const conv = ensureConversation(state, conversationId);
            const snap = asPayload<"SNAPCHAT_SNAP_OPEN">(payload);
            const target = getMessageById(conv, snap.messageId);
            if (target) {
                target.snapOpened = true;
                target.status = "opened";
            }
            break;
        }
        case "SNAPCHAT_TYPING_START": {
            if (!conversationId) return;
            const conv = ensureConversation(state, conversationId);
            const typing = asPayload<"SNAPCHAT_TYPING_START">(payload);
            conv.typing[typing.actor] = true;
            break;
        }
        case "SNAPCHAT_TYPING_END": {
            if (!conversationId) return;
            const conv = ensureConversation(state, conversationId);
            const typing = asPayload<"SNAPCHAT_TYPING_END">(payload);
            conv.typing[typing.actor] = false;
            break;
        }
        case "SNAPCHAT_STREAK_UPDATE": {
            if (!conversationId) return;
            const conv = ensureConversation(state, conversationId);
            const streak = asPayload<"SNAPCHAT_STREAK_UPDATE">(payload);
            conv.streak = streak.streak;
            break;
        }
        case "SNAPCHAT_SET_SCREEN": {
            const data = asPayload<"SNAPCHAT_SET_SCREEN">(payload);
            state.currentScreen = data.screen;
            if (data.conversationId) {
                state.activeConversationId = data.conversationId;
            } else if (data.screen === "chat_list") {
                state.activeConversationId = undefined;
            }
            syncViewMode(state);
            break;
        }
        case "SNAPCHAT_MESSAGE_STATUS_SET": {
            if (!conversationId) return;
            const conv = ensureConversation(state, conversationId);
            const msg = asPayload<"SNAPCHAT_MESSAGE_STATUS_SET">(payload);
            const target = getMessageById(conv, msg.messageId);
            if (target) {
                target.status = msg.status;
            }
            break;
        }
        case "SNAPCHAT_SCREENSHOT": {
            if (!conversationId) return;
            const conv = ensureConversation(state, conversationId);
            const ss = asPayload<"SNAPCHAT_SCREENSHOT">(payload);
            if (ss.messageId) {
                const target = getMessageById(conv, ss.messageId);
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
            const save = asPayload<"SNAPCHAT_SAVE_MESSAGE">(payload);
            const target = getMessageById(conv, save.messageId);
            if (target) {
                target.saved = true;
            }
            break;
        }
        default:
            break;
    }
}
