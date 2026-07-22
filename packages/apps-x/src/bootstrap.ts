import type {
  PluginBootstrapContract,
  PluginBootstrapSchemaContext,
  PluginBootstrapValidationResult,
} from "@tokovo/core";
import {
  formatXSchemaIssues,
  xInitialViewSchema,
  xSnapshotSchema,
  type XInitialViewInput,
  type XSnapshotInput,
} from "./contract/schemas.js";
import {
  X_STATE_SCHEMA_VERSION,
  createXInitialState,
  type XDMMessage,
  type XDMThread,
  type XNotification,
  type XRoute,
  type XState,
  type XTweet,
  type XUser,
} from "./runtime/state.js";

export type XSnapshot = XSnapshotInput;
export type XInitialView = XInitialViewInput;

function snapshotInputOrEmpty(value: unknown): unknown {
  return value === undefined
    ? { schemaVersion: X_STATE_SCHEMA_VERSION, users: [] }
    : value;
}

function validateSchema(
  input: PluginBootstrapSchemaContext<"app_x">,
  kind: "snapshot" | "initialView",
): PluginBootstrapValidationResult {
  const result = (kind === "snapshot" ? xSnapshotSchema : xInitialViewSchema).safeParse(input.value);
  return result.success
    ? { errors: [] }
    : { errors: formatXSchemaIssues(result.error, kind) };
}

function duplicateErrors(ids: readonly string[], path: string): string[] {
  const seen = new Set<string>();
  const errors: string[] = [];
  ids.forEach((id, index) => {
    if (seen.has(id)) errors.push(`${path}[${index}].id duplicates "${id}"`);
    seen.add(id);
  });
  return errors;
}

function validateReferences(snapshot: XSnapshot, view?: XInitialView): string[] {
  const errors: string[] = [];
  const users = new Set(snapshot.users.map((user) => user.id));
  const tweets = new Set((snapshot.tweets ?? []).map((tweet) => tweet.id));
  const threads = new Set((snapshot.threads ?? []).map((thread) => thread.id));
  const messages = new Set((snapshot.messages ?? []).map((message) => message.id));

  errors.push(...duplicateErrors(snapshot.users.map((user) => user.id), "snapshot.users"));
  errors.push(...duplicateErrors((snapshot.tweets ?? []).map((tweet) => tweet.id), "snapshot.tweets"));
  errors.push(...duplicateErrors((snapshot.notifications ?? []).map((notification) => notification.id), "snapshot.notifications"));
  errors.push(...duplicateErrors((snapshot.threads ?? []).map((thread) => thread.id), "snapshot.threads"));
  errors.push(...duplicateErrors((snapshot.messages ?? []).map((message) => message.id), "snapshot.messages"));

  const requireUser = (id: string, path: string): void => {
    if (!users.has(id)) errors.push(`${path} references unknown user "${id}"`);
  };
  const requireTweet = (id: string, path: string): void => {
    if (!tweets.has(id)) errors.push(`${path} references unknown tweet "${id}"`);
  };
  const requireThread = (id: string, path: string): void => {
    if (!threads.has(id)) errors.push(`${path} references unknown thread "${id}"`);
  };

  if (snapshot.currentUserId) requireUser(snapshot.currentUserId, "snapshot.currentUserId");

  (snapshot.tweets ?? []).forEach((tweet, index) => {
    requireUser(tweet.authorId, `snapshot.tweets[${index}].authorId`);
    if (tweet.replyToId) requireTweet(tweet.replyToId, `snapshot.tweets[${index}].replyToId`);
    if (tweet.repostOfId) requireTweet(tweet.repostOfId, `snapshot.tweets[${index}].repostOfId`);
    if (tweet.quoteTweetId) requireTweet(tweet.quoteTweetId, `snapshot.tweets[${index}].quoteTweetId`);
    tweet.likedBy?.forEach((id, actorIndex) => requireUser(id, `snapshot.tweets[${index}].likedBy[${actorIndex}]`));
    tweet.bookmarkedBy?.forEach((id, actorIndex) => requireUser(id, `snapshot.tweets[${index}].bookmarkedBy[${actorIndex}]`));
    tweet.sharedBy?.forEach((id, actorIndex) => requireUser(id, `snapshot.tweets[${index}].sharedBy[${actorIndex}]`));
  });

  (snapshot.notifications ?? []).forEach((notification, index) => {
    requireUser(notification.actorId, `snapshot.notifications[${index}].actorId`);
    if (notification.tweetId) requireTweet(notification.tweetId, `snapshot.notifications[${index}].tweetId`);
  });

  const threadParticipants = new Map<string, Set<string>>();
  (snapshot.threads ?? []).forEach((thread, index) => {
    const participants = new Set(thread.participantIds);
    threadParticipants.set(thread.id, participants);
    if (participants.size !== thread.participantIds.length) {
      errors.push(`snapshot.threads[${index}].participantIds contains duplicates`);
    }
    thread.participantIds.forEach((id, participantIndex) => {
      requireUser(id, `snapshot.threads[${index}].participantIds[${participantIndex}]`);
    });
  });

  (snapshot.messages ?? []).forEach((message, index) => {
    requireThread(message.threadId, `snapshot.messages[${index}].threadId`);
    requireUser(message.senderId, `snapshot.messages[${index}].senderId`);
    const participants = threadParticipants.get(message.threadId);
    if (participants && !participants.has(message.senderId)) {
      errors.push(`snapshot.messages[${index}].senderId is not a participant of thread "${message.threadId}"`);
    }
  });

  const relations = new Set<string>();
  (snapshot.follows ?? []).forEach((relation, index) => {
    requireUser(relation.followerId, `snapshot.follows[${index}].followerId`);
    requireUser(relation.followingId, `snapshot.follows[${index}].followingId`);
    if (relation.followerId === relation.followingId) {
      errors.push(`snapshot.follows[${index}] cannot follow itself`);
    }
    const key = `${relation.followerId}:${relation.followingId}`;
    if (relations.has(key)) errors.push(`snapshot.follows[${index}] duplicates relation "${key}"`);
    relations.add(key);
  });

  if (view?.tweetId) requireTweet(view.tweetId, "initialView.tweetId");
  if (view?.userId) requireUser(view.userId, "initialView.userId");
  if (view?.threadId) requireThread(view.threadId, "initialView.threadId");

  void messages;
  return errors;
}

function toUser(input: XSnapshot["users"][number]): XUser {
  return {
    id: input.id,
    name: input.name,
    handle: input.handle,
    bio: input.bio,
    avatarUrl: input.avatarUrl,
    bannerUrl: input.bannerUrl,
    location: input.location,
    website: input.website,
    joinedAt: input.joinedAt,
    followers: input.followers ?? 0,
    following: input.following ?? 0,
    followerIds: [],
    followingIds: [],
    verified: input.verified ?? null,
  };
}

function toTweet(input: NonNullable<XSnapshot["tweets"]>[number]): XTweet {
  const selectedOptionId = input.poll?.selectedOptionId ?? null;
  const pollVotes = input.poll?.options.reduce((total, option) => total + option.votes, 0) ?? 0;
  return {
    id: input.id,
    authorId: input.authorId,
    text: input.text,
    createdAt: input.createdAt,
    replyToId: input.replyToId,
    repostOfId: input.repostOfId,
    quoteTweetId: input.quoteTweetId,
    media: input.media
      ? {
          type: input.media.type,
          urls: [...input.media.urls],
          aspect: input.media.aspect,
          alt: input.media.alt,
          posterUrl: input.media.posterUrl,
          sensitive: input.media.sensitive ?? false,
          playback: input.media.type === "video"
            ? { state: "idle", progress: 0 }
            : null,
        }
      : undefined,
    linkPreview: input.linkPreview ? { ...input.linkPreview } : undefined,
    poll: input.poll
      ? {
          options: input.poll.options.map((option) => ({ ...option })),
          totalVotes: input.poll.totalVotes ?? pollVotes,
          endsAt: input.poll.endsAt,
          selectedOptionId,
        }
      : undefined,
    hashtags: [...(input.hashtags ?? [])],
    mentions: [...(input.mentions ?? [])],
    likeCount: input.likeCount ?? input.likedBy?.length ?? 0,
    repostCount: input.repostCount ?? 0,
    replyIds: [],
    likedBy: [...(input.likedBy ?? [])],
    bookmarkedBy: [...(input.bookmarkedBy ?? [])],
    sharedBy: [...(input.sharedBy ?? [])],
    viewCount: input.viewCount ?? 0,
    bookmarkCount: input.bookmarkCount ?? input.bookmarkedBy?.length ?? 0,
    shareCount: input.shareCount ?? input.sharedBy?.length ?? 0,
  };
}

function routeForView(view?: XInitialView): XRoute {
  if (!view) return { screen: "timeline" };
  return {
    screen: view.screen,
    tweetId: view.tweetId,
    userId: view.userId,
    threadId: view.threadId,
  };
}

function syncViewMode(state: XState): void {
  if (state.route.screen === "compose") {
    state.viewMode = "FULLSCREEN";
    state.conversationId = undefined;
  } else if (state.route.screen === "thread") {
    state.viewMode = "CHAT";
    state.conversationId = state.route.threadId;
  } else {
    state.viewMode = "FEED";
    state.conversationId = undefined;
  }
}

export const xBootstrap: PluginBootstrapContract<"app_x"> = {
  snapshot: {
    currentVersion: 2,
    validate: (input) => validateSchema(input, "snapshot"),
  },
  view: {
    currentVersion: 2,
    validate: (input) => validateSchema(input, "initialView"),
  },
  validate(context): PluginBootstrapValidationResult {
    const snapshotResult = xSnapshotSchema.safeParse(snapshotInputOrEmpty(context.snapshot?.snapshot));
    const viewResult = context.initialView
      ? xInitialViewSchema.safeParse(context.initialView.view)
      : undefined;
    if (!snapshotResult.success || (viewResult && !viewResult.success)) return { errors: [] };
    return { errors: validateReferences(snapshotResult.data, viewResult?.data) };
  },
  hydrate(context): XState {
    const snapshot = xSnapshotSchema.parse(snapshotInputOrEmpty(context.snapshot?.snapshot));
    const initialView = context.initialView
      ? xInitialViewSchema.parse(context.initialView.view)
      : undefined;
    const state = createXInitialState();
    state.schemaVersion = X_STATE_SCHEMA_VERSION;
    state.locale = snapshot.locale ?? "en-US";
    state.currentUserId = snapshot.currentUserId ?? null;

    for (const input of snapshot.users) {
      state.usersById[input.id] = toUser(input);
    }
    for (const relation of snapshot.follows ?? []) {
      const follower = state.usersById[relation.followerId];
      const following = state.usersById[relation.followingId];
      follower.followingIds.push(following.id);
      following.followerIds.push(follower.id);
      follower.following = Math.max(follower.following, follower.followingIds.length);
      following.followers = Math.max(following.followers, following.followerIds.length);
    }

    for (const input of snapshot.tweets ?? []) {
      state.tweetsById[input.id] = toTweet(input);
    }
    for (const tweet of Object.values(state.tweetsById)) {
      if (tweet.replyToId) state.tweetsById[tweet.replyToId].replyIds.push(tweet.id);
      if (!tweet.replyToId) state.timelineIds.push(tweet.id);
    }
    state.timelineIds.sort((left, right) => {
      const difference = state.tweetsById[right].createdAt - state.tweetsById[left].createdAt;
      return difference === 0 ? left.localeCompare(right) : difference;
    });

    for (const input of snapshot.notifications ?? []) {
      const notification: XNotification = {
        ...input,
        read: input.read ?? false,
      };
      state.notificationsById[input.id] = notification;
      state.notificationIds.push(input.id);
    }
    state.notificationIds.sort((left, right) => {
      const difference = state.notificationsById[right].createdAt - state.notificationsById[left].createdAt;
      return difference === 0 ? left.localeCompare(right) : difference;
    });

    for (const input of snapshot.threads ?? []) {
      const thread: XDMThread = {
        id: input.id,
        participantIds: [...input.participantIds],
        messageIds: [],
        title: input.title,
        unreadCount: input.unreadCount ?? 0,
        pinned: input.pinned ?? false,
        typingUserId: null,
        lastMessageAt: null,
      };
      state.dmThreadsById[input.id] = thread;
      state.dmThreadIds.push(input.id);
      state.threadScrollYById[input.id] = 0;
    }
    for (const input of snapshot.messages ?? []) {
      const message: XDMMessage = {
        ...input,
        delivery: input.delivery ?? "sent",
      };
      state.dmMessagesById[input.id] = message;
      const thread = state.dmThreadsById[input.threadId];
      thread.messageIds.push(input.id);
      thread.lastMessageAt = Math.max(thread.lastMessageAt ?? 0, input.createdAt);
    }
    for (const thread of Object.values(state.dmThreadsById)) {
      thread.messageIds.sort((left, right) => {
        const difference = state.dmMessagesById[left].createdAt - state.dmMessagesById[right].createdAt;
        return difference === 0 ? left.localeCompare(right) : difference;
      });
    }
    state.dmThreadIds.sort((left, right) => {
      const a = state.dmThreadsById[left];
      const b = state.dmThreadsById[right];
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const difference = (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0);
      return difference === 0 ? left.localeCompare(right) : difference;
    });

    state.route = routeForView(initialView);
    state.composer = initialView?.composer
      ? {
          draft: initialView.composer.draft,
          status: initialView.composer.status ?? "idle",
          error: initialView.composer.error ?? null,
        }
      : { draft: "", status: "idle", error: null };
    state.timelineTab = initialView?.timelineTab ?? "forYou";
    state.profileTab = initialView?.profileTab ?? "posts";
    state.notificationsTab = initialView?.notificationsTab ?? "all";
    state.feedScrollY = initialView?.feedScrollY ?? 0;
    syncViewMode(state);
    return state;
  },
};
