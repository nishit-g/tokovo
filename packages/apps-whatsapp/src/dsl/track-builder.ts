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

import type { WhatsAppPayloads, WhatsAppTrackEvent, TrackMessageRef } from "@tokovo/ir";

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
