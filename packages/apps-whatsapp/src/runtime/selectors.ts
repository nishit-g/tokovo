/**
 * WhatsApp State Selectors
 *
 * Memoized queries for accessing WhatsApp state.
 */

import type { WorldState } from "@tokovo/core";
import type {
  WhatsAppConversation,
  WhatsAppState,
  WhatsAppMessage,
} from "../types/index.js";

// =============================================================================
// STATE SELECTORS
// =============================================================================

/**
 * Get WhatsApp app state.
 */
export function selectAppState(world: WorldState): WhatsAppState | undefined {
  return world.appState?.app_whatsapp as WhatsAppState | undefined;
}

/**
 * Get all conversations.
 */
export function selectConversations(
  world: WorldState,
): Record<string, WhatsAppConversation> {
  const appState = selectAppState(world);
  return (appState?.conversations ?? {}) as Record<
    string,
    WhatsAppConversation
  >;
}

/**
 * Get current conversation ID.
 */
export function selectCurrentConversationId(
  world: WorldState,
): string | undefined {
  const appState = selectAppState(world);
  return appState?.currentConversationId ?? appState?.conversationId;
}

/**
 * Get current conversation.
 */
export function selectCurrentConversation(
  world: WorldState,
): WhatsAppConversation | undefined {
  const convId = selectCurrentConversationId(world);
  if (!convId) return undefined;
  return selectConversations(world)[convId];
}

/**
 * Get messages for a conversation.
 */
export function selectMessages(
  world: WorldState,
  conversationId: string,
): WhatsAppMessage[] {
  const conv = selectConversations(world)[conversationId];
  return conv?.messages ?? [];
}

/**
 * Get last message for a conversation.
 */
export function selectLastMessage(
  world: WorldState,
  conversationId: string,
): WhatsAppMessage | undefined {
  const messages = selectMessages(world, conversationId);
  return messages[messages.length - 1];
}

/**
 * Get typing members for a conversation.
 */
export function selectTypingMembers(
  world: WorldState,
  conversationId: string,
): string[] {
  const conv = selectConversations(world)[conversationId];
  if (!conv?.typing) return [];
  return Object.entries(conv.typing)
    .filter(([_, isTyping]) => isTyping)
    .map(([name]) => name);
}

/**
 * Check if conversation is group.
 */
export function selectIsGroupConversation(
  world: WorldState,
  conversationId: string,
): boolean {
  const conv = selectConversations(world)[conversationId];
  return conv?.type === "group";
}
