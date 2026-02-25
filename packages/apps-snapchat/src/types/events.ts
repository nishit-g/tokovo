import type { TrackEventBase } from "@tokovo/ir";
import type {
    SnapchatAttachment,
    SnapchatMessageStatus,
    SnapchatSnapType,
} from "./messages.js";
import type { SnapchatScreen } from "./state.js";
import type { SnapchatConversation } from "./conversation.js";

// =============================================================================
// PAYLOAD TYPES
// =============================================================================

export interface ConversationCreatePayload {
    conversation: SnapchatConversation;
}

export interface ConversationOpenPayload {
    conversationId: string;
}

export interface MessageSendPayload {
    conversationId: string;
    text?: string;
    attachments?: SnapchatAttachment[];
    messageId?: string;
    typed?: boolean;
    charDelay?: number;
}

export interface MessageReceivePayload {
    conversationId: string;
    from: string;
    text?: string;
    attachments?: SnapchatAttachment[];
    messageId?: string;
    silent?: boolean;
}

export interface SnapSendPayload {
    conversationId: string;
    snapType: SnapchatSnapType;
    url?: string;
    timer?: number;
    messageId?: string;
}

export interface SnapReceivePayload {
    conversationId: string;
    from: string;
    snapType: SnapchatSnapType;
    url?: string;
    timer?: number;
    messageId?: string;
}

export interface SnapOpenPayload {
    conversationId: string;
    messageId: string;
}

export interface TypingPayload {
    conversationId: string;
    actor: string;
}

export interface StreakUpdatePayload {
    conversationId: string;
    streak: number;
}

export interface ScreenPayload {
    screen: SnapchatScreen;
    conversationId?: string;
}

export interface MessageStatusPayload {
    conversationId: string;
    messageId: string;
    status: SnapchatMessageStatus;
}

export interface ScreenshotPayload {
    conversationId: string;
    messageId?: string;
}

export interface SaveMessagePayload {
    conversationId: string;
    messageId: string;
}

// =============================================================================
// EVENT MAP
// =============================================================================

export type SnapchatEventMap = {
    SNAPCHAT_CONVERSATION_CREATE: ConversationCreatePayload;
    SNAPCHAT_CONVERSATION_OPEN: ConversationOpenPayload;
    SNAPCHAT_MESSAGE_SEND: MessageSendPayload;
    SNAPCHAT_MESSAGE_RECEIVE: MessageReceivePayload;
    SNAPCHAT_SNAP_SEND: SnapSendPayload;
    SNAPCHAT_SNAP_RECEIVE: SnapReceivePayload;
    SNAPCHAT_SNAP_OPEN: SnapOpenPayload;
    SNAPCHAT_TYPING_START: TypingPayload;
    SNAPCHAT_TYPING_END: TypingPayload;
    SNAPCHAT_STREAK_UPDATE: StreakUpdatePayload;
    SNAPCHAT_SET_SCREEN: ScreenPayload;
    SNAPCHAT_MESSAGE_STATUS_SET: MessageStatusPayload;
    SNAPCHAT_SCREENSHOT: ScreenshotPayload;
    SNAPCHAT_SAVE_MESSAGE: SaveMessagePayload;
};

export type SnapchatEventType = keyof SnapchatEventMap;

export type SnapchatEventPayload<T extends SnapchatEventType = SnapchatEventType> =
    SnapchatEventMap[T];

export type SnapchatTrackEvent = TrackEventBase & {
    kind: "APP";
    appId: "app_snapchat";
    deviceId: string;
    conversationId?: string;
} & {
    [K in SnapchatEventType]: {
        type: K;
        payload: SnapchatEventMap[K];
    };
}[SnapchatEventType];

export function isSnapchatEvent(event: unknown): event is SnapchatTrackEvent {
    return (
        typeof event === "object" &&
        event !== null &&
        (event as { kind?: string }).kind === "APP" &&
        (event as { appId?: string }).appId === "app_snapchat"
    );
}
