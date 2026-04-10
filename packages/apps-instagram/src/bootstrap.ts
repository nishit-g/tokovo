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
  PluginBootstrapSchemaContext,
  PluginBootstrapValidationResult,
} from "@tokovo/core";
import type {
  InstagramComposerDraftPayload,
  InstagramProfileTab,
  InstagramThemeMode,
  InstagramUserPayload,
} from "./types/index.js";
import type {
  InstagramComment,
  InstagramDMMessage,
  InstagramDMThread,
  InstagramNotification,
  InstagramPost,
  InstagramScreen,
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

const SCREENS: readonly InstagramScreen[] = [
  "home",
  "story",
  "notifications",
  "inbox",
  "thread",
  "profile",
  "composer",
];

function validateSnapshot(
  input: PluginBootstrapSchemaContext<"app_instagram">,
): PluginBootstrapValidationResult {
  const errors: string[] = [];
  const snapshot = expectObjectRecord(input.value, "snapshot", errors);
  if (!snapshot) return { errors };

  const userIds = new Set<string>();
  const postIds = new Set<string>();
  const storyIds = new Set<string>();
  const threadIds = new Set<string>();

  const users = snapshot.users == null ? undefined : expectArray(snapshot.users, "snapshot.users", errors);
  users?.forEach((value, index) => {
    const user = expectObjectRecord(value, `snapshot.users[${index}]`, errors);
    if (!user) return;
    const id = expectString(user.id, `snapshot.users[${index}].id`, errors);
    expectString(user.username, `snapshot.users[${index}].username`, errors);
    expectString(user.displayName, `snapshot.users[${index}].displayName`, errors);
    if (id) userIds.add(id);
  });

  const posts = snapshot.posts == null ? undefined : expectArray(snapshot.posts, "snapshot.posts", errors);
  posts?.forEach((value, index) => {
    const post = expectObjectRecord(value, `snapshot.posts[${index}]`, errors);
    if (!post) return;
    const id = expectString(post.id, `snapshot.posts[${index}].id`, errors);
    const authorId = expectString(post.authorId, `snapshot.posts[${index}].authorId`, errors);
    expectString(post.imageUrl, `snapshot.posts[${index}].imageUrl`, errors);
    if (typeof post.caption !== "string") {
      errors.push(`snapshot.posts[${index}].caption must be a string`);
    }
    if (id) postIds.add(id);
    if (authorId && userIds.size > 0 && !userIds.has(authorId)) {
      errors.push(`snapshot.posts[${index}].authorId references unknown user "${authorId}"`);
    }
  });

  const comments = snapshot.comments == null ? undefined : expectArray(snapshot.comments, "snapshot.comments", errors);
  comments?.forEach((value, index) => {
    const comment = expectObjectRecord(value, `snapshot.comments[${index}]`, errors);
    if (!comment) return;
    const postId = expectString(comment.postId, `snapshot.comments[${index}].postId`, errors);
    const authorId = expectString(comment.authorId, `snapshot.comments[${index}].authorId`, errors);
    expectString(comment.id, `snapshot.comments[${index}].id`, errors);
    if (typeof comment.text !== "string") {
      errors.push(`snapshot.comments[${index}].text must be a string`);
    }
    if (postId && postIds.size > 0 && !postIds.has(postId)) {
      errors.push(`snapshot.comments[${index}].postId references unknown post "${postId}"`);
    }
    if (authorId && userIds.size > 0 && !userIds.has(authorId)) {
      errors.push(`snapshot.comments[${index}].authorId references unknown user "${authorId}"`);
    }
  });

  const storySets = snapshot.storySets == null
    ? undefined
    : expectArray(snapshot.storySets, "snapshot.storySets", errors);
  storySets?.forEach((value, index) => {
    const set = expectObjectRecord(value, `snapshot.storySets[${index}]`, errors);
    if (!set) return;
    const userId = expectString(set.userId, `snapshot.storySets[${index}].userId`, errors);
    expectString(set.id, `snapshot.storySets[${index}].id`, errors);
    if (userId && userIds.size > 0 && !userIds.has(userId)) {
      errors.push(`snapshot.storySets[${index}].userId references unknown user "${userId}"`);
    }
    const items = set.items == null ? undefined : expectArray(set.items, `snapshot.storySets[${index}].items`, errors);
    items?.forEach((itemValue, itemIndex) => {
      const item = expectObjectRecord(itemValue, `snapshot.storySets[${index}].items[${itemIndex}]`, errors);
      if (!item) return;
      const itemId = expectString(item.id, `snapshot.storySets[${index}].items[${itemIndex}].id`, errors);
      const authorId = expectString(item.authorId, `snapshot.storySets[${index}].items[${itemIndex}].authorId`, errors);
      expectString(item.mediaUrl, `snapshot.storySets[${index}].items[${itemIndex}].mediaUrl`, errors);
      if (itemId) storyIds.add(itemId);
      if (authorId && userIds.size > 0 && !userIds.has(authorId)) {
        errors.push(`snapshot.storySets[${index}].items[${itemIndex}].authorId references unknown user "${authorId}"`);
      }
    });
  });

  const threads = snapshot.threads == null ? undefined : expectArray(snapshot.threads, "snapshot.threads", errors);
  threads?.forEach((value, index) => {
    const thread = expectObjectRecord(value, `snapshot.threads[${index}]`, errors);
    if (!thread) return;
    const id = expectString(thread.id, `snapshot.threads[${index}].id`, errors);
    if (id) threadIds.add(id);
    const participants = thread.participantIds == null
      ? undefined
      : expectArray(thread.participantIds, `snapshot.threads[${index}].participantIds`, errors);
    participants?.forEach((participant, participantIndex) => {
      const participantId = expectString(
        participant,
        `snapshot.threads[${index}].participantIds[${participantIndex}]`,
        errors,
      );
      if (participantId && userIds.size > 0 && !userIds.has(participantId)) {
        errors.push(`snapshot.threads[${index}].participantIds[${participantIndex}] references unknown user "${participantId}"`);
      }
    });
  });

  const messages = snapshot.messages == null ? undefined : expectArray(snapshot.messages, "snapshot.messages", errors);
  messages?.forEach((value, index) => {
    const message = expectObjectRecord(value, `snapshot.messages[${index}]`, errors);
    if (!message) return;
    const threadId = expectString(message.threadId, `snapshot.messages[${index}].threadId`, errors);
    const senderId = expectString(message.senderId, `snapshot.messages[${index}].senderId`, errors);
    expectString(message.id, `snapshot.messages[${index}].id`, errors);
    if (typeof message.text !== "string") {
      errors.push(`snapshot.messages[${index}].text must be a string`);
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

  const notifications = snapshot.notifications == null
    ? undefined
    : expectArray(snapshot.notifications, "snapshot.notifications", errors);
  notifications?.forEach((value, index) => {
    const notification = expectObjectRecord(value, `snapshot.notifications[${index}]`, errors);
    if (!notification) return;
    expectString(notification.id, `snapshot.notifications[${index}].id`, errors);
    const actorId = expectString(notification.actorId, `snapshot.notifications[${index}].actorId`, errors);
    expectOneOf(
      notification.type,
      ["like", "comment", "follow", "dm", "story_reply"],
      `snapshot.notifications[${index}].type`,
      errors,
    );
    if (actorId && userIds.size > 0 && !userIds.has(actorId)) {
      errors.push(`snapshot.notifications[${index}].actorId references unknown user "${actorId}"`);
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
    expectOptionalBoolean(notification.read, `snapshot.notifications[${index}].read`, errors);
  });

  expectOptionalString(snapshot.currentUserId, "snapshot.currentUserId", errors);
  return { errors };
}

function validateInitialView(
  input: PluginBootstrapSchemaContext<"app_instagram">,
): PluginBootstrapValidationResult {
  const errors: string[] = [];
  const view = expectObjectRecord(input.value, "initialView", errors);
  if (!view) return { errors };
  expectOneOf(view.screen, SCREENS, "initialView.screen", errors);
  expectOptionalString(view.postId, "initialView.postId", errors);
  expectOptionalString(view.profileId, "initialView.profileId", errors);
  expectOptionalString(view.threadId, "initialView.threadId", errors);
  expectOptionalString(view.storySetId, "initialView.storySetId", errors);
  expectOptionalString(view.storyId, "initialView.storyId", errors);
  if (view.profileTab != null) {
    expectOneOf(view.profileTab, ["posts", "tagged"], "initialView.profileTab", errors);
  }
  if (view.themeMode != null) {
    expectOneOf(view.themeMode, ["light", "dark", "ghibli"], "initialView.themeMode", errors);
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

export const instagramBootstrap: PluginBootstrapContract<"app_instagram"> = {
  snapshot: { currentVersion: 1, validate: validateSnapshot },
  view: { currentVersion: 1, validate: validateInitialView },
  validate(context): PluginBootstrapValidationResult {
    const snapshot = (context.snapshot?.snapshot as InstagramSnapshot | undefined) ?? {};
    const initialView = context.initialView?.view as InstagramInitialView | undefined;
    const errors: string[] = [];
    const userIds = new Set((snapshot.users ?? []).map((item) => item.id));
    const postIds = new Set((snapshot.posts ?? []).map((item) => item.id));
    const threadIds = new Set((snapshot.threads ?? []).map((item) => item.id));
    const storySetIds = new Set((snapshot.storySets ?? []).map((item) => item.id));
    const storyIds = new Set((snapshot.storySets ?? []).flatMap((item) => item.items.map((story) => story.id)));

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
      errors.push(`initialView.storySetId references unknown story set "${initialView.storySetId}"`);
    }
    if (initialView?.storyId && !storyIds.has(initialView.storyId)) {
      errors.push(`initialView.storyId references unknown story "${initialView.storyId}"`);
    }
    return { errors };
  },
  hydrate(context): InstagramState {
    const snapshot = (context.snapshot?.snapshot as InstagramSnapshot | undefined) ?? {};
    const initialView = context.initialView?.view as InstagramInitialView | undefined;
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

    state.posts = (snapshot.posts ?? []).map((post): InstagramPost => ({
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
    })).sort((a, b) => b.createdAt - a.createdAt);

    state.comments = (snapshot.comments ?? []).map((comment): InstagramComment => ({
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      text: comment.text,
      createdAt: comment.createdAt ?? 0,
    }));

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

    state.dmThreads = (snapshot.threads ?? []).map((thread): InstagramDMThread => ({
      id: thread.id,
      participantIds: [...thread.participantIds],
      title: thread.title,
      unreadCount: thread.unreadCount ?? 0,
      pinned: thread.pinned ?? false,
      typingUserId: null,
      messageIds: [],
      lastMessageAt: null,
    }));

    state.dmMessages = (snapshot.messages ?? []).map((message): InstagramDMMessage => ({
      id: message.id,
      threadId: message.threadId,
      senderId: message.senderId,
      text: message.text,
      createdAt: message.createdAt ?? 0,
      storyId: message.storyId,
    }));

    for (const message of state.dmMessages) {
      const thread = state.dmThreads.find((item) => item.id === message.threadId);
      if (!thread) continue;
      thread.messageIds.push(message.id);
      thread.lastMessageAt = Math.max(thread.lastMessageAt ?? 0, message.createdAt);
    }

    state.notifications = (snapshot.notifications ?? []).map((notification): InstagramNotification => ({
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
    })).sort((a, b) => b.createdAt - a.createdAt);

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
  },
};
