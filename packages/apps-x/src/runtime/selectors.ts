import type { WorldState } from "@tokovo/core";
import type {
  XState,
  XTweet,
  XUser,
  XNotification,
  XDMThread,
  XDMMessage,
  XThemeMode,
} from "./state.js";

export function getXState(world: WorldState): XState | undefined {
  return world.appState?.["app_x"] as XState | undefined;
}

export function getThemeMode(world: WorldState): XThemeMode {
  return getXState(world)?.themeMode ?? "dark";
}

export function getUserById(world: WorldState, userId: string | null): XUser | null {
  if (!userId) return null;
  return getXState(world)?.users.find((u) => u.id === userId) ?? null;
}

export function getTimelineTweets(world: WorldState): XTweet[] {
  const state = getXState(world);
  if (!state) return [];
  const tweets = state.tweets ?? [];
  const timeline = state.timeline ?? [];
  const byId = new Map(tweets.map((t) => [t.id, t]));
  return timeline.map((id) => byId.get(id)).filter(Boolean) as XTweet[];
}

export function getActiveTweet(world: WorldState): XTweet | null {
  const state = getXState(world);
  if (!state?.activeTweetId) return null;
  return (state.tweets ?? []).find((t) => t.id === state.activeTweetId) ?? null;
}

export function getActiveUser(world: WorldState): XUser | null {
  const state = getXState(world);
  if (!state?.activeUserId) return null;
  return (state.users ?? []).find((u) => u.id === state.activeUserId) ?? null;
}

export function getNotifications(world: WorldState): XNotification[] {
  return getXState(world)?.notifications ?? [];
}

export function getDMThreads(world: WorldState): XDMThread[] {
  return getXState(world)?.dmThreads ?? [];
}

export function getActiveThread(world: WorldState): XDMThread | null {
  const state = getXState(world);
  if (!state?.activeThreadId) return null;
  return (state.dmThreads ?? []).find((t) => t.id === state.activeThreadId) ?? null;
}

export function getThreadMessages(world: WorldState, threadId: string | null): XDMMessage[] {
  const state = getXState(world);
  if (!state || !threadId) return [];
  const thread = (state.dmThreads ?? []).find((t) => t.id === threadId);
  if (!thread) return [];
  const byId = new Map((state.dmMessages ?? []).map((m) => [m.id, m]));
  return thread.messageIds.map((id) => byId.get(id)).filter(Boolean) as XDMMessage[];
}
