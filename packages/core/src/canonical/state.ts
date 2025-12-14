/**
 * Canonical State Primitives
 *
 * Minimal base interfaces for cross-app state.
 * Apps extend these with their own fields.
 *
 * CORE OWNS: Base interfaces (minimal)
 * APPS OWN: Extended state with app-specific logic
 *
 * @module @tokovo/core/canonical/state
 */

import type { ActorId, ActorRef } from "./identity";
import type { CanonicalContent } from "./content";

// =============================================================================
// CANONICAL MESSAGE
// =============================================================================

/**
 * Base message interface.
 * All apps can represent messages with this shape.
 */
export interface CanonicalMessage {
    /** Unique message ID */
    readonly id: string;
    /** Actor who sent the message */
    readonly fromId: ActorId;
    /** Message content */
    readonly content: CanonicalContent;
    /** Direction: in = received, out = sent */
    readonly direction: "in" | "out";
    /** Delivery status */
    readonly status: "sending" | "sent" | "delivered" | "read" | "failed";
    /** Frame when message appeared */
    readonly at: number;
    /** Display timestamp */
    readonly timestamp?: string;
    /** Reactions on this message */
    readonly reactions?: ReadonlyArray<{
        readonly emoji: string;
        readonly count: number;
        readonly fromMe?: boolean;
    }>;
    /** Reply context */
    readonly replyTo?: {
        readonly messageId: string;
        readonly text: string;
        readonly fromId: ActorId;
    };
}

// =============================================================================
// CANONICAL CONVERSATION
// =============================================================================

/**
 * Base conversation state.
 */
export interface CanonicalConversationBase {
    /** Conversation ID */
    readonly id: string;
    /** Display name */
    readonly name: string;
    /** Avatar URL */
    readonly avatarUrl?: string;
    /** Messages in this conversation */
    readonly messages: CanonicalMessage[];
    /** Is this a group conversation */
    readonly isGroup?: boolean;
    /** Unread count */
    readonly unreadCount?: number;
    /** Last message preview */
    readonly lastMessage?: CanonicalMessage;
    /** Typing indicator */
    readonly typing?: {
        readonly isTyping: boolean;
        readonly fromId?: ActorId;
    };
}

// =============================================================================
// CANONICAL FEED
// =============================================================================

/**
 * Feed item author.
 */
export interface FeedItemAuthor {
    readonly id: ActorId;
    readonly name: string;
    readonly handle: string;
    readonly avatarUrl?: string;
    readonly verified?: "blue" | "gold" | "grey" | false;
}

/**
 * Base feed item.
 */
export interface CanonicalFeedItem {
    readonly id: string;
    readonly author: FeedItemAuthor;
    readonly content: CanonicalContent;
    readonly itemType: "post" | "repost" | "quote" | "reply" | "ad";
    readonly likes: number;
    readonly reposts: number;
    readonly replies: number;
    readonly views?: number;
    readonly bookmarks?: number;
    readonly liked?: boolean;
    readonly reposted?: boolean;
    readonly bookmarked?: boolean;
    readonly quotedItem?: CanonicalFeedItem;
    readonly replyToId?: string;
    readonly createdAt?: string;
    readonly at: number;
}

/**
 * Base feed state.
 */
export interface CanonicalFeedBase {
    readonly id: string;
    readonly items: CanonicalFeedItem[];
    readonly scrollPosition?: number;
}

// =============================================================================
// CANONICAL STORY
// =============================================================================

/**
 * Base story item.
 */
export interface CanonicalStoryItem {
    readonly id: string;
    readonly content: CanonicalContent;
    readonly duration: number;
    readonly createdAt?: number;
    readonly seen?: boolean;
}

/**
 * Story ring (user's stories).
 */
export interface CanonicalStoryRing {
    readonly userId: ActorId;
    readonly user: ActorRef;
    readonly items: CanonicalStoryItem[];
    readonly hasUnseenItems: boolean;
}

/**
 * Base story state.
 */
export interface CanonicalStoryBase {
    readonly rings: CanonicalStoryRing[];
    readonly currentRingIndex?: number;
    readonly currentItemIndex?: number;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Create an empty conversation.
 */
export function createEmptyConversation(id: string, name: string): CanonicalConversationBase {
    return {
        id,
        name,
        messages: [],
        unreadCount: 0,
    };
}

/**
 * Create an empty feed.
 */
export function createEmptyFeed(id: string): CanonicalFeedBase {
    return {
        id,
        items: [],
        scrollPosition: 0,
    };
}

/**
 * Create an empty story state.
 */
export function createEmptyStoryState(): CanonicalStoryBase {
    return {
        rings: [],
    };
}

/**
 * Add message to conversation (immutable).
 */
export function addMessageToConversation(
    conversation: CanonicalConversationBase,
    message: CanonicalMessage
): CanonicalConversationBase {
    return {
        ...conversation,
        messages: [...conversation.messages, message],
        lastMessage: message,
        unreadCount: message.direction === "in" ? (conversation.unreadCount ?? 0) + 1 : conversation.unreadCount,
    };
}

/**
 * Add item to feed (immutable).
 */
export function addItemToFeed(
    feed: CanonicalFeedBase,
    item: CanonicalFeedItem
): CanonicalFeedBase {
    return {
        ...feed,
        items: [item, ...feed.items],
    };
}

/**
 * Mark message as read (immutable).
 */
export function markMessageAsRead(
    conversation: CanonicalConversationBase,
    messageId: string
): CanonicalConversationBase {
    return {
        ...conversation,
        messages: conversation.messages.map((m) =>
            m.id === messageId ? { ...m, status: "read" as const } : m
        ),
        unreadCount: Math.max(0, (conversation.unreadCount ?? 0) - 1),
    };
}
