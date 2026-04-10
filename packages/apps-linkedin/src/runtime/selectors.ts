import type { WorldState } from "@tokovo/core";
import type {
  LinkedInState,
  LIUser,
  LIPost,
  LIComment,
  LINotification,
  LIDMThread,
  LIDMMessage,
} from "./state.js";
import type { LIThemeMode } from "../types/events.js";

const VIRTUAL_MINUTE_FRAMES = 24;

export function getLinkedInState(world: WorldState): LinkedInState | undefined {
  return world.appState?.["app_linkedin"] as LinkedInState | undefined;
}

export function getThemeMode(world: WorldState): LIThemeMode {
  return getLinkedInState(world)?.themeMode ?? "light";
}

export function getCurrentUserId(world: WorldState): string | null {
  return getLinkedInState(world)?.currentUserId ?? null;
}

export function getCurrentUser(world: WorldState): LIUser | null {
  return getUserById(world, getCurrentUserId(world));
}

export function getUserById(world: WorldState, userId: string | null): LIUser | null {
  if (!userId) return null;
  return getLinkedInState(world)?.users.find((u) => u.id === userId) ?? null;
}

export function getPostById(world: WorldState, postId: string | null): LIPost | null {
  if (!postId) return null;
  return getLinkedInState(world)?.posts.find((p) => p.id === postId) ?? null;
}

export function getFeedPosts(world: WorldState): LIPost[] {
  const state = getLinkedInState(world);
  if (!state) return [];
  const byId = new Map((state.posts ?? []).map((p) => [p.id, p]));
  return (state.feed ?? []).map((id) => byId.get(id)).filter(Boolean) as LIPost[];
}

export function getFeedFocusPostId(world: WorldState): string | null {
  const state = getLinkedInState(world);
  const posts = getFeedPosts(world);
  if (!state || posts.length === 0) return null;
  if (state.currentScreen === "feed" && state.activePostId && posts.some((post) => post.id === state.activePostId)) {
    return state.activePostId;
  }
  return posts[0]?.id ?? null;
}

export function getFeedFocusIndex(world: WorldState): number {
  const focusId = getFeedFocusPostId(world);
  if (!focusId) return 0;
  return Math.max(0, getFeedPosts(world).findIndex((post) => post.id === focusId));
}

export function getActivePost(world: WorldState): LIPost | null {
  return getPostById(world, getLinkedInState(world)?.activePostId ?? null);
}

export function getActiveUser(world: WorldState): LIUser | null {
  return getUserById(world, getLinkedInState(world)?.activeUserId ?? null);
}

export function getProfileUser(world: WorldState): LIUser | null {
  return getActiveUser(world) ?? getCurrentUser(world);
}

export function getCommentsForPost(world: WorldState, postId: string | null): LIComment[] {
  const state = getLinkedInState(world);
  if (!state || !postId) return [];
  return (state.comments ?? [])
    .filter((comment) => comment.postId === postId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getLatestCommentsForPost(
  world: WorldState,
  postId: string | null,
  limit = 2,
): LIComment[] {
  return getCommentsForPost(world, postId).slice(-limit);
}

export function getRepostCountForPost(world: WorldState, postId: string | null): number {
  if (!postId) return 0;
  const state = getLinkedInState(world);
  if (!state) return 0;
  return state.posts.filter((post) => post.repostOfId === postId).length;
}

export function getNotifications(world: WorldState): LINotification[] {
  return [...(getLinkedInState(world)?.notifications ?? [])].sort((a, b) => b.createdAt - a.createdAt);
}

export function getUnreadNotificationCount(world: WorldState): number {
  return getNotifications(world).filter((notification) => notification.unread).length;
}

export function getDMThreads(world: WorldState): LIDMThread[] {
  return [...(getLinkedInState(world)?.dmThreads ?? [])].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if ((a.unreadCount ?? 0) !== (b.unreadCount ?? 0)) return (b.unreadCount ?? 0) - (a.unreadCount ?? 0);
    return (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0);
  });
}

export function getActiveThread(world: WorldState): LIDMThread | null {
  const state = getLinkedInState(world);
  if (!state?.activeThreadId) return null;
  return (state.dmThreads ?? []).find((thread) => thread.id === state.activeThreadId) ?? null;
}

export function getThreadMessages(world: WorldState, threadId: string | null): LIDMMessage[] {
  const state = getLinkedInState(world);
  if (!state || !threadId) return [];
  const thread = (state.dmThreads ?? []).find((item) => item.id === threadId);
  if (!thread) return [];
  const byId = new Map((state.dmMessages ?? []).map((message) => [message.id, message]));
  return thread.messageIds.map((id) => byId.get(id)).filter(Boolean) as LIDMMessage[];
}

export function getLastMessageForThread(world: WorldState, threadId: string | null): LIDMMessage | null {
  const messages = getThreadMessages(world, threadId);
  return messages[messages.length - 1] ?? null;
}

export function getUnreadMessageCount(world: WorldState): number {
  return getDMThreads(world).reduce((sum, thread) => sum + (thread.unreadCount ?? 0), 0);
}

export function getUserPosts(world: WorldState, userId: string | null): LIPost[] {
  if (!userId) return [];
  return getFeedPosts(world).filter((post) => post.authorId === userId);
}

export function formatRelativeFrameTime(createdAt: number, referenceAt: number): string {
  const deltaFrames = Math.max(0, referenceAt - createdAt);
  const minutes = Math.floor(deltaFrames / VIRTUAL_MINUTE_FRAMES);

  if (minutes <= 0) return "Now";
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h`;
  if (minutes < 60 * 24 * 7) return `${Math.floor(minutes / (60 * 24))}d`;
  return `${Math.floor(minutes / (60 * 24 * 7))}w`;
}

export function getReferenceFrame(world: WorldState): number {
  const state = getLinkedInState(world);
  if (!state) return 0;
  const candidates = [
    ...state.posts.map((post) => post.createdAt),
    ...state.comments.map((comment) => comment.createdAt),
    ...state.notifications.map((notification) => notification.createdAt),
    ...state.dmMessages.map((message) => message.createdAt),
  ];
  return candidates.length > 0 ? Math.max(...candidates) : 0;
}

export function formatCompactCount(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return `${value}`;
}
