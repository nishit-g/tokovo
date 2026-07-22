import { getAppStateForDevice, type WorldState } from "@tokovo/core";
import type { IMessageConversation, IMessageMessage, IMessageState } from "../types/index.js";

export function selectIMessageState(world: WorldState, deviceId: string) {
  return getAppStateForDevice<IMessageState>(world, "app_imessage", deviceId);
}

export function selectConversations(
  world: WorldState,
  deviceId: string,
): Record<string, IMessageConversation> {
  const state = selectIMessageState(world, deviceId);
  return (state?.conversations ?? {}) as Record<
    string,
    IMessageConversation
  >;
}

export function selectActiveConversation(
  world: WorldState,
  deviceId: string,
): IMessageConversation | undefined {
  const state = selectIMessageState(world, deviceId);
  if (!state?.activeConversationId) return undefined;
  return state.conversations?.[state.activeConversationId];
}

export function selectMessages(
  world: WorldState,
  deviceId: string,
  conversationId?: string,
): IMessageMessage[] {
  if (!conversationId) return [];
  const conversations = selectIMessageState(world, deviceId)?.conversations ?? {};
  return conversations[conversationId]?.messages ?? [];
}

export function selectTypingUsers(
  world: WorldState,
  deviceId: string,
  conversationId?: string,
): string[] {
  if (!conversationId) return [];
  const conv = selectIMessageState(world, deviceId)?.conversations?.[conversationId];
  if (!conv) return [];
  return Object.entries(conv.typing)
    .filter(([, isTyping]) => isTyping)
    .map(([userId]) => userId);
}
