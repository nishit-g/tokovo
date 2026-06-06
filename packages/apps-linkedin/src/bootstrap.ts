import {
  expectArray,
  expectObjectRecord,
  expectOneOf,
  expectOptionalString,
  expectString,
} from "@tokovo/core";
import type {
  PluginBootstrapContract,
  PluginBootstrapSchemaContext,
  PluginBootstrapValidationResult,
} from "@tokovo/core";
import type {
  LIThemeMode,
  NotificationAddPayload,
  PostCommentPayload,
  PostCreatePayload,
  UserCreatePayload,
} from "./types/index.js";
import type {
  LIComment,
  LIDMMessage,
  LIDMThread,
  LINotification,
  LIPost,
  LinkedInState,
} from "./runtime/state.js";

type PostInput = Omit<PostCreatePayload, "id"> & { id: string };

export interface LinkedInSnapshot {
  currentUserId?: string;
  users?: UserCreatePayload[];
  posts?: PostInput[];
  comments?: Array<Omit<PostCommentPayload, "id"> & { id: string }>;
  notifications?: Array<NotificationAddPayload>;
  threads?: Array<{
    id: string;
    participantIds: string[];
    title?: string;
    unreadCount?: number;
    pinned?: boolean;
  }>;
  messages?: Array<{ id: string; threadId: string; senderId: string; text: string; createdAt?: number }>;
  connections?: Array<{ a: string; b: string }>;
}

export interface LinkedInInitialView {
  screen: LinkedInState["currentScreen"];
  activePostId?: string;
  activeUserId?: string;
  activeThreadId?: string;
  composeDraft?: string;
  themeMode?: LIThemeMode;
}

const LINKEDIN_SCREENS = [
  "feed",
  "post",
  "compose",
  "profile",
  "notifications",
  "messages",
  "thread",
] as const;

const LINKEDIN_THEME_MODES: readonly LIThemeMode[] = ["light", "dark", "storybook"];

function validateLinkedInSnapshot(
  input: PluginBootstrapSchemaContext<"app_linkedin">,
): PluginBootstrapValidationResult {
  const errors: string[] = [];
  const snapshot = expectObjectRecord(input.value, "snapshot", errors);
  if (!snapshot) {
    return { errors };
  }

  const userIds = new Set<string>();
  const postIds = new Set<string>();
  const threadIds = new Set<string>();

  const users = snapshot.users === null || snapshot.users === undefined
    ? undefined
    : expectArray(snapshot.users, "snapshot.users", errors);
  users?.forEach((value, index) => {
    const user = expectObjectRecord(value, `snapshot.users[${index}]`, errors);
    if (!user) return;
    const id = expectString(user.id, `snapshot.users[${index}].id`, errors);
    expectString(user.name, `snapshot.users[${index}].name`, errors);
    expectString(user.handle, `snapshot.users[${index}].handle`, errors);
    if (id) {
      if (userIds.has(id)) errors.push(`snapshot.users[${index}].id duplicates "${id}"`);
      userIds.add(id);
    }
  });

  const posts = snapshot.posts === null || snapshot.posts === undefined
    ? undefined
    : expectArray(snapshot.posts, "snapshot.posts", errors);
  posts?.forEach((value, index) => {
    const post = expectObjectRecord(value, `snapshot.posts[${index}]`, errors);
    if (!post) return;
    const id = expectString(post.id, `snapshot.posts[${index}].id`, errors);
    const authorId = expectString(post.authorId, `snapshot.posts[${index}].authorId`, errors);
    expectString(post.text, `snapshot.posts[${index}].text`, errors);
    if (id) {
      if (postIds.has(id)) errors.push(`snapshot.posts[${index}].id duplicates "${id}"`);
      postIds.add(id);
    }
    if (authorId && userIds.size > 0 && !userIds.has(authorId)) {
      errors.push(`snapshot.posts[${index}].authorId references unknown user "${authorId}"`);
    }
  });

  const comments = snapshot.comments === null || snapshot.comments === undefined
    ? undefined
    : expectArray(snapshot.comments, "snapshot.comments", errors);
  comments?.forEach((value, index) => {
    const comment = expectObjectRecord(value, `snapshot.comments[${index}]`, errors);
    if (!comment) return;
    expectString(comment.id, `snapshot.comments[${index}].id`, errors);
    const postId = expectString(comment.postId, `snapshot.comments[${index}].postId`, errors);
    const authorId = expectString(comment.authorId, `snapshot.comments[${index}].authorId`, errors);
    expectString(comment.text, `snapshot.comments[${index}].text`, errors);
    if (postId && postIds.size > 0 && !postIds.has(postId)) {
      errors.push(`snapshot.comments[${index}].postId references unknown post "${postId}"`);
    }
    if (authorId && userIds.size > 0 && !userIds.has(authorId)) {
      errors.push(`snapshot.comments[${index}].authorId references unknown user "${authorId}"`);
    }
  });

  const threads = snapshot.threads === null || snapshot.threads === undefined
    ? undefined
    : expectArray(snapshot.threads, "snapshot.threads", errors);
  threads?.forEach((value, index) => {
    const thread = expectObjectRecord(value, `snapshot.threads[${index}]`, errors);
    if (!thread) return;
    const id = expectString(thread.id, `snapshot.threads[${index}].id`, errors);
    const participantIds = expectArray(
      thread.participantIds,
      `snapshot.threads[${index}].participantIds`,
      errors,
    );
    participantIds?.forEach((participantId, participantIndex) => {
      const resolved = expectString(
        participantId,
        `snapshot.threads[${index}].participantIds[${participantIndex}]`,
        errors,
      );
      if (resolved && userIds.size > 0 && !userIds.has(resolved)) {
        errors.push(`snapshot.threads[${index}].participantIds[${participantIndex}] references unknown user "${resolved}"`);
      }
    });
    if (id) {
      if (threadIds.has(id)) errors.push(`snapshot.threads[${index}].id duplicates "${id}"`);
      threadIds.add(id);
    }
  });

  const messages = snapshot.messages === null || snapshot.messages === undefined
    ? undefined
    : expectArray(snapshot.messages, "snapshot.messages", errors);
  messages?.forEach((value, index) => {
    const message = expectObjectRecord(value, `snapshot.messages[${index}]`, errors);
    if (!message) return;
    expectString(message.id, `snapshot.messages[${index}].id`, errors);
    const threadId = expectString(message.threadId, `snapshot.messages[${index}].threadId`, errors);
    const senderId = expectString(message.senderId, `snapshot.messages[${index}].senderId`, errors);
    expectString(message.text, `snapshot.messages[${index}].text`, errors);
    if (threadId && threadIds.size > 0 && !threadIds.has(threadId)) {
      errors.push(`snapshot.messages[${index}].threadId references unknown thread "${threadId}"`);
    }
    if (senderId && userIds.size > 0 && !userIds.has(senderId)) {
      errors.push(`snapshot.messages[${index}].senderId references unknown user "${senderId}"`);
    }
  });

  expectOptionalString(snapshot.currentUserId, "snapshot.currentUserId", errors);

  return { errors };
}

function validateLinkedInInitialView(
  input: PluginBootstrapSchemaContext<"app_linkedin">,
): PluginBootstrapValidationResult {
  const errors: string[] = [];
  const view = expectObjectRecord(input.value, "initialView", errors);
  if (!view) {
    return { errors };
  }

  expectOneOf(view.screen, LINKEDIN_SCREENS, "initialView.screen", errors);
  expectOptionalString(view.activePostId, "initialView.activePostId", errors);
  expectOptionalString(view.activeUserId, "initialView.activeUserId", errors);
  expectOptionalString(view.activeThreadId, "initialView.activeThreadId", errors);
  expectOptionalString(view.composeDraft, "initialView.composeDraft", errors);
  if (view.themeMode !== null && view.themeMode !== undefined) {
    expectOneOf(view.themeMode, LINKEDIN_THEME_MODES, "initialView.themeMode", errors);
  }

  return { errors };
}

function toPost(input: PostInput, fallbackCreatedAt: number): LIPost {
  return {
    id: input.id,
    authorId: input.authorId,
    text: input.text,
    createdAt: input.createdAt ?? fallbackCreatedAt,
    visibility: input.visibility ?? "public",
    media: input.media,
    linkPreview: input.linkPreview,
    hashtags: [...(input.hashtags ?? [])],
    mentions: [...(input.mentions ?? [])],
    reactions: {},
    reactedBy: {},
    commentIds: [],
    repostOfId: undefined,
    viewCount: 0,
  };
}

export const linkedInBootstrap: PluginBootstrapContract<"app_linkedin"> = {
  snapshot: {
    currentVersion: 1,
    validate: validateLinkedInSnapshot,
  },
  view: {
    currentVersion: 1,
    validate: validateLinkedInInitialView,
  },
  validate(context): PluginBootstrapValidationResult {
    const snapshot = (context.snapshot?.snapshot as LinkedInSnapshot | undefined) ?? {};
    const initialView = context.initialView?.view as LinkedInInitialView | undefined;
    const errors: string[] = [];
    const userIds = new Set((snapshot.users ?? []).map((user) => user.id));
    const postIds = new Set((snapshot.posts ?? []).map((post) => post.id));
    const threadIds = new Set((snapshot.threads ?? []).map((thread) => thread.id));

    if (snapshot.currentUserId && userIds.size > 0 && !userIds.has(snapshot.currentUserId)) {
      errors.push(`snapshot.currentUserId references unknown user "${snapshot.currentUserId}"`);
    }
    if (initialView?.activePostId && !postIds.has(initialView.activePostId)) {
      errors.push(`initialView.activePostId references unknown post "${initialView.activePostId}"`);
    }
    if (initialView?.activeUserId && !userIds.has(initialView.activeUserId)) {
      errors.push(`initialView.activeUserId references unknown user "${initialView.activeUserId}"`);
    }
    if (initialView?.activeThreadId && !threadIds.has(initialView.activeThreadId)) {
      errors.push(`initialView.activeThreadId references unknown thread "${initialView.activeThreadId}"`);
    }

    return { errors };
  },
  hydrate(context): LinkedInState {
    const snapshot = (context.snapshot?.snapshot as LinkedInSnapshot | undefined) ?? {};
    const initialView = context.initialView?.view as LinkedInInitialView | undefined;
    const state: LinkedInState = {
      ...(context.baseState as LinkedInState),
      users: [],
      posts: [],
      comments: [],
      feed: [],
      notifications: [],
      dmThreads: [],
      dmMessages: [],
      navigationStack: [],
    };

    state.users = (snapshot.users ?? []).map((user) => ({
      id: user.id,
      name: user.name,
      handle: user.handle,
      headline: user.headline,
      avatarUrl: user.avatarUrl,
      location: user.location,
      company: user.company,
      about: user.about,
      connections: user.connections ?? 0,
      followers: user.followers ?? 0,
      profileViews: user.profileViews,
      impressionCount: user.impressionCount,
      connectionIds: [],
      followerIds: [],
    }));

    const usersById = new Map(state.users.map((user) => [user.id, user]));
    for (const connection of snapshot.connections ?? []) {
      const left = usersById.get(connection.a);
      const right = usersById.get(connection.b);
      if (!left || !right) continue;
      if (!left.connectionIds.includes(right.id)) left.connectionIds.push(right.id);
      if (!right.connectionIds.includes(left.id)) right.connectionIds.push(left.id);
      left.connections = left.connectionIds.length;
      right.connections = right.connectionIds.length;
    }

    state.posts = (snapshot.posts ?? [])
      .map((post) => toPost(post, 0))
      .sort((a, b) => b.createdAt - a.createdAt);
    const postsById = new Map(state.posts.map((post) => [post.id, post]));

    state.comments = (snapshot.comments ?? [])
      .map<LIComment>((comment) => ({
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        text: comment.text,
        createdAt: comment.createdAt ?? 0,
      }))
      .sort((a, b) => a.createdAt - b.createdAt);
    for (const comment of state.comments) {
      postsById.get(comment.postId)?.commentIds.push(comment.id);
    }

    state.feed = state.posts.map((post) => post.id);
    state.notifications = (snapshot.notifications ?? [])
      .map<LINotification>((notification) => ({
        id: notification.id,
        type: notification.type,
        actorId: notification.actorId,
        postId: notification.postId,
        threadId: notification.threadId,
        title: notification.title,
        body: notification.body,
        createdAt: notification.createdAt ?? 0,
        unread: notification.unread ?? false,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    state.dmThreads = (snapshot.threads ?? []).map<LIDMThread>((thread) => ({
      id: thread.id,
      participantIds: [...thread.participantIds],
      messageIds: [],
      title: thread.title,
      unreadCount: thread.unreadCount ?? 0,
      pinned: thread.pinned ?? false,
      lastMessageId: null,
      lastMessageAt: null,
      draftText: "",
      typingParticipantIds: [],
    }));
    const threadsById = new Map(state.dmThreads.map((thread) => [thread.id, thread]));
    state.dmMessages = (snapshot.messages ?? [])
      .map<LIDMMessage>((message) => {
        const thread = threadsById.get(message.threadId);
        if (thread) {
          thread.messageIds.push(message.id);
          thread.lastMessageId = message.id;
          thread.lastMessageAt = message.createdAt ?? 0;
        }
        return {
          id: message.id,
          threadId: message.threadId,
          senderId: message.senderId,
          text: message.text,
          createdAt: message.createdAt ?? 0,
        };
      })
      .sort((a, b) => a.createdAt - b.createdAt);

    state.currentUserId = snapshot.currentUserId ?? null;

    if (initialView) {
      state.currentScreen = initialView.screen;
      state.activePostId = initialView.activePostId ?? null;
      state.activeUserId = initialView.activeUserId ?? null;
      state.activeThreadId = initialView.activeThreadId ?? null;
      state.composeDraft = initialView.composeDraft ?? "";
      state.themeMode = initialView.themeMode ?? state.themeMode;
      state.lastNavFrame = 0;
      state.navigationStack = [];
      state.viewMode = initialView.screen === "thread" ? "CHAT" : initialView.screen === "compose" ? "FULLSCREEN" : "FEED";
      state.conversationId = initialView.screen === "thread" ? initialView.activeThreadId : undefined;
    }

    return state;
  },
};
