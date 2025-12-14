/**
 * Canonical Adapter
 *
 * Bridges between existing Tokovo types and canonical types.
 * Use this for gradual migration - apps can start using canonical
 * event shapes while the rest of the system catches up.
 *
 * MIGRATION PATH:
 * 1. Use adapter to convert legacy events → canonical events
 * 2. Write new code against canonical types
 * 3. Eventually remove adapter when all code migrated
 *
 * @module @tokovo/core/canonical/adapter
 */

import type { TimelineEvent, Message, ConversationState } from "../types";
import type {
    CanonicalContent,
    TextContent,
    ImageContent,
    VideoContent,
    VoiceContent,
    SystemContent,
} from "./content";
import type { ActorId } from "./identity";
import type { CanonicalTrace } from "./events";
import type { CanonicalMessage, CanonicalConversationBase } from "./state";
import { createTrace } from "./events";

// =============================================================================
// CANONICAL EVENT SHAPES (standalone, for adapter use)
// =============================================================================

/**
 * Canonical MESSAGE event (for adapter use).
 */
export interface AdapterMessageEvent {
    kind: "APP";
    type: "MESSAGE";
    at: number;
    trace: CanonicalTrace;
    conversationId: string;
    fromId: ActorId;
    content: CanonicalContent;
}

/**
 * Canonical TYPING event (for adapter use).
 */
export interface AdapterTypingEvent {
    kind: "APP";
    type: "TYPING";
    at: number;
    trace: CanonicalTrace;
    conversationId: string;
    fromId: ActorId;
    isTyping: boolean;
}

/**
 * Canonical NAVIGATE event (for adapter use).
 */
export interface AdapterNavigateEvent {
    kind: "APP";
    type: "NAVIGATE";
    at: number;
    trace: CanonicalTrace;
    screen: string;
    conversationId?: string;
}

/**
 * Union of all adapter event types.
 */
export type AdapterEvent = AdapterMessageEvent | AdapterTypingEvent | AdapterNavigateEvent;

// =============================================================================
// LEGACY → CANONICAL CONVERSION
// =============================================================================

/**
 * Convert legacy TimelineEvent to canonical event shape.
 */
export function legacyEventToCanonical(
    event: TimelineEvent,
    episodeId: string,
    deviceId: string,
    beatName: string,
    opIndex: number
): AdapterEvent | null {
    if (event.kind !== "APP") {
        return null;
    }

    const trace: CanonicalTrace = createTrace(episodeId, deviceId, beatName, opIndex);

    // Cast to access extended properties
    const appEvent = event as unknown as {
        type: string;
        at: number;
        conversationId?: string;
        from?: string;
        text?: string;
        message?: Record<string, unknown>;
        screen?: string;
    };

    switch (appEvent.type) {
        case "MESSAGE_RECEIVED":
        case "MESSAGE_SENT": {
            const content = legacyMessageToContent(appEvent);
            return {
                kind: "APP",
                type: "MESSAGE",
                at: event.at,
                trace,
                conversationId: appEvent.conversationId ?? "",
                fromId: appEvent.type === "MESSAGE_SENT" ? "__me__" : (appEvent.from ?? "unknown"),
                content,
            };
        }

        case "TYPING_START":
        case "TYPING_END": {
            return {
                kind: "APP",
                type: "TYPING",
                at: event.at,
                trace,
                conversationId: appEvent.conversationId ?? "",
                fromId: appEvent.from ?? "unknown",
                isTyping: appEvent.type === "TYPING_START",
            };
        }

        case "SCREEN_NAVIGATED":
        case "NAVIGATE": {
            return {
                kind: "APP",
                type: "NAVIGATE",
                at: event.at,
                trace,
                screen: appEvent.screen ?? "chat",
                conversationId: appEvent.conversationId,
            };
        }

        default:
            return null;
    }
}

/**
 * Extract content from legacy message payload.
 */
export function legacyMessageToContent(
    event: { message?: Record<string, unknown>; text?: string }
): CanonicalContent {
    const msg = event.message ?? {};
    const type = (msg.type as string) ?? "text";

    switch (type) {
        case "text":
            return {
                kind: "text",
                text: (event.text ?? msg.text ?? "") as string,
            } as TextContent;

        case "image":
            return {
                kind: "image",
                url: (msg.imageUrl ?? "") as string,
                caption: msg.caption as string | undefined,
            } as ImageContent;

        case "video":
            return {
                kind: "video",
                url: (msg.videoUrl ?? "") as string,
                thumbnailUrl: (msg.thumbnailUrl ?? msg.videoUrl ?? "") as string,
                duration: (msg.duration ?? 0) as number,
                caption: msg.caption as string | undefined,
            } as VideoContent;

        case "voice":
            return {
                kind: "voice",
                duration: (msg.duration ?? 0) as number,
                url: msg.voiceUrl as string | undefined,
            } as VoiceContent;

        case "system":
            return {
                kind: "system",
                systemType: (msg.systemType ?? "encryption_notice") as SystemContent["systemType"],
                text: msg.text as string | undefined,
            } as SystemContent;

        default:
            return {
                kind: "text",
                text: (event.text ?? msg.text ?? "") as string,
            } as TextContent;
    }
}

// =============================================================================
// CANONICAL → LEGACY CONVERSION
// =============================================================================

/**
 * Convert canonical event back to legacy TimelineEvent.
 */
export function canonicalToLegacyEvent(
    event: AdapterEvent,
    appId: string
): TimelineEvent {
    const base = {
        kind: "APP" as const,
        at: event.at,
        appId,
    };

    switch (event.type) {
        case "MESSAGE": {
            const isFromMe = event.fromId === "__me__";
            return {
                ...base,
                type: isFromMe ? "MESSAGE_SENT" : "MESSAGE_RECEIVED",
                conversationId: event.conversationId,
                from: event.fromId,
                text: event.content.kind === "text" ? event.content.text : undefined,
                message: canonicalContentToLegacy(event.content),
            } as unknown as TimelineEvent;
        }

        case "TYPING": {
            return {
                ...base,
                type: event.isTyping ? "TYPING_START" : "TYPING_END",
                conversationId: event.conversationId,
                from: event.fromId,
            } as unknown as TimelineEvent;
        }

        case "NAVIGATE": {
            return {
                ...base,
                type: "NAVIGATE",
                screen: event.screen,
                conversationId: event.conversationId,
            } as unknown as TimelineEvent;
        }

        default:
            return base as unknown as TimelineEvent;
    }
}

/**
 * Convert canonical content to legacy message format.
 */
export function canonicalContentToLegacy(content: CanonicalContent): Record<string, unknown> {
    switch (content.kind) {
        case "text":
            return { type: "text", text: content.text };
        case "image":
            return { type: "image", imageUrl: content.url, caption: content.caption };
        case "video":
            return {
                type: "video",
                videoUrl: content.url,
                thumbnailUrl: content.thumbnailUrl,
                duration: content.duration,
                caption: content.caption,
            };
        case "voice":
            return { type: "voice", duration: content.duration, voiceUrl: content.url };
        case "system":
            return { type: "system", systemType: content.systemType, text: content.text };
        default:
            return { type: content.kind };
    }
}

// =============================================================================
// STATE CONVERSION
// =============================================================================

/**
 * Convert legacy Message to CanonicalMessage.
 */
export function legacyMessageToCanonical(
    msg: Message,
    fromId: ActorId
): CanonicalMessage {
    return {
        id: msg.id,
        fromId,
        content: {
            kind: "text",
            text: msg.text ?? "",
        } as TextContent,
        direction: msg.from === "me" ? "out" : "in",
        status: (msg.status as CanonicalMessage["status"]) ?? "delivered",
        at: msg.at ?? 0,
    };
}

/**
 * Convert CanonicalMessage to legacy Message.
 */
export function canonicalMessageToLegacy(msg: CanonicalMessage): Message {
    return {
        id: msg.id,
        from: msg.direction === "out" ? "me" : msg.fromId,
        text: msg.content.kind === "text" ? msg.content.text : undefined,
        at: msg.at,
        status: msg.status,
        type: msg.content.kind,
    } as Message;
}

/**
 * Convert legacy ConversationState to CanonicalConversationBase.
 */
export function legacyConversationToCanonical(
    conv: ConversationState,
    actorLookup: (id: string) => ActorId
): CanonicalConversationBase {
    return {
        id: conv.id,
        name: conv.name ?? conv.id,
        avatarUrl: (conv as unknown as { avatar?: string }).avatar,
        messages: conv.messages.map(msg => legacyMessageToCanonical(msg, actorLookup(msg.from))),
    };
}

// =============================================================================
// SCHEMA DEFINITIONS (for gradual adoption)
// =============================================================================

/**
 * WhatsApp schema (reference).
 */
export const WHATSAPP_SCHEMA = {
    id: "app_whatsapp",
    contentKinds: ["text", "image", "video", "gif", "voice", "sticker", "location", "contact", "file", "system", "deleted"],
    eventTypes: ["MESSAGE", "TYPING", "READ", "REACTION", "NAVIGATE"],
    systemTypes: ["encryption_notice", "member_added", "member_removed", "group_created", "call_missed", "call_ended"],
    capabilities: ["messaging", "typing", "read_receipts", "reactions", "voice", "video", "stickers", "location", "contacts", "groups", "calls"],
} as const;

/**
 * Instagram schema (reference).
 */
export const INSTAGRAM_SCHEMA = {
    id: "app_instagram",
    contentKinds: ["text", "image", "video", "gif", "voice", "sticker", "link", "system"],
    eventTypes: ["MESSAGE", "TYPING", "NAVIGATE", "STORY_ITEM", "STORY_VIEW", "FEED_ITEM", "FEED_ACTION"],
    capabilities: ["messaging", "typing", "voice", "video", "stickers", "stories", "feed"],
} as const;

/**
 * Twitter schema (reference).
 */
export const TWITTER_SCHEMA = {
    id: "app_twitter",
    contentKinds: ["text", "image", "video", "gif", "link"],
    eventTypes: ["MESSAGE", "NAVIGATE", "FEED_ITEM", "FEED_SCROLL", "FEED_ACTION", "COMMENT"],
    feedIds: ["__main_feed__", "__following__"],
    capabilities: ["messaging", "feed"],
} as const;

// =============================================================================
// MIGRATION HELPERS
// =============================================================================

/**
 * Check if an event is using canonical format.
 */
export function isCanonicalEvent(event: unknown): event is AdapterEvent {
    return (
        typeof event === "object" &&
        event !== null &&
        "trace" in event &&
        typeof (event as Record<string, unknown>).trace === "object"
    );
}

/**
 * Ensure event has trace (add if missing).
 */
export function ensureTrace(
    event: TimelineEvent,
    episodeId: string,
    deviceId: string,
    beatName: string,
    opIndex: number
): TimelineEvent & { trace: CanonicalTrace } {
    if ("trace" in event && event.trace) {
        return event as TimelineEvent & { trace: CanonicalTrace };
    }

    return {
        ...event,
        trace: createTrace(episodeId, deviceId, beatName, opIndex),
    } as TimelineEvent & { trace: CanonicalTrace };
}

/**
 * Wrapper for gradual reducer migration.
 * Converts incoming legacy events to canonical format.
 */
export function withCanonicalAdapter<TState>(
    reducer: (state: TState, event: AdapterEvent) => TState,
    episodeId: string,
    deviceId: string
): (state: TState, event: TimelineEvent, beatName?: string, opIndex?: number) => TState {
    return (state, event, beatName = "unknown", opIndex = 0) => {
        const canonical = legacyEventToCanonical(event, episodeId, deviceId, beatName, opIndex);
        if (!canonical) {
            return state;
        }
        return reducer(state, canonical);
    };
}
