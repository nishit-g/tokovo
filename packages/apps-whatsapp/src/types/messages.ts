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
  | "link"
  | "deleted"
  | "sticker"
  | "call_missed"
  | "screenshot_alert"
  | "document"
  | "contact"
  | "location";

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
  /** Whether the message was forwarded */
  isForwarded?: boolean;
  /** Original sender of the forwarded message */
  forwardedFrom?: string;
  /** Sender display name for group chats */
  senderName?: string;
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

export interface StickerMessage extends BaseMessage {
  type: "sticker";
  stickerUrl: string;
  stickerPack?: string;
}

export interface SystemMessage extends BaseMessage {
  type: "system";
  text: string;
  systemType?:
    | "member_added"
    | "member_removed"
    | "admin_change"
    | "group_created"
    | "group_name_changed"
    | "date_change";
  targetMember?: string;
  actorName?: string;
}

export interface DeletedMessage extends BaseMessage {
  type: "deleted";
  text?: string;
  originalType?: WhatsAppMessageType;
  originalText?: string;
  deletedAt?: number;
  deletedBy?: string;
}

export interface LinkMessage extends BaseMessage {
  type: "link";
  text?: string;
  linkPreview: LinkPreviewData;
}

export interface DocumentMessage extends BaseMessage {
  type: "document";
  fileName: string;
  fileSize: string;
  documentUrl: string;
  fileType?: string;
  pageCount?: number;
}

export interface ContactMessage extends BaseMessage {
  type: "contact";
  contactName: string;
  contactPhone?: string;
  contactAvatarUrl?: string;
}

export interface LocationMessage extends BaseMessage {
  type: "location";
  latitude: number;
  longitude: number;
  locationName?: string;
  locationAddress?: string;
  mapThumbnailUrl?: string;
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
  | StickerMessage
  | SystemMessage
  | DeletedMessage
  | LinkMessage
  | DocumentMessage
  | ContactMessage
  | LocationMessage;

// =============================================================================
// REACTION & REPLY TYPES
// =============================================================================

export interface WhatsAppReaction {
  emoji: string;
  count: number;
  fromMe?: boolean;
}

export interface ReplyToData {
  messageId?: string;
  text?: string;
  from?: string;
  type?: WhatsAppMessageType;
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
  stickerUrl?: string;
  caption?: string;
  duration?: number;
  isPlaying?: boolean;
  playProgress?: number;
  edited?: boolean;
  editedAt?: number;
  originalText?: string;
  originalType?: WhatsAppMessageType;
  deletedAt?: number;
  deletedBy?: string;
  systemType?: string;
  targetMember?: string;
  actorName?: string;
  reactions?: WhatsAppReaction[];
  replyTo?: ReplyToData;
  linkPreview?: LinkPreviewData;
  isForwarded?: boolean;
  forwardedFrom?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  pageCount?: number;
  documentUrl?: string;
  contactName?: string;
  contactPhone?: string;
  contactAvatarUrl?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  locationAddress?: string;
  mapThumbnailUrl?: string;
  // Voice/Audio aliases for backward compatibility
  voiceUrl?: string;
  audioUrl?: string;
  fileUrl?: string;
  // Sender display name for group chats
  senderName?: string;
  // Delivery status timestamps
  readAt?: number;
  deliveredAt?: number;
}
