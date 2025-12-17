/**
 * WhatsApp Plugin Types
 * 
 * All app-specific types are defined here.
 * Core has been cleaned of app-specific bloatware.
 */

// =============================================================================
// MESSAGE TYPES
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

export interface BaseMessage {
    id: string;
    from: string;
    timestamp?: string;
    status?: "sending" | "sent" | "delivered" | "read";
    at?: number;
}

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

// =============================================================================
// GROUP MEMBER
// =============================================================================

export interface WhatsAppGroupMember {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
    colorIndex?: number;
}

// =============================================================================
// CONVERSATION STATE
// =============================================================================

export interface WhatsAppConversation {
    id: string;
    type?: "dm" | "group";
    name?: string;
    avatar?: string;
    members?: WhatsAppGroupMember[];
    admins?: string[];
    messages: WhatsAppMessage[];
    unreadCount?: number;
    typing?: Record<string, boolean>;
    draftText?: string;
}

// =============================================================================
// APP STATE
// =============================================================================

export interface WhatsAppState {
    conversationId?: string;
    screen?: string;
    viewMode?: "CHAT" | "LIST" | "TRANSITION";
}

// =============================================================================
// WORLD STATE HELPERS
// =============================================================================

/**
 * Cast WorldState.conversations to WhatsApp conversations.
 */
export function asWhatsAppConversations(
    conversations: Record<string, unknown>
): Record<string, WhatsAppConversation> {
    return conversations as Record<string, WhatsAppConversation>;
}

/**
 * Cast WorldState.appState.app_whatsapp to WhatsAppState.
 */
export function asWhatsAppState(
    appState: Record<string, unknown>
): WhatsAppState | undefined {
    return (appState?.app_whatsapp || appState?.whatsapp) as WhatsAppState | undefined;
}
