/**
 * Canonical Runtime Events
 *
 * Unified event schema that ALL apps consume.
 *
 * KEY DESIGN DECISIONS:
 * 1. Events carry `fromId: ActorId` (not full ActorRef) - lightweight, good for hashing
 * 2. Trace is REQUIRED on all events - enables debugging and determinism
 * 3. Discriminated union per event type - TypeScript enforces required fields
 * 4. Feed/Story events are first-class - not just messaging apps
 *
 * @module @tokovo/core/canonical/events
 */

import type { CanonicalContent, SystemMessageType } from "./content";
import type { ActorId } from "./identity";

// =============================================================================
// TRACE (Required on ALL events)
// =============================================================================

/**
 * Trace information for debugging and determinism.
 *
 * Every canonical event MUST carry trace.
 * This enables:
 * - Source mapping (find the DSL line that produced this event)
 * - Deterministic ordering (opIndex is part of sort key)
 * - Visual debugging (highlight source beat on hover)
 */
export interface CanonicalTrace {
    /** Episode ID */
    readonly episodeId: string;
    /** Device ID */
    readonly deviceId: string;
    /** Beat name */
    readonly beatName: string;
    /** Operation index within the beat */
    readonly opIndex: number;
    /** Conversation ID (if applicable) */
    readonly conversationId?: string;
}

/**
 * Create a trace object.
 */
export function createTrace(
    episodeId: string,
    deviceId: string,
    beatName: string,
    opIndex: number,
    conversationId?: string
): CanonicalTrace {
    return { episodeId, deviceId, beatName, opIndex, conversationId };
}

// =============================================================================
// BASE EVENT
// =============================================================================

/**
 * Base interface for all canonical events.
 */
interface BaseEvent {
    /** Frame number when this event occurs */
    readonly at: number;
    /** Trace for debugging (REQUIRED) */
    readonly trace: CanonicalTrace;
}

// =============================================================================
// MESSAGE META
// =============================================================================

/**
 * Semantic metadata for AI/camera systems.
 */
export interface SemanticMeta {
    readonly mood?: "tense" | "sad" | "angry" | "excited" | "confused" | "neutral" | "romantic" | "suspicious";
    readonly intensity?: number; // 0-1
    readonly urgency?: number; // 0-1
    readonly secrecy?: "low" | "medium" | "high";
    readonly subtext?: string;
    readonly tags?: ReadonlyArray<string>;
}

/**
 * Message metadata.
 */
export interface MessageMeta {
    /** Message ID (deterministic, required) */
    readonly id: string;
    /** Delivery status */
    readonly status: "sending" | "sent" | "delivered" | "read" | "failed";
    /** Display timestamp (e.g., "2:34 PM") */
    readonly timestamp?: string;
    /** Whether message was edited */
    readonly edited?: boolean;
    /** Reactions on this message */
    readonly reactions?: ReadonlyArray<{
        emoji: string;
        count: number;
        fromMe?: boolean;
    }>;
    /** Reply context */
    readonly replyTo?: {
        messageId: string;
        text: string;
        fromId: ActorId;
        contentKind?: CanonicalContent["kind"];
    };
    /** Semantic annotations for AI/camera */
    readonly semantic?: SemanticMeta;
}

// =============================================================================
// MESSAGING EVENTS
// =============================================================================

/**
 * MESSAGE event - unified send/receive.
 *
 * Replaces: MESSAGE_RECEIVED, MESSAGE_SENT
 *
 * @example
 * ```ts
 * const msg: MessageEvent = {
 *   at: 60,
 *   kind: "APP",
 *   type: "MESSAGE",
 *   appId: "app_whatsapp",
 *   conversationId: "dm_alex",
 *   direction: "in",
 *   fromId: "actor_alex",
 *   content: { kind: "text", text: "Hey!" },
 *   meta: { id: "msg_1", status: "delivered" },
 *   trace: { ... }
 * };
 * ```
 */
export interface MessageEvent extends BaseEvent {
    readonly kind: "APP";
    readonly type: "MESSAGE";
    readonly appId: string;
    readonly conversationId: string;
    /** Direction: "in" = received, "out" = sent */
    readonly direction: "in" | "out";
    /** Actor ID (resolve to ActorRef via registry) */
    readonly fromId: ActorId;
    /** Message content */
    readonly content: CanonicalContent;
    /** Message metadata */
    readonly meta: MessageMeta;
}

/**
 * TYPING event - unified start/end.
 *
 * Replaces: TYPING_START, TYPING_END
 */
export interface TypingEvent extends BaseEvent {
    readonly kind: "APP";
    readonly type: "TYPING";
    readonly appId: string;
    readonly conversationId: string;
    /** Who is typing */
    readonly fromId: ActorId;
    /** Typing state */
    readonly state: "start" | "end";
}

/**
 * READ event - read receipt.
 */
export interface ReadEvent extends BaseEvent {
    readonly kind: "APP";
    readonly type: "READ";
    readonly appId: string;
    readonly conversationId: string;
    /** ID of the message that was read */
    readonly messageId: string;
    /** Who read the message (optional, for group chats) */
    readonly byId?: ActorId;
}

/**
 * REACTION event - emoji reaction on message/post.
 */
export interface ReactionEvent extends BaseEvent {
    readonly kind: "APP";
    readonly type: "REACTION";
    readonly appId: string;
    /** Conversation ID (for chat reactions) */
    readonly conversationId?: string;
    /** Message ID (for chat reactions) */
    readonly messageId?: string;
    /** Post ID (for feed reactions) */
    readonly postId?: string;
    /** Reaction emoji */
    readonly emoji: string;
    /** Whether the reaction is from me */
    readonly fromMe: boolean;
    /** Add or remove the reaction */
    readonly action: "add" | "remove";
}

// =============================================================================
// NAVIGATION EVENTS
// =============================================================================

/**
 * Screen types for navigation.
 */
export type ScreenType =
    | "home"
    | "chat"
    | "chatList"
    | "feed"
    | "profile"
    | "explore"
    | "notifications"
    | "settings"
    | "compose"
    | "stories"
    | "reels"
    | "search"
    | "thread"
    | "calls";

/**
 * Navigation target.
 */
export interface NavigateTarget {
    readonly screen: ScreenType;
    readonly conversationId?: string;
    readonly postId?: string;
    readonly userId?: string;
    readonly storyId?: string;
}

/**
 * NAVIGATE event - screen navigation.
 *
 * Replaces: SCREEN_CHANGE, CUSTOM navigate, etc.
 */
export interface NavigateEvent extends BaseEvent {
    readonly kind: "APP";
    readonly type: "NAVIGATE";
    readonly appId: string;
    readonly target: NavigateTarget;
    readonly transition?: "push" | "pop" | "present" | "dismiss" | "fade" | "none";
}

// =============================================================================
// FEED EVENTS
// =============================================================================

/**
 * Feed item author.
 */
export interface FeedAuthor {
    readonly id: ActorId;
    readonly name: string;
    readonly handle: string;
    readonly avatarUrl?: string;
    readonly verified?: "blue" | "gold" | "grey" | false;
}

/**
 * Feed item stats.
 */
export interface FeedStats {
    readonly likes: number;
    readonly reposts: number;
    readonly replies: number;
    readonly views?: number;
    readonly bookmarks?: number;
}

/**
 * Feed item types.
 */
export type FeedItemType = "post" | "repost" | "quote" | "reply" | "ad";

/**
 * Feed item data.
 */
export interface FeedItem {
    readonly id: string;
    readonly author: FeedAuthor;
    readonly content: CanonicalContent;
    readonly itemType: FeedItemType;
    readonly stats: FeedStats;
    /** Quoted item (for quote tweets) */
    readonly quotedItem?: FeedItem;
    /** Parent ID (for replies) */
    readonly replyToId?: string;
    /** Creation timestamp */
    readonly createdAt?: string;
}

/**
 * FEED_ITEM event - tweet, post, reel appears.
 */
export interface FeedItemEvent extends BaseEvent {
    readonly kind: "APP";
    readonly type: "FEED_ITEM";
    readonly appId: string;
    /** Feed ID (e.g., "__main_feed__", "__for_you__") */
    readonly feedId: string;
    readonly item: FeedItem;
}

/**
 * FEED_SCROLL event - scroll position change.
 */
export interface FeedScrollEvent extends BaseEvent {
    readonly kind: "APP";
    readonly type: "FEED_SCROLL";
    readonly appId: string;
    readonly feedId: string;
    /** Scroll position (0-1 normalized) */
    readonly position: number;
    /** Scroll velocity (optional) */
    readonly velocity?: number;
}

/**
 * Feed action types.
 */
export type FeedActionType = "like" | "unlike" | "repost" | "unrepost" | "bookmark" | "unbookmark";

/**
 * FEED_ACTION event - like, repost, bookmark.
 */
export interface FeedActionEvent extends BaseEvent {
    readonly kind: "APP";
    readonly type: "FEED_ACTION";
    readonly appId: string;
    readonly postId: string;
    readonly action: FeedActionType;
}

/**
 * COMMENT event - comment on a post.
 */
export interface CommentEvent extends BaseEvent {
    readonly kind: "APP";
    readonly type: "COMMENT";
    readonly appId: string;
    readonly postId: string;
    readonly direction: "in" | "out";
    readonly fromId: ActorId;
    readonly content: CanonicalContent;
    readonly meta: {
        readonly id: string;
        readonly replyToCommentId?: string;
        readonly likes?: number;
    };
}

// =============================================================================
// STORY EVENTS
// =============================================================================

/**
 * Story item data.
 */
export interface StoryItem {
    readonly id: string;
    readonly content: CanonicalContent;
    /** Auto-advance duration in seconds */
    readonly duration?: number;
    /** Creation timestamp */
    readonly createdAt?: number;
}

/**
 * STORY_ITEM event - story appears.
 */
export interface StoryItemEvent extends BaseEvent {
    readonly kind: "APP";
    readonly type: "STORY_ITEM";
    readonly appId: string;
    readonly storyId: string;
    readonly authorId: ActorId;
    readonly item: StoryItem;
    readonly seen?: boolean;
}

/**
 * Story view action types.
 */
export type StoryViewAction = "view" | "reply" | "react" | "skip" | "exit";

/**
 * STORY_VIEW event - view/interact with story.
 */
export interface StoryViewEvent extends BaseEvent {
    readonly kind: "APP";
    readonly type: "STORY_VIEW";
    readonly appId: string;
    readonly storyId: string;
    readonly action: StoryViewAction;
    readonly emoji?: string; // For react
    readonly replyText?: string; // For reply
}

// =============================================================================
// SOCIAL EVENTS
// =============================================================================

/**
 * Social action types.
 */
export type SocialActionType = "follow" | "unfollow" | "block" | "unblock" | "mute" | "unmute";

/**
 * SOCIAL event - follow, block, mute.
 */
export interface SocialEvent extends BaseEvent {
    readonly kind: "APP";
    readonly type: "SOCIAL";
    readonly appId: string;
    readonly action: SocialActionType;
    readonly targetUserId: ActorId;
}

// =============================================================================
// CUSTOM EVENT (Escape Hatch)
// =============================================================================

/**
 * CUSTOM event - for truly app-specific features.
 *
 * RULES:
 * 1. Name MUST be namespaced: "app_instagram.story_poll"
 * 2. Should be RARE - if you use CUSTOM frequently, add a canonical type
 * 3. Plugins define allowedCustomEvents in their schema
 */
export interface CustomEvent extends BaseEvent {
    readonly kind: "APP";
    readonly type: "CUSTOM";
    readonly appId: string;
    /** Namespaced event name (e.g., "app_instagram.story_poll") */
    readonly name: string;
    /** Event payload */
    readonly payload: Record<string, unknown>;
}

// =============================================================================
// APP EVENT UNION
// =============================================================================

/**
 * Union of all APP events.
 */
export type AppRuntimeEvent =
    // Messaging
    | MessageEvent
    | TypingEvent
    | ReadEvent
    | ReactionEvent
    // Navigation
    | NavigateEvent
    // Feed
    | FeedItemEvent
    | FeedScrollEvent
    | FeedActionEvent
    | CommentEvent
    // Stories
    | StoryItemEvent
    | StoryViewEvent
    // Social
    | SocialEvent
    // Escape hatch
    | CustomEvent;

/**
 * All APP event types.
 */
export type AppEventType = AppRuntimeEvent["type"];

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isMessageEvent(e: AppRuntimeEvent): e is MessageEvent {
    return e.type === "MESSAGE";
}

export function isTypingEvent(e: AppRuntimeEvent): e is TypingEvent {
    return e.type === "TYPING";
}

export function isReadEvent(e: AppRuntimeEvent): e is ReadEvent {
    return e.type === "READ";
}

export function isReactionEvent(e: AppRuntimeEvent): e is ReactionEvent {
    return e.type === "REACTION";
}

export function isNavigateEvent(e: AppRuntimeEvent): e is NavigateEvent {
    return e.type === "NAVIGATE";
}

export function isFeedItemEvent(e: AppRuntimeEvent): e is FeedItemEvent {
    return e.type === "FEED_ITEM";
}

export function isFeedActionEvent(e: AppRuntimeEvent): e is FeedActionEvent {
    return e.type === "FEED_ACTION";
}

export function isStoryItemEvent(e: AppRuntimeEvent): e is StoryItemEvent {
    return e.type === "STORY_ITEM";
}

export function isStoryViewEvent(e: AppRuntimeEvent): e is StoryViewEvent {
    return e.type === "STORY_VIEW";
}

export function isCustomEvent(e: AppRuntimeEvent): e is CustomEvent {
    return e.type === "CUSTOM";
}
