/**
 * WhatsApp Event Type Constants
 * 
 * Namespaced event types for WhatsApp plugin.
 */

// =============================================================================
// RUNTIME EVENT TYPES
// =============================================================================

export const WHATSAPP_EVENT_TYPES = {
    // Messages
    MESSAGE_RECEIVED: "MESSAGE_RECEIVED",
    MESSAGE_SENT: "MESSAGE_SENT",
    MESSAGE_DELETED: "MESSAGE_DELETED",

    // Typing
    TYPING_START: "TYPING_START",
    TYPING_END: "TYPING_END",

    // Reactions
    REACTION_ADDED: "REACTION_ADDED",
    REACTION_REMOVED: "REACTION_REMOVED",

    // Read receipts
    MESSAGE_READ: "MESSAGE_READ",
    MESSAGE_DELIVERED: "MESSAGE_DELIVERED",

    // Media
    IMAGE_SENT: "IMAGE_SENT",
    IMAGE_RECEIVED: "IMAGE_RECEIVED",
    VIDEO_SENT: "VIDEO_SENT",
    VIDEO_RECEIVED: "VIDEO_RECEIVED",
    VOICE_SENT: "VOICE_SENT",
    VOICE_RECEIVED: "VOICE_RECEIVED",

    // Navigation
    SCREEN_NAVIGATED: "SCREEN_NAVIGATED",
} as const;

export type WhatsAppEventType = typeof WHATSAPP_EVENT_TYPES[keyof typeof WHATSAPP_EVENT_TYPES];

// =============================================================================
// GROUP EVENT TYPES (Namespaced)
// =============================================================================

export const GROUP_EVENT_TYPES = {
    MEMBER_ADDED: "whatsapp.GROUP_MEMBER_ADDED",
    MEMBER_REMOVED: "whatsapp.GROUP_MEMBER_REMOVED",
    ADMIN_CHANGED: "whatsapp.GROUP_ADMIN_CHANGED",
    INFO_UPDATED: "whatsapp.GROUP_INFO_UPDATED",
    CREATED: "whatsapp.GROUP_CREATED",
} as const;

export type GroupEventType = typeof GROUP_EVENT_TYPES[keyof typeof GROUP_EVENT_TYPES];
