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

export function getLinkedInState(world: WorldState): LinkedInState | undefined {
  return world.appState?.["app_linkedin"] as LinkedInState | undefined;
}

export function getThemeMode(world: WorldState): LIThemeMode {
  return getLinkedInState(world)?.themeMode ?? "light";
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

export function getActivePost(world: WorldState): LIPost | null {
  return getPostById(world, getLinkedInState(world)?.activePostId ?? null);
}

export function getActiveUser(world: WorldState): LIUser | null {
  return getUserById(world, getLinkedInState(world)?.activeUserId ?? null);
}

export function getCommentsForPost(world: WorldState, postId: string | null): LIComment[] {
  const state = getLinkedInState(world);
  if (!state || !postId) return [];
  return (state.comments ?? []).filter((c) => c.postId === postId);
}

export function getNotifications(world: WorldState): LINotification[] {
  return getLinkedInState(world)?.notifications ?? [];
}

export function getDMThreads(world: WorldState): LIDMThread[] {
  return getLinkedInState(world)?.dmThreads ?? [];
}

export function getActiveThread(world: WorldState): LIDMThread | null {
  const state = getLinkedInState(world);
  if (!state?.activeThreadId) return null;
  return (state.dmThreads ?? []).find((t) => t.id === state.activeThreadId) ?? null;
}

export function getThreadMessages(world: WorldState, threadId: string | null): LIDMMessage[] {
  const state = getLinkedInState(world);
  if (!state || !threadId) return [];
  const thread = (state.dmThreads ?? []).find((t) => t.id === threadId);
  if (!thread) return [];
  const byId = new Map((state.dmMessages ?? []).map((m) => [m.id, m]));
  return thread.messageIds.map((id) => byId.get(id)).filter(Boolean) as LIDMMessage[];
}

