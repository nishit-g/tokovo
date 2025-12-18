/**
 * WhatsApp Types - Barrel Export
 * 
 * Re-exports all type definitions for the WhatsApp plugin.
 */

// Messages
export type {
    WhatsAppMessageType,
    BaseMessage,
    TextMessage,
    ImageMessage,
    VideoMessage,
    VoiceMessage,
    GifMessage,
    SystemMessage,
    DeletedMessage,
    MessageData,
    WhatsAppReaction,
    ReplyToData,
    LinkPreviewData,
    WhatsAppMessage,
} from "./messages";

// Conversation
export type {
    WhatsAppGroupMember,
    WhatsAppConversation,
} from "./conversation";

// State
export type {
    WhatsAppState,
} from "./state";
export {
    asWhatsAppConversations,
    asWhatsAppState,
} from "./state";

// Events
export {
    WHATSAPP_EVENT_TYPES,
    GROUP_EVENT_TYPES,
} from "./events";
export type {
    WhatsAppEventType,
    GroupEventType,
} from "./events";
