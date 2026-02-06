/**
 * WhatsApp Conversation Types
 *
 * Conversation and group member type definitions.
 */

import type { WhatsAppMessage } from "./messages.js";

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
  messagesById?: Record<string, WhatsAppMessage>;
  unreadCount?: number;
  typing?: Record<string, boolean>;
  draftText?: string;
  isMuted?: boolean;
  isPinned?: boolean;
  hasStatus?: boolean;
  isArchived?: boolean;
  lastMessageAt?: number;
  mutedUntil?: string;
  description?: string;
  createdAt?: string;
  createdBy?: string;
}
