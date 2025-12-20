/**
 * WhatsApp App State Types
 * 
 * Plugin state and world state helpers.
 */

import type { WhatsAppConversation } from "./conversation";

// =============================================================================
// APP STATE
// =============================================================================

export interface WhatsAppState {
    conversationId?: string;
    screen?: string;  // Legacy

    // Navigation (set by core navigation.ts)
    currentScreen?: "main" | "chat" | "chats" | "profile" | string;
    currentConversationId?: string;

    viewMode?: "CHAT" | "LIST" | "TRANSITION";

    /** StatusBar theme - "light" | "dark" | full custom theme */
    statusBarTheme?: "light" | "dark" | {
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
