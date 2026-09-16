/**
 * WhatsApp Message Types
 *
 * All message-related type definitions.
 */

// =============================================================================
// MESSAGE TYPE ENUM
// =============================================================================

import type { WhatsAppMediaLifecycle } from "./media.js";

export type WhatsAppMessageType =
  | "text"
  | "image"
  | "video"
  | "voice"
  | "poll"
  | "system"
  | "gif"
  | "link"
  | "deleted"
  | "sticker"
  | "call"
  | "call_missed"
  | "screenshot_alert"
  | "document"
  | "contact"
  | "location";

export type WhatsAppSystemMessageType =
  | "member_added"
  | "member_removed"
  | "admin_change"
  | "group_created"
  | "group_name_changed"
  | "date_change"
  | "encryption_notice"
  | "business_notice"
  | "safety_code_changed"
  | "unread_divider"
  | "disappearing_messages"
  | "group_description_changed"
  | "group_icon_changed"
  | "phone_number_changed"
  | "pinned_message";

// =============================================================================
// BASE MESSAGE
// =============================================================================

export interface BaseMessage {
  id: string;
  from: string;
  timestamp?: string;
  timestampMs?: number;
  status?: "sending" | "sent" | "delivered" | "read" | "failed";
  at?: number;
  deliveredAt?: number;
  readAt?: number;
  /** Reactions (tapbacks) on this message */
  reactions?: WhatsAppReaction[];
  /** Frame of the latest authored reaction change; absent for seeded reactions. */
  reactionsChangedAt?: number;
  reactionsStartedAt?: number;
  /** Reply-to reference if this message is a reply */
  replyTo?: ReplyToData;
  /** Whether the message was forwarded */
  isForwarded?: boolean;
  /** Original sender of the forwarded message */
  forwardedFrom?: string;
  /** Sender display name for group chats */
  senderName?: string;
  /** Whether the message is starred */
  starred?: boolean;
  /** Authored transport failure state. Never inferred from a live network. */
  failureReason?: string;
  retryCount?: number;
  lastRetryAt?: number;
}

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
  pollQuestion?: string;
  options?: Array<{ text: string; votes?: number }>;
  totalVotes?: number;
  pollStatus?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  gifUrl?: string;
  stickerUrl?: string;
  caption?: string;
  duration?: number;
  callType?: "voice" | "video";
  media?: WhatsAppMediaLifecycle;
  edited?: boolean;
  editedAt?: number;
  originalText?: string;
  originalType?: WhatsAppMessageType;
  deletedAt?: number;
  deletedBy?: string;
  deletedForEveryone?: boolean;
  systemType?: WhatsAppSystemMessageType;
  targetMember?: string;
  actorName?: string;
  linkPreview?: LinkPreviewData;
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
}
