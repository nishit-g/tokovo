import { getAppStateForDevice, type WorldState } from "@tokovo/core";
import type { SnapchatConversation, SnapchatMessage, SnapchatState } from "../types/index.js";

export function selectSnapchatState(world: WorldState, deviceId: string): SnapchatState | undefined {
  return getAppStateForDevice<SnapchatState>(world, "app_snapchat", deviceId);
}

export function selectConversations(world: WorldState, deviceId: string): SnapchatConversation[] {
  return Object.values(selectSnapchatState(world, deviceId)?.conversations ?? {}).sort((a, b) => {
    if ((a.pinned ?? false) !== (b.pinned ?? false)) {
      return a.pinned ? -1 : 1;
    }
    return (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0);
  });
}

export function selectActiveConversation(world: WorldState, deviceId: string): SnapchatConversation | undefined {
  const state = selectSnapchatState(world, deviceId);
  if (!state?.activeConversationId) return undefined;
  return state.conversations?.[state.activeConversationId];
}

export function selectMessages(
  world: WorldState,
  deviceId: string,
  conversationId?: string,
): SnapchatMessage[] {
  if (!conversationId) return [];
  return selectSnapchatState(world, deviceId)?.conversations?.[conversationId]?.messages ?? [];
}

export function selectTypingActors(
  world: WorldState,
  deviceId: string,
  conversationId?: string,
): string[] {
  if (!conversationId) return [];
  const typing = selectSnapchatState(world, deviceId)?.conversations?.[conversationId]?.typing ?? {};
  return Object.entries(typing)
    .filter(([, value]) => value)
    .map(([actor]) => actor);
}

export function selectUnreadConversationCount(world: WorldState, deviceId: string): number {
  return selectConversations(world, deviceId).filter((conversation) => conversation.unreadCount > 0).length;
}

export function selectDraft(world: WorldState, deviceId: string, conversationId?: string): string {
  if (!conversationId) return "";
  return selectSnapchatState(world, deviceId)?.drafts?.[conversationId] ?? "";
}
