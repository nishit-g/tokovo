/**
 * WhatsApp Message Types
 * 
 * All message-related type definitions.
 */

// =============================================================================
// MESSAGE TYPE ENUM
// =============================================================================

export type WhatsAppMessageType =
    | "text"
    | "image"
    | "video"
    | "voice"
    | "system"
    | "gif"
    | "deleted"
    | "call_missed"
    | "screenshot_alert";

// =============================================================================
// BASE MESSAGE
// =============================================================================

export interface BaseMessage {
    id: string;
    from: string;
    timestamp?: string;
    status?: "sending" | "sent" | "delivered" | "read";
    at?: number;
    /** Reactions (tapbacks) on this message */
    reactions?: WhatsAppReaction[];
    /** Reply-to reference if this message is a reply */
    replyTo?: ReplyToData;
}

// =============================================================================
// SPECIFIC MESSAGE TYPES
// =============================================================================

export interface TextMessage extends BaseMessage {
    type: "text";
    text: string;
}

export interface ImageMessage extends BaseMessage {
    type: "image";
    imageUrl: string;
    caption?: string;
}

export interface VideoMessage extends BaseMessage {
    type: "video";
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: number;
    caption?: string;
    isPlaying?: boolean;
    playProgress?: number;
}

export interface VoiceMessage extends BaseMessage {
    type: "voice";
    duration: number;
    isPlaying?: boolean;
    playProgress?: number;
}

export interface GifMessage extends BaseMessage {
    type: "gif";
    gifUrl: string;
}

export interface SystemMessage extends BaseMessage {
    type: "system";
    text: string;
    systemType?: "member_added" | "member_removed" | "admin_change" | "group_created" | "group_name_changed" | "date_change";
    targetMember?: string;
    actorName?: string;
}

export interface DeletedMessage extends BaseMessage {
    type: "deleted";
}

// =============================================================================
// DISCRIMINATED UNION
// =============================================================================

export type MessageData =
    | TextMessage
    | ImageMessage
    | VideoMessage
    | VoiceMessage
    | GifMessage
    | SystemMessage
    | DeletedMessage;

// =============================================================================
// REACTION & REPLY TYPES
// =============================================================================

export interface WhatsAppReaction {
    emoji: string;
    count: number;
    fromMe?: boolean;
}

export interface ReplyToData {
    messageId: string;
    text: string;
    from: string;
    type?: "text" | "image" | "video" | "voice";
    thumbnailUrl?: string;
}

export interface LinkPreviewData {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
}

// =============================================================================
// EXTENDED MESSAGE (with reactions, replies)
// =============================================================================

export interface WhatsAppMessage extends BaseMessage {
    type: WhatsAppMessageType;
    text?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    gifUrl?: string;
    caption?: string;
    duration?: number;
    isPlaying?: boolean;
    playProgress?: number;
    edited?: boolean;
    systemType?: string;
    targetMember?: string;
    actorName?: string;
    reactions?: WhatsAppReaction[];
    replyTo?: ReplyToData;
    linkPreview?: LinkPreviewData;
}
