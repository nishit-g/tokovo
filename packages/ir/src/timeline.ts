/**
 * Timeline IR - Execution Contract
 * 
 * Timeline IR is PLATFORM-AGNOSTIC but TIME-SPECIFIC.
 * 
 * RULES:
 * - All waits resolved to frames
 * - Fully deterministic
 * - No adapter-specific fields
 * - Sorted by canonical ordering
 * - Every op carries Trace
 */

import { Trace } from "./trace";

// =============================================================================
// TIMELINE OPERATIONS
// =============================================================================

/**
 * Base interface for all timeline operations.
 */
interface TimelineOpBase {
    /** Frame number when this operation occurs */
    readonly at: number;

    /** Operation kind (discriminator) */
    readonly kind: string;

    /** Debug trace */
    readonly trace: Trace;
}

/**
 * Device unlocked.
 */
export interface DeviceUnlockedOp extends TimelineOpBase {
    readonly kind: "DeviceUnlocked";
    readonly deviceId: string;
}

/**
 * App opened.
 */
export interface AppOpenedOp extends TimelineOpBase {
    readonly kind: "AppOpened";
    readonly deviceId: string;
    readonly appId: string;
}

/**
 * Conversation navigated to.
 */
export interface ConversationOpenedOp extends TimelineOpBase {
    readonly kind: "ConversationOpened";
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
}

/**
 * Typing indicator started.
 */
export interface TypingStartedOp extends TimelineOpBase {
    readonly kind: "TypingStarted";
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
    readonly actor: string;
}

/**
 * Typing indicator ended.
 */
export interface TypingEndedOp extends TimelineOpBase {
    readonly kind: "TypingEnded";
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
    readonly actor: string;
}

/**
 * Message received.
 */
export interface MessageReceivedOp extends TimelineOpBase {
    readonly kind: "MessageReceived";
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
    readonly message: {
        readonly id: string;
        readonly text?: string;
        readonly from: string;
        readonly type?: "text" | "image" | "video" | "gif" | "voice" | "system";
        readonly timestamp?: string;
        // Media fields
        readonly imageUrl?: string;
        readonly videoUrl?: string;
        readonly thumbnailUrl?: string;
        readonly gifUrl?: string;
        readonly caption?: string;
        readonly duration?: number;
        readonly height?: number;
    };
}

/**
 * Message sent (by device owner).
 */
export interface MessageSentOp extends TimelineOpBase {
    readonly kind: "MessageSent";
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
    readonly message: {
        readonly id: string;
        readonly text?: string;
        readonly type?: "text" | "image" | "video" | "gif" | "voice";
        readonly timestamp?: string;
        // Media fields
        readonly imageUrl?: string;
        readonly videoUrl?: string;
        readonly thumbnailUrl?: string;
        readonly gifUrl?: string;
        readonly caption?: string;
        readonly duration?: number;
        readonly height?: number;
    };
}

/**
 * Message marked as read.
 */
export interface MessageReadOp extends TimelineOpBase {
    readonly kind: "MessageRead";
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
    readonly messageId: string;
}

/**
 * Message deleted.
 */
export interface MessageDeletedOp extends TimelineOpBase {
    readonly kind: "MessageDeleted";
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
    readonly messageId: string;
}

/**
 * Screen navigated within app.
 */
export interface ScreenNavigatedOp extends TimelineOpBase {
    readonly kind: "ScreenNavigated";
    readonly deviceId: string;
    readonly appId: string;
    readonly screen: "chats-list" | "chat" | "settings" | "status" | "calls";
    readonly conversationId?: string;  // For "chat" screen
    readonly transition?: "push" | "pop" | "present" | "dismiss";
}

/**
 * Union of all timeline operations.
 */
export type TimelineOp =
    | DeviceUnlockedOp
    | AppOpenedOp
    | ConversationOpenedOp
    | TypingStartedOp
    | TypingEndedOp
    | MessageReceivedOp
    | MessageSentOp
    | MessageReadOp
    | MessageDeletedOp
    | ScreenNavigatedOp;

// =============================================================================
// TIMELINE IR (COMPLETE)
// =============================================================================

/**
 * Complete Timeline IR for an episode.
 */
export interface TimelineIR {
    readonly episodeId: string;
    readonly fps: number;
    readonly durationInFrames: number;
    readonly ops: TimelineOp[];
}
