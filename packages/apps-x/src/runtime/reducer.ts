import type { WorldState, PluginReducer, RuntimeEvent } from "@tokovo/core";
import type {
  ProfileTab,
  TimelineTab,
  XDMMessage,
  XDMThread,
  XNotification,
  XRoute,
  XState,
  XTweet,
  XUser,
} from "./state.js";
import { createXInitialState } from "./state.js";

function ensureMutableArray<T>(value: T[] | undefined | null): T[] {
  if (!Array.isArray(value)) return [];
  // Some seed payloads may carry frozen arrays. Avoid runtime reducer crashes.
  return Object.isExtensible(value) ? value : [...value];
}

function ensureMutableRecord<T extends Record<string, unknown>>(
  value: T | undefined | null,
): T {
  if (!value || typeof value !== "object") return {} as T;
  return Object.isExtensible(value) ? value : { ...value };
}

function syncViewMode(state: XState): void {
  // Canonical screen-to-view mapping (required by LayoutEngine).
  // - compose: FULLSCREEN
  // - DM thread: CHAT
  // - everything else: FEED
  if (state.currentScreen === "compose") {
    state.viewMode = "FULLSCREEN";
    state.conversationId = undefined;
    return;
  }
  if (state.currentScreen === "thread") {
    state.viewMode = "CHAT";
    state.conversationId = state.activeThreadId ?? undefined;
    return;
  }
  state.viewMode = "FEED";
  state.conversationId = undefined;
}

function getAppState(draft: WorldState): XState {
  if (!draft.appState) {
    draft.appState = {};
  }
  if (!draft.appState["app_x"]) {
    draft.appState["app_x"] = createXInitialState();
  }
  const state = draft.appState["app_x"] as XState;
  state.users = ensureMutableArray(state.users);
  state.tweets = ensureMutableArray(state.tweets);
  state.timeline = ensureMutableArray(state.timeline);
  state.notifications = ensureMutableArray(state.notifications);
  state.dmThreads = ensureMutableArray(state.dmThreads);
  state.dmMessages = ensureMutableArray(state.dmMessages);
  state.composeDraft ??= "";
  state.currentScreen ??= "timeline";
  state.activeTweetId ??= null;
  state.activeUserId ??= null;
  state.activeThreadId ??= null;
  state.currentUserId ??= null;
  state.notificationsTab ??= "all";
  state.timelineTab ??= "forYou";
  state.profileTab ??= "posts";
  state.navigationStack ??= [];
  state.lastNavFrame ??= 0;
  state.statusBarTheme ??= "dark";
  state.themeMode ??= "dark";
  state.threadDrafts = ensureMutableRecord(state.threadDrafts);
  state.viewMode ??= "FEED";
  state.conversationId ??= undefined;
  for (const notification of state.notifications) {
    notification.read ??= false;
  }
  for (const thread of state.dmThreads) {
    thread.unreadCount ??= 0;
    thread.pinned ??= false;
    thread.typingUserId ??= null;
    thread.lastMessageAt ??= null;
  }
  syncViewMode(state);
  return state;
}

function ensureUserDefaults(payload: Partial<XUser>): XUser {
  return {
    id: payload.id ?? "user-unknown",
    name: payload.name ?? "Unknown",
    handle: payload.handle ?? "unknown",
    bio: payload.bio,
    avatarUrl: payload.avatarUrl,
    followers: payload.followers ?? 0,
    following: payload.following ?? 0,
    followerIds: Array.isArray(payload.followerIds)
      ? [...payload.followerIds]
      : [],
    followingIds: Array.isArray(payload.followingIds)
      ? [...payload.followingIds]
      : [],
    verified: payload.verified ?? null,
  };
}

function buildRoute(state: XState): XRoute {
  return {
    screen: state.currentScreen,
    tweetId: state.activeTweetId ?? undefined,
    userId: state.activeUserId ?? undefined,
    threadId: state.activeThreadId ?? undefined,
  };
}

function routesEqual(a: XRoute, b: XRoute): boolean {
  return (
    a.screen === b.screen &&
    a.tweetId === b.tweetId &&
    a.userId === b.userId &&
    a.threadId === b.threadId
  );
}

function insertTopLevelTweetByCreatedAt(
  state: XState,
  tweetId: string,
  createdAt: number,
): void {
  const existingIndex = state.timeline.indexOf(tweetId);
  if (existingIndex >= 0) {
    state.timeline.splice(existingIndex, 1);
  }

  const insertAt = state.timeline.findIndex((id) => {
    const existingTweet = state.tweets.find((t) => t.id === id);
    if (!existingTweet) return false;
    return existingTweet.createdAt < createdAt;
  });

  if (insertAt >= 0) {
    state.timeline.splice(insertAt, 0, tweetId);
    return;
  }
  state.timeline.push(tweetId);
}

function markNotificationsRead(state: XState): void {
  for (const notification of state.notifications) {
    notification.read = true;
  }
}

function markThreadRead(state: XState, threadId: string | null | undefined): void {
  if (!threadId) return;
  const thread = state.dmThreads.find((item) => item.id === threadId);
  if (!thread) return;
  thread.unreadCount = 0;
}

function getThreadById(state: XState, threadId: string): XDMThread | undefined {
  return state.dmThreads.find((thread) => thread.id === threadId);
}

export const xReducer: PluginReducer<"app_x"> = (
  draft: WorldState,
  event: RuntimeEvent & { kind: "APP"; appId: "app_x" }
) => {
  const appState = getAppState(draft);

  switch (event.type) {
    case "ADD_USER": {
      const payload = event.payload as Partial<XUser>;
      const existing = appState.users.find((u) => u.id === payload.id);
      if (existing) {
        Object.assign(existing, ensureUserDefaults({ ...existing, ...payload }));
      } else {
        appState.users.push(ensureUserDefaults(payload));
      }
      break;
    }
    case "SET_CURRENT_USER": {
      const payload = event.payload as { userId: string };
      appState.currentUserId = payload.userId;
      break;
    }
    case "FOLLOW_USER": {
      const payload = event.payload as { followerId: string; followingId: string };
      const follower = appState.users.find((u) => u.id === payload.followerId);
      const following = appState.users.find((u) => u.id === payload.followingId);
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
    case "UNFOLLOW_USER": {
      const payload = event.payload as { followerId: string; followingId: string };
      const follower = appState.users.find((u) => u.id === payload.followerId);
      const following = appState.users.find((u) => u.id === payload.followingId);
      if (follower) {
        const hadRelationship = follower.followingIds.includes(payload.followingId);
        if (hadRelationship) {
          follower.followingIds = follower.followingIds.filter((id) => id !== payload.followingId);
          follower.following = Math.max(0, follower.following - 1);
        }
      }
      if (following) {
        const hadRelationship = following.followerIds.includes(payload.followerId);
        if (hadRelationship) {
          following.followerIds = following.followerIds.filter((id) => id !== payload.followerId);
          following.followers = Math.max(0, following.followers - 1);
        }
      }
      break;
    }
    case "ADD_TWEET": {
      const payload = event.payload as Partial<XTweet> & {
        id: string;
        authorId: string;
        text?: string;
        createdAt: number;
        replyToId?: string;
        repostOfId?: string;
        quoteTweetId?: string;
      };

      const tweet: XTweet = {
        id: payload.id,
        authorId: payload.authorId,
        text: payload.text ?? "",
        createdAt: payload.createdAt,
        replyToId: payload.replyToId,
        repostOfId: payload.repostOfId,
        quoteTweetId: payload.quoteTweetId,
        media: payload.media,
        linkPreview: payload.linkPreview,
        poll: payload.poll,
        hashtags: Array.isArray(payload.hashtags) ? [...payload.hashtags] : [],
        mentions: Array.isArray(payload.mentions) ? [...payload.mentions] : [],
        likeCount: payload.likeCount ?? 0,
        repostCount: payload.repostCount ?? 0,
        replyIds: Array.isArray(payload.replyIds) ? [...payload.replyIds] : [],
        likedBy: Array.isArray(payload.likedBy) ? [...payload.likedBy] : [],
        viewCount: payload.viewCount ?? 0,
        bookmarkCount: payload.bookmarkCount ?? 0,
        shareCount: payload.shareCount ?? 0,
      };
      const existingIndex = appState.tweets.findIndex((item) => item.id === tweet.id);
      if (existingIndex >= 0) {
        appState.tweets.splice(existingIndex, 1, tweet);
      } else {
        appState.tweets.push(tweet);
      }
      const shouldAppearInTimeline = !tweet.replyToId;
      if (shouldAppearInTimeline) {
        insertTopLevelTweetByCreatedAt(appState, tweet.id, tweet.createdAt);
      }

      if (tweet.replyToId) {
        const parent = appState.tweets.find((t) => t.id === tweet.replyToId);
        if (parent && !parent.replyIds.includes(tweet.id)) parent.replyIds.push(tweet.id);
      }

      if (tweet.repostOfId) {
        const original = appState.tweets.find((t) => t.id === tweet.repostOfId);
        if (original) original.repostCount += 1;
      }
      break;
    }
    case "LIKE_TWEET": {
      const payload = event.payload as { tweetId: string; userId: string };
      const tweet = appState.tweets.find((t) => t.id === payload.tweetId);
      if (tweet && !tweet.likedBy.includes(payload.userId)) {
        tweet.likedBy.push(payload.userId);
        tweet.likeCount += 1;
      }
      break;
    }
    case "VIEW_TWEET": {
      const payload = event.payload as { tweetId: string };
      const tweet = appState.tweets.find((t) => t.id === payload.tweetId);
      if (tweet) tweet.viewCount += 1;
      break;
    }
    case "BOOKMARK_TWEET": {
      const payload = event.payload as { tweetId: string };
      const tweet = appState.tweets.find((t) => t.id === payload.tweetId);
      if (tweet) tweet.bookmarkCount += 1;
      break;
    }
    case "SHARE_TWEET": {
      const payload = event.payload as { tweetId: string };
      const tweet = appState.tweets.find((t) => t.id === payload.tweetId);
      if (tweet) tweet.shareCount += 1;
      break;
    }
    case "SET_SCREEN": {
      const payload = event.payload as {
        screen: XState["currentScreen"];
        tweetId?: string;
        userId?: string;
        threadId?: string;
      };
      const currentRoute = buildRoute(appState);
      const nextRoute: XRoute = {
        screen: payload.screen,
        tweetId: payload.tweetId,
        userId: payload.userId,
        threadId: payload.threadId,
      };

      if (!routesEqual(currentRoute, nextRoute)) {
        appState.navigationStack.push(currentRoute);
      }

      appState.currentScreen = payload.screen;
      appState.activeTweetId = payload.tweetId ?? null;
      appState.activeUserId = payload.userId ?? null;
      appState.activeThreadId = payload.threadId ?? null;
      appState.lastNavFrame = event.at;
      if (payload.screen === "notifications") {
        markNotificationsRead(appState);
      }
      if (payload.screen === "thread") {
        markThreadRead(appState, payload.threadId ?? null);
      }
      syncViewMode(appState);
      break;
    }
    case "NAVIGATE_BACK": {
      const previous = appState.navigationStack.pop();
      if (previous) {
        appState.currentScreen = previous.screen;
        appState.activeTweetId = previous.tweetId ?? null;
        appState.activeUserId = previous.userId ?? null;
        appState.activeThreadId = previous.threadId ?? null;
        appState.lastNavFrame = event.at;
        syncViewMode(appState);
      }
      break;
    }
    case "SET_ACTIVE_TWEET": {
      const payload = event.payload as { tweetId: string | null };
      appState.activeTweetId = payload.tweetId;
      break;
    }
    case "SET_ACTIVE_USER": {
      const payload = event.payload as { userId: string | null };
      appState.activeUserId = payload.userId;
      break;
    }
    case "SET_ACTIVE_THREAD": {
      const payload = event.payload as { threadId: string | null };
      appState.activeThreadId = payload.threadId;
      markThreadRead(appState, payload.threadId);
      syncViewMode(appState);
      break;
    }
    case "SET_COMPOSE_DRAFT": {
      const payload = event.payload as { text: string };
      appState.composeDraft = payload.text;
      break;
    }
    case "SET_THREAD_DRAFT": {
      const payload = event.payload as { threadId: string; text: string };
      appState.threadDrafts[payload.threadId] = payload.text;
      break;
    }
    case "SET_THREAD_TYPING": {
      const payload = event.payload as { threadId: string; userId: string | null };
      const thread = getThreadById(appState, payload.threadId);
      if (thread) {
        thread.typingUserId = payload.userId;
      }
      break;
    }
    case "SET_TIMELINE_TAB": {
      const payload = event.payload as { tab: TimelineTab };
      appState.timelineTab = payload.tab;
      break;
    }
    case "SET_PROFILE_TAB": {
      const payload = event.payload as { tab: ProfileTab };
      appState.profileTab = payload.tab;
      break;
    }
    case "SET_NOTIFICATIONS_TAB": {
      const payload = event.payload as { tab: XState["notificationsTab"] };
      appState.notificationsTab = payload.tab;
      if (appState.currentScreen === "notifications") {
        markNotificationsRead(appState);
      }
      break;
    }
    case "ADD_NOTIFICATION": {
      const payload = event.payload as XNotification;
      appState.notifications = appState.notifications.filter((item) => item.id !== payload.id);
      appState.notifications.unshift({
        ...payload,
        read:
          payload.read ??
          appState.currentScreen === "notifications",
      });
      break;
    }
    case "ADD_DM_THREAD": {
      const payload = event.payload as XDMThread;
      const existing = appState.dmThreads.find((t) => t.id === payload.id);
      if (existing) {
        existing.participantIds = Array.isArray(payload.participantIds)
          ? [...payload.participantIds]
          : existing.participantIds;
        existing.title = payload.title ?? existing.title;
        existing.unreadCount = payload.unreadCount ?? existing.unreadCount;
        existing.pinned = payload.pinned ?? existing.pinned;
      } else {
        appState.dmThreads.push({
          ...payload,
          // Payload arrays can be frozen (seed data). Clone to keep reducer safe.
          participantIds: Array.isArray(payload.participantIds)
            ? [...payload.participantIds]
            : [],
          messageIds: Array.isArray(payload.messageIds) ? [...payload.messageIds] : [],
          title: payload.title,
          unreadCount: payload.unreadCount ?? 0,
          pinned: payload.pinned ?? false,
          typingUserId: payload.typingUserId ?? null,
          lastMessageAt: payload.lastMessageAt ?? null,
        });
      }
      break;
    }
    case "ADD_DM_MESSAGE": {
      const payload = event.payload as XDMMessage;
      // Defensive: some upstream seed data / previous frames may contain frozen arrays.
      appState.dmMessages = ensureMutableArray(appState.dmMessages);
      if (!appState.dmMessages.find((message) => message.id === payload.id)) {
        appState.dmMessages.push(payload);
      }
      const thread = appState.dmThreads.find((t) => t.id === payload.threadId);
      if (thread) {
        thread.messageIds = ensureMutableArray(thread.messageIds);
        if (!thread.messageIds.includes(payload.id)) {
          thread.messageIds.push(payload.id);
        }
        thread.lastMessageAt =
          thread.lastMessageAt === null || thread.lastMessageAt === undefined
            ? payload.createdAt
            : Math.max(thread.lastMessageAt, payload.createdAt);
        if (thread.typingUserId === payload.senderId) {
          thread.typingUserId = null;
        }
        const isActiveThread =
          appState.currentScreen === "thread" &&
          appState.activeThreadId === payload.threadId;
        if (payload.senderId !== appState.currentUserId && !isActiveThread) {
          thread.unreadCount += 1;
        }
      }
      break;
    }
    case "SET_THEME_MODE": {
      const payload = event.payload as { mode: "dark" | "light" | "ghibli" };
      appState.themeMode = payload.mode;
      break;
    }
  }
};
