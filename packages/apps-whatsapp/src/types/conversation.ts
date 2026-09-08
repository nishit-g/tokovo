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
  /**
   * Optional authored identity colors. When present, messages from this member
   * use the accent as their bubble color and the on-accent color for content.
   */
  accentColor?: string;
  onAccentColor?: string;
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
  contact?: {
    phone?: string;
    about?: string;
    businessCategory?: string;
    lastSeenLabel?: string;
    verifiedBusiness?: boolean;
  };
  trust?: {
    endToEndEncrypted?: boolean;
    businessNotice?: string;
    safetyCodeNotice?: string;
  };
  preferences?: {
    notifications?: string;
    mediaVisibility?: string;
    disappearingMessages?: string;
    chatLock?: boolean;
  };
  isMuted?: boolean;
  isPinned?: boolean;
  /** Favorite is independent of list pinning. */
  isFavorite?: boolean;
  isArchived?: boolean;
  unreadDividerMessageId?: string;
  lastMessageAt?: number;
  mutedUntil?: string;
  description?: string;
  createdAt?: string;
  createdBy?: string;
  pinnedMessage?: {
    text: string;
    from?: string;
  };
}
