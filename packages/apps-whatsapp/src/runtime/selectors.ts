/**
 * WhatsApp State Selectors
 *
 * Device-aware queries for accessing immutable WhatsApp state.
 */

import { getAppStateForDevice, type WorldState } from "@tokovo/core";
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
export function selectAppState(
  world: WorldState,
  deviceId?: string,
): WhatsAppState | undefined {
  return getAppStateForDevice<WhatsAppState>(world, "app_whatsapp", deviceId);
}

/**
 * Get all conversations.
 */
export function selectConversations(
  world: WorldState,
  deviceId?: string,
): Record<string, WhatsAppConversation> {
  const appState = selectAppState(world, deviceId);
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
  deviceId?: string,
): string | undefined {
  const appState = selectAppState(world, deviceId);
  return appState?.conversationId;
}

/**
 * Get current conversation.
 */
export function selectCurrentConversation(
  world: WorldState,
  deviceId?: string,
): WhatsAppConversation | undefined {
  const convId = selectCurrentConversationId(world, deviceId);
  if (!convId) return undefined;
  return selectConversations(world, deviceId)[convId];
}

/**
 * Get messages for a conversation.
 */
export function selectMessages(
  world: WorldState,
  conversationId: string,
  deviceId?: string,
): WhatsAppMessage[] {
  const conv = selectConversations(world, deviceId)[conversationId];
  return conv?.messages ?? [];
}

/**
 * Get last message for a conversation.
 */
export function selectLastMessage(
  world: WorldState,
  conversationId: string,
  deviceId?: string,
): WhatsAppMessage | undefined {
  const messages = selectMessages(world, conversationId, deviceId);
  return messages[messages.length - 1];
}

/**
 * Get typing members for a conversation.
 */
export function selectTypingMembers(
  world: WorldState,
  conversationId: string,
  deviceId?: string,
): string[] {
  const conv = selectConversations(world, deviceId)[conversationId];
  if (!conv?.typing) return [];
  return Object.entries(conv.typing)
    .filter(([actor, isTyping]) => isTyping && actor !== "me")
    .map(([name]) => name);
}

/**
 * Check if conversation is group.
 */
export function selectIsGroupConversation(
  world: WorldState,
  conversationId: string,
  deviceId?: string,
): boolean {
  const conv = selectConversations(world, deviceId)[conversationId];
  return conv?.type === "group";
}
