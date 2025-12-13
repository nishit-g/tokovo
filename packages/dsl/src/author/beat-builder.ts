/**
 * Beat Builder
 * 
 * Fluent API for defining actions within a beat.
 * A beat is a named group of sequential/concurrent operations.
 */

import {
    SceneOp,
    WaitOp,
    TypingStartOp,
    TypingEndOp,
    SendMessageOp,
    ReceiveMessageOp,
    ReadMessageOp,
    DeleteMessageOp,
    ConcurrentOp,
    MessageRef,
    messageRef,
    // Media operations
    SendImageOp,
    ReceiveImageOp,
    SendVideoOp,
    ReceiveVideoOp,
    SendGifOp,
    ReceiveGifOp,
    SendVoiceOp,
    ReceiveVoiceOp,
    // POV operations
    POVSwitchOp,
    SplitPOVOp,
    POVLayout,
    // Navigation operations
    NavigateScreenOp,
    OpenChatOp,
    GoBackOp,
    // Reserved signals
    ReactionAddedOp,
    ScreenshotTakenOp,
    MissedCallOp,
    // Semantic
    SemanticMeta,
    MessageMeta,
} from "@tokovo/ir";
import { TypingBuilder, MessageHandle, TrackFn, TrackBuilder } from "../types";

/**
 * Message options for semantic annotations.
 */
export interface MessageOptions {
    /** Semantic annotations */
    mood?: SemanticMeta["mood"];
    intensity?: number;
    secrecy?: "low" | "medium" | "high";
    urgency?: number;
    intimacy?: number;
    subtext?: string;
    tags?: string[];
    /** Message type */
    type?: "text" | "image" | "voice" | "system";
}

/**
 * Build MessageMeta from options.
 */
function buildMeta(options?: MessageOptions): MessageMeta | undefined {
    if (!options) return undefined;

    const semantic: SemanticMeta = {};
    if (options.mood) semantic.mood = options.mood;
    if (options.intensity !== undefined) semantic.intensity = options.intensity;
    if (options.secrecy) semantic.secrecy = options.secrecy;
    if (options.urgency !== undefined) semantic.urgency = options.urgency;
    if (options.intimacy !== undefined) semantic.intimacy = options.intimacy;
    if (options.subtext) semantic.subtext = options.subtext;
    if (options.tags) semantic.tags = options.tags;

    return {
        type: options.type ?? "text",
        semantic: Object.keys(semantic).length > 0 ? semantic : undefined,
    };
}

/**
 * Beat builder collects operations within a beat.
 */
export class BeatBuilder {
    private readonly ops: SceneOp[] = [];
    private readonly deviceId: string;
    private readonly appId: string;
    private readonly conversationId: string;
    private messageCounter = 0;
    private lastMessageRef: MessageRef | undefined;

    constructor(deviceId: string, appId: string, conversationId: string) {
        this.deviceId = deviceId;
        this.appId = appId;
        this.conversationId = conversationId;
    }

    /**
     * Wait for a duration.
     */
    wait(duration: string): this {
        const op: WaitOp = { kind: "Wait", duration };
        this.ops.push(op);
        return this;
    }

    /**
     * Start typing indicator.
     * Returns a builder for fluent chaining: typing("Bob").for("2s")
     */
    typing(actor: string): TypingBuilder {
        const conversationId = this.conversationId;
        const ops = this.ops;

        return {
            for: (duration: string) => {
                // Expand to: TypingStart + Wait + TypingEnd
                const start: TypingStartOp = {
                    kind: "TypingStart",
                    actor,
                    conversationId,
                };
                const wait: WaitOp = { kind: "Wait", duration };
                const end: TypingEndOp = {
                    kind: "TypingEnd",
                    actor,
                    conversationId,
                };
                ops.push(start, wait, end);
            },
        };
    }

    /**
     * Start typing without specifying duration.
     * Use typingEnd() to stop.
     */
    typingStart(actor: string): this {
        const op: TypingStartOp = {
            kind: "TypingStart",
            actor,
            conversationId: this.conversationId,
        };
        this.ops.push(op);
        return this;
    }

    /**
     * Stop typing indicator.
     */
    typingEnd(actor: string): this {
        const op: TypingEndOp = {
            kind: "TypingEnd",
            actor,
            conversationId: this.conversationId,
        };
        this.ops.push(op);
        return this;
    }

    /**
     * Send a message (from device owner).
     * @param text - Message text
     * @param options - Optional semantic annotations
     */
    send(text: string, options?: MessageOptions): MessageHandle {
        const id = `msg_${this.deviceId}_${this.conversationId}_${++this.messageCounter}`;
        const op: SendMessageOp = {
            kind: "SendMessage",
            actor: "me",
            text,
            conversationId: this.conversationId,
            meta: buildMeta(options),
        };
        this.ops.push(op);

        const ref = messageRef(id, this.deviceId, this.appId, this.conversationId);
        this.lastMessageRef = ref;
        return ref;
    }

    /**
     * Receive a message (from someone else).
     * @param actor - Who sent the message
     * @param text - Message text
     * @param options - Optional semantic annotations
     */
    receive(actor: string, text: string, options?: MessageOptions): MessageHandle {
        const id = `msg_${this.deviceId}_${this.conversationId}_${++this.messageCounter}`;
        const op: ReceiveMessageOp = {
            kind: "ReceiveMessage",
            actor,
            text,
            conversationId: this.conversationId,
            meta: buildMeta(options),
        };
        this.ops.push(op);

        const ref = messageRef(id, this.deviceId, this.appId, this.conversationId);
        this.lastMessageRef = ref;
        return ref;
    }

    /**
     * Mark a message as read.
     */
    read(ref: MessageHandle): this {
        const op: ReadMessageOp = { kind: "ReadMessage", ref };
        this.ops.push(op);
        return this;
    }

    /**
     * Mark the last message as read.
     */
    readLast(): this {
        if (!this.lastMessageRef) {
            throw new Error("readLast() called but no previous message exists");
        }
        return this.read(this.lastMessageRef);
    }

    /**
     * Delete a message.
     */
    delete(ref: MessageHandle): this {
        const op: DeleteMessageOp = { kind: "DeleteMessage", ref };
        this.ops.push(op);
        return this;
    }

    /**
     * Delete the last message.
     */
    deleteLast(): this {
        if (!this.lastMessageRef) {
            throw new Error("deleteLast() called but no previous message exists");
        }
        return this.delete(this.lastMessageRef);
    }

    // =========================================================================
    // MEDIA MESSAGE OPERATIONS
    // =========================================================================

    /**
     * Media options for image, video, GIF messages.
     */
    private static readonly MEDIA_DEFAULTS = {
        IMAGE_HEIGHT: 400,
        VIDEO_HEIGHT: 400,
        GIF_HEIGHT: 300,
        VOICE_HEIGHT: 150,
    };

    /**
     * Send an image message.
     * @param url - Image URL
     * @param options - Optional caption and height
     */
    sendImage(url: string, options?: { caption?: string; height?: number; skipAutoTiming?: boolean }): MessageHandle {
        const id = `img_${this.deviceId}_${this.conversationId}_${++this.messageCounter}`;
        const op: SendImageOp = {
            kind: "SendImage",
            imageUrl: url,
            conversationId: this.conversationId,
            caption: options?.caption,
            height: options?.height ?? BeatBuilder.MEDIA_DEFAULTS.IMAGE_HEIGHT,
            skipAutoTiming: options?.skipAutoTiming,
        };
        this.ops.push(op);

        const ref = messageRef(id, this.deviceId, this.appId, this.conversationId);
        this.lastMessageRef = ref;
        return ref;
    }

    /**
     * Receive an image message.
     * @param actor - Who sent the image
     * @param url - Image URL
     * @param options - Optional caption and height
     */
    receiveImage(actor: string, url: string, options?: { caption?: string; height?: number; skipAutoTiming?: boolean }): MessageHandle {
        const id = `img_${this.deviceId}_${this.conversationId}_${++this.messageCounter}`;
        const op: ReceiveImageOp = {
            kind: "ReceiveImage",
            actor,
            imageUrl: url,
            conversationId: this.conversationId,
            caption: options?.caption,
            height: options?.height ?? BeatBuilder.MEDIA_DEFAULTS.IMAGE_HEIGHT,
            skipAutoTiming: options?.skipAutoTiming,
        };
        this.ops.push(op);

        const ref = messageRef(id, this.deviceId, this.appId, this.conversationId);
        this.lastMessageRef = ref;
        return ref;
    }

    /**
     * Send a video message.
     * @param url - Video URL
     * @param duration - Video duration in seconds
     * @param options - Optional thumbnail, caption and height
     */
    sendVideo(url: string, duration: number, options?: { thumbnailUrl?: string; caption?: string; height?: number; skipAutoTiming?: boolean }): MessageHandle {
        const id = `vid_${this.deviceId}_${this.conversationId}_${++this.messageCounter}`;
        const op: SendVideoOp = {
            kind: "SendVideo",
            videoUrl: url,
            thumbnailUrl: options?.thumbnailUrl,
            conversationId: this.conversationId,
            duration,
            caption: options?.caption,
            height: options?.height ?? BeatBuilder.MEDIA_DEFAULTS.VIDEO_HEIGHT,
            skipAutoTiming: options?.skipAutoTiming,
        };
        this.ops.push(op);

        const ref = messageRef(id, this.deviceId, this.appId, this.conversationId);
        this.lastMessageRef = ref;
        return ref;
    }

    /**
     * Receive a video message.
     * @param actor - Who sent the video
     * @param url - Video URL
     * @param duration - Video duration in seconds
     * @param options - Optional thumbnail, caption and height
     */
    receiveVideo(actor: string, url: string, duration: number, options?: { thumbnailUrl?: string; caption?: string; height?: number; skipAutoTiming?: boolean }): MessageHandle {
        const id = `vid_${this.deviceId}_${this.conversationId}_${++this.messageCounter}`;
        const op: ReceiveVideoOp = {
            kind: "ReceiveVideo",
            actor,
            videoUrl: url,
            thumbnailUrl: options?.thumbnailUrl,
            conversationId: this.conversationId,
            duration,
            caption: options?.caption,
            height: options?.height ?? BeatBuilder.MEDIA_DEFAULTS.VIDEO_HEIGHT,
            skipAutoTiming: options?.skipAutoTiming,
        };
        this.ops.push(op);

        const ref = messageRef(id, this.deviceId, this.appId, this.conversationId);
        this.lastMessageRef = ref;
        return ref;
    }

    /**
     * Send a GIF message.
     * @param url - GIF URL (from Giphy, Tenor, etc.)
     * @param options - Optional height
     */
    sendGif(url: string, options?: { height?: number; skipAutoTiming?: boolean }): MessageHandle {
        const id = `gif_${this.deviceId}_${this.conversationId}_${++this.messageCounter}`;
        const op: SendGifOp = {
            kind: "SendGif",
            gifUrl: url,
            conversationId: this.conversationId,
            height: options?.height ?? BeatBuilder.MEDIA_DEFAULTS.GIF_HEIGHT,
            skipAutoTiming: options?.skipAutoTiming,
        };
        this.ops.push(op);

        const ref = messageRef(id, this.deviceId, this.appId, this.conversationId);
        this.lastMessageRef = ref;
        return ref;
    }

    /**
     * Receive a GIF message.
     * @param actor - Who sent the GIF
     * @param url - GIF URL
     * @param options - Optional height
     */
    receiveGif(actor: string, url: string, options?: { height?: number; skipAutoTiming?: boolean }): MessageHandle {
        const id = `gif_${this.deviceId}_${this.conversationId}_${++this.messageCounter}`;
        const op: ReceiveGifOp = {
            kind: "ReceiveGif",
            actor,
            gifUrl: url,
            conversationId: this.conversationId,
            height: options?.height ?? BeatBuilder.MEDIA_DEFAULTS.GIF_HEIGHT,
            skipAutoTiming: options?.skipAutoTiming,
        };
        this.ops.push(op);

        const ref = messageRef(id, this.deviceId, this.appId, this.conversationId);
        this.lastMessageRef = ref;
        return ref;
    }

    /**
     * Send a voice note.
     * @param duration - Voice note duration in seconds
     * @param options - Optional timing override
     */
    sendVoice(duration: number, options?: { skipAutoTiming?: boolean }): MessageHandle {
        const id = `voice_${this.deviceId}_${this.conversationId}_${++this.messageCounter}`;
        const op: SendVoiceOp = {
            kind: "SendVoice",
            conversationId: this.conversationId,
            duration,
            skipAutoTiming: options?.skipAutoTiming,
        };
        this.ops.push(op);

        const ref = messageRef(id, this.deviceId, this.appId, this.conversationId);
        this.lastMessageRef = ref;
        return ref;
    }

    /**
     * Receive a voice note.
     * @param actor - Who sent the voice note
     * @param duration - Voice note duration in seconds
     * @param options - Optional timing override
     */
    receiveVoice(actor: string, duration: number, options?: { skipAutoTiming?: boolean }): MessageHandle {
        const id = `voice_${this.deviceId}_${this.conversationId}_${++this.messageCounter}`;
        const op: ReceiveVoiceOp = {
            kind: "ReceiveVoice",
            actor,
            conversationId: this.conversationId,
            duration,
            skipAutoTiming: options?.skipAutoTiming,
        };
        this.ops.push(op);

        const ref = messageRef(id, this.deviceId, this.appId, this.conversationId);
        this.lastMessageRef = ref;
        return ref;
    }

    // =========================================================================
    // POV OPERATIONS (STORY GRAMMAR)
    // =========================================================================

    /**
     * Switch point of view to a different device.
     */
    pov(deviceId: string, transition?: "cut" | "crossfade" | "wipe"): this {
        const op: POVSwitchOp = { kind: "POVSwitch", deviceId, transition };
        this.ops.push(op);
        return this;
    }

    /**
     * Split POV - show multiple devices simultaneously.
     */
    splitPov(devices: string[], layout: POVLayout = "horizontal"): this {
        const op: SplitPOVOp = { kind: "SplitPOV", devices, layout };
        this.ops.push(op);
        return this;
    }

    // =========================================================================
    // RESERVED SIGNALS (DRAMA EVENTS)
    // =========================================================================

    /**
     * Add a reaction to a message.
     */
    react(ref: MessageHandle, actor: string, emoji: string): this {
        const op: ReactionAddedOp = { kind: "ReactionAdded", ref, actor, emoji };
        this.ops.push(op);
        return this;
    }

    /**
     * Screenshot taken notification (drama!).
     */
    screenshot(): this {
        const op: ScreenshotTakenOp = {
            kind: "ScreenshotTaken",
            conversationId: this.conversationId
        };
        this.ops.push(op);
        return this;
    }

    /**
     * Missed call event.
     */
    missedCall(actor: string, callType?: "voice" | "video"): this {
        const op: MissedCallOp = {
            kind: "MissedCall",
            actor,
            conversationId: this.conversationId,
            callType,
        };
        this.ops.push(op);
        return this;
    }

    // =========================================================================
    // CONCURRENT
    // =========================================================================

    /**
     * Execute operations concurrently across multiple tracks.
     */
    concurrent(tracks: TrackFn[]): this {
        const trackOps: SceneOp[][] = tracks.map((fn) => {
            const trackBuilder = this.createTrackBuilder();
            fn(trackBuilder);
            return trackBuilder.getOps();
        });

        const op: ConcurrentOp = { kind: "Concurrent", tracks: trackOps };
        this.ops.push(op);
        return this;
    }

    /**
     * Create a track builder for concurrent operations.
     */
    private createTrackBuilder(): TrackBuilderImpl {
        return new TrackBuilderImpl(
            this.deviceId,
            this.appId,
            this.conversationId,
            () => ++this.messageCounter
        );
    }

    // =========================================================================
    // NAVIGATION
    // =========================================================================

    /**
     * Navigate to a screen within the app.
     * @param screen - Target screen (chats-list, chat, settings, status, calls)
     * @param options - Transition options
     */
    showScreen(
        screen: "chats-list" | "chat" | "settings" | "status" | "calls",
        options?: { transition?: "push" | "pop" | "present" | "dismiss"; duration?: number }
    ): this {
        const op: NavigateScreenOp = {
            kind: "NavigateScreen",
            screen,
            transition: options?.transition,
            animationDuration: options?.duration,
        };
        this.ops.push(op);
        return this;
    }

    /**
     * Open a specific chat (navigate to chat screen with conversation).
     * @param conversationId - ID of the conversation to open
     * @param options - Transition options
     */
    openChat(
        conversationId: string,
        options?: { transition?: "push" | "pop"; duration?: number }
    ): this {
        const op: OpenChatOp = {
            kind: "OpenChat",
            conversationId,
            transition: options?.transition,
            animationDuration: options?.duration,
        };
        this.ops.push(op);
        return this;
    }

    /**
     * Go back to the previous screen.
     * @param options - Transition options
     */
    goBack(options?: { transition?: "pop" | "dismiss"; duration?: number }): this {
        const op: GoBackOp = {
            kind: "GoBack",
            transition: options?.transition,
            animationDuration: options?.duration,
        };
        this.ops.push(op);
        return this;
    }

    /**
     * Get collected operations.
     */
    getOps(): SceneOp[] {
        return this.ops;
    }
}

/**
 * Track builder implementation for concurrent operations.
 */
class TrackBuilderImpl implements TrackBuilder {
    private readonly ops: SceneOp[] = [];
    private readonly deviceId: string;
    private readonly appId: string;
    private readonly conversationId: string;
    private readonly getNextId: () => number;

    constructor(
        deviceId: string,
        appId: string,
        conversationId: string,
        getNextId: () => number
    ) {
        this.deviceId = deviceId;
        this.appId = appId;
        this.conversationId = conversationId;
        this.getNextId = getNextId;
    }

    wait(duration: string): this {
        this.ops.push({ kind: "Wait", duration });
        return this;
    }

    typing(actor: string): TypingBuilder {
        const conversationId = this.conversationId;
        const ops = this.ops;

        return {
            for: (duration: string) => {
                ops.push({ kind: "TypingStart", actor, conversationId });
                ops.push({ kind: "Wait", duration });
                ops.push({ kind: "TypingEnd", actor, conversationId });
            },
        };
    }

    send(actor: string, text: string): MessageHandle {
        const id = `msg_${this.deviceId}_${this.conversationId}_${this.getNextId()}`;
        this.ops.push({
            kind: "SendMessage",
            actor,
            text,
            conversationId: this.conversationId,
        });
        return messageRef(id, this.deviceId, this.appId, this.conversationId);
    }

    receive(actor: string, text: string): MessageHandle {
        const id = `msg_${this.deviceId}_${this.conversationId}_${this.getNextId()}`;
        this.ops.push({
            kind: "ReceiveMessage",
            actor,
            text,
            conversationId: this.conversationId,
        });
        return messageRef(id, this.deviceId, this.appId, this.conversationId);
    }

    getOps(): SceneOp[] {
        return this.ops;
    }
}
