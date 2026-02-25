import { parseTimeToFrames } from "@tokovo/dsl";
import { SNAPCHAT_APP_ID } from "../constants.js";
import type { SnapchatAttachment, SnapchatSnapType } from "../types/messages.js";
import type { SnapchatTrackEvent } from "../types/events.js";
import type { SnapchatConversation } from "../types/conversation.js";
import type { SnapchatScreen } from "../types/state.js";

type GetDeclarationOrder = () => number;

type PayloadInput<T> = T | ((order: number) => T);

function resolvePayload<T>(payload: PayloadInput<T>, order: number): T {
    return typeof payload === "function" ? (payload as (o: number) => T)(order) : payload;
}

function createMessageId(frame: number, order: number) {
    return `msg-${frame}-${order}`;
}

// =============================================================================
// INPUT TYPES
// =============================================================================

export interface SendMessageInput {
    text?: string;
    attachments?: SnapchatAttachment[];
    messageId?: string;
    typed?: boolean;
    charDelay?: number;
}

export interface ReceiveMessageInput {
    from: string;
    text?: string;
    attachments?: SnapchatAttachment[];
    messageId?: string;
    silent?: boolean;
}

export interface SendSnapInput {
    snapType?: SnapchatSnapType;
    url?: string;
    timer?: number;
    messageId?: string;
}

export interface ReceiveSnapInput {
    from: string;
    snapType?: SnapchatSnapType;
    url?: string;
    timer?: number;
    messageId?: string;
}

// =============================================================================
// POINT BUILDER (single frame)
// =============================================================================

export class SnapchatPointBuilder {
    constructor(
        private _frame: number,
        private _deviceId: string,
        private _conversationId: string,
        private _events: SnapchatTrackEvent[],
        private _getOrder: GetDeclarationOrder,
        private _setConversationId?: (id: string) => void,
    ) { }

    private _push<T extends SnapchatTrackEvent["type"]>(
        type: T,
        payload: PayloadInput<Extract<SnapchatTrackEvent, { type: T }>["payload"]>,
        duration?: number,
    ) {
        const order = this._getOrder();
        const resolvedPayload = resolvePayload(payload, order);
        this._events.push({
            kind: "APP",
            appId: SNAPCHAT_APP_ID,
            type,
            payload: resolvedPayload,
            at: this._frame,
            duration: duration ?? 0,
            deviceId: this._deviceId,
            conversationId: this._conversationId,
            _declarationOrder: order,
        } as SnapchatTrackEvent);
    }

    createConversation(conversation: Partial<SnapchatConversation>) {
        this._push("SNAPCHAT_CONVERSATION_CREATE", (order) => ({
            conversation: {
                id: conversation.id ?? `conv-${this._frame}-${order}`,
                title: conversation.title,
                avatar: conversation.avatar,
                participants: conversation.participants ?? [],
                messages: conversation.messages ?? [],
                typing: conversation.typing ?? {},
                unreadCount: conversation.unreadCount ?? 0,
                isGroup: conversation.isGroup ?? false,
                streak: conversation.streak,
            },
        }));
    }

    openConversation(conversationId: string) {
        this._push("SNAPCHAT_CONVERSATION_OPEN", { conversationId });
        this._conversationId = conversationId;
        if (this._setConversationId) {
            this._setConversationId(conversationId);
        }
    }

    send(text: string, options?: Omit<SendMessageInput, "text">) {
        this._push("SNAPCHAT_MESSAGE_SEND", (order) => ({
            conversationId: this._conversationId,
            text,
            attachments: options?.attachments,
            messageId: options?.messageId ?? createMessageId(this._frame, order),
            typed: options?.typed,
            charDelay: options?.charDelay,
        }));
    }

    receive(from: string, text: string, options?: Omit<ReceiveMessageInput, "from" | "text">) {
        this._push("SNAPCHAT_MESSAGE_RECEIVE", (order) => ({
            conversationId: this._conversationId,
            from,
            text,
            attachments: options?.attachments,
            messageId: options?.messageId ?? createMessageId(this._frame, order),
            silent: options?.silent,
        }));
    }

    sendSnap(input?: SendSnapInput) {
        this._push("SNAPCHAT_SNAP_SEND", (order) => ({
            conversationId: this._conversationId,
            snapType: input?.snapType ?? "photo",
            url: input?.url,
            timer: input?.timer ?? 5,
            messageId: input?.messageId ?? `snap-${this._frame}-${order}`,
        }));
    }

    receiveSnap(from: string, input?: Omit<ReceiveSnapInput, "from">) {
        this._push("SNAPCHAT_SNAP_RECEIVE", (order) => ({
            conversationId: this._conversationId,
            from,
            snapType: input?.snapType ?? "photo",
            url: input?.url,
            timer: input?.timer ?? 5,
            messageId: input?.messageId ?? `snap-${this._frame}-${order}`,
        }));
    }

    openSnap(messageId: string) {
        this._push("SNAPCHAT_SNAP_OPEN", {
            conversationId: this._conversationId,
            messageId,
        });
    }

    typingStart(actor: string) {
        this._push("SNAPCHAT_TYPING_START", {
            conversationId: this._conversationId,
            actor,
        });
    }

    typingEnd(actor: string) {
        this._push("SNAPCHAT_TYPING_END", {
            conversationId: this._conversationId,
            actor,
        });
    }

    typing(actor: string, isTyping: boolean) {
        if (isTyping) {
            this.typingStart(actor);
        } else {
            this.typingEnd(actor);
        }
    }

    updateStreak(streak: number) {
        this._push("SNAPCHAT_STREAK_UPDATE", {
            conversationId: this._conversationId,
            streak,
        });
    }

    setScreen(screen: SnapchatScreen) {
        this._push("SNAPCHAT_SET_SCREEN", {
            screen,
            conversationId: this._conversationId,
        });
    }

    screenshot(messageId?: string) {
        this._push("SNAPCHAT_SCREENSHOT", {
            conversationId: this._conversationId,
            messageId,
        });
    }

    saveMessage(messageId: string) {
        this._push("SNAPCHAT_SAVE_MESSAGE", {
            conversationId: this._conversationId,
            messageId,
        });
    }
}

// =============================================================================
// TRACK BUILDER (timeline)
// =============================================================================

export class SnapchatTrackBuilder {
    _events: SnapchatTrackEvent[] = [];
    private _currentFrame = 0;
    private _conversationId = "";

    constructor(
        private _fps: number,
        private _deviceId: string,
        conversationId: string,
        private _getOrder: GetDeclarationOrder,
    ) {
        this._conversationId = conversationId;
    }

    private _point() {
        return new SnapchatPointBuilder(
            this._currentFrame,
            this._deviceId,
            this._conversationId,
            this._events,
            this._getOrder,
            (id) => { this._conversationId = id; },
        );
    }

    at(time: string | number): SnapchatPointBuilder {
        this._currentFrame =
            typeof time === "number" ? time : parseTimeToFrames(time, this._fps);
        return this._point();
    }

    span(start: string | number, _end: string | number): SnapchatPointBuilder {
        const startFrame =
            typeof start === "number" ? start : parseTimeToFrames(start, this._fps);
        this._currentFrame = startFrame;
        return new SnapchatPointBuilder(
            startFrame,
            this._deviceId,
            this._conversationId,
            this._events,
            this._getOrder,
            (id) => { this._conversationId = id; },
        );
    }

    switchTo(conversationId: string, time: string | number) {
        this._currentFrame =
            typeof time === "number" ? time : parseTimeToFrames(time, this._fps);
        this._conversationId = conversationId;
        this._point().openConversation(conversationId);
        return this;
    }

    getEvents() {
        return this._events;
    }
}

export function createSnapchatTrackBuilder(
    fps: number,
    deviceId: string,
    conversationId: string,
    getOrder: GetDeclarationOrder,
) {
    return new SnapchatTrackBuilder(fps, deviceId, conversationId, getOrder);
}
