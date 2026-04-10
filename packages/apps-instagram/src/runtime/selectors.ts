import type { WorldState } from "@tokovo/core";
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

export function getInstagramState(world: WorldState): InstagramState | undefined {
  return world.appState?.app_instagram as InstagramState | undefined;
}

export function getActiveSurface(world: WorldState): InstagramState["currentScreen"] {
  return getInstagramState(world)?.currentScreen ?? "home";
}

export function getThemeMode(world: WorldState): InstagramState["themeMode"] {
  return getInstagramState(world)?.themeMode ?? "light";
}

export function getCurrentUser(world: WorldState): InstagramUser | null {
  const state = getInstagramState(world);
  if (!state?.currentUserId) return null;
  return state.users.find((user) => user.id === state.currentUserId) ?? null;
}

export function getUserById(world: WorldState, userId: string | null): InstagramUser | null {
  if (!userId) return null;
  return getInstagramState(world)?.users.find((user) => user.id === userId) ?? null;
}

export function getVisibleFeedPosts(world: WorldState): InstagramPost[] {
  return [...(getInstagramState(world)?.posts ?? [])].sort(
    (a, b) => b.createdAt - a.createdAt,
  );
}

export function getCommentsForPost(world: WorldState, postId: string | null): InstagramComment[] {
  if (!postId) return [];
  return [...(getInstagramState(world)?.comments ?? [])]
    .filter((comment) => comment.postId === postId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getStorySets(world: WorldState): InstagramStorySet[] {
  return getInstagramState(world)?.storySets ?? [];
}

export function getStoriesForSet(world: WorldState, storySetId: string | null): InstagramStory[] {
  const state = getInstagramState(world);
  if (!state || !storySetId) return [];
  const set = state.storySets.find((item) => item.id === storySetId);
  if (!set) return [];
  const byId = new Map(state.stories.map((story) => [story.id, story]));
  return set.storyIds.map((id) => byId.get(id)).filter(Boolean) as InstagramStory[];
}

export function getActiveStorySet(world: WorldState): InstagramStorySet | null {
  const state = getInstagramState(world);
  if (!state?.activeStorySetId) return null;
  return state.storySets.find((item) => item.id === state.activeStorySetId) ?? null;
}

export function getActiveStory(world: WorldState): InstagramStory | null {
  const state = getInstagramState(world);
  if (!state?.activeStoryId) return null;
  return state.stories.find((story) => story.id === state.activeStoryId) ?? null;
}

export function getInboxThreads(world: WorldState): InstagramDMThread[] {
  return [...(getInstagramState(world)?.dmThreads ?? [])].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0);
  });
}

export function getActiveThread(world: WorldState): InstagramDMThread | null {
  const state = getInstagramState(world);
  if (!state?.activeThreadId) return null;
  return state.dmThreads.find((thread) => thread.id === state.activeThreadId) ?? null;
}

export function getVisibleDMMessages(
  world: WorldState,
  threadId: string | null,
): InstagramDMMessage[] {
  const state = getInstagramState(world);
  if (!state || !threadId) return [];
  const thread = state.dmThreads.find((item) => item.id === threadId);
  if (!thread) return [];
  const byId = new Map(state.dmMessages.map((message) => [message.id, message]));
  return thread.messageIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .sort((a, b) => a!.createdAt - b!.createdAt) as InstagramDMMessage[];
}

export function getThreadDraft(world: WorldState, threadId: string | null): string {
  const state = getInstagramState(world);
  if (!state || !threadId) return "";
  return state.threadDrafts[threadId] ?? "";
}

export function getVisibleNotifications(world: WorldState): InstagramNotification[] {
  return getInstagramState(world)?.notifications ?? [];
}

export function getUnreadDMCount(world: WorldState): number {
  return (getInstagramState(world)?.dmThreads ?? []).reduce(
    (sum, thread) => sum + thread.unreadCount,
    0,
  );
}

export function getUnreadNotificationCount(world: WorldState): number {
  return (getInstagramState(world)?.notifications ?? []).filter((item) => !item.read)
    .length;
}

export function getActiveProfile(world: WorldState): InstagramUser | null {
  const state = getInstagramState(world);
  if (!state) return null;
  return getUserById(world, state.activeProfileId ?? state.currentUserId);
}

export function getProfilePosts(world: WorldState, profileId: string | null): InstagramPost[] {
  if (!profileId) return [];
  return getVisibleFeedPosts(world).filter((post) => post.authorId === profileId);
}
