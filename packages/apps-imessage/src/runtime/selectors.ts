import type { WorldState } from "@tokovo/core";
import type { IMessageConversation, IMessageMessage, IMessageState } from "../types/index.js";

export function selectIMessageState(world: WorldState) {
  return world.appState?.app_imessage as IMessageState | undefined;
}

export function selectConversations(
  world: WorldState,
): Record<string, IMessageConversation> {
  const state = world.appState?.app_imessage as IMessageState | undefined;
  return (state?.conversations ?? {}) as Record<
    string,
    IMessageConversation
  >;
}

export function selectActiveConversation(
  world: WorldState,
): IMessageConversation | undefined {
  const state = world.appState?.app_imessage as IMessageState | undefined;
  if (!state?.activeConversationId) return undefined;
  return state.conversations?.[state.activeConversationId];
}

export function selectMessages(
  world: WorldState,
  conversationId?: string,
): IMessageMessage[] {
  if (!conversationId) return [];
  const conversations =
    (world.appState?.app_imessage as IMessageState | undefined)?.conversations ??
    {};
  return conversations[conversationId]?.messages ?? [];
}

export function selectTypingUsers(
  world: WorldState,
  conversationId?: string,
): string[] {
  if (!conversationId) return [];
  const conv = (world.appState?.app_imessage as IMessageState | undefined)
    ?.conversations?.[conversationId];
  if (!conv) return [];
  return Object.entries(conv.typing)
    .filter(([, isTyping]) => isTyping)
    .map(([userId]) => userId);
}
