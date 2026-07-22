import { getAppStateForDevice, type WorldState } from "@tokovo/core";
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

export function getLinkedInState(world: WorldState, deviceId: string): LinkedInState | undefined {
  return getAppStateForDevice<LinkedInState>(world, "app_linkedin", deviceId);
}

export function getThemeMode(world: WorldState, deviceId: string): LIThemeMode {
  return getLinkedInState(world, deviceId)?.themeMode ?? "light";
}

export function getCurrentUserId(world: WorldState, deviceId: string): string | null {
  return getLinkedInState(world, deviceId)?.currentUserId ?? null;
}

export function getCurrentUser(world: WorldState, deviceId: string): LIUser | null {
  return getUserById(world, deviceId, getCurrentUserId(world, deviceId));
}

export function getUserById(world: WorldState, deviceId: string, userId: string | null): LIUser | null {
  if (!userId) return null;
  return getLinkedInState(world, deviceId)?.users.find((u) => u.id === userId) ?? null;
}

export function getPostById(world: WorldState, deviceId: string, postId: string | null): LIPost | null {
  if (!postId) return null;
  return getLinkedInState(world, deviceId)?.posts.find((p) => p.id === postId) ?? null;
}

export function getFeedPosts(world: WorldState, deviceId: string): LIPost[] {
  const state = getLinkedInState(world, deviceId);
  if (!state) return [];
  const byId = new Map((state.posts ?? []).map((p) => [p.id, p]));
  return (state.feed ?? []).map((id) => byId.get(id)).filter(Boolean) as LIPost[];
}

export function getFeedFocusPostId(world: WorldState, deviceId: string): string | null {
  const state = getLinkedInState(world, deviceId);
  const posts = getFeedPosts(world, deviceId);
  if (!state || posts.length === 0) return null;
  if (state.currentScreen === "feed" && state.activePostId && posts.some((post) => post.id === state.activePostId)) {
    return state.activePostId;
  }
  return posts[0]?.id ?? null;
}

export function getFeedFocusIndex(world: WorldState, deviceId: string): number {
  const focusId = getFeedFocusPostId(world, deviceId);
  if (!focusId) return 0;
  return Math.max(0, getFeedPosts(world, deviceId).findIndex((post) => post.id === focusId));
}

export function getActivePost(world: WorldState, deviceId: string): LIPost | null {
  return getPostById(world, deviceId, getLinkedInState(world, deviceId)?.activePostId ?? null);
}

export function getActiveUser(world: WorldState, deviceId: string): LIUser | null {
  return getUserById(world, deviceId, getLinkedInState(world, deviceId)?.activeUserId ?? null);
}

export function getProfileUser(world: WorldState, deviceId: string): LIUser | null {
  return getActiveUser(world, deviceId) ?? getCurrentUser(world, deviceId);
}

export function getCommentsForPost(world: WorldState, deviceId: string, postId: string | null): LIComment[] {
  const state = getLinkedInState(world, deviceId);
  if (!state || !postId) return [];
  return (state.comments ?? [])
    .filter((comment) => comment.postId === postId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getLatestCommentsForPost(
  world: WorldState,
  deviceId: string,
  postId: string | null,
  limit = 2,
): LIComment[] {
  return getCommentsForPost(world, deviceId, postId).slice(-limit);
}

export function getRepostCountForPost(world: WorldState, deviceId: string, postId: string | null): number {
  if (!postId) return 0;
  const state = getLinkedInState(world, deviceId);
  if (!state) return 0;
  return state.posts.filter((post) => post.repostOfId === postId).length;
}

export function getNotifications(world: WorldState, deviceId: string): LINotification[] {
  return [...(getLinkedInState(world, deviceId)?.notifications ?? [])].sort((a, b) => b.createdAt - a.createdAt);
}

export function getUnreadNotificationCount(world: WorldState, deviceId: string): number {
  return getNotifications(world, deviceId).filter((notification) => notification.unread).length;
}

export function getDMThreads(world: WorldState, deviceId: string): LIDMThread[] {
  return [...(getLinkedInState(world, deviceId)?.dmThreads ?? [])].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if ((a.unreadCount ?? 0) !== (b.unreadCount ?? 0)) return (b.unreadCount ?? 0) - (a.unreadCount ?? 0);
    return (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0);
  });
}

export function getActiveThread(world: WorldState, deviceId: string): LIDMThread | null {
  const state = getLinkedInState(world, deviceId);
  if (!state?.activeThreadId) return null;
  return (state.dmThreads ?? []).find((thread) => thread.id === state.activeThreadId) ?? null;
}

export function getThreadMessages(world: WorldState, deviceId: string, threadId: string | null): LIDMMessage[] {
  const state = getLinkedInState(world, deviceId);
  if (!state || !threadId) return [];
  const thread = (state.dmThreads ?? []).find((item) => item.id === threadId);
  if (!thread) return [];
  const byId = new Map((state.dmMessages ?? []).map((message) => [message.id, message]));
  return thread.messageIds.map((id) => byId.get(id)).filter(Boolean) as LIDMMessage[];
}

export function getLastMessageForThread(world: WorldState, deviceId: string, threadId: string | null): LIDMMessage | null {
  const messages = getThreadMessages(world, deviceId, threadId);
  return messages[messages.length - 1] ?? null;
}

export function getUnreadMessageCount(world: WorldState, deviceId: string): number {
  return getDMThreads(world, deviceId).reduce((sum, thread) => sum + (thread.unreadCount ?? 0), 0);
}

export function getUserPosts(world: WorldState, deviceId: string, userId: string | null): LIPost[] {
  if (!userId) return [];
  return getFeedPosts(world, deviceId).filter((post) => post.authorId === userId);
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

export function getReferenceFrame(world: WorldState, deviceId: string): number {
  const state = getLinkedInState(world, deviceId);
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
