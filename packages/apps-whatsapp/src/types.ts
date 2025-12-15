export type WhatsAppMessageType = "text" | "image" | "video" | "voice" | "system" | "gif";

export interface BaseMessage {
    id: string;
    from: string;
    timestamp?: string; // e.g. "10:42"
    status?: "sent" | "delivered" | "read";
    at?: number; // Timeline frame
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
}

export interface VoiceMessage extends BaseMessage {
    type: "voice";
    duration: number; // seconds
}

export interface SystemMessage extends BaseMessage {
    type: "system";
    text: string;
    systemType?: "member_added" | "member_removed" | "date_change";
}

export type MessageData = TextMessage | ImageMessage | VideoMessage | VoiceMessage | SystemMessage;

export interface WhatsAppState {
    conversationId?: string;
    // Add other state properties if needed for navigation
}
