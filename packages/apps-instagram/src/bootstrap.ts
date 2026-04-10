import type { RuntimeEvent } from "@tokovo/core";
import type {
  InstagramComposerDraftPayload,
  InstagramProfileTab,
  InstagramScreen,
  InstagramThemeMode,
  InstagramUserPayload,
} from "./types/index.js";
import type {
  InstagramComment,
  InstagramDMMessage,
  InstagramDMThread,
  InstagramNotification,
  InstagramPost,
  InstagramState,
  InstagramStory,
  InstagramUser,
} from "./runtime/state.js";
import { createInstagramInitialState } from "./runtime/state.js";

export interface InstagramSnapshot {
  currentUserId?: string;
  users?: InstagramUserPayload[];
  follows?: Array<{ followerId: string; followingId: string }>;
  posts?: Array<{
    id: string;
    authorId: string;
    imageUrl: string;
    caption: string;
    createdAt?: number;
    location?: string;
    aspect?: "square" | "portrait" | "landscape";
    likeCount?: number;
    commentCount?: number;
  }>;
  comments?: Array<{
    id: string;
    postId: string;
    authorId: string;
    text: string;
    createdAt?: number;
  }>;
  storySets?: Array<{
    id: string;
    userId: string;
    items: Array<{
      id: string;
      authorId: string;
      mediaUrl: string;
      createdAt?: number;
      durationFrames?: number;
      accentColor?: string;
    }>;
  }>;
  threads?: Array<{
    id: string;
    participantIds: string[];
    title?: string;
    unreadCount?: number;
    pinned?: boolean;
  }>;
  messages?: Array<{
    id: string;
    threadId: string;
    senderId: string;
    text: string;
    createdAt?: number;
    storyId?: string;
  }>;
  notifications?: Array<{
    id: string;
    type: "like" | "comment" | "follow" | "dm" | "story_reply";
    actorId: string;
    postId?: string;
    threadId?: string;
    storyId?: string;
    title?: string;
    body?: string;
    createdAt?: number;
    read?: boolean;
  }>;
}

export interface InstagramInitialView {
  screen: InstagramScreen;
  postId?: string;
  profileId?: string;
  threadId?: string;
  storySetId?: string;
  storyId?: string;
  profileTab?: InstagramProfileTab;
  themeMode?: InstagramThemeMode;
  composerDraft?: InstagramComposerDraftPayload;
}

type ValidationResult = { errors: string[] };

const SCREENS: readonly InstagramScreen[] = [
  "home",
  "story",
  "notifications",
  "inbox",
  "thread",
  "profile",
  "composer",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value);
}

function isOptionalBoolean(value: unknown): value is boolean | undefined {
  return value === undefined || typeof value === "boolean";
}

function isOptionalNumber(value: unknown): value is number | undefined {
  return value === undefined || (typeof value === "number" && Number.isFinite(value));
}

function expectString(
  value: unknown,
  path: string,
  errors: string[],
): string | undefined {
  if (isString(value) && value.length > 0) return value;
  errors.push(`${path} must be a non-empty string`);
  return undefined;
}

function validateSnapshotObject(snapshot: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const userIds = new Set<string>();
  const postIds = new Set<string>();
  const storyIds = new Set<string>();
  const threadIds = new Set<string>();

  const users = Array.isArray(snapshot.users) ? snapshot.users : undefined;
  users?.forEach((value, index) => {
    if (!isRecord(value)) {
      errors.push(`snapshot.users[${index}] must be an object`);
      return;
    }
    const id = expectString(value.id, `snapshot.users[${index}].id`, errors);
    expectString(value.username, `snapshot.users[${index}].username`, errors);
    expectString(value.displayName, `snapshot.users[${index}].displayName`, errors);
    if (id) userIds.add(id);
  });

  const posts = Array.isArray(snapshot.posts) ? snapshot.posts : undefined;
  posts?.forEach((value, index) => {
    if (!isRecord(value)) {
      errors.push(`snapshot.posts[${index}] must be an object`);
      return;
    }
    const id = expectString(value.id, `snapshot.posts[${index}].id`, errors);
    const authorId = expectString(
      value.authorId,
      `snapshot.posts[${index}].authorId`,
      errors,
    );
    expectString(value.imageUrl, `snapshot.posts[${index}].imageUrl`, errors);
    if (typeof value.caption !== "string") {
      errors.push(`snapshot.posts[${index}].caption must be a string`);
    }
    if (id) postIds.add(id);
    if (authorId && userIds.size > 0 && !userIds.has(authorId)) {
      errors.push(
        `snapshot.posts[${index}].authorId references unknown user "${authorId}"`,
      );
    }
  });

  const comments = Array.isArray(snapshot.comments) ? snapshot.comments : undefined;
  comments?.forEach((value, index) => {
    if (!isRecord(value)) {
      errors.push(`snapshot.comments[${index}] must be an object`);
      return;
    }
    const postId = expectString(
      value.postId,
      `snapshot.comments[${index}].postId`,
      errors,
    );
    const authorId = expectString(
      value.authorId,
      `snapshot.comments[${index}].authorId`,
      errors,
    );
    expectString(value.id, `snapshot.comments[${index}].id`, errors);
    if (typeof value.text !== "string") {
      errors.push(`snapshot.comments[${index}].text must be a string`);
    }
    if (postId && postIds.size > 0 && !postIds.has(postId)) {
      errors.push(
        `snapshot.comments[${index}].postId references unknown post "${postId}"`,
      );
    }
    if (authorId && userIds.size > 0 && !userIds.has(authorId)) {
      errors.push(
        `snapshot.comments[${index}].authorId references unknown user "${authorId}"`,
      );
    }
  });

  const storySets = Array.isArray(snapshot.storySets) ? snapshot.storySets : undefined;
  storySets?.forEach((value, index) => {
    if (!isRecord(value)) {
      errors.push(`snapshot.storySets[${index}] must be an object`);
      return;
    }
    const userId = expectString(
      value.userId,
      `snapshot.storySets[${index}].userId`,
      errors,
    );
    expectString(value.id, `snapshot.storySets[${index}].id`, errors);
    if (userId && userIds.size > 0 && !userIds.has(userId)) {
      errors.push(
        `snapshot.storySets[${index}].userId references unknown user "${userId}"`,
      );
    }
    const items = Array.isArray(value.items) ? value.items : undefined;
    items?.forEach((itemValue, itemIndex) => {
      if (!isRecord(itemValue)) {
        errors.push(
          `snapshot.storySets[${index}].items[${itemIndex}] must be an object`,
        );
        return;
      }
      const itemId = expectString(
        itemValue.id,
        `snapshot.storySets[${index}].items[${itemIndex}].id`,
        errors,
      );
      const authorId = expectString(
        itemValue.authorId,
        `snapshot.storySets[${index}].items[${itemIndex}].authorId`,
        errors,
      );
      expectString(
        itemValue.mediaUrl,
        `snapshot.storySets[${index}].items[${itemIndex}].mediaUrl`,
        errors,
      );
      if (itemId) storyIds.add(itemId);
      if (authorId && userIds.size > 0 && !userIds.has(authorId)) {
        errors.push(
          `snapshot.storySets[${index}].items[${itemIndex}].authorId references unknown user "${authorId}"`,
        );
      }
    });
  });

  const threads = Array.isArray(snapshot.threads) ? snapshot.threads : undefined;
  threads?.forEach((value, index) => {
    if (!isRecord(value)) {
      errors.push(`snapshot.threads[${index}] must be an object`);
      return;
    }
    const id = expectString(value.id, `snapshot.threads[${index}].id`, errors);
    const participants = Array.isArray(value.participantIds)
      ? value.participantIds
      : undefined;
    if (!participants) {
      errors.push(`snapshot.threads[${index}].participantIds must be an array`);
    }
    if (id) threadIds.add(id);
    participants?.forEach((participant, participantIndex) => {
      const participantId = expectString(
        participant,
        `snapshot.threads[${index}].participantIds[${participantIndex}]`,
        errors,
      );
      if (participantId && userIds.size > 0 && !userIds.has(participantId)) {
        errors.push(
          `snapshot.threads[${index}].participantIds[${participantIndex}] references unknown user "${participantId}"`,
        );
      }
    });
  });

  const messages = Array.isArray(snapshot.messages) ? snapshot.messages : undefined;
  messages?.forEach((value, index) => {
    if (!isRecord(value)) {
      errors.push(`snapshot.messages[${index}] must be an object`);
      return;
    }
    const threadId = expectString(
      value.threadId,
      `snapshot.messages[${index}].threadId`,
      errors,
    );
    const senderId = expectString(
      value.senderId,
      `snapshot.messages[${index}].senderId`,
      errors,
    );
    expectString(value.id, `snapshot.messages[${index}].id`, errors);
    if (typeof value.text !== "string") {
      errors.push(`snapshot.messages[${index}].text must be a string`);
    }
    if (threadId && threadIds.size > 0 && !threadIds.has(threadId)) {
      errors.push(
        `snapshot.messages[${index}].threadId references unknown thread "${threadId}"`,
      );
    }
    if (senderId && userIds.size > 0 && !userIds.has(senderId)) {
      errors.push(
        `snapshot.messages[${index}].senderId references unknown user "${senderId}"`,
      );
    }
    if (typeof value.storyId === "string" && storyIds.size > 0 && !storyIds.has(value.storyId)) {
      errors.push(
        `snapshot.messages[${index}].storyId references unknown story "${value.storyId}"`,
      );
    }
  });

  const notifications = Array.isArray(snapshot.notifications)
    ? snapshot.notifications
    : undefined;
  notifications?.forEach((value, index) => {
    if (!isRecord(value)) {
      errors.push(`snapshot.notifications[${index}] must be an object`);
      return;
    }
    expectString(value.id, `snapshot.notifications[${index}].id`, errors);
    const actorId = expectString(
      value.actorId,
      `snapshot.notifications[${index}].actorId`,
      errors,
    );
    if (
      !isString(value.type) ||
      !["like", "comment", "follow", "dm", "story_reply"].includes(value.type)
    ) {
      errors.push(`snapshot.notifications[${index}].type must be a valid notification type`);
    }
    if (actorId && userIds.size > 0 && !userIds.has(actorId)) {
      errors.push(
        `snapshot.notifications[${index}].actorId references unknown user "${actorId}"`,
      );
    }
    if (typeof value.postId === "string" && postIds.size > 0 && !postIds.has(value.postId)) {
      errors.push(
        `snapshot.notifications[${index}].postId references unknown post "${value.postId}"`,
      );
    }
    if (
      typeof value.threadId === "string" &&
      threadIds.size > 0 &&
      !threadIds.has(value.threadId)
    ) {
      errors.push(
        `snapshot.notifications[${index}].threadId references unknown thread "${value.threadId}"`,
      );
    }
    if (
      typeof value.storyId === "string" &&
      storyIds.size > 0 &&
      !storyIds.has(value.storyId)
    ) {
      errors.push(
        `snapshot.notifications[${index}].storyId references unknown story "${value.storyId}"`,
      );
    }
    if (!isOptionalBoolean(value.read)) {
      errors.push(`snapshot.notifications[${index}].read must be a boolean`);
    }
  });

  if (
    snapshot.currentUserId !== undefined &&
    !isString(snapshot.currentUserId)
  ) {
    errors.push("snapshot.currentUserId must be a string");
  }

  return { errors };
}

export function validateInstagramSnapshot(value: unknown): ValidationResult {
  if (!isRecord(value)) {
    return { errors: ["snapshot must be an object"] };
  }
  return validateSnapshotObject(value);
}

export function validateInstagramInitialView(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return { errors: ["initialView must be an object"] };
  }
  if (!SCREENS.includes(value.screen as InstagramScreen)) {
    errors.push("initialView.screen must be a valid Instagram screen");
  }
  if (!isOptionalString(value.postId)) errors.push("initialView.postId must be a string");
  if (!isOptionalString(value.profileId)) {
    errors.push("initialView.profileId must be a string");
  }
  if (!isOptionalString(value.threadId)) errors.push("initialView.threadId must be a string");
  if (!isOptionalString(value.storySetId)) {
    errors.push("initialView.storySetId must be a string");
  }
  if (!isOptionalString(value.storyId)) errors.push("initialView.storyId must be a string");
  if (
    value.profileTab !== undefined &&
    value.profileTab !== "posts" &&
    value.profileTab !== "tagged"
  ) {
    errors.push('initialView.profileTab must be "posts" or "tagged"');
  }
  if (
    value.themeMode !== undefined &&
    value.themeMode !== "light" &&
    value.themeMode !== "dark" &&
    value.themeMode !== "ghibli"
  ) {
    errors.push('initialView.themeMode must be "light", "dark", or "ghibli"');
  }
  if (
    value.composerDraft !== undefined &&
    (!isRecord(value.composerDraft) || typeof value.composerDraft.caption !== "string")
  ) {
    errors.push("initialView.composerDraft.caption must be a string");
  }
  return { errors };
}

export function validateInstagramBootstrap(
  snapshot: InstagramSnapshot = {},
  initialView?: InstagramInitialView,
): ValidationResult {
  const errors = [
    ...validateInstagramSnapshot(snapshot).errors,
    ...(initialView ? validateInstagramInitialView(initialView).errors : []),
  ];

  const userIds = new Set((snapshot.users ?? []).map((item) => item.id));
  const postIds = new Set((snapshot.posts ?? []).map((item) => item.id));
  const threadIds = new Set((snapshot.threads ?? []).map((item) => item.id));
  const storySetIds = new Set((snapshot.storySets ?? []).map((item) => item.id));
  const storyIds = new Set(
    (snapshot.storySets ?? []).flatMap((item) => item.items.map((story) => story.id)),
  );

  if (snapshot.currentUserId && userIds.size > 0 && !userIds.has(snapshot.currentUserId)) {
    errors.push(`snapshot.currentUserId references unknown user "${snapshot.currentUserId}"`);
  }
  if (initialView?.postId && !postIds.has(initialView.postId)) {
    errors.push(`initialView.postId references unknown post "${initialView.postId}"`);
  }
  if (initialView?.profileId && !userIds.has(initialView.profileId)) {
    errors.push(`initialView.profileId references unknown user "${initialView.profileId}"`);
  }
  if (initialView?.threadId && !threadIds.has(initialView.threadId)) {
    errors.push(`initialView.threadId references unknown thread "${initialView.threadId}"`);
  }
  if (initialView?.storySetId && !storySetIds.has(initialView.storySetId)) {
    errors.push(
      `initialView.storySetId references unknown story set "${initialView.storySetId}"`,
    );
  }
  if (initialView?.storyId && !storyIds.has(initialView.storyId)) {
    errors.push(`initialView.storyId references unknown story "${initialView.storyId}"`);
  }

  return { errors };
}

function toUser(input: InstagramUserPayload): InstagramUser {
  return {
    id: input.id,
    username: input.username,
    displayName: input.displayName,
    avatarUrl: input.avatarUrl,
    bio: input.bio,
    followers: input.followers ?? 0,
    following: input.following ?? 0,
    followerIds: [],
    followingIds: [],
    verified: input.verified ?? false,
  };
}

export function hydrateInstagramState(
  snapshot: InstagramSnapshot = {},
  initialView?: InstagramInitialView,
): InstagramState {
  const state = createInstagramInitialState();
  state.users = (snapshot.users ?? []).map(toUser);

  for (const follow of snapshot.follows ?? []) {
    const follower = state.users.find((item) => item.id === follow.followerId);
    const following = state.users.find((item) => item.id === follow.followingId);
    if (follower && !follower.followingIds.includes(follow.followingId)) {
      follower.followingIds.push(follow.followingId);
    }
    if (following && !following.followerIds.includes(follow.followerId)) {
      following.followerIds.push(follow.followerId);
    }
  }

  state.posts = (snapshot.posts ?? [])
    .map(
      (post): InstagramPost => ({
        id: post.id,
        authorId: post.authorId,
        imageUrl: post.imageUrl,
        caption: post.caption,
        createdAt: post.createdAt ?? 0,
        location: post.location,
        aspect: post.aspect ?? "portrait",
        likeCount: post.likeCount ?? 0,
        commentCount: post.commentCount ?? 0,
        commentIds: [],
        likedBy: [],
      }),
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  state.comments = (snapshot.comments ?? []).map(
    (comment): InstagramComment => ({
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      text: comment.text,
      createdAt: comment.createdAt ?? 0,
    }),
  );

  for (const comment of state.comments) {
    const post = state.posts.find((item) => item.id === comment.postId);
    if (post && !post.commentIds.includes(comment.id)) {
      post.commentIds.push(comment.id);
      post.commentCount += 1;
    }
  }

  for (const set of snapshot.storySets ?? []) {
    const stories: InstagramStory[] = set.items.map((item) => ({
      id: item.id,
      authorId: item.authorId,
      mediaUrl: item.mediaUrl,
      createdAt: item.createdAt ?? 0,
      durationFrames: item.durationFrames ?? 90,
      accentColor: item.accentColor,
    }));
    state.stories.push(...stories);
    state.storySets.push({
      id: set.id,
      userId: set.userId,
      storyIds: stories.map((item) => item.id),
      lastViewedStoryId: null,
    });
  }

  state.dmThreads = (snapshot.threads ?? []).map(
    (thread): InstagramDMThread => ({
      id: thread.id,
      participantIds: [...thread.participantIds],
      title: thread.title,
      unreadCount: thread.unreadCount ?? 0,
      pinned: thread.pinned ?? false,
      typingUserId: null,
      messageIds: [],
      lastMessageAt: null,
    }),
  );

  state.dmMessages = (snapshot.messages ?? []).map(
    (message): InstagramDMMessage => ({
      id: message.id,
      threadId: message.threadId,
      senderId: message.senderId,
      text: message.text,
      createdAt: message.createdAt ?? 0,
      storyId: message.storyId,
    }),
  );

  for (const message of state.dmMessages) {
    const thread = state.dmThreads.find((item) => item.id === message.threadId);
    if (!thread) continue;
    thread.messageIds.push(message.id);
    thread.lastMessageAt = Math.max(thread.lastMessageAt ?? 0, message.createdAt);
  }

  state.notifications = (snapshot.notifications ?? [])
    .map(
      (notification): InstagramNotification => ({
        id: notification.id,
        type: notification.type,
        actorId: notification.actorId,
        postId: notification.postId,
        threadId: notification.threadId,
        storyId: notification.storyId,
        title: notification.title,
        body: notification.body,
        createdAt: notification.createdAt ?? 0,
        read: notification.read ?? false,
      }),
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  state.currentUserId = snapshot.currentUserId ?? null;
  if (initialView) {
    state.currentScreen = initialView.screen;
    state.activePostId = initialView.postId ?? null;
    state.activeProfileId = initialView.profileId ?? null;
    state.activeThreadId = initialView.threadId ?? null;
    state.activeStorySetId = initialView.storySetId ?? null;
    state.activeStoryId = initialView.storyId ?? null;
    state.profileTab = initialView.profileTab ?? "posts";
    state.themeMode = initialView.themeMode ?? "light";
    state.composerDraft = initialView.composerDraft ?? { caption: "" };
    state.statusBarTheme = initialView.screen === "story" ? "light" : "dark";
  }

  if (state.activeThreadId) {
    state.viewMode = "CHAT";
    state.conversationId = state.activeThreadId;
  } else if (state.currentScreen === "story" || state.currentScreen === "composer") {
    state.viewMode = "FULLSCREEN";
  }

  return state;
}

export function lowerInstagramSnapshot(
  snapshotInput: unknown,
  at: number,
  deviceId?: string,
): RuntimeEvent[] {
  const validation = validateInstagramBootstrap(snapshotInput as InstagramSnapshot);
  if (validation.errors.length > 0) {
    throw new Error(
      `Invalid Instagram snapshot: ${validation.errors.join("; ")}`,
    );
  }
  return [
    {
      at,
      kind: "APP",
      appId: "app_instagram",
      type: "HYDRATE_STATE",
      deviceId,
      payload: hydrateInstagramState(snapshotInput as InstagramSnapshot),
    },
  ];
}

export function lowerInstagramInitialView(
  viewInput: unknown,
  at: number,
  deviceId?: string,
): RuntimeEvent[] {
  const validation = validateInstagramInitialView(viewInput);
  if (validation.errors.length > 0) {
    throw new Error(
      `Invalid Instagram initial view: ${validation.errors.join("; ")}`,
    );
  }

  const view = viewInput as InstagramInitialView;
  const events: RuntimeEvent[] = [
    {
      at,
      kind: "APP",
      appId: "app_instagram",
      type: "SET_SCREEN",
      deviceId,
      payload: {
        screen: view.screen,
        postId: view.postId,
        profileId: view.profileId,
        threadId: view.threadId,
        storySetId: view.storySetId,
        storyId: view.storyId,
      },
    },
  ];

  if (view.profileTab) {
    events.push({
      at,
      kind: "APP",
      appId: "app_instagram",
      type: "SET_PROFILE_TAB",
      deviceId,
      payload: { tab: view.profileTab },
    });
  }
  if (view.themeMode) {
    events.push({
      at,
      kind: "APP",
      appId: "app_instagram",
      type: "SET_THEME_MODE",
      deviceId,
      payload: { mode: view.themeMode },
    });
  }
  if (view.composerDraft) {
    events.push({
      at,
      kind: "APP",
      appId: "app_instagram",
      type: "SET_COMPOSER_DRAFT",
      deviceId,
      payload: view.composerDraft,
    });
  }

  return events;
}
