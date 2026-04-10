import type { WorldState } from "@tokovo/core";
import type { SnapchatConversation, SnapchatMessage, SnapchatState } from "../types/index.js";

export function selectSnapchatState(world: WorldState): SnapchatState | undefined {
  return world.appState?.app_snapchat as SnapchatState | undefined;
}

export function selectConversations(world: WorldState): SnapchatConversation[] {
  return Object.values(selectSnapchatState(world)?.conversations ?? {}).sort((a, b) => {
    if ((a.pinned ?? false) !== (b.pinned ?? false)) {
      return a.pinned ? -1 : 1;
    }
    return (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0);
  });
}

export function selectActiveConversation(world: WorldState): SnapchatConversation | undefined {
  const state = selectSnapchatState(world);
  if (!state?.activeConversationId) return undefined;
  return state.conversations?.[state.activeConversationId];
}

export function selectMessages(
  world: WorldState,
  conversationId?: string,
): SnapchatMessage[] {
  if (!conversationId) return [];
  return selectSnapchatState(world)?.conversations?.[conversationId]?.messages ?? [];
}

export function selectTypingActors(
  world: WorldState,
  conversationId?: string,
): string[] {
  if (!conversationId) return [];
  const typing = selectSnapchatState(world)?.conversations?.[conversationId]?.typing ?? {};
  return Object.entries(typing)
    .filter(([, value]) => value)
    .map(([actor]) => actor);
}

export function selectUnreadConversationCount(world: WorldState): number {
  return selectConversations(world).filter((conversation) => conversation.unreadCount > 0).length;
}

export function selectDraft(world: WorldState, conversationId?: string): string {
  if (!conversationId) return "";
  return selectSnapchatState(world)?.drafts?.[conversationId] ?? "";
}
