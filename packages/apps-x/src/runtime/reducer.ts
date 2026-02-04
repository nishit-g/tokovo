import type { WorldState, PluginReducer, RuntimeEvent } from "@tokovo/core";
import type { XState, XTweet, XUser, XNotification, XDMThread, XDMMessage, XRoute } from "./state";
import { createXInitialState } from "./state";

function getAppState(draft: WorldState): XState {
  if (!draft.appState) {
    draft.appState = {};
  }
  if (!draft.appState["app_x"]) {
    draft.appState["app_x"] = createXInitialState();
  }
  const state = draft.appState["app_x"] as XState;
  state.users ??= [];
  state.tweets ??= [];
  state.timeline ??= [];
  state.notifications ??= [];
  state.dmThreads ??= [];
  state.dmMessages ??= [];
  state.composeDraft ??= "";
  state.currentScreen ??= "timeline";
  state.activeTweetId ??= null;
  state.activeUserId ??= null;
  state.activeThreadId ??= null;
  state.currentUserId ??= null;
  state.notificationsTab ??= "all";
  state.navigationStack ??= [];
  state.lastNavFrame ??= 0;
  state.statusBarTheme ??= "dark";
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
    followerIds: payload.followerIds ?? [],
    followingIds: payload.followingIds ?? [],
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

export const xReducer: PluginReducer<"app_x"> = (
  draft: WorldState,
  event: RuntimeEvent & { kind: "APP"; appId: "app_x" }
) => {
  const appState = getAppState(draft);

  switch (event.type) {
    case "ADD_USER": {
      const payload = event.payload as Partial<XUser>;
      const exists = appState.users.find((u) => u.id === payload.id);
      if (!exists) {
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
        follower.followingIds = follower.followingIds.filter((id) => id !== payload.followingId);
        follower.following = Math.max(0, follower.following - 1);
      }
      if (following) {
        following.followerIds = following.followerIds.filter((id) => id !== payload.followerId);
        following.followers = Math.max(0, following.followers - 1);
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
        hashtags: payload.hashtags ?? [],
        mentions: payload.mentions ?? [],
        likeCount: payload.likeCount ?? 0,
        repostCount: payload.repostCount ?? 0,
        replyIds: payload.replyIds ?? [],
        likedBy: payload.likedBy ?? [],
        viewCount: payload.viewCount ?? 0,
        bookmarkCount: payload.bookmarkCount ?? 0,
        shareCount: payload.shareCount ?? 0,
      };

      appState.tweets.push(tweet);
      const shouldAppearInTimeline = !tweet.replyToId;
      if (shouldAppearInTimeline) {
        appState.timeline.unshift(tweet.id);
      }

      if (tweet.replyToId) {
        const parent = appState.tweets.find((t) => t.id === tweet.replyToId);
        if (parent) parent.replyIds.push(tweet.id);
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
      appState.activeTweetId = payload.tweetId ?? appState.activeTweetId;
      appState.activeUserId = payload.userId ?? appState.activeUserId;
      appState.activeThreadId = payload.threadId ?? appState.activeThreadId;
      appState.lastNavFrame = event.at;
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
      break;
    }
    case "SET_COMPOSE_DRAFT": {
      const payload = event.payload as { text: string };
      appState.composeDraft = payload.text;
      break;
    }
    case "SET_NOTIFICATIONS_TAB": {
      const payload = event.payload as { tab: XState["notificationsTab"] };
      appState.notificationsTab = payload.tab;
      break;
    }
    case "ADD_NOTIFICATION": {
      const payload = event.payload as XNotification;
      appState.notifications.unshift(payload);
      break;
    }
    case "ADD_DM_THREAD": {
      const payload = event.payload as XDMThread;
      const exists = appState.dmThreads.find((t) => t.id === payload.id);
      if (!exists) {
        appState.dmThreads.push({
          ...payload,
          messageIds: payload.messageIds ?? [],
        });
      }
      break;
    }
    case "ADD_DM_MESSAGE": {
      const payload = event.payload as XDMMessage;
      appState.dmMessages.push(payload);
      const thread = appState.dmThreads.find((t) => t.id === payload.threadId);
      if (thread) {
        thread.messageIds.push(payload.id);
      }
      break;
    }
  }
};
