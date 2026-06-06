import {
  expectArray,
  expectObjectRecord,
  expectOneOf,
  expectOptionalBoolean,
  expectOptionalNumber,
  expectOptionalString,
  expectString,
} from "@tokovo/core";
import type {
  PluginBootstrapContract,
  PluginBootstrapValidationResult,
} from "@tokovo/core";
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
  InstagramStorySet,
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

type ValidationResult = PluginBootstrapValidationResult & { errors: string[] };

const INSTAGRAM_SCREENS: readonly InstagramScreen[] = [
  "home",
  "story",
  "notifications",
  "inbox",
  "thread",
  "profile",
  "composer",
];

const INSTAGRAM_PROFILE_TABS: readonly InstagramProfileTab[] = ["posts", "tagged"];
const INSTAGRAM_THEME_MODES: readonly InstagramThemeMode[] = [
  "light",
  "dark",
  "storybook",
];
const INSTAGRAM_POST_ASPECTS = ["square", "portrait", "landscape"] as const;
const INSTAGRAM_NOTIFICATION_TYPES = [
  "like",
  "comment",
  "follow",
  "dm",
  "story_reply",
] as const;

function validateInstagramSnapshotValue(value: unknown): ValidationResult {
  const errors: string[] = [];
  const snapshot = expectObjectRecord(value, "snapshot", errors);
  if (!snapshot) {
    return { errors };
  }

  const userIds = new Set<string>();
  const postIds = new Set<string>();
  const storyIds = new Set<string>();
  const storySetIds = new Set<string>();
  const threadIds = new Set<string>();
  const messageIds = new Set<string>();
  const notificationIds = new Set<string>();

  const users = snapshot.users === null || snapshot.users === undefined
    ? undefined
    : expectArray(snapshot.users, "snapshot.users", errors);
  users?.forEach((value, index) => {
    const user = expectObjectRecord(value, `snapshot.users[${index}]`, errors);
    if (!user) return;
    const id = expectString(user.id, `snapshot.users[${index}].id`, errors);
    expectString(user.username, `snapshot.users[${index}].username`, errors);
    expectString(user.displayName, `snapshot.users[${index}].displayName`, errors);
    expectOptionalString(user.avatarUrl, `snapshot.users[${index}].avatarUrl`, errors);
    expectOptionalString(user.bio, `snapshot.users[${index}].bio`, errors);
    expectOptionalNumber(user.followers, `snapshot.users[${index}].followers`, errors);
    expectOptionalNumber(user.following, `snapshot.users[${index}].following`, errors);
    expectOptionalBoolean(user.verified, `snapshot.users[${index}].verified`, errors);
    if (id) {
      if (userIds.has(id)) errors.push(`snapshot.users[${index}].id duplicates "${id}"`);
      userIds.add(id);
    }
  });

  const follows = snapshot.follows === null || snapshot.follows === undefined
    ? undefined
    : expectArray(snapshot.follows, "snapshot.follows", errors);
  follows?.forEach((value, index) => {
    const follow = expectObjectRecord(value, `snapshot.follows[${index}]`, errors);
    if (!follow) return;
    const followerId = expectString(
      follow.followerId,
      `snapshot.follows[${index}].followerId`,
      errors,
    );
    const followingId = expectString(
      follow.followingId,
      `snapshot.follows[${index}].followingId`,
      errors,
    );
    if (followerId && userIds.size > 0 && !userIds.has(followerId)) {
      errors.push(`snapshot.follows[${index}].followerId references unknown user "${followerId}"`);
    }
    if (followingId && userIds.size > 0 && !userIds.has(followingId)) {
      errors.push(`snapshot.follows[${index}].followingId references unknown user "${followingId}"`);
    }
  });

  const posts = snapshot.posts === null || snapshot.posts === undefined
    ? undefined
    : expectArray(snapshot.posts, "snapshot.posts", errors);
  posts?.forEach((value, index) => {
    const post = expectObjectRecord(value, `snapshot.posts[${index}]`, errors);
    if (!post) return;
    const id = expectString(post.id, `snapshot.posts[${index}].id`, errors);
    const authorId = expectString(
      post.authorId,
      `snapshot.posts[${index}].authorId`,
      errors,
    );
    expectString(post.imageUrl, `snapshot.posts[${index}].imageUrl`, errors);
    if (typeof post.caption !== "string") {
      errors.push(`snapshot.posts[${index}].caption must be a string`);
    }
    expectOptionalString(post.location, `snapshot.posts[${index}].location`, errors);
    expectOptionalNumber(post.createdAt, `snapshot.posts[${index}].createdAt`, errors);
    expectOptionalNumber(post.likeCount, `snapshot.posts[${index}].likeCount`, errors);
    expectOptionalNumber(post.commentCount, `snapshot.posts[${index}].commentCount`, errors);
    if (post.aspect !== null && post.aspect !== undefined) {
      expectOneOf(
        post.aspect,
        INSTAGRAM_POST_ASPECTS,
        `snapshot.posts[${index}].aspect`,
        errors,
      );
    }
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
    const authorId = expectString(
      comment.authorId,
      `snapshot.comments[${index}].authorId`,
      errors,
    );
    if (typeof comment.text !== "string") {
      errors.push(`snapshot.comments[${index}].text must be a string`);
    }
    expectOptionalNumber(comment.createdAt, `snapshot.comments[${index}].createdAt`, errors);
    if (postId && postIds.size > 0 && !postIds.has(postId)) {
      errors.push(`snapshot.comments[${index}].postId references unknown post "${postId}"`);
    }
    if (authorId && userIds.size > 0 && !userIds.has(authorId)) {
      errors.push(`snapshot.comments[${index}].authorId references unknown user "${authorId}"`);
    }
  });

  const storySets = snapshot.storySets === null || snapshot.storySets === undefined
    ? undefined
    : expectArray(snapshot.storySets, "snapshot.storySets", errors);
  storySets?.forEach((value, index) => {
    const storySet = expectObjectRecord(value, `snapshot.storySets[${index}]`, errors);
    if (!storySet) return;
    const id = expectString(storySet.id, `snapshot.storySets[${index}].id`, errors);
    const userId = expectString(storySet.userId, `snapshot.storySets[${index}].userId`, errors);
    if (id) {
      if (storySetIds.has(id)) {
        errors.push(`snapshot.storySets[${index}].id duplicates "${id}"`);
      }
      storySetIds.add(id);
    }
    if (userId && userIds.size > 0 && !userIds.has(userId)) {
      errors.push(`snapshot.storySets[${index}].userId references unknown user "${userId}"`);
    }

    const items = expectArray(storySet.items, `snapshot.storySets[${index}].items`, errors);
    items?.forEach((itemValue, itemIndex) => {
      const item = expectObjectRecord(
        itemValue,
        `snapshot.storySets[${index}].items[${itemIndex}]`,
        errors,
      );
      if (!item) return;
      const itemId = expectString(
        item.id,
        `snapshot.storySets[${index}].items[${itemIndex}].id`,
        errors,
      );
      const authorId = expectString(
        item.authorId,
        `snapshot.storySets[${index}].items[${itemIndex}].authorId`,
        errors,
      );
      expectString(
        item.mediaUrl,
        `snapshot.storySets[${index}].items[${itemIndex}].mediaUrl`,
        errors,
      );
      expectOptionalNumber(
        item.createdAt,
        `snapshot.storySets[${index}].items[${itemIndex}].createdAt`,
        errors,
      );
      expectOptionalNumber(
        item.durationFrames,
        `snapshot.storySets[${index}].items[${itemIndex}].durationFrames`,
        errors,
      );
      expectOptionalString(
        item.accentColor,
        `snapshot.storySets[${index}].items[${itemIndex}].accentColor`,
        errors,
      );
      if (itemId) {
        if (storyIds.has(itemId)) {
          errors.push(
            `snapshot.storySets[${index}].items[${itemIndex}].id duplicates "${itemId}"`,
          );
        }
        storyIds.add(itemId);
      }
      if (authorId && userIds.size > 0 && !userIds.has(authorId)) {
        errors.push(
          `snapshot.storySets[${index}].items[${itemIndex}].authorId references unknown user "${authorId}"`,
        );
      }
    });
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
        errors.push(
          `snapshot.threads[${index}].participantIds[${participantIndex}] references unknown user "${resolved}"`,
        );
      }
    });
    expectOptionalString(thread.title, `snapshot.threads[${index}].title`, errors);
    expectOptionalNumber(thread.unreadCount, `snapshot.threads[${index}].unreadCount`, errors);
    expectOptionalBoolean(thread.pinned, `snapshot.threads[${index}].pinned`, errors);
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
    const id = expectString(message.id, `snapshot.messages[${index}].id`, errors);
    const threadId = expectString(message.threadId, `snapshot.messages[${index}].threadId`, errors);
    const senderId = expectString(message.senderId, `snapshot.messages[${index}].senderId`, errors);
    if (typeof message.text !== "string") {
      errors.push(`snapshot.messages[${index}].text must be a string`);
    }
    expectOptionalNumber(message.createdAt, `snapshot.messages[${index}].createdAt`, errors);
    expectOptionalString(message.storyId, `snapshot.messages[${index}].storyId`, errors);
    if (id) {
      if (messageIds.has(id)) errors.push(`snapshot.messages[${index}].id duplicates "${id}"`);
      messageIds.add(id);
    }
    if (threadId && threadIds.size > 0 && !threadIds.has(threadId)) {
      errors.push(`snapshot.messages[${index}].threadId references unknown thread "${threadId}"`);
    }
    if (senderId && userIds.size > 0 && !userIds.has(senderId)) {
      errors.push(`snapshot.messages[${index}].senderId references unknown user "${senderId}"`);
    }
    if (typeof message.storyId === "string" && storyIds.size > 0 && !storyIds.has(message.storyId)) {
      errors.push(`snapshot.messages[${index}].storyId references unknown story "${message.storyId}"`);
    }
  });

  const notifications = snapshot.notifications === null || snapshot.notifications === undefined
    ? undefined
    : expectArray(snapshot.notifications, "snapshot.notifications", errors);
  notifications?.forEach((value, index) => {
    const notification = expectObjectRecord(
      value,
      `snapshot.notifications[${index}]`,
      errors,
    );
    if (!notification) return;
    const id = expectString(notification.id, `snapshot.notifications[${index}].id`, errors);
    const actorId = expectString(
      notification.actorId,
      `snapshot.notifications[${index}].actorId`,
      errors,
    );
    expectOneOf(
      notification.type,
      INSTAGRAM_NOTIFICATION_TYPES,
      `snapshot.notifications[${index}].type`,
      errors,
    );
    expectOptionalString(notification.postId, `snapshot.notifications[${index}].postId`, errors);
    expectOptionalString(notification.threadId, `snapshot.notifications[${index}].threadId`, errors);
    expectOptionalString(notification.storyId, `snapshot.notifications[${index}].storyId`, errors);
    expectOptionalString(notification.title, `snapshot.notifications[${index}].title`, errors);
    expectOptionalString(notification.body, `snapshot.notifications[${index}].body`, errors);
    expectOptionalNumber(notification.createdAt, `snapshot.notifications[${index}].createdAt`, errors);
    expectOptionalBoolean(notification.read, `snapshot.notifications[${index}].read`, errors);
    if (id) {
      if (notificationIds.has(id)) {
        errors.push(`snapshot.notifications[${index}].id duplicates "${id}"`);
      }
      notificationIds.add(id);
    }
    if (actorId && userIds.size > 0 && !userIds.has(actorId)) {
      errors.push(
        `snapshot.notifications[${index}].actorId references unknown user "${actorId}"`,
      );
    }
    if (typeof notification.postId === "string" && postIds.size > 0 && !postIds.has(notification.postId)) {
      errors.push(`snapshot.notifications[${index}].postId references unknown post "${notification.postId}"`);
    }
    if (typeof notification.threadId === "string" && threadIds.size > 0 && !threadIds.has(notification.threadId)) {
      errors.push(`snapshot.notifications[${index}].threadId references unknown thread "${notification.threadId}"`);
    }
    if (typeof notification.storyId === "string" && storyIds.size > 0 && !storyIds.has(notification.storyId)) {
      errors.push(`snapshot.notifications[${index}].storyId references unknown story "${notification.storyId}"`);
    }
  });

  expectOptionalString(snapshot.currentUserId, "snapshot.currentUserId", errors);
  if (
    typeof snapshot.currentUserId === "string" &&
    userIds.size > 0 &&
    !userIds.has(snapshot.currentUserId)
  ) {
    errors.push(`snapshot.currentUserId references unknown user "${snapshot.currentUserId}"`);
  }

  return { errors };
}

function validateInstagramInitialViewValue(value: unknown): ValidationResult {
  const errors: string[] = [];
  const view = expectObjectRecord(value, "initialView", errors);
  if (!view) {
    return { errors };
  }

  expectOneOf(view.screen, INSTAGRAM_SCREENS, "initialView.screen", errors);
  expectOptionalString(view.postId, "initialView.postId", errors);
  expectOptionalString(view.profileId, "initialView.profileId", errors);
  expectOptionalString(view.threadId, "initialView.threadId", errors);
  expectOptionalString(view.storySetId, "initialView.storySetId", errors);
  expectOptionalString(view.storyId, "initialView.storyId", errors);

  if (view.profileTab !== null && view.profileTab !== undefined) {
    expectOneOf(view.profileTab, INSTAGRAM_PROFILE_TABS, "initialView.profileTab", errors);
  }
  if (view.themeMode !== null && view.themeMode !== undefined) {
    expectOneOf(view.themeMode, INSTAGRAM_THEME_MODES, "initialView.themeMode", errors);
  }
  if (view.composerDraft !== null && view.composerDraft !== undefined) {
    const draft = expectObjectRecord(view.composerDraft, "initialView.composerDraft", errors);
    if (draft) {
      if (typeof draft.caption !== "string") {
        errors.push("initialView.composerDraft.caption must be a string");
      }
      expectOptionalString(draft.imageUrl, "initialView.composerDraft.imageUrl", errors);
      expectOptionalString(draft.location, "initialView.composerDraft.location", errors);
    }
  }

  return { errors };
}

function validateInstagramReferences(
  snapshot?: InstagramSnapshot,
  initialView?: InstagramInitialView,
): ValidationResult {
  const errors: string[] = [];
  if (!snapshot || !initialView) {
    if (initialView?.screen === "story" && !initialView.storySetId) {
      errors.push('initialView.storySetId is required when initialView.screen is "story"');
    }
    if (initialView?.screen === "thread" && !initialView.threadId) {
      errors.push('initialView.threadId is required when initialView.screen is "thread"');
    }
    return { errors };
  }

  const userIds = new Set(snapshot.users?.map((user) => user.id) ?? []);
  const postIds = new Set(snapshot.posts?.map((post) => post.id) ?? []);
  const threadIds = new Set(snapshot.threads?.map((thread) => thread.id) ?? []);
  const storySetIds = new Set(snapshot.storySets?.map((storySet) => storySet.id) ?? []);
  const storyIds = new Set(
    snapshot.storySets?.flatMap((storySet) => storySet.items.map((item) => item.id)) ?? [],
  );

  if (initialView.screen === "story" && !initialView.storySetId) {
    errors.push('initialView.storySetId is required when initialView.screen is "story"');
  }
  if (initialView.screen === "thread" && !initialView.threadId) {
    errors.push('initialView.threadId is required when initialView.screen is "thread"');
  }
  if (initialView.postId && postIds.size > 0 && !postIds.has(initialView.postId)) {
    errors.push(`initialView.postId references unknown post "${initialView.postId}"`);
  }
  if (initialView.profileId && userIds.size > 0 && !userIds.has(initialView.profileId)) {
    errors.push(`initialView.profileId references unknown user "${initialView.profileId}"`);
  }
  if (initialView.threadId && threadIds.size > 0 && !threadIds.has(initialView.threadId)) {
    errors.push(`initialView.threadId references unknown thread "${initialView.threadId}"`);
  }
  if (initialView.storySetId && storySetIds.size > 0 && !storySetIds.has(initialView.storySetId)) {
    errors.push(`initialView.storySetId references unknown story set "${initialView.storySetId}"`);
  }
  if (initialView.storyId && storyIds.size > 0 && !storyIds.has(initialView.storyId)) {
    errors.push(`initialView.storyId references unknown story "${initialView.storyId}"`);
  }

  return { errors };
}

function syncBootstrapViewMode(state: InstagramState): void {
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

function ensureUser(user: InstagramUserPayload): InstagramUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    followers: user.followers ?? 0,
    following: user.following ?? 0,
    followerIds: [],
    followingIds: [],
    verified: user.verified ?? false,
  };
}

function applyInitialView(state: InstagramState, initialView?: InstagramInitialView): void {
  if (!initialView) {
    syncBootstrapViewMode(state);
    return;
  }

  state.currentScreen = initialView.screen;
  state.activePostId = initialView.postId ?? null;
  state.activeProfileId = initialView.profileId ?? (initialView.screen === "profile" ? state.currentUserId : null);
  state.activeThreadId = initialView.threadId ?? null;
  state.activeStorySetId = initialView.storySetId ?? null;

  const activeStorySet = initialView.storySetId === null || initialView.storySetId === undefined
    ? undefined
    : state.storySets.find((item) => item.id === initialView.storySetId);
  const resolvedStoryId =
    initialView.storyId ??
    activeStorySet?.storyIds[0] ??
    null;
  state.activeStoryId = resolvedStoryId;

  state.profileTab = initialView.profileTab ?? "posts";
  state.themeMode = initialView.themeMode ?? state.themeMode;
  state.composerDraft = initialView.composerDraft
    ? { ...initialView.composerDraft }
    : { ...state.composerDraft };
  state.statusBarTheme = initialView.screen === "story" ? "light" : "dark";

  if (activeStorySet && resolvedStoryId) {
    activeStorySet.lastViewedStoryId = resolvedStoryId;
  }

  syncBootstrapViewMode(state);
}

export function validateInstagramInitialView(value: unknown): ValidationResult {
  return validateInstagramInitialViewValue(value);
}

export function validateInstagramBootstrap(
  snapshot: InstagramSnapshot,
  initialView?: InstagramInitialView,
): ValidationResult {
  const snapshotErrors = validateInstagramSnapshotValue(snapshot).errors ?? [];
  const initialViewErrors = initialView
    ? validateInstagramInitialViewValue(initialView).errors ?? []
    : [];
  const referenceErrors = validateInstagramReferences(snapshot, initialView).errors ?? [];

  return {
    errors: [...snapshotErrors, ...initialViewErrors, ...referenceErrors],
  };
}

export function hydrateInstagramState(
  snapshot?: InstagramSnapshot,
  initialView?: InstagramInitialView,
): InstagramState {
  const state = createInstagramInitialState();
  if (!snapshot) {
    applyInitialView(state, initialView);
    return state;
  }

  const usersById = new Map<string, InstagramUser>();
  state.users = (snapshot.users ?? []).map((user) => {
    const hydrated = ensureUser(user);
    usersById.set(hydrated.id, hydrated);
    return hydrated;
  });

  for (const follow of snapshot.follows ?? []) {
    const follower = usersById.get(follow.followerId);
    const following = usersById.get(follow.followingId);
    if (follower && !follower.followingIds.includes(follow.followingId)) {
      follower.followingIds.push(follow.followingId);
    }
    if (following && !following.followerIds.includes(follow.followerId)) {
      following.followerIds.push(follow.followerId);
    }
  }

  for (const user of state.users) {
    user.followers = Math.max(user.followers, user.followerIds.length);
    user.following = Math.max(user.following, user.followingIds.length);
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

  const postsById = new Map(state.posts.map((post) => [post.id, post]));

  state.comments = (snapshot.comments ?? [])
    .map(
      (comment): InstagramComment => ({
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        text: comment.text,
        createdAt: comment.createdAt ?? 0,
      }),
    )
    .sort((a, b) => a.createdAt - b.createdAt);

  for (const comment of state.comments) {
    const post = postsById.get(comment.postId);
    if (post && !post.commentIds.includes(comment.id)) {
      post.commentIds.push(comment.id);
    }
  }

  for (const post of state.posts) {
    post.commentCount = Math.max(post.commentCount, post.commentIds.length);
  }

  const stories: InstagramStory[] = [];
  state.storySets = (snapshot.storySets ?? []).map((storySet): InstagramStorySet => {
    const items = storySet.items.map(
      (item): InstagramStory => ({
        id: item.id,
        authorId: item.authorId,
        mediaUrl: item.mediaUrl,
        createdAt: item.createdAt ?? 0,
        durationFrames: item.durationFrames ?? 90,
        accentColor: item.accentColor,
      }),
    );
    stories.push(...items);
    return {
      id: storySet.id,
      userId: storySet.userId,
      storyIds: items.map((item) => item.id),
      lastViewedStoryId: null,
    };
  });
  state.stories = stories;

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

  const threadsById = new Map(state.dmThreads.map((thread) => [thread.id, thread]));
  state.dmMessages = (snapshot.messages ?? [])
    .map(
      (message): InstagramDMMessage => ({
        id: message.id,
        threadId: message.threadId,
        senderId: message.senderId,
        text: message.text,
        createdAt: message.createdAt ?? 0,
        storyId: message.storyId,
      }),
    )
    .sort((a, b) => a.createdAt - b.createdAt);

  for (const message of state.dmMessages) {
    const thread = threadsById.get(message.threadId);
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

  applyInitialView(state, initialView);
  return state;
}

export const instagramBootstrap: PluginBootstrapContract<"app_instagram"> = {
  snapshot: {
    currentVersion: 1,
    validate: (input) => validateInstagramSnapshotValue(input.value),
  },
  view: {
    currentVersion: 1,
    validate: (input) => validateInstagramInitialViewValue(input.value),
  },
  validate(context): ValidationResult {
    return validateInstagramReferences(
      context.snapshot?.snapshot as InstagramSnapshot | undefined,
      context.initialView?.view as InstagramInitialView | undefined,
    );
  },
  hydrate(context): InstagramState {
    return hydrateInstagramState(
      context.snapshot?.snapshot as InstagramSnapshot | undefined,
      context.initialView?.view as InstagramInitialView | undefined,
    );
  },
};
