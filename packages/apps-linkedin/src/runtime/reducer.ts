import type { PluginReducer, RuntimeEvent, WorldState } from "@tokovo/core";
import type { LinkedInState, LIUser, LIPost, LIComment, LINotification, LIDMThread, LIDMMessage, LIRoute } from "./state.js";
import { createLinkedInInitialState } from "./state.js";
import type { LIReactionType, LIScreen, LIThemeMode } from "../types/index.js";

function ensureMutableArray<T>(value: T[] | undefined | null): T[] {
  if (!Array.isArray(value)) return [];
  return Object.isExtensible(value) ? value : [...value];
}

function syncViewMode(state: LinkedInState): void {
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

function getAppState(draft: WorldState): LinkedInState {
  if (!draft.appState) draft.appState = {};
  if (!draft.appState["app_linkedin"]) draft.appState["app_linkedin"] = createLinkedInInitialState();
  const state = draft.appState["app_linkedin"] as LinkedInState;

  state.users = ensureMutableArray(state.users);
  state.posts = ensureMutableArray(state.posts);
  state.comments = ensureMutableArray(state.comments);
  state.feed = ensureMutableArray(state.feed);
  state.notifications = ensureMutableArray(state.notifications);
  state.dmThreads = ensureMutableArray(state.dmThreads);
  state.dmMessages = ensureMutableArray(state.dmMessages);

  state.currentScreen ??= "feed";
  state.activePostId ??= null;
  state.activeUserId ??= null;
  state.activeThreadId ??= null;
  state.currentUserId ??= null;
  state.composeDraft ??= "";
  state.navigationStack ??= [];
  state.lastNavFrame ??= 0;
  state.statusBarTheme ??= "dark";
  state.themeMode ??= "light";
  state.viewMode ??= "FEED";
  state.conversationId ??= undefined;

  syncViewMode(state);
  return state;
}

function ensureUserDefaults(payload: Partial<LIUser>): LIUser {
  return {
    id: payload.id ?? "li-user-unknown",
    name: payload.name ?? "Unknown",
    handle: payload.handle ?? "unknown",
    headline: payload.headline,
    avatarUrl: payload.avatarUrl,
    connections: payload.connections ?? 0,
    followers: payload.followers ?? 0,
    connectionIds: Array.isArray(payload.connectionIds) ? [...payload.connectionIds] : [],
    followerIds: Array.isArray(payload.followerIds) ? [...payload.followerIds] : [],
  };
}

function ensurePostDefaults(
  payload: Partial<LIPost> & { id: string; authorId: string },
  fallbackCreatedAt: number,
): LIPost {
  return {
    id: payload.id,
    authorId: payload.authorId,
    text: payload.text ?? "",
    createdAt: payload.createdAt ?? fallbackCreatedAt,
    visibility: payload.visibility ?? "public",
    media: payload.media,
    linkPreview: payload.linkPreview,
    hashtags: Array.isArray(payload.hashtags) ? [...payload.hashtags] : [],
    mentions: Array.isArray(payload.mentions) ? [...payload.mentions] : [],
    reactions: payload.reactions ?? {},
    reactedBy: payload.reactedBy ?? {},
    commentIds: Array.isArray(payload.commentIds) ? [...payload.commentIds] : [],
    repostOfId: payload.repostOfId,
    viewCount: payload.viewCount ?? 0,
  };
}

function buildRoute(state: LinkedInState): LIRoute {
  return {
    screen: state.currentScreen,
    postId: state.activePostId ?? undefined,
    userId: state.activeUserId ?? undefined,
    threadId: state.activeThreadId ?? undefined,
  };
}

function routesEqual(a: LIRoute, b: LIRoute): boolean {
  return a.screen === b.screen && a.postId === b.postId && a.userId === b.userId && a.threadId === b.threadId;
}

export const linkedInReducer: PluginReducer<"app_linkedin"> = (
  draft: WorldState,
  event: RuntimeEvent & { kind: "APP"; appId: "app_linkedin" },
) => {
  const app = getAppState(draft);

  switch (event.type) {
    case "LINKEDIN_ADD_USER": {
      const payload = event.payload as Partial<LIUser>;
      const exists = app.users.find((u) => u.id === payload.id);
      if (!exists) app.users.push(ensureUserDefaults(payload));
      break;
    }
    case "LINKEDIN_SET_CURRENT_USER": {
      const payload = event.payload as { userId: string };
      app.currentUserId = payload.userId;
      break;
    }
    case "LINKEDIN_CONNECT_USERS":
    case "LINKEDIN_DISCONNECT_USERS": {
      const payload = event.payload as { a: string; b: string };
      const a = app.users.find((u) => u.id === payload.a);
      const b = app.users.find((u) => u.id === payload.b);
      if (!a || !b) break;
      const connect = event.type === "LINKEDIN_CONNECT_USERS";
      if (connect) {
        if (!a.connectionIds.includes(b.id)) a.connectionIds.push(b.id);
        if (!b.connectionIds.includes(a.id)) b.connectionIds.push(a.id);
        a.connections = a.connectionIds.length;
        b.connections = b.connectionIds.length;
      } else {
        a.connectionIds = a.connectionIds.filter((id) => id !== b.id);
        b.connectionIds = b.connectionIds.filter((id) => id !== a.id);
        a.connections = a.connectionIds.length;
        b.connections = b.connectionIds.length;
      }
      break;
    }
    case "LINKEDIN_ADD_POST": {
      const payload = event.payload as Partial<LIPost> & { id: string; authorId: string };
      const post = ensurePostDefaults(payload, event.at);
      app.posts.push(post);
      app.feed.unshift(post.id);
      break;
    }
    case "LINKEDIN_REPOST_POST": {
      const payload = event.payload as { id: string; authorId: string; repostOfId: string; text?: string; createdAt?: number };
      const post = ensurePostDefaults({
        id: payload.id,
        authorId: payload.authorId,
        text: payload.text ?? "",
        repostOfId: payload.repostOfId,
        createdAt: payload.createdAt ?? event.at,
      }, event.at);
      app.posts.push(post);
      app.feed.unshift(post.id);
      break;
    }
    case "LINKEDIN_REACT_POST": {
      const payload = event.payload as { postId: string; userId: string; reaction: LIReactionType };
      const post = app.posts.find((p) => p.id === payload.postId);
      if (!post) break;
      post.reactions ??= {};
      post.reactedBy ??= {};
      const prev = post.reactedBy[payload.userId];
      if (prev) {
        // switch reaction
        post.reactions[prev] = Math.max(0, (post.reactions[prev] ?? 1) - 1);
      }
      post.reactedBy[payload.userId] = payload.reaction;
      post.reactions[payload.reaction] = (post.reactions[payload.reaction] ?? 0) + 1;
      break;
    }
    case "LINKEDIN_ADD_COMMENT": {
      const payload = event.payload as LIComment;
      const post = app.posts.find((p) => p.id === payload.postId);
      if (!post) break;
      const comment: LIComment = {
        id: payload.id,
        postId: payload.postId,
        authorId: payload.authorId,
        text: payload.text ?? "",
        createdAt: payload.createdAt ?? event.at,
      };
      app.comments.push(comment);
      post.commentIds ??= [];
      post.commentIds.push(comment.id);
      break;
    }
    case "LINKEDIN_VIEW_POST": {
      const payload = event.payload as { postId: string };
      const post = app.posts.find((p) => p.id === payload.postId);
      if (post) post.viewCount = (post.viewCount ?? 0) + 1;
      break;
    }
    case "LINKEDIN_SET_SCREEN": {
      const payload = event.payload as { screen: LIScreen; postId?: string; userId?: string; threadId?: string };
      const current = buildRoute(app);
      const next: LIRoute = { screen: payload.screen, postId: payload.postId, userId: payload.userId, threadId: payload.threadId };
      if (!routesEqual(current, next)) app.navigationStack.push(current);

      app.currentScreen = payload.screen;
      app.activePostId = payload.postId ?? null;
      app.activeUserId = payload.userId ?? null;
      app.activeThreadId = payload.threadId ?? null;
      app.lastNavFrame = event.at;
      syncViewMode(app);
      break;
    }
    case "LINKEDIN_NAVIGATE_BACK": {
      const prev = app.navigationStack.pop();
      if (prev) {
        app.currentScreen = prev.screen;
        app.activePostId = prev.postId ?? null;
        app.activeUserId = prev.userId ?? null;
        app.activeThreadId = prev.threadId ?? null;
        app.lastNavFrame = event.at;
        syncViewMode(app);
      }
      break;
    }
    case "LINKEDIN_SET_ACTIVE_POST": {
      const payload = event.payload as { postId: string };
      app.activePostId = payload.postId;
      break;
    }
    case "LINKEDIN_SET_ACTIVE_USER": {
      const payload = event.payload as { userId: string };
      app.activeUserId = payload.userId;
      break;
    }
    case "LINKEDIN_SET_ACTIVE_THREAD": {
      const payload = event.payload as { threadId: string };
      app.activeThreadId = payload.threadId;
      syncViewMode(app);
      break;
    }
    case "LINKEDIN_SET_COMPOSE_DRAFT": {
      const payload = event.payload as { text: string };
      app.composeDraft = payload.text ?? "";
      break;
    }
    case "LINKEDIN_SET_THEME_MODE": {
      const payload = event.payload as { mode: LIThemeMode };
      app.themeMode = payload.mode ?? "light";
      break;
    }
    case "LINKEDIN_ADD_NOTIFICATION": {
      const payload = event.payload as LINotification;
      const n: LINotification = {
        id: payload.id,
        type: payload.type,
        actorId: payload.actorId,
        postId: payload.postId,
        createdAt: payload.createdAt ?? event.at,
      };
      app.notifications.unshift(n);
      break;
    }
    case "LINKEDIN_ADD_DM_THREAD": {
      const payload = event.payload as LIDMThread;
      const exists = app.dmThreads.find((t) => t.id === payload.id);
      if (!exists) {
        app.dmThreads.push({
          id: payload.id,
          participantIds: Array.isArray(payload.participantIds) ? [...payload.participantIds] : [],
          messageIds: [],
        });
      }
      break;
    }
    case "LINKEDIN_ADD_DM_MESSAGE": {
      const payload = event.payload as LIDMMessage;
      const thread = app.dmThreads.find((t) => t.id === payload.threadId);
      if (!thread) {
        app.dmThreads.push({ id: payload.threadId, participantIds: [], messageIds: [] });
      }
      const msg: LIDMMessage = {
        id: payload.id,
        threadId: payload.threadId,
        senderId: payload.senderId,
        text: payload.text ?? "",
        createdAt: payload.createdAt ?? event.at,
      };
      app.dmMessages.push(msg);
      const th = app.dmThreads.find((t) => t.id === payload.threadId)!;
      th.messageIds.push(msg.id);
      break;
    }
    default:
      break;
  }
};
