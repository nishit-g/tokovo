/**
 * Snapchat Message Types
 */

export type SnapchatMessageKind = "text" | "snap" | "sticker" | "voice" | "system";

export type SnapchatMessageStatus = "sending" | "sent" | "delivered" | "opened" | "screenshot";

export type SnapchatSnapType = "photo" | "video";

export interface SnapchatAttachment {
    kind: "image" | "video" | "sticker" | "voice";
    url?: string;
    /** Duration in seconds for video/voice */
    duration?: number;
    /** Snap timer in seconds (auto-delete after viewing) */
    timer?: number;
}

export interface SnapchatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    senderName?: string;
    fromMe: boolean;
    kind: SnapchatMessageKind;
    text?: string;
    attachments?: SnapchatAttachment[];
    timestamp: number;
    status?: SnapchatMessageStatus;
    /** For snaps: type of snap */
    snapType?: SnapchatSnapType;
    /** For snaps: timer duration in seconds */
    snapTimer?: number;
    /** Whether the snap has been opened */
    snapOpened?: boolean;
    /** Whether a screenshot was taken */
    screenshotted?: boolean;
    /** System message type */
    isSystem?: boolean;
    systemType?: string;
    systemText?: string;
    /** Saved in chat */
    saved?: boolean;
}
