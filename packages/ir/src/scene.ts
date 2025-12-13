/**
 * Scene IR - Semantic Truth
 * 
 * Scene IR represents WHAT HAPPENS, not WHEN or HOW.
 * 
 * RULES:
 * - No frames
 * - No layout
 * - No camera
 * - No platform assumptions
 * 
 * If FPS changes, layout changes, or Director logic changes,
 * Scene IR stays valid.
 */

// =============================================================================
// DURATION
// =============================================================================

/**
 * Human-readable duration expression.
 * Examples: "1.2s", "300ms", "45frames"
 */
export type DurationExpr = `${number}${"s" | "ms" | "frames"}` | string;

/**
 * Parse duration to frames
 */
export function parseDuration(expr: DurationExpr, fps: number): number {
    const match = expr.match(/^([\d.]+)(s|ms|frames)$/);
    if (!match) {
        throw new Error(`Invalid duration: ${expr}`);
    }

    const value = parseFloat(match[1]);
    const unit = match[2];

    switch (unit) {
        case "s":
            return Math.round(value * fps);
        case "ms":
            return Math.round((value / 1000) * fps);
        case "frames":
            return Math.round(value);
        default:
            throw new Error(`Unknown duration unit: ${unit}`);
    }
}

// =============================================================================
// MESSAGE REFERENCE
// =============================================================================

/**
 * Reference to a message.
 * MUST include full context for cross-device/conversation operations.
 */
export interface MessageRef {
    readonly _type: "MessageRef";
    readonly id: string;
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
}

/**
 * Create a message reference
 */
export function messageRef(
    id: string,
    deviceId: string,
    appId: string,
    conversationId: string
): MessageRef {
    return {
        _type: "MessageRef",
        id,
        deviceId,
        appId,
        conversationId,
    };
}

// =============================================================================
// MESSAGE METADATA
// =============================================================================

import { SemanticMeta, BeatMeta, EpisodeConfig, POVLayout } from "./semantic";

export interface MessageMeta {
    /** Message type */
    type?: "text" | "image" | "voice" | "system";

    /** For voice messages */
    voiceDuration?: number;

    /** Timestamp display */
    timestamp?: string;

    /** Semantic annotations */
    semantic?: SemanticMeta;

    /** Custom metadata */
    [key: string]: unknown;
}

// =============================================================================
// SCENE OPERATIONS (CORE)
// =============================================================================

/**
 * Wait for a duration.
 * This advances the cursor but emits no runtime event.
 */
export interface WaitOp {
    readonly kind: "Wait";
    readonly duration: DurationExpr;
}

/**
 * Start typing indicator.
 */
export interface TypingStartOp {
    readonly kind: "TypingStart";
    readonly actor: string;
    readonly conversationId: string;
}

/**
 * End typing indicator.
 */
export interface TypingEndOp {
    readonly kind: "TypingEnd";
    readonly actor: string;
    readonly conversationId: string;
}

/**
 * Send a message (from "me" / device owner).
 */
export interface SendMessageOp {
    readonly kind: "SendMessage";
    readonly actor: string;
    readonly text: string;
    readonly conversationId: string;
    readonly meta?: MessageMeta;
}

/**
 * Receive a message (from someone else).
 */
export interface ReceiveMessageOp {
    readonly kind: "ReceiveMessage";
    readonly actor: string;
    readonly text: string;
    readonly conversationId: string;
    readonly meta?: MessageMeta;
}

/**
 * Mark a message as read.
 */
export interface ReadMessageOp {
    readonly kind: "ReadMessage";
    readonly ref: MessageRef;
}

/**
 * Delete a message.
 */
export interface DeleteMessageOp {
    readonly kind: "DeleteMessage";
    readonly ref: MessageRef;
}

/**
 * Concurrent operations across multiple tracks.
 * Compiler forks cursor per track, compiles each independently,
 * then joins at max(trackEnds).
 */
export interface ConcurrentOp {
    readonly kind: "Concurrent";
    readonly tracks: SceneOp[][];
}

// =============================================================================
// POV OPERATIONS (STORY GRAMMAR)
// =============================================================================

/**
 * Switch point of view to a device.
 */
export interface POVSwitchOp {
    readonly kind: "POVSwitch";
    readonly deviceId: string;
    readonly transition?: "cut" | "crossfade" | "wipe";
}

/**
 * Split POV - show multiple devices simultaneously.
 */
export interface SplitPOVOp {
    readonly kind: "SplitPOV";
    readonly devices: string[];
    readonly layout: POVLayout;
}

// =============================================================================
// RESERVED SIGNAL OPERATIONS (FUTURE-PROOFING)
// =============================================================================

/**
 * Reaction added to a message (❤️ 😂 😡).
 */
export interface ReactionAddedOp {
    readonly kind: "ReactionAdded";
    readonly ref: MessageRef;
    readonly actor: string;
    readonly emoji: string;
}

/**
 * Voice note sent.
 */
export interface VoiceNoteSentOp {
    readonly kind: "VoiceNoteSent";
    readonly actor: string;
    readonly conversationId: string;
    readonly durationMs: number;
}

/**
 * Voice note received.
 */
export interface VoiceNoteReceivedOp {
    readonly kind: "VoiceNoteReceived";
    readonly actor: string;
    readonly conversationId: string;
    readonly durationMs: number;
}

/**
 * Missed call.
 */
export interface MissedCallOp {
    readonly kind: "MissedCall";
    readonly actor: string;
    readonly conversationId: string;
    readonly callType?: "voice" | "video";
}

/**
 * Online status changed.
 */
export interface OnlineStatusChangedOp {
    readonly kind: "OnlineStatusChanged";
    readonly actor: string;
    readonly status: "online" | "offline" | "typing" | "last_seen";
}

/**
 * Screenshot taken (drama alert!).
 */
export interface ScreenshotTakenOp {
    readonly kind: "ScreenshotTaken";
    readonly conversationId: string;
}

/**
 * User blocked.
 */
export interface BlockedUserOp {
    readonly kind: "BlockedUser";
    readonly actor: string;
}

/**
 * Union of all scene operations.
 */
export type SceneOp =
    // Core operations
    | WaitOp
    | TypingStartOp
    | TypingEndOp
    | SendMessageOp
    | ReceiveMessageOp
    | ReadMessageOp
    | DeleteMessageOp
    | ConcurrentOp
    // POV operations
    | POVSwitchOp
    | SplitPOVOp
    // Reserved signals
    | ReactionAddedOp
    | VoiceNoteSentOp
    | VoiceNoteReceivedOp
    | MissedCallOp
    | OnlineStatusChangedOp
    | ScreenshotTakenOp
    | BlockedUserOp;

// =============================================================================
// SCENE (TOP LEVEL)
// =============================================================================

/**
 * A beat is a named group of operations.
 * Used for semantic grouping, story rhythm, and debugging.
 */
export interface Beat {
    readonly name: string;
    readonly ops: SceneOp[];
    /** Optional rhythm/semantic metadata */
    readonly meta?: BeatMeta;
}

/**
 * A device context within a scene.
 */
export interface DeviceScene {
    readonly deviceId: string;
    readonly profileId: string;
    readonly appId: string;
    readonly conversations: ConversationDef[];
    readonly beats: Beat[];
}


/**
 * Conversation definition.
 */
export interface ConversationDef {
    readonly id: string;
    readonly name?: string;
    readonly avatar?: string;
    readonly type?: "dm" | "group";
}

/**
 * Complete scene IR for an episode.
 */
export interface SceneIR {
    readonly episodeId: string;
    readonly meta: EpisodeMeta;
    readonly devices: DeviceScene[];
}

/**
 * Episode metadata with semantic configuration.
 * Extends EpisodeConfig with required fields.
 */
export interface EpisodeMeta extends EpisodeConfig {
    /** Frames per second (required) */
    readonly fps: number;

    /** Duration hint (calculated if not specified) */
    readonly durationInFrames?: number;
}
