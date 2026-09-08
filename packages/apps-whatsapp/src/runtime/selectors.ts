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

export function selectScreenScroll(
  state: WhatsAppState,
  frame: number,
  screen = state.currentScreen,
): number {
  const scroll = screen ? state.screenScroll?.[screen] : undefined;
  if (!scroll) return 0;
  const progress =
    scroll.durationFrames === 0
      ? 1
      : Math.max(0, Math.min(1, (frame - scroll.at) / scroll.durationFrames));
  return scroll.from + (scroll.to - scroll.from) * (1 - (1 - progress) ** 3);
}

export function compareConversations(
  a: WhatsAppConversation,
  b: WhatsAppConversation,
): number {
  if (Boolean(a.isPinned) !== Boolean(b.isPinned)) return a.isPinned ? -1 : 1;
  const delta =
    (b.lastMessageAt ?? b.messages.at(-1)?.at ?? 0) -
    (a.lastMessageAt ?? a.messages.at(-1)?.at ?? 0);
  if (delta) return delta;
  return (a.name ?? "") < (b.name ?? "")
    ? -1
    : (a.name ?? "") > (b.name ?? "")
      ? 1
      : 0;
}

export function matchesChatFilter(
  conversation: WhatsAppConversation,
  filter: WhatsAppState["chatFilter"],
): boolean {
  if (conversation.isArchived) return false;
  switch (filter) {
    case "unread":
      return (conversation.unreadCount ?? 0) > 0;
    case "favorites":
      return Boolean(conversation.isFavorite);
    case "groups":
      return conversation.type === "group";
    case "drafts":
      return Boolean(conversation.draftText?.trim());
    default:
      return true;
  }
}

// =============================================================================
// STATE SELECTORS
// =============================================================================

/**
 * Get WhatsApp app state.
 */
export function selectAppState(
  world: WorldState,
  deviceId: string,
): WhatsAppState | undefined {
  return getAppStateForDevice<WhatsAppState>(world, "app_whatsapp", deviceId);
}

/**
 * Get all conversations.
 */
export function selectConversations(
  world: WorldState,
  deviceId: string,
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
  deviceId: string,
): string | undefined {
  const appState = selectAppState(world, deviceId);
  return appState?.conversationId;
}

/**
 * Get current conversation.
 */
export function selectCurrentConversation(
  world: WorldState,
  deviceId: string,
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
  deviceId: string,
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
  deviceId: string,
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
  deviceId: string,
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
  deviceId: string,
): boolean {
  const conv = selectConversations(world, deviceId)[conversationId];
  return conv?.type === "group";
}
