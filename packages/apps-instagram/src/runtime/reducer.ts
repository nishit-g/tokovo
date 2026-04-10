import type { PluginReducer, RuntimeEvent, WorldState } from "@tokovo/core";
import type {
  InstagramComment,
  InstagramDMMessage,
  InstagramDMThread,
  InstagramNotification,
  InstagramPost,
  InstagramRoute,
  InstagramState,
  InstagramStory,
  InstagramStorySet,
  InstagramUser,
} from "./state.js";
import { createInstagramInitialState } from "./state.js";

function ensureMutableArray<T>(value: T[] | undefined | null): T[] {
  if (!Array.isArray(value)) return [];
  return Object.isExtensible(value) ? value : [...value];
}

function ensureMutableRecord<T extends Record<string, unknown>>(value: T | undefined | null): T {
  if (!value || typeof value !== "object") return {} as T;
  return Object.isExtensible(value) ? value : { ...value };
}

function syncViewMode(state: InstagramState): void {
  if (state.currentScreen === "thread") {
    state.viewMode = "CHAT";
    state.conversationId = state.activeThreadId ?? undefined;
    return;
  }
  if (state.currentScreen === "story" || state.currentScreen === "composer") {
    state.viewMode = "FULLSCREEN";
    state.conversationId = undefined;
    return;
  }
  state.viewMode = "FEED";
  state.conversationId = undefined;
}

function getAppState(draft: WorldState): InstagramState {
  draft.appState ??= {};
  draft.appState.app_instagram ??= createInstagramInitialState();
  const state = draft.appState.app_instagram as InstagramState;
  state.users = ensureMutableArray(state.users);
  state.posts = ensureMutableArray(state.posts);
  state.comments = ensureMutableArray(state.comments);
  state.storySets = ensureMutableArray(state.storySets);
  state.stories = ensureMutableArray(state.stories);
  state.dmThreads = ensureMutableArray(state.dmThreads);
  state.dmMessages = ensureMutableArray(state.dmMessages);
  state.notifications = ensureMutableArray(state.notifications);
  state.threadDrafts = ensureMutableRecord(state.threadDrafts);
  state.navigationStack = ensureMutableArray(state.navigationStack);
  state.composerDraft ??= { caption: "" };
  state.profileTab ??= "posts";
  state.statusBarTheme ??= "dark";
  state.themeMode ??= "light";
  state.lastNavFrame ??= 0;
  syncViewMode(state);
  return state;
}

function ensureUser(payload: Partial<InstagramUser>): InstagramUser {
  return {
    id: payload.id ?? "ig-user-unknown",
    username: payload.username ?? "unknown",
    displayName: payload.displayName ?? "Unknown",
    avatarUrl: payload.avatarUrl,
    bio: payload.bio,
    followers: payload.followers ?? 0,
    following: payload.following ?? 0,
    followerIds: Array.isArray(payload.followerIds) ? [...payload.followerIds] : [],
    followingIds: Array.isArray(payload.followingIds) ? [...payload.followingIds] : [],
    verified: payload.verified ?? false,
  };
}

function ensurePost(payload: Partial<InstagramPost> & {
  id: string;
  authorId: string;
  imageUrl: string;
  caption: string;
  createdAt: number;
}): InstagramPost {
  return {
    id: payload.id,
    authorId: payload.authorId,
    imageUrl: payload.imageUrl,
    caption: payload.caption,
    createdAt: payload.createdAt,
    location: payload.location,
    aspect: payload.aspect ?? "portrait",
    likeCount: payload.likeCount ?? 0,
    commentCount: payload.commentCount ?? 0,
    commentIds: Array.isArray(payload.commentIds) ? [...payload.commentIds] : [],
    likedBy: Array.isArray(payload.likedBy) ? [...payload.likedBy] : [],
  };
}

function ensureComment(payload: Partial<InstagramComment> & {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: number;
}): InstagramComment {
  return {
    id: payload.id,
    postId: payload.postId,
    authorId: payload.authorId,
    text: payload.text,
    createdAt: payload.createdAt,
  };
}

function ensureStory(payload: Partial<InstagramStory> & {
  id: string;
  authorId: string;
  mediaUrl: string;
  createdAt: number;
}): InstagramStory {
  return {
    id: payload.id,
    authorId: payload.authorId,
    mediaUrl: payload.mediaUrl,
    createdAt: payload.createdAt,
    durationFrames: payload.durationFrames ?? 90,
    accentColor: payload.accentColor,
  };
}

function ensureStorySet(payload: Partial<InstagramStorySet> & {
  id: string;
  userId: string;
  storyIds: string[];
}): InstagramStorySet {
  return {
    id: payload.id,
    userId: payload.userId,
    storyIds: [...payload.storyIds],
    lastViewedStoryId: payload.lastViewedStoryId ?? null,
  };
}

function ensureThread(payload: Partial<InstagramDMThread> & {
  id: string;
  participantIds: string[];
}): InstagramDMThread {
  return {
    id: payload.id,
    participantIds: [...payload.participantIds],
    title: payload.title,
    unreadCount: payload.unreadCount ?? 0,
    pinned: payload.pinned ?? false,
    typingUserId: payload.typingUserId ?? null,
    messageIds: Array.isArray(payload.messageIds) ? [...payload.messageIds] : [],
    lastMessageAt: payload.lastMessageAt ?? null,
  };
}

function ensureMessage(payload: Partial<InstagramDMMessage> & {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: number;
}): InstagramDMMessage {
  return {
    id: payload.id,
    threadId: payload.threadId,
    senderId: payload.senderId,
    text: payload.text,
    createdAt: payload.createdAt,
    storyId: payload.storyId,
  };
}

function buildRoute(state: InstagramState): InstagramRoute {
  return {
    screen: state.currentScreen,
    postId: state.activePostId ?? undefined,
    profileId: state.activeProfileId ?? undefined,
    threadId: state.activeThreadId ?? undefined,
    storySetId: state.activeStorySetId ?? undefined,
    storyId: state.activeStoryId ?? undefined,
  };
}

function routesEqual(a: InstagramRoute, b: InstagramRoute): boolean {
  return (
    a.screen === b.screen &&
    a.postId === b.postId &&
    a.profileId === b.profileId &&
    a.threadId === b.threadId &&
    a.storySetId === b.storySetId &&
    a.storyId === b.storyId
  );
}

function markNotificationsRead(state: InstagramState): void {
  for (const notification of state.notifications) notification.read = true;
}

function markThreadRead(state: InstagramState, threadId: string | null | undefined): void {
  if (!threadId) return;
  const thread = state.dmThreads.find((item) => item.id === threadId);
  if (thread) thread.unreadCount = 0;
}

function upsertById<T extends { id: string }>(list: T[], value: T): void {
  const index = list.findIndex((item) => item.id === value.id);
  if (index >= 0) list.splice(index, 1, value);
  else list.push(value);
}

export const instagramReducer: PluginReducer<"app_instagram"> = (
  draft: WorldState,
  event: RuntimeEvent & { kind: "APP"; appId: "app_instagram" },
) => {
  const state = getAppState(draft);

  switch (event.type) {
    case "ADD_USER": {
      const payload = event.payload as Partial<InstagramUser>;
      upsertById(state.users, ensureUser(payload));
      break;
    }
    case "SET_CURRENT_USER": {
      const payload = event.payload as { userId: string };
      state.currentUserId = payload.userId;
      break;
    }
    case "FOLLOW_USER": {
      const payload = event.payload as { followerId: string; followingId: string };
      const follower = state.users.find((item) => item.id === payload.followerId);
      const following = state.users.find((item) => item.id === payload.followingId);
      if (follower && !follower.followingIds.includes(payload.followingId)) {
        follower.followingIds.push(payload.followingId);
        follower.following += 1;
      }
      if (following && !following.followerIds.includes(payload.followerId)) {
        following.followerIds.push(payload.followerId);
        following.followers += 1;
      }
      break;
    }
    case "ADD_POST": {
      const payload = event.payload as Partial<InstagramPost> & {
        id: string;
        authorId: string;
        imageUrl: string;
        caption: string;
        createdAt: number;
      };
      upsertById(state.posts, ensurePost(payload));
      state.posts.sort((a, b) => b.createdAt - a.createdAt);
      break;
    }
    case "LIKE_POST": {
      const payload = event.payload as { postId: string; userId: string };
      const post = state.posts.find((item) => item.id === payload.postId);
      if (post && !post.likedBy.includes(payload.userId)) {
        post.likedBy.push(payload.userId);
        post.likeCount += 1;
      }
      break;
    }
    case "ADD_COMMENT": {
      const payload = event.payload as Partial<InstagramComment> & {
        id: string;
        postId: string;
        authorId: string;
        text: string;
        createdAt: number;
      };
      const comment = ensureComment(payload);
      upsertById(state.comments, comment);
      const post = state.posts.find((item) => item.id === comment.postId);
      if (post && !post.commentIds.includes(comment.id)) {
        post.commentIds.push(comment.id);
        post.commentCount += 1;
      }
      break;
    }
    case "ADD_STORY_SET": {
      const payload = event.payload as Partial<InstagramStorySet> & {
        id: string;
        userId: string;
        storyIds: string[];
        stories?: InstagramStory[];
      };
      if (Array.isArray(payload.stories)) {
        for (const story of payload.stories) {
          upsertById(state.stories, ensureStory(story));
        }
      }
      upsertById(state.storySets, ensureStorySet(payload));
      break;
    }
    case "OPEN_STORY": {
      const payload = event.payload as { storySetId: string; storyId?: string };
      const storySet = state.storySets.find((item) => item.id === payload.storySetId);
      const nextStoryId = payload.storyId ?? storySet?.storyIds[0] ?? null;
      state.currentScreen = "story";
      state.activeStorySetId = payload.storySetId;
      state.activeStoryId = nextStoryId;
      if (storySet && nextStoryId) storySet.lastViewedStoryId = nextStoryId;
      state.statusBarTheme = "light";
      state.lastNavFrame = event.at;
      syncViewMode(state);
      break;
    }
    case "ADVANCE_STORY": {
      const payload = event.payload as { storySetId: string; direction?: "next" | "prev" };
      const set = state.storySets.find((item) => item.id === payload.storySetId);
      if (!set) break;
      const currentIndex = Math.max(0, set.storyIds.indexOf(state.activeStoryId ?? ""));
      const delta = payload.direction === "prev" ? -1 : 1;
      const nextIndex = Math.min(set.storyIds.length - 1, Math.max(0, currentIndex + delta));
      const nextStoryId = set.storyIds[nextIndex] ?? null;
      state.activeStorySetId = set.id;
      state.activeStoryId = nextStoryId;
      if (nextStoryId) set.lastViewedStoryId = nextStoryId;
      break;
    }
    case "ADD_DM_THREAD": {
      const payload = event.payload as Partial<InstagramDMThread> & {
        id: string;
        participantIds: string[];
      };
      upsertById(state.dmThreads, ensureThread(payload));
      break;
    }
    case "ADD_DM_MESSAGE": {
      const payload = event.payload as Partial<InstagramDMMessage> & {
        id: string;
        threadId: string;
        senderId: string;
        text: string;
        createdAt: number;
      };
      const message = ensureMessage(payload);
      upsertById(state.dmMessages, message);
      const thread = state.dmThreads.find((item) => item.id === message.threadId);
      if (thread && !thread.messageIds.includes(message.id)) {
        thread.messageIds.push(message.id);
        thread.lastMessageAt = message.createdAt;
        if (message.senderId !== state.currentUserId && state.activeThreadId !== thread.id) {
          thread.unreadCount += 1;
        }
      }
      break;
    }
    case "SET_THREAD_DRAFT": {
      const payload = event.payload as { threadId: string; text: string };
      state.threadDrafts[payload.threadId] = payload.text;
      break;
    }
    case "SET_THREAD_TYPING": {
      const payload = event.payload as { threadId: string; userId: string | null };
      const thread = state.dmThreads.find((item) => item.id === payload.threadId);
      if (thread) thread.typingUserId = payload.userId;
      break;
    }
    case "ADD_NOTIFICATION": {
      const payload = event.payload as InstagramNotification;
      state.notifications = state.notifications.filter((item) => item.id !== payload.id);
      state.notifications.unshift({
        ...payload,
        createdAt: payload.createdAt ?? event.at,
        read: payload.read ?? state.currentScreen === "notifications",
      });
      break;
    }
    case "DISMISS_NOTIFICATION": {
      const payload = event.payload as { id: string };
      state.notifications = state.notifications.filter((item) => item.id !== payload.id);
      break;
    }
    case "SET_SCREEN": {
      const payload = event.payload as InstagramRoute;
      const currentRoute = buildRoute(state);
      if (!routesEqual(currentRoute, payload)) {
        state.navigationStack.push(currentRoute);
      }
      state.currentScreen = payload.screen;
      state.activePostId = payload.postId ?? null;
      state.activeProfileId = payload.profileId ?? null;
      state.activeThreadId = payload.threadId ?? null;
      state.activeStorySetId = payload.storySetId ?? null;
      state.activeStoryId = payload.storyId ?? null;
      state.lastNavFrame = event.at;
      if (payload.screen === "notifications") markNotificationsRead(state);
      if (payload.screen === "thread") markThreadRead(state, payload.threadId);
      state.statusBarTheme = payload.screen === "story" ? "light" : "dark";
      syncViewMode(state);
      break;
    }
    case "SET_ACTIVE_POST": {
      const payload = event.payload as { postId: string | null };
      state.activePostId = payload.postId;
      break;
    }
    case "SET_ACTIVE_PROFILE": {
      const payload = event.payload as { profileId: string | null };
      state.activeProfileId = payload.profileId;
      break;
    }
    case "SET_ACTIVE_THREAD": {
      const payload = event.payload as { threadId: string | null };
      state.activeThreadId = payload.threadId;
      markThreadRead(state, payload.threadId);
      syncViewMode(state);
      break;
    }
    case "SET_ACTIVE_STORY_SET": {
      const payload = event.payload as { storySetId: string | null };
      state.activeStorySetId = payload.storySetId;
      break;
    }
    case "SET_ACTIVE_STORY": {
      const payload = event.payload as { storyId: string | null };
      state.activeStoryId = payload.storyId;
      break;
    }
    case "NAVIGATE_BACK": {
      const previous = state.navigationStack.pop();
      if (!previous) break;
      state.currentScreen = previous.screen;
      state.activePostId = previous.postId ?? null;
      state.activeProfileId = previous.profileId ?? null;
      state.activeThreadId = previous.threadId ?? null;
      state.activeStorySetId = previous.storySetId ?? null;
      state.activeStoryId = previous.storyId ?? null;
      state.lastNavFrame = event.at;
      state.statusBarTheme = previous.screen === "story" ? "light" : "dark";
      syncViewMode(state);
      break;
    }
    case "SET_COMPOSER_DRAFT": {
      const payload = event.payload as {
        caption?: string;
        imageUrl?: string;
        location?: string;
      };
      state.composerDraft = {
        caption: payload.caption ?? "",
        imageUrl: payload.imageUrl,
        location: payload.location,
      };
      break;
    }
    case "SET_PROFILE_TAB": {
      const payload = event.payload as { tab: InstagramState["profileTab"] };
      state.profileTab = payload.tab;
      break;
    }
    case "SET_THEME_MODE": {
      const payload = event.payload as { mode: InstagramState["themeMode"] };
      state.themeMode = payload.mode;
      break;
    }
    default:
      break;
  }
};
