/**
 * WhatsApp App State Types
 *
 * Plugin state and world state helpers.
 */

import type { WhatsAppConversation } from "./conversation.js";
import type { ViewKind } from "@tokovo/core";
import type {
  WhatsAppAccountProfile,
  WhatsAppCallLogEntry,
  WhatsAppChannel,
  WhatsAppCommunity,
  WhatsAppSettings,
  WhatsAppStatusUpdate,
  WhatsAppStatusViewerState,
} from "./product.js";
import type { WhatsAppLocale } from "../localization/index.js";
import type { WhatsAppMediaViewerState } from "./media.js";
import type {
  WhatsAppGestureState,
  WhatsAppReplyComposerState,
} from "./interactions.js";

export interface WhatsAppThreadViewportState {
  conversationId: string;
  anchorMessageId: string;
  reason: "unread" | "message";
}

export type WhatsAppScreenId =
  | "chat"
  | "chats"
  | "updates"
  | "calls"
  | "communities"
  | "settings"
  | "profile";

export type WhatsAppChatFilter =
  | "all"
  | "unread"
  | "favorites"
  | "groups"
  | "drafts";

// =============================================================================
// APP STATE
// =============================================================================

export interface WhatsAppState {
  /** Monotonic invalidation key for deterministic static layout caching. */
  layoutRevision: number;
  /** Authored locale; never inferred from the browser or host machine. */
  locale: WhatsAppLocale;
  mediaViewer: WhatsAppMediaViewerState | null;
  statusViewer: WhatsAppStatusViewerState | null;
  activeGesture: WhatsAppGestureState | null;
  replyComposer: WhatsAppReplyComposerState | null;
  /** Explicit semantic scroll target. Null means follow the latest messages. */
  threadViewport: WhatsAppThreadViewportState | null;
  /** Canonical selected conversation for chat and profile surfaces. */
  conversationId?: string;
  currentScreen?: WhatsAppScreenId;
  chatFilter: WhatsAppChatFilter;
  /** Required by the Tokovo LayoutEngine. */
  viewMode: ViewKind;
  conversations: Record<string, WhatsAppConversation>;
  statuses: WhatsAppStatusUpdate[];
  channels: WhatsAppChannel[];
  callLog: WhatsAppCallLogEntry[];
  communities: WhatsAppCommunity[];
  profile?: WhatsAppAccountProfile;
  settings: WhatsAppSettings;
  statusBarTheme?:
    | "light"
    | "dark"
    | {
        backgroundColor?: string;
        iconColor?: string;
        timeColor?: string;
      };
}
