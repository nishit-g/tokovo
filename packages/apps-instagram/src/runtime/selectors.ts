import { getAppStateForDevice, type WorldState } from "@tokovo/core";
import type {
  InstagramComment,
  InstagramDMMessage,
  InstagramDMThread,
  InstagramNotification,
  InstagramPost,
  InstagramState,
  InstagramStory,
  InstagramStorySet,
  InstagramUser,
} from "./state.js";

export function getInstagramState(world: WorldState, deviceId: string): InstagramState | undefined {
  return getAppStateForDevice<InstagramState>(world, "app_instagram", deviceId);
}

export function getActiveSurface(world: WorldState, deviceId: string): InstagramState["currentScreen"] {
  return getInstagramState(world, deviceId)?.currentScreen ?? "home";
}

export function getThemeMode(world: WorldState, deviceId: string): InstagramState["themeMode"] {
  return getInstagramState(world, deviceId)?.themeMode ?? "light";
}

export function getCurrentUser(world: WorldState, deviceId: string): InstagramUser | null {
  const state = getInstagramState(world, deviceId);
  if (!state?.currentUserId) return null;
  return state.users.find((user) => user.id === state.currentUserId) ?? null;
}

export function getUserById(world: WorldState, deviceId: string, userId: string | null): InstagramUser | null {
  if (!userId) return null;
  return getInstagramState(world, deviceId)?.users.find((user) => user.id === userId) ?? null;
}

export function getVisibleFeedPosts(world: WorldState, deviceId: string): InstagramPost[] {
  return [...(getInstagramState(world, deviceId)?.posts ?? [])].sort(
    (a, b) => b.createdAt - a.createdAt,
  );
}

export function getFocusedFeedPostId(world: WorldState, deviceId: string): string | null {
  const state = getInstagramState(world, deviceId);
  if (!state || state.currentScreen !== "home") return null;
  return state.activePostId ?? null;
}

export function getCommentsForPost(world: WorldState, deviceId: string, postId: string | null): InstagramComment[] {
  if (!postId) return [];
  return [...(getInstagramState(world, deviceId)?.comments ?? [])]
    .filter((comment) => comment.postId === postId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getStorySets(world: WorldState, deviceId: string): InstagramStorySet[] {
  return getInstagramState(world, deviceId)?.storySets ?? [];
}

export function getStoriesForSet(world: WorldState, deviceId: string, storySetId: string | null): InstagramStory[] {
  const state = getInstagramState(world, deviceId);
  if (!state || !storySetId) return [];
  const set = state.storySets.find((item) => item.id === storySetId);
  if (!set) return [];
  const byId = new Map(state.stories.map((story) => [story.id, story]));
  return set.storyIds.map((id) => byId.get(id)).filter(Boolean) as InstagramStory[];
}

export function getActiveStorySet(world: WorldState, deviceId: string): InstagramStorySet | null {
  const state = getInstagramState(world, deviceId);
  if (!state?.activeStorySetId) return null;
  return state.storySets.find((item) => item.id === state.activeStorySetId) ?? null;
}

export function getActiveStory(world: WorldState, deviceId: string): InstagramStory | null {
  const state = getInstagramState(world, deviceId);
  if (!state?.activeStoryId) return null;
  return state.stories.find((story) => story.id === state.activeStoryId) ?? null;
}

export function getInboxThreads(world: WorldState, deviceId: string): InstagramDMThread[] {
  return [...(getInstagramState(world, deviceId)?.dmThreads ?? [])].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0);
  });
}

export function getActiveThread(world: WorldState, deviceId: string): InstagramDMThread | null {
  const state = getInstagramState(world, deviceId);
  if (!state?.activeThreadId) return null;
  return state.dmThreads.find((thread) => thread.id === state.activeThreadId) ?? null;
}

export function getVisibleDMMessages(
  world: WorldState,
  deviceId: string,
  threadId: string | null,
): InstagramDMMessage[] {
  const state = getInstagramState(world, deviceId);
  if (!state || !threadId) return [];
  const thread = state.dmThreads.find((item) => item.id === threadId);
  if (!thread) return [];
  const byId = new Map(state.dmMessages.map((message) => [message.id, message]));
  return thread.messageIds
    .map((id) => byId.get(id))
    .filter((message): message is InstagramDMMessage => Boolean(message))
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getThreadDraft(world: WorldState, deviceId: string, threadId: string | null): string {
  const state = getInstagramState(world, deviceId);
  if (!state || !threadId) return "";
  return state.threadDrafts[threadId] ?? "";
}

export function getVisibleNotifications(world: WorldState, deviceId: string): InstagramNotification[] {
  return getInstagramState(world, deviceId)?.notifications ?? [];
}

export function getUnreadDMCount(world: WorldState, deviceId: string): number {
  return (getInstagramState(world, deviceId)?.dmThreads ?? []).reduce(
    (sum, thread) => sum + thread.unreadCount,
    0,
  );
}

export function getUnreadNotificationCount(world: WorldState, deviceId: string): number {
  return (getInstagramState(world, deviceId)?.notifications ?? []).filter((item) => !item.read)
    .length;
}

export function getActiveProfile(world: WorldState, deviceId: string): InstagramUser | null {
  const state = getInstagramState(world, deviceId);
  if (!state) return null;
  return getUserById(world, deviceId, state.activeProfileId ?? state.currentUserId);
}

export function getProfilePosts(world: WorldState, deviceId: string, profileId: string | null): InstagramPost[] {
  if (!profileId) return [];
  return getVisibleFeedPosts(world, deviceId).filter((post) => post.authorId === profileId);
}
