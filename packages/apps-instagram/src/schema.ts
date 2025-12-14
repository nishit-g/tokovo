/**
 * Instagram Schema
 *
 * Defines the canonical schema for Instagram plugin.
 *
 * @module @tokovo/apps-instagram/schema
 */

export const INSTAGRAM_SCHEMA = {
    id: "app_instagram",
    name: "Instagram",
    version: "2.0.0",

    contentKinds: [
        "text",
        "image",
        "video",
        "gif",
        "voice",
        "sticker",
        "link",
        "system",
    ] as const,

    eventTypes: [
        "MESSAGE",
        "TYPING",
        "NAVIGATE",
        "STORY_ITEM",
        "STORY_VIEW",
        "FEED_ITEM",
        "FEED_ACTION",
        "SOCIAL",
    ] as const,

    legacyEventTypes: [
        "MESSAGE_RECEIVED",
        "TYPING_START",
        "TYPING_END",
        "CUSTOM",
    ] as const,

    feedIds: ["__explore__", "__home__", "__reels__"] as const,

    capabilities: [
        "messaging",
        "typing",
        "voice",
        "video",
        "stickers",
        "stories",
        "feed",
        "navigation",
        "notifications",
    ] as const,

    limits: {
        maxTextLength: 2200,
        maxCaptionLength: 2200,
        maxReactions: 1,
    },

    allowedCustomEvents: [
        "app_instagram.story_reply",
        "app_instagram.story_reaction",
        "app_instagram.reel_view",
        "app_instagram.share_to_story",
    ] as const,
} as const;

export type InstagramSchema = typeof INSTAGRAM_SCHEMA;

export const INSTAGRAM_EVENT_MAP = {
    MESSAGE_RECEIVED: "MESSAGE",
    TYPING_START: "TYPING",
    TYPING_END: "TYPING",
    CUSTOM: "CUSTOM",
} as const;
