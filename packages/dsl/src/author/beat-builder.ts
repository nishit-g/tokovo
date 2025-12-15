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
    AddReactionOp,
    ScreenshotTakenOp,
    MissedCallOp,
    // Semantic
    SemanticMeta,
    MessageMeta,
} from "@tokovo/ir";
import { TypingBuilder, MessageHandle, TrackFn, TrackBuilder } from "../types";
import { CameraBuilder } from "./camera-builder";

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
    type?: "text" | "image" | "video" | "gif" | "voice" | "system" | "deleted" | "screenshot_alert" | "call_missed";

    /** Interactions */
    replyTo?: { messageId: string; text: string; from: string; type?: string };
    imgUrl?: string; // Quick override for image/video url if needed in generic send
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
        ...(options.replyTo && { replyTo: options.replyTo }),
        ...(options.imgUrl && { imageUrl: options.imgUrl }),
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
     * Define camera operations within the beat.
     * These operations will be timed relative to the current beat cursor.
     */
    camera(fn: (c: CameraBuilder) => void): this {
        const builder = new CameraBuilder();
        fn(builder);
        // Extract operations and add to beat stream (ignoring 'at' since beat handles timing)
        for (const event of builder.getEvents()) {
            this.ops.push(event.op);
        }
        return this;
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
        const op: AddReactionOp = { kind: "AddReaction", ref, actor, emoji };
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
        options?: { transition?: "push" | "pop" | "present" | "dismiss"; duration?: string | number }
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
        options?: { transition?: "push" | "pop"; duration?: string | number }
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
    goBack(options?: { transition?: "pop" | "dismiss"; duration?: string | number }): this {
        const op: GoBackOp = {
            kind: "GoBack",
            transition: options?.transition,
            animationDuration: options?.duration,
        };
        this.ops.push(op);
        return this;
    }

    /**
     * Navigate to a different app.
     * @param appId - Target app ID (e.g., "app_twitter", "app_whatsapp")
     * @param options - Navigation options
     */
    navigate(
        appId: string,
        options?: {
            screen?: string;
            conversationId?: string;
            transition?: "push" | "pop" | "present";
            duration?: string | number
        }
    ): this {
        const op = {
            kind: "AppNavigate" as const,
            appId,
            screen: options?.screen,
            conversationId: options?.conversationId,
            transition: options?.transition,
            animationDuration: options?.duration,
        };
        this.ops.push(op as any);
        return this;
    }

    /**
     * Show a device notification.
     * @param appId - App that's sending the notification
     * @param options - Notification content and display options
     */
    notification(
        appId: string,
        options: {
            title: string;
            body: string;
            mode?: "lockscreen" | "headsup" | "both";
            icon?: string;
        }
    ): this {
        const op = {
            kind: "ShowNotification" as const,
            appId,
            title: options.title,
            body: options.body,
            mode: options.mode || "headsup",
            icon: options.icon,
        };
        this.ops.push(op as any);
        return this;
    }

    // =========================================================================
    // TWITTER / X
    // =========================================================================

    /**
     * Tweet handle for referencing tweets.
     */
    private tweetCounter = 0;
    private lastTweetRef: MessageRef | undefined;

    /**
     * Post a tweet from the device owner.
     * @param text - Tweet text
     * @param options - Tweet options (media, quote, etc)
     */
    postTweet(
        text: string,
        options?: {
            media?: { url: string; type: "image" | "video" | "gif" }[];
            author?: { name: string; handle: string; verified?: "blue" | "gold" | "grey" };
        }
    ): MessageHandle {
        const id = `tweet_${this.deviceId}_${++this.tweetCounter}`;
        this.ops.push({
            kind: "SendMessage" as const,
            actor: "me",
            text,
            conversationId: "__twitter_timeline__",
            meta: {
                type: "tweet" as any,
                ...(options?.media && { media: options.media }),
                ...(options?.author && { author: options.author }),
            },
        });
        const ref = messageRef(id, this.deviceId, "app_twitter", "__twitter_timeline__");
        this.lastTweetRef = ref;
        return ref;
    }

    /**
     * Receive a tweet in timeline from another user.
     * @param author - Tweet author info
     * @param text - Tweet text
     * @param options - Tweet options
     */
    tweetReceived(
        author: { name: string; handle: string; verified?: "blue" | "gold" | "grey"; avatarUrl?: string },
        text: string,
        options?: {
            media?: { url: string; type: "image" | "video" | "gif" }[];
            replyCount?: number;
            retweetCount?: number;
            likeCount?: number;
            viewCount?: number;
        }
    ): MessageHandle {
        const id = `tweet_${this.deviceId}_${++this.tweetCounter}`;
        this.ops.push({
            kind: "ReceiveMessage" as const,
            actor: author.handle,
            text,
            conversationId: "__twitter_timeline__",
            meta: {
                type: "tweet" as any,
                author,
                ...(options?.media && { media: options.media }),
                ...(options?.replyCount !== undefined && { replyCount: options.replyCount }),
                ...(options?.retweetCount !== undefined && { retweetCount: options.retweetCount }),
                ...(options?.likeCount !== undefined && { likeCount: options.likeCount }),
                ...(options?.viewCount !== undefined && { viewCount: options.viewCount }),
            },
        });
        const ref = messageRef(id, this.deviceId, "app_twitter", "__twitter_timeline__");
        this.lastTweetRef = ref;
        return ref;
    }

    /**
     * Like a tweet.
     * @param ref - Reference to the tweet
     */
    likeTweet(ref: MessageHandle): this {
        this.ops.push({
            kind: "AddReaction" as const,
            ref,
            actor: "me",
            emoji: "❤️",
        });
        return this;
    }

    /**
     * Retweet a tweet.
     * @param ref - Reference to the tweet
     */
    retweetTweet(ref: MessageHandle): this {
        this.ops.push({
            kind: "AddReaction" as const,
            ref,
            actor: "me",
            emoji: "🔁",  // Using emoji as placeholder for retweet action
        });
        return this;
    }

    /**
     * Quote a tweet with comment.
     * @param ref - Reference to the original tweet
     * @param text - Quote comment
     */
    quoteTweet(ref: MessageHandle, text: string): MessageHandle {
        const id = `quote_${this.deviceId}_${++this.tweetCounter}`;
        this.ops.push({
            kind: "SendMessage" as const,
            actor: "me",
            text,
            conversationId: "__twitter_timeline__",
            meta: {
                type: "quote_tweet" as any,
                quoteTweetRef: ref,
            },
        });
        const newRef = messageRef(id, this.deviceId, "app_twitter", "__twitter_timeline__");
        this.lastTweetRef = newRef;
        return newRef;
    }

    /**
     * Reply to a tweet.
     * @param ref - Reference to the tweet being replied to
     * @param text - Reply text
     */
    replyTweet(ref: MessageHandle, text: string): MessageHandle {
        const id = `reply_${this.deviceId}_${++this.tweetCounter}`;
        this.ops.push({
            kind: "SendMessage" as const,
            actor: "me",
            text,
            conversationId: "__twitter_timeline__",
            meta: {
                type: "reply" as any,
                replyToRef: ref,
            },
        });
        const newRef = messageRef(id, this.deviceId, "app_twitter", "__twitter_timeline__");
        this.lastTweetRef = newRef;
        return newRef;
    }

    /**
     * Bookmark a tweet.
     * @param ref - Reference to the tweet
     */
    bookmarkTweet(ref: MessageHandle): this {
        this.ops.push({
            kind: "AddReaction" as const,
            ref,
            actor: "me",
            emoji: "🔖",  // Bookmark indicator
        });
        return this;
    }

    // =========================================================================
    // KEYBOARD / TYPING SIMULATION
    // =========================================================================

    /**
     * Typing speed presets (chars per second)
     */
    private static readonly TYPING_SPEEDS = {
        slow: 4,      // 4 chars/sec - careful typing
        casual: 7,    // 7 chars/sec - normal conversation
        fast: 11,     // 11 chars/sec - quick reply
        angry: 15,    // 15 chars/sec - frustrated typing
    };

    /**
     * Show the virtual keyboard.
     * @param layout - Keyboard layout (default: qwerty)
     */
    showKeyboard(layout?: "qwerty" | "numbers" | "symbols" | "emoji"): this {
        this.ops.push({
            kind: "ShowKeyboard" as const,
            deviceId: this.deviceId,
            layout: layout || "qwerty",
        } as any);
        return this;
    }

    /**
     * Hide the virtual keyboard.
     */
    hideKeyboard(): this {
        this.ops.push({
            kind: "HideKeyboard" as const,
            deviceId: this.deviceId,
        } as any);
        return this;
    }

    /**
     * Simulate realistic typing with character-by-character animation.
     * Includes optional typos and humanized timing.
     * 
     * @param text - Text to type
     * @param options - Typing simulation options
     */
    simulateTyping(
        text: string,
        options?: {
            speed?: "slow" | "casual" | "fast" | "angry";
            typos?: number;           // Number of random typos
            framesPerChar?: number;   // Override chars/sec
        }
    ): this {
        const speed = options?.speed || "casual";
        const charsPerSecond = BeatBuilder.TYPING_SPEEDS[speed];
        const framesPerChar = options?.framesPerChar || Math.round(60 / charsPerSecond);

        // Generate typing sequence with optional typos
        const sequence = this.generateTypingSequence(text, options?.typos || 0);

        // Build the operation
        this.ops.push({
            kind: "SimulateTyping" as const,
            deviceId: this.deviceId,
            text,
            sequence,
            framesPerChar,
            speed,
        } as any);

        return this;
    }

    /**
     * Generate typing sequence with humanized timing and optional typos.
     * Returns array of { char, delay } pairs.
     */
    private generateTypingSequence(
        text: string,
        typoCount: number
    ): Array<{ char: string; isTypo?: boolean; isBackspace?: boolean }> {
        const sequence: Array<{ char: string; isTypo?: boolean; isBackspace?: boolean }> = [];

        // Adjacent keys for typo generation
        const adjacentKeys: Record<string, string[]> = {
            a: ["q", "w", "s", "z"],
            b: ["v", "g", "h", "n"],
            c: ["x", "d", "f", "v"],
            d: ["s", "e", "r", "f", "c", "x"],
            e: ["w", "r", "d", "s"],
            f: ["d", "r", "t", "g", "v", "c"],
            g: ["f", "t", "y", "h", "b", "v"],
            h: ["g", "y", "u", "j", "n", "b"],
            i: ["u", "o", "k", "j"],
            j: ["h", "u", "i", "k", "m", "n"],
            k: ["j", "i", "o", "l", "m"],
            l: ["k", "o", "p"],
            m: ["n", "j", "k"],
            n: ["b", "h", "j", "m"],
            o: ["i", "p", "l", "k"],
            p: ["o", "l"],
            q: ["w", "a"],
            r: ["e", "t", "f", "d"],
            s: ["a", "w", "e", "d", "x", "z"],
            t: ["r", "y", "g", "f"],
            u: ["y", "i", "j", "h"],
            v: ["c", "f", "g", "b"],
            w: ["q", "e", "s", "a"],
            x: ["z", "s", "d", "c"],
            y: ["t", "u", "h", "g"],
            z: ["a", "s", "x"],
        };

        // Pick random typo positions
        const typoPositions = new Set<number>();
        while (typoPositions.size < Math.min(typoCount, Math.floor(text.length / 3))) {
            typoPositions.add(Math.floor(Math.random() * text.length));
        }

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (typoPositions.has(i) && adjacentKeys[char.toLowerCase()]) {
                // Insert typo
                const wrongKey = adjacentKeys[char.toLowerCase()][
                    Math.floor(Math.random() * adjacentKeys[char.toLowerCase()].length)
                ];
                sequence.push({ char: wrongKey, isTypo: true });
                // Backspace
                sequence.push({ char: "⌫", isBackspace: true });
                // Correct character
                sequence.push({ char });
            } else {
                sequence.push({ char });
            }
        }

        return sequence;
    }

    /**
     * Clear the keyboard input text.
     */
    clearKeyboardText(): this {
        this.ops.push({
            kind: "ClearKeyboardText" as const,
            deviceId: this.deviceId,
        } as any);
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
