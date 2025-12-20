/**
 * Instagram v2 Track Builder
 * 
 * Provides DSL verbs for Instagram interactions:
 * - receive() - Incoming DM
 * - send() - Outgoing DM
 * - like() - Like a post
 * - comment() - Comment on a post
 * - navigate() - Switch screens
 */

import type { InstagramPayloads } from "../ir/payloads";
import type { InstagramTrackEvent } from "../ir/track-event";

// =============================================================================
// TYPES
// =============================================================================

type GetDeclarationOrder = () => number;

// =============================================================================
// POINT BUILDER (at)
// =============================================================================

export class InstagramPointBuilder {
    constructor(
        private _frame: number,
        private _fps: number,
        private _deviceId: string,
        private _events: InstagramTrackEvent[],
        private _getOrder: GetDeclarationOrder
    ) { }

    private emit<T extends keyof InstagramPayloads>(
        type: T,
        payload: InstagramPayloads[T]
    ): void {
        this._events.push({
            kind: "APP",
            appId: "app_instagram",
            type,
            payload,
            at: this._frame,
            deviceId: this._deviceId,
            _declarationOrder: this._getOrder(),
        } as InstagramTrackEvent);
    }

    // =========================================================================
    // NAVIGATION
    // =========================================================================

    /** Navigate to a screen */
    navigate(screen: "home" | "dms" | "search" | "reels" | "profile"): void {
        this.emit("NAVIGATE", { screen });
    }

    /** Open a DM thread */
    openDM(threadId: string): void {
        this.emit("OPEN_DM", { threadId });
    }

    // =========================================================================
    // FEED
    // =========================================================================

    /** New post appears in feed */
    newPost(
        author: { username: string; avatar: string; verified?: boolean },
        image: string,
        caption?: string
    ): void {
        this.emit("NEW_POST", { author, image, caption });
    }

    /** Like a post */
    like(postId: string): void {
        this.emit("LIKE_POST", { postId });
    }

    /** Comment on a post */
    comment(postId: string, text: string): void {
        this.emit("COMMENT", { postId, text });
    }

    /** Save a post */
    save(postId: string): void {
        this.emit("SAVE_POST", { postId });
    }

    // =========================================================================
    // DIRECT MESSAGES
    // =========================================================================

    /** Receive a DM */
    receive(
        from: { username: string; avatar: string },
        content: string,
        options?: { threadId?: string; contentType?: "text" | "image" }
    ): void {
        const threadId = options?.threadId || `thread_${from.username}`;
        this.emit("RECEIVE_DM", {
            threadId,
            from,
            content,
            contentType: options?.contentType || "text",
        });
    }

    /** Send a DM */
    send(
        to: { username: string; avatar: string },
        content: string,
        options?: { threadId?: string; contentType?: "text" | "image" }
    ): void {
        const threadId = options?.threadId || `thread_${to.username}`;
        this.emit("SEND_DM", {
            threadId,
            to,
            content,
            contentType: options?.contentType || "text",
        });
    }
}

// =============================================================================
// SPAN BUILDER (span)
// =============================================================================

export class InstagramSpanBuilder {
    constructor(
        private _startFrame: number,
        private _endFrame: number,
        private _deviceId: string,
        private _events: InstagramTrackEvent[],
        private _getOrder: GetDeclarationOrder
    ) { }

    private emit<T extends keyof InstagramPayloads>(
        type: T,
        payload: InstagramPayloads[T]
    ): void {
        this._events.push({
            kind: "APP",
            appId: "app_instagram",
            type,
            payload,
            at: this._startFrame,
            duration: this._endFrame - this._startFrame,
            deviceId: this._deviceId,
            _declarationOrder: this._getOrder(),
        } as InstagramTrackEvent);
    }

    /** Show typing indicator for a DM thread */
    typing(threadId: string): void {
        // Start typing
        this._events.push({
            kind: "APP",
            appId: "app_instagram",
            type: "DM_TYPING",
            payload: { threadId, isTyping: true },
            at: this._startFrame,
            deviceId: this._deviceId,
            _declarationOrder: this._getOrder(),
        } as InstagramTrackEvent);

        // End typing
        this._events.push({
            kind: "APP",
            appId: "app_instagram",
            type: "DM_TYPING_END",
            payload: { threadId },
            at: this._endFrame,
            deviceId: this._deviceId,
            _declarationOrder: this._getOrder(),
        } as InstagramTrackEvent);
    }
}

// =============================================================================
// MAIN TRACK BUILDER
// =============================================================================

export class InstagramTrackBuilder {
    _events: InstagramTrackEvent[] = [];

    constructor(
        private _fps: number,
        private _deviceId: string,
        private _getOrder: GetDeclarationOrder
    ) { }

    /** Set current time for next event */
    at(time: string | number): InstagramPointBuilder {
        const frame = this.parseTime(time);
        return new InstagramPointBuilder(
            frame,
            this._fps,
            this._deviceId,
            this._events,
            this._getOrder
        );
    }

    /** Set a time span for events with duration */
    span(start: string | number, end: string | number): InstagramSpanBuilder {
        const startFrame = this.parseTime(start);
        const endFrame = this.parseTime(end);
        return new InstagramSpanBuilder(
            startFrame,
            endFrame,
            this._deviceId,
            this._events,
            this._getOrder
        );
    }

    private parseTime(time: string | number): number {
        if (typeof time === "number") return Math.round(time);
        const trimmed = time.trim();
        if (trimmed.endsWith("ms")) {
            return Math.round((parseFloat(trimmed.slice(0, -2)) / 1000) * this._fps);
        }
        if (trimmed.endsWith("s")) {
            return Math.round(parseFloat(trimmed.slice(0, -1)) * this._fps);
        }
        return Math.round(parseFloat(trimmed));
    }
}
