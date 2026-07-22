import { getAppStateForDevice, type WorldState } from "@tokovo/core";
import type {
  ProfileTab,
  TimelineTab,
  XState,
  XTweet,
  XUser,
  XNotification,
  XDMThread,
  XDMMessage,
  XThemeMode,
} from "./state.js";

export function getXState(world: WorldState, deviceId: string): XState | undefined {
  return getAppStateForDevice<XState>(world, "app_x", deviceId);
}

export function getThemeMode(world: WorldState, deviceId: string): XThemeMode {
  return getXState(world, deviceId)?.themeMode ?? "dark";
}

export function getTimelineTab(world: WorldState, deviceId: string): TimelineTab {
  return getXState(world, deviceId)?.timelineTab ?? "forYou";
}

export function getProfileTab(world: WorldState, deviceId: string): ProfileTab {
  return getXState(world, deviceId)?.profileTab ?? "posts";
}

export function getUserById(world: WorldState, deviceId: string, userId: string | null): XUser | null {
  if (!userId) return null;
  return getXState(world, deviceId)?.users.find((u) => u.id === userId) ?? null;
}

export function getTimelineTweets(world: WorldState, deviceId: string): XTweet[] {
  const state = getXState(world, deviceId);
  if (!state) return [];
  const tweets = state.tweets ?? [];
  const timeline = state.timeline ?? [];
  const byId = new Map(tweets.map((t) => [t.id, t]));
  const ordered = timeline.map((id) => byId.get(id)).filter(Boolean) as XTweet[];
  if (state.timelineTab !== "following" || !state.currentUserId) {
    return ordered;
  }

  const currentUser = state.users.find((user) => user.id === state.currentUserId);
  if (!currentUser) return ordered;
  return ordered.filter(
    (tweet) =>
      tweet.authorId === currentUser.id ||
      currentUser.followingIds.includes(tweet.authorId),
  );
}

export function getTweetsByAuthor(world: WorldState, deviceId: string, authorId: string | null): XTweet[] {
  if (!authorId) return [];
  const state = getXState(world, deviceId);
  if (!state) return [];
  return (state.tweets ?? [])
    .filter((tweet) => tweet.authorId === authorId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getActiveTweet(world: WorldState, deviceId: string): XTweet | null {
  const state = getXState(world, deviceId);
  if (!state?.activeTweetId) return null;
  return (state.tweets ?? []).find((t) => t.id === state.activeTweetId) ?? null;
}

export function getActiveUser(world: WorldState, deviceId: string): XUser | null {
  const state = getXState(world, deviceId);
  if (!state?.activeUserId) return null;
  return (state.users ?? []).find((u) => u.id === state.activeUserId) ?? null;
}

export function getNotifications(world: WorldState, deviceId: string): XNotification[] {
  return getXState(world, deviceId)?.notifications ?? [];
}

export function getVisibleNotifications(world: WorldState, deviceId: string): XNotification[] {
  const state = getXState(world, deviceId);
  if (!state) return [];
  if (state.notificationsTab === "mentions") {
    return state.notifications.filter((item) => item.isMention || item.type === "mention");
  }
  return state.notifications;
}

export function getNotificationBadgeCount(world: WorldState, deviceId: string): number {
  return getNotifications(world, deviceId).filter((item) => !item.read).length;
}

export function getDMThreads(world: WorldState, deviceId: string): XDMThread[] {
  const threads = [...(getXState(world, deviceId)?.dmThreads ?? [])];
  return threads.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0);
  });
}

export function getActiveThread(world: WorldState, deviceId: string): XDMThread | null {
  const state = getXState(world, deviceId);
  if (!state?.activeThreadId) return null;
  return (state.dmThreads ?? []).find((t) => t.id === state.activeThreadId) ?? null;
}

export function getThreadMessages(world: WorldState, deviceId: string, threadId: string | null): XDMMessage[] {
  const state = getXState(world, deviceId);
  if (!state || !threadId) return [];
  const thread = (state.dmThreads ?? []).find((t) => t.id === threadId);
  if (!thread) return [];
  const byId = new Map((state.dmMessages ?? []).map((m) => [m.id, m]));
  return thread.messageIds
    .map((id) => byId.get(id))
    .filter((message): message is XDMMessage => Boolean(message))
    .sort((left, right) => left.createdAt - right.createdAt);
}

export function getThreadDraft(world: WorldState, deviceId: string, threadId: string | null): string {
  const state = getXState(world, deviceId);
  if (!state || !threadId) return "";
  return state.threadDrafts[threadId] ?? "";
}

export function getUnreadThreadCount(world: WorldState, deviceId: string): number {
  return getDMThreads(world, deviceId).reduce((count, thread) => count + thread.unreadCount, 0);
}

export function getActiveSurface(world: WorldState, deviceId: string): XState["currentScreen"] {
  return getXState(world, deviceId)?.currentScreen ?? "timeline";
}
