/**
 * WhatsApp Schema
 *
 * Defines the canonical schema for WhatsApp plugin.
 * This is a reference for migration - maps legacy events to canonical.
 *
 * @module @tokovo/apps-whatsapp/schema
 */

/**
 * WhatsApp plugin schema.
 */
export const WHATSAPP_SCHEMA = {
    id: "app_whatsapp",
    name: "WhatsApp",
    version: "2.0.0",

    // Supported content types
    contentKinds: [
        "text",
        "image",
        "video",
        "gif",
        "voice",
        "sticker",
        "location",
        "contact",
        "file",
        "system",
        "deleted",
    ] as const,

    // Canonical event types this plugin handles
    eventTypes: [
        "MESSAGE",
        "TYPING",
        "READ",
        "REACTION",
        "NAVIGATE",
    ] as const,

    // Legacy event types (for migration mapping)
    legacyEventTypes: [
        "MESSAGE_RECEIVED",
        "MESSAGE_SENT",
        "TYPING_START",
        "TYPING_END",
        "MESSAGE_READ",
        "VOICE_MESSAGE_RECEIVED",
        "VOICE_MESSAGE_PLAY",
        "GROUP_MEMBER_ADDED",
        "GROUP_MEMBER_REMOVED",
        "REACTION_ADDED",
    ] as const,

    // System message types
    systemTypes: [
        "encryption_notice",
        "member_added",
        "member_removed",
        "group_created",
        "call_missed",
        "call_ended",
    ] as const,

    // Plugin capabilities
    capabilities: [
        "messaging",
        "typing",
        "read_receipts",
        "reactions",
        "voice",
        "video",
        "stickers",
        "location",
        "contacts",
        "groups",
        "calls",
        "navigation",
        "notifications",
    ] as const,

    // Content limits
    limits: {
        maxTextLength: 65536,
        maxCaptionLength: 1024,
        maxReactions: 100,
        maxVideoDuration: 180,
    },

    // Allowed custom events (namespaced)
    allowedCustomEvents: [
        "app_whatsapp.voice_play",
        "app_whatsapp.voice_pause",
        "app_whatsapp.voice_seek",
        "app_whatsapp.status_viewed",
    ] as const,
} as const;

/**
 * Type for WhatsApp schema.
 */
export type WhatsAppSchema = typeof WHATSAPP_SCHEMA;

/**
 * Legacy → Canonical event mapping.
 */
export const WHATSAPP_EVENT_MAP = {
    MESSAGE_RECEIVED: "MESSAGE",
    MESSAGE_SENT: "MESSAGE",
    TYPING_START: "TYPING",
    TYPING_END: "TYPING",
    MESSAGE_READ: "READ",
    REACTION_ADDED: "REACTION",
    VOICE_MESSAGE_RECEIVED: "MESSAGE",
    SCREEN_NAVIGATED: "NAVIGATE",
    NAVIGATE: "NAVIGATE",
} as const;
