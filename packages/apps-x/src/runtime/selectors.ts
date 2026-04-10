import type { WorldState } from "@tokovo/core";
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

export function getXState(world: WorldState): XState | undefined {
  return world.appState?.["app_x"] as XState | undefined;
}

export function getThemeMode(world: WorldState): XThemeMode {
  return getXState(world)?.themeMode ?? "dark";
}

export function getTimelineTab(world: WorldState): TimelineTab {
  return getXState(world)?.timelineTab ?? "forYou";
}

export function getProfileTab(world: WorldState): ProfileTab {
  return getXState(world)?.profileTab ?? "posts";
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

export function getTweetsByAuthor(world: WorldState, authorId: string | null): XTweet[] {
  if (!authorId) return [];
  const state = getXState(world);
  if (!state) return [];
  return (state.tweets ?? [])
    .filter((tweet) => tweet.authorId === authorId)
    .sort((a, b) => b.createdAt - a.createdAt);
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

export function getVisibleNotifications(world: WorldState): XNotification[] {
  const state = getXState(world);
  if (!state) return [];
  if (state.notificationsTab === "mentions") {
    return state.notifications.filter((item) => item.isMention || item.type === "mention");
  }
  return state.notifications;
}

export function getNotificationBadgeCount(world: WorldState): number {
  return getNotifications(world).filter((item) => !item.read).length;
}

export function getDMThreads(world: WorldState): XDMThread[] {
  const threads = [...(getXState(world)?.dmThreads ?? [])];
  return threads.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0);
  });
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
  return thread.messageIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .sort((a, b) => a!.createdAt - b!.createdAt) as XDMMessage[];
}

export function getThreadDraft(world: WorldState, threadId: string | null): string {
  const state = getXState(world);
  if (!state || !threadId) return "";
  return state.threadDrafts[threadId] ?? "";
}

export function getUnreadThreadCount(world: WorldState): number {
  return getDMThreads(world).reduce((count, thread) => count + thread.unreadCount, 0);
}

export function getActiveSurface(world: WorldState): XState["currentScreen"] {
  return getXState(world)?.currentScreen ?? "timeline";
}
