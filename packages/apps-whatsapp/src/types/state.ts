/**
 * WhatsApp App State Types
 *
 * Plugin state and world state helpers.
 */

import type { WhatsAppConversation } from "./conversation.js";
import type { ViewKind } from "@tokovo/core";

// =============================================================================
// APP STATE
// =============================================================================

export interface WhatsAppState {
  conversationId?: string;
  currentScreen?:
    | "main"
    | "chat"
    | "chats"
    | "updates"
    | "status"
    | "calls"
    | "communities"
    | "settings"
    | "profile"
    | string;
  currentConversationId?: string;
  /** Required by the Tokovo LayoutEngine. */
  viewMode: ViewKind;
  conversations?: Record<string, unknown>;
  statusBarTheme?:
    | "light"
    | "dark"
    | {
        backgroundColor?: string;
        iconColor?: string;
        timeColor?: string;
      };
}

// =============================================================================
// WORLD STATE HELPERS
// =============================================================================

/**
 * Cast WorldState.conversations to WhatsApp conversations.
 */
export function asWhatsAppConversations(
  conversations: Record<string, unknown>,
): Record<string, WhatsAppConversation> {
  return conversations as Record<string, WhatsAppConversation>;
}

/**
 * Cast WorldState.appState.app_whatsapp to WhatsAppState.
 */
export function asWhatsAppState(
  appState: Record<string, unknown>,
): WhatsAppState | undefined {
  return (appState?.app_whatsapp || appState?.whatsapp) as
    | WhatsAppState
    | undefined;
}
