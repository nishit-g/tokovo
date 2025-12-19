/**
 * WhatsApp v2 Track Builder - App-specific track for WhatsApp events
 * 
 * @description Provides DSL verbs for WhatsApp interactions:
 * - receive() - Incoming message
 * - send() - Outgoing message  
 * - typing() - Typing indicator
 * - react() - Emoji reaction
 * 
 * @see docs-v2/DSL_REVAMP.md#app-track-plugin-system
 */

import type { TrackMessageRef } from "@tokovo/ir";

// Local type for WhatsApp track events
type WhatsAppTrackEvent = {
    at: number;
    duration?: number;
    deviceId: string;
    kind: "APP";
    appId: "app_whatsapp";
    type: string;
    payload: Record<string, any>;
    _declarationOrder: number;
};

// =============================================================================
// TYPES
// =============================================================================

type GetDeclarationOrder = () => number;

export interface ReceiveOptions {
    silent?: boolean;
    replyTo?: TrackMessageRef;
}

export interface SendOptions {
    silent?: boolean;
}

export interface ImageOptions {
    caption?: string;
    height?: number;
}

export interface TypingOptions {
    actor?: string;
}

// =============================================================================
// POINT BUILDER (at)
// =============================================================================

export class WhatsAppPointBuilder {
    constructor(
        private _frame: number,
        private _fps: number,
        private _deviceId: string,
        private _conversationId: string,
        private _events: WhatsAppTrackEvent[],
        private _getOrder: GetDeclarationOrder
    ) { }

    /**
     * Receive a message from someone.
     */
    receive(from: string, text: string, options: ReceiveOptions = {}): void {
        this._events.push({
            at: this._frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            payload: {
                conversationId: this._conversationId,
                from,
                text,
                silent: options.silent,
                replyTo: options.replyTo,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Send a message.
     */
    send(text: string, options: SendOptions = {}): void {
        this._events.push({
            at: this._frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_SENT",
            payload: {
                conversationId: this._conversationId,
                text,
                silent: options.silent,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Receive an image.
     */
    receiveImage(from: string, url: string, options: ImageOptions = {}): void {
        this._events.push({
            at: this._frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "IMAGE_RECEIVED",
            payload: {
                conversationId: this._conversationId,
                from,
                url,
                caption: options.caption,
                height: options.height,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Send an image.
     */
    sendImage(url: string, options: ImageOptions = {}): void {
        this._events.push({
            at: this._frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "IMAGE_SENT",
            payload: {
                conversationId: this._conversationId,
                url,
                caption: options.caption,
                messageType: "image",
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Receive a video.
     */
    receiveVideo(from: string, url: string, options: { duration?: number; caption?: string } = {}): void {
        this._events.push({
            at: this._frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "VIDEO_RECEIVED",
            payload: {
                conversationId: this._conversationId,
                from,
                url,
                duration: options.duration ?? 10,
                caption: options.caption,
                messageType: "video",
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Send a video.
     */
    sendVideo(url: string, options: { duration?: number; caption?: string } = {}): void {
        this._events.push({
            at: this._frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "VIDEO_SENT",
            payload: {
                conversationId: this._conversationId,
                url,
                duration: options.duration ?? 10,
                caption: options.caption,
                messageType: "video",
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Receive a voice note.
     */
    receiveVoice(from: string, duration: number): void {
        this._events.push({
            at: this._frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "VOICE_RECEIVED",
            payload: {
                conversationId: this._conversationId,
                from,
                duration,
                messageType: "voice",
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Send a voice note.
     */
    sendVoice(duration: number): void {
        this._events.push({
            at: this._frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "VOICE_SENT",
            payload: {
                conversationId: this._conversationId,
                duration,
                messageType: "voice",
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Receive a GIF.
     */
    receiveGif(from: string, url: string): void {
        this._events.push({
            at: this._frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "GIF_RECEIVED",
            payload: {
                conversationId: this._conversationId,
                from,
                url,
                messageType: "gif",
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Send a GIF.
     */
    sendGif(url: string): void {
        this._events.push({
            at: this._frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "GIF_SENT",
            payload: {
                conversationId: this._conversationId,
                url,
                messageType: "gif",
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * React to a message.
     */
    react(messageRef: TrackMessageRef, emoji: string): void {
        this._events.push({
            at: this._frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "REACT",
            payload: {
                conversationId: this._conversationId,  // Required for reducer!
                messageRef,
                emoji,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Mark conversation as read.
     */
    read(): void {
        this._events.push({
            at: this._frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "READ",
            payload: {
                conversationId: this._conversationId,
            },
            _declarationOrder: this._getOrder(),
        });
    }
}

// =============================================================================
// SPAN BUILDER (span)
// =============================================================================

export class WhatsAppSpanBuilder {
    constructor(
        private _startFrame: number,
        private _endFrame: number,
        private _deviceId: string,
        private _conversationId: string,
        private _events: WhatsAppTrackEvent[],
        private _getOrder: GetDeclarationOrder
    ) { }

    /**
     * Show typing indicator for the span duration.
     * NOTE: Use keyboard track for actual key animation.
     */
    typing(actor: string = "them"): void {
        this._events.push(
            {
                at: this._startFrame,
                duration: this._endFrame - this._startFrame,
                deviceId: this._deviceId,
                kind: "APP",
                appId: "app_whatsapp",
                type: "TYPING_START",
                payload: {
                    conversationId: this._conversationId,
                    actor,
                },
                _declarationOrder: this._getOrder(),
            },
            {
                at: this._endFrame,
                deviceId: this._deviceId,
                kind: "APP",
                appId: "app_whatsapp",
                type: "TYPING_END",
                payload: {
                    conversationId: this._conversationId,
                    actor,
                },
                _declarationOrder: this._getOrder(),
            }
        );
    }
}

// =============================================================================
// WHATSAPP TRACK BUILDER
// =============================================================================

/**
 * Parse time to frames.
 */
function parseTime(time: string | number, fps: number): number {
    if (typeof time === "number") return Math.round(time);
    const trimmed = time.trim();
    if (trimmed.endsWith("ms")) {
        return Math.round((parseFloat(trimmed.slice(0, -2)) / 1000) * fps);
    }
    if (trimmed.endsWith("s")) {
        return Math.round(parseFloat(trimmed.slice(0, -1)) * fps);
    }
    return Math.round(parseFloat(trimmed));
}

export class WhatsAppTrackBuilder {
    _events: WhatsAppTrackEvent[] = [];

    constructor(
        private _fps: number,
        private _deviceId: string,
        private _conversationId: string,
        private _getOrder: GetDeclarationOrder
    ) { }

    /**
     * Create a point (instant) operation at a specific time.
     */
    at(time: string | number): WhatsAppPointBuilder {
        const frame = parseTime(time, this._fps);
        return new WhatsAppPointBuilder(
            frame,
            this._fps,
            this._deviceId,
            this._conversationId,
            this._events,
            this._getOrder
        );
    }

    /**
     * Create a span (duration) operation between two times.
     */
    span(start: string | number, end: string | number): WhatsAppSpanBuilder {
        const startFrame = parseTime(start, this._fps);
        const endFrame = parseTime(end, this._fps);
        return new WhatsAppSpanBuilder(
            startFrame,
            endFrame,
            this._deviceId,  // FIXED: was passing _fps by mistake!
            this._conversationId,
            this._events,
            this._getOrder
        );
    }

    /**
     * Switch to a different conversation.
     * Emits core CONVERSATION_OPENED event (handled by navigation.ts)
     */
    switchTo(conversationId: string): void {
        const frame = parseTime("0s", this._fps);
        this._events.push({
            at: frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "CONVERSATION_OPENED",  // Core event!
            payload: {
                conversationId,
            },
            _declarationOrder: this._getOrder(),
        } as any);
        // Update internal conversation ID for subsequent methods
        (this as any)._conversationId = conversationId;
    }

    /**
     * Open the chat list screen.
     * Emits core NAVIGATE_SCREEN event (handled by navigation.ts)
     */
    openChatList(): void {
        const frame = parseTime("0s", this._fps);
        this._events.push({
            at: frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "NAVIGATE_SCREEN",  // Core event!
            payload: {
                screen: "chats",  // Core expects "chats" not "chatList"
            },
            _declarationOrder: this._getOrder(),
        } as any);
    }

    /**
     * Go back to previous screen.
     * Emits core GO_BACK event (handled by navigation.ts)
     */
    goBack(): void {
        const frame = parseTime("0s", this._fps);
        this._events.push({
            at: frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "GO_BACK",  // Core event!
            payload: {},
            _declarationOrder: this._getOrder(),
        } as any);
    }

    /**
     * Open profile screen.
     */
    openProfile(): void {
        const frame = parseTime("0s", this._fps);
        this._events.push({
            at: frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "NAVIGATE_SCREEN",
            payload: {
                screen: "profile",
            },
            _declarationOrder: this._getOrder(),
        } as any);
    }

    /**
     * Add a date separator (e.g., "Today", "Yesterday").
     */
    dateSeparator(text: string = "Today"): void {
        const frame = parseTime("0s", this._fps);
        this._events.push({
            at: frame,
            deviceId: this._deviceId,
            kind: "APP",
            appId: "app_whatsapp",
            type: "DATE_SEPARATOR",
            payload: {
                conversationId: this._conversationId,
                text,
            },
            _declarationOrder: this._getOrder(),
        } as any);
    }
}

/**
 * Create a new WhatsApp track builder factory.
 */
export function createWhatsAppTrackBuilder(
    fps: number,
    deviceId: string,
    conversationId: string,
    getOrder: GetDeclarationOrder
): WhatsAppTrackBuilder {
    return new WhatsAppTrackBuilder(fps, deviceId, conversationId, getOrder);
}
