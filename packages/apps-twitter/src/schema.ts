/**
 * Twitter Schema
 *
 * Defines the canonical schema for Twitter plugin.
 *
 * @module @tokovo/apps-twitter/schema
 */

export const TWITTER_MAIN_FEED = "__main_feed__";
export const TWITTER_FOLLOWING_FEED = "__following__";

export const TWITTER_SCHEMA = {
    id: "app_twitter",
    name: "X (Twitter)",
    version: "2.0.0",

    contentKinds: [
        "text",
        "image",
        "video",
        "gif",
        "link",
    ] as const,

    eventTypes: [
        "MESSAGE",
        "NAVIGATE",
        "FEED_ITEM",
        "FEED_SCROLL",
        "FEED_ACTION",
        "COMMENT",
        "SOCIAL",
    ] as const,

    legacyEventTypes: [
        "MESSAGE_RECEIVED",
        "MESSAGE_SENT",
        "REACTION_ADDED",
        "SCREEN_NAVIGATED",
        "NAVIGATE",
        "TAB_CHANGED",
        "TYPING_START",
        "TYPING_END",
    ] as const,

    feedIds: [TWITTER_MAIN_FEED, TWITTER_FOLLOWING_FEED] as const,

    capabilities: [
        "messaging",
        "feed",
        "navigation",
        "notifications",
    ] as const,

    limits: {
        maxTextLength: 280,
        maxCaptionLength: 280,
    },

    allowedCustomEvents: [
        "app_twitter.tab_change",
        "app_twitter.scroll_to_top",
        "app_twitter.refresh",
    ] as const,
} as const;

export type TwitterSchema = typeof TWITTER_SCHEMA;

export const TWITTER_EVENT_MAP = {
    MESSAGE_RECEIVED: "FEED_ITEM",
    MESSAGE_SENT: "FEED_ITEM",
    REACTION_ADDED: "FEED_ACTION",
    SCREEN_NAVIGATED: "NAVIGATE",
    NAVIGATE: "NAVIGATE",
    TAB_CHANGED: "NAVIGATE",
} as const;
