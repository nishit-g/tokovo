/**
 * Compiler Context
 * 
 * Shared state for compiler passes.
 * Maintains cursor (current frame), virtual device state, and message ID mapping.
 */

import { Trace, createTrace } from "@tokovo/ir";

/**
 * Virtual device state for auto-unlock/open/navigate passes.
 */
export interface VirtualDeviceState {
    isLocked: boolean;
    foregroundAppId?: string;
    activeConversationId?: string;
}

/**
 * Compiler configuration.
 */
export interface CompilerConfig {
    /** Frames per second */
    fps: number;

    /** Episode ID */
    episodeId: string;

    /** Validation mode */
    mode: "strict" | "lenient";
}

/**
 * Compiler context passed through all passes.
 */
export class CompilerContext {
    readonly config: CompilerConfig;

    /** Message ID counter */
    private messageCounter = 0;

    /** Map from DSL message ref to real message ID */
    private messageIdMap = new Map<string, string>();

    /** Virtual device states */
    private deviceStates = new Map<string, VirtualDeviceState>();

    constructor(config: CompilerConfig) {
        this.config = config;
    }

    /**
     * Get or create virtual device state.
     */
    getDeviceState(deviceId: string): VirtualDeviceState {
        if (!this.deviceStates.has(deviceId)) {
            this.deviceStates.set(deviceId, {
                isLocked: true,
                foregroundAppId: undefined,
                activeConversationId: undefined,
            });
        }
        return this.deviceStates.get(deviceId)!;
    }

    /**
     * Update virtual device state.
     */
    updateDeviceState(deviceId: string, update: Partial<VirtualDeviceState>): void {
        const state = this.getDeviceState(deviceId);
        Object.assign(state, update);
    }

    /**
     * Generate a unique message ID.
     */
    generateMessageId(deviceId: string, conversationId: string): string {
        return `msg_${deviceId}_${conversationId}_${++this.messageCounter}`;
    }

    /**
     * Register a message ID mapping.
     */
    registerMessageId(refId: string, realId: string): void {
        this.messageIdMap.set(refId, realId);
    }

    /**
     * Get real message ID from reference.
     */
    resolveMessageId(refId: string): string | undefined {
        return this.messageIdMap.get(refId);
    }

    /**
     * Create a trace for a scene operation.
     */
    createTrace(partial: Partial<Trace>): Trace {
        return createTrace({
            episodeId: this.config.episodeId,
            ...partial,
        });
    }
}

/**
 * Cursor tracks the current frame position during compilation.
 */
export class Cursor {
    private frame: number = 0;

    /**
     * Get current frame.
     */
    get current(): number {
        return this.frame;
    }

    /**
     * Advance cursor by frames.
     */
    advance(frames: number): void {
        this.frame += frames;
    }

    /**
     * Fork cursor for concurrent tracks.
     */
    fork(): Cursor {
        const forked = new Cursor();
        forked.frame = this.frame;
        return forked;
    }

    /**
     * Join cursors, taking the maximum position.
     */
    static join(cursors: Cursor[]): Cursor {
        const joined = new Cursor();
        joined.frame = Math.max(...cursors.map(c => c.current));
        return joined;
    }
}
