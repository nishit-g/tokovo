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
} from "@tokovo/ir";
import { TypingBuilder, MessageHandle, TrackFn, TrackBuilder } from "../types";

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
     */
    send(text: string): MessageHandle {
        const id = `msg_${this.deviceId}_${this.conversationId}_${++this.messageCounter}`;
        const op: SendMessageOp = {
            kind: "SendMessage",
            actor: "me",
            text,
            conversationId: this.conversationId,
        };
        this.ops.push(op);

        const ref = messageRef(id, this.deviceId, this.appId, this.conversationId);
        this.lastMessageRef = ref;
        return ref;
    }

    /**
     * Receive a message (from someone else).
     */
    receive(actor: string, text: string): MessageHandle {
        const id = `msg_${this.deviceId}_${this.conversationId}_${++this.messageCounter}`;
        const op: ReceiveMessageOp = {
            kind: "ReceiveMessage",
            actor,
            text,
            conversationId: this.conversationId,
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
