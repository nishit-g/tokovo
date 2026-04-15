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
  NotificationsTab,
  ProfileTab,
  TimelineTab,
  TweetCreatePayload,
  TweetQuotePayload,
  TweetReplyPayload,
  UserCreatePayload,
} from "./types/index.js";
import type {
  XDMMessage,
  XDMThread,
  XNotification,
  XScreen,
  XState,
  XTweet,
  XUser,
} from "./runtime/state.js";

type TweetInput = Omit<TweetCreatePayload, "id"> & { id: string };
type ReplyInput = Omit<TweetReplyPayload, "id"> & { id: string };
type QuoteInput = Omit<TweetQuotePayload, "id"> & { id: string };

export interface XSnapshot {
  currentUserId?: string;
  users?: UserCreatePayload[];
  tweets?: TweetInput[];
  replies?: ReplyInput[];
  quotes?: QuoteInput[];
  notifications?: Array<{
    id: string;
    type: "like" | "repost" | "reply" | "follow" | "mention";
    actorId: string;
    tweetId?: string;
    isMention?: boolean;
    createdAt?: number;
    title?: string;
    body?: string;
    read?: boolean;
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
  }>;
  follows?: Array<{ followerId: string; followingId: string }>;
}

export interface XInitialView {
  screen: XScreen;
  activeTweetId?: string;
  activeUserId?: string;
  activeThreadId?: string;
  composeDraft?: string;
  timelineTab?: TimelineTab;
  profileTab?: ProfileTab;
  notificationsTab?: NotificationsTab;
  themeMode?: XState["themeMode"];
}

const X_SCREENS: readonly XScreen[] = [
  "timeline",
  "tweet",
  "compose",
  "profile",
  "notifications",
  "messages",
  "thread",
];

const X_TIMELINE_TABS: readonly TimelineTab[] = ["forYou", "following"];
const X_PROFILE_TABS: readonly ProfileTab[] = ["posts", "replies", "media", "likes"];
const X_NOTIFICATION_TABS: readonly NotificationsTab[] = ["all", "mentions"];
const X_THEME_MODES: readonly NonNullable<XState["themeMode"]>[] = ["light", "dark"];

function validateXSnapshot(
  input: PluginBootstrapSchemaContext<"app_x">,
): PluginBootstrapValidationResult {
  const errors: string[] = [];
  const snapshot = expectObjectRecord(input.value, "snapshot", errors);
  if (!snapshot) {
    return { errors };
  }

  const userIds = new Set<string>();
  const tweetIds = new Set<string>();
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

  const validateTweetCollection = (key: "tweets" | "replies" | "quotes"): void => {
    const entries = snapshot[key] === null || snapshot[key] === undefined
      ? undefined
      : expectArray(snapshot[key], `snapshot.${key}`, errors);
    entries?.forEach((value, index) => {
      const tweet = expectObjectRecord(value, `snapshot.${key}[${index}]`, errors);
      if (!tweet) return;
      const id = expectString(tweet.id, `snapshot.${key}[${index}].id`, errors);
      const authorId = expectString(
        tweet.authorId,
        `snapshot.${key}[${index}].authorId`,
        errors,
      );
      expectString(tweet.text, `snapshot.${key}[${index}].text`, errors);
      if (id) {
        if (tweetIds.has(id)) errors.push(`snapshot.${key}[${index}].id duplicates "${id}"`);
        tweetIds.add(id);
      }
      if (authorId && userIds.size > 0 && !userIds.has(authorId)) {
        errors.push(`snapshot.${key}[${index}].authorId references unknown user "${authorId}"`);
      }
      expectOptionalNumber(
        tweet.createdAt,
        `snapshot.${key}[${index}].createdAt`,
        errors,
      );
    });
  };

  validateTweetCollection("tweets");
  validateTweetCollection("replies");
  validateTweetCollection("quotes");

  const notifications =
    snapshot.notifications === null || snapshot.notifications === undefined
    ? undefined
    : expectArray(snapshot.notifications, "snapshot.notifications", errors);
  notifications?.forEach((value, index) => {
    const notification = expectObjectRecord(
      value,
      `snapshot.notifications[${index}]`,
      errors,
    );
    if (!notification) return;
    expectString(notification.id, `snapshot.notifications[${index}].id`, errors);
    const actorId = expectString(
      notification.actorId,
      `snapshot.notifications[${index}].actorId`,
      errors,
    );
    expectOneOf(
      notification.type,
      ["like", "repost", "reply", "follow", "mention"],
      `snapshot.notifications[${index}].type`,
      errors,
    );
    if (actorId && userIds.size > 0 && !userIds.has(actorId)) {
      errors.push(`snapshot.notifications[${index}].actorId references unknown user "${actorId}"`);
    }
    if (typeof notification.tweetId === "string" && tweetIds.size > 0 && !tweetIds.has(notification.tweetId)) {
      errors.push(`snapshot.notifications[${index}].tweetId references unknown tweet "${notification.tweetId}"`);
    }
    expectOptionalBoolean(notification.read, `snapshot.notifications[${index}].read`, errors);
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

function validateXInitialView(
  input: PluginBootstrapSchemaContext<"app_x">,
): PluginBootstrapValidationResult {
  const errors: string[] = [];
  const view = expectObjectRecord(input.value, "initialView", errors);
  if (!view) {
    return { errors };
  }

  expectOneOf(view.screen, X_SCREENS, "initialView.screen", errors);
  expectOptionalString(view.activeTweetId, "initialView.activeTweetId", errors);
  expectOptionalString(view.activeUserId, "initialView.activeUserId", errors);
  expectOptionalString(view.activeThreadId, "initialView.activeThreadId", errors);
  expectOptionalString(view.composeDraft, "initialView.composeDraft", errors);
  if (view.timelineTab !== null && view.timelineTab !== undefined) {
    expectOneOf(view.timelineTab, X_TIMELINE_TABS, "initialView.timelineTab", errors);
  }
  if (view.profileTab !== null && view.profileTab !== undefined) {
    expectOneOf(view.profileTab, X_PROFILE_TABS, "initialView.profileTab", errors);
  }
  if (view.notificationsTab !== null && view.notificationsTab !== undefined) {
    expectOneOf(
      view.notificationsTab,
      X_NOTIFICATION_TABS,
      "initialView.notificationsTab",
      errors,
    );
  }
  if (view.themeMode !== null && view.themeMode !== undefined) {
    expectOneOf(view.themeMode, X_THEME_MODES, "initialView.themeMode", errors);
  }

  return { errors };
}

function toUser(input: UserCreatePayload): XUser {
  return {
    id: input.id,
    name: input.name,
    handle: input.handle,
    bio: input.bio,
    avatarUrl: input.avatarUrl,
    followers: input.followers ?? 0,
    following: input.following ?? 0,
    followerIds: [],
    followingIds: [],
    verified: input.verified ?? null,
  };
}

function toTweet(
  input: TweetInput | ReplyInput | QuoteInput,
  fallbackCreatedAt: number,
): XTweet {
  return {
    id: input.id,
    authorId: input.authorId,
    text: input.text,
    createdAt: input.createdAt ?? fallbackCreatedAt,
    replyToId: "replyToId" in input ? input.replyToId : undefined,
    quoteTweetId: input.quoteTweetId,
    media: input.media,
    linkPreview: input.linkPreview,
    poll: input.poll
      ? {
          options: input.poll.options.map((option) => ({ ...option })),
          totalVotes: input.poll.totalVotes ?? 0,
          endsAt: input.poll.endsAt,
        }
      : undefined,
    hashtags: [...(input.hashtags ?? [])],
    mentions: [...(input.mentions ?? [])],
    likeCount: 0,
    repostCount: 0,
    replyIds: [],
    likedBy: [],
    viewCount: input.viewCount ?? 0,
    bookmarkCount: input.bookmarkCount ?? 0,
    shareCount: input.shareCount ?? 0,
  };
}

export const xBootstrap: PluginBootstrapContract<"app_x"> = {
  snapshot: {
    currentVersion: 1,
    validate: validateXSnapshot,
  },
  view: {
    currentVersion: 1,
    validate: validateXInitialView,
  },
  validate(context): PluginBootstrapValidationResult {
    const snapshot = (context.snapshot?.snapshot as XSnapshot | undefined) ?? {};
    const initialView = context.initialView?.view as XInitialView | undefined;
    const errors: string[] = [];
    const userIds = new Set((snapshot.users ?? []).map((user) => user.id));
    const tweetIds = new Set([
      ...(snapshot.tweets ?? []).map((tweet) => tweet.id),
      ...(snapshot.replies ?? []).map((reply) => reply.id),
      ...(snapshot.quotes ?? []).map((quote) => quote.id),
    ]);
    const threadIds = new Set((snapshot.threads ?? []).map((thread) => thread.id));

    if (snapshot.currentUserId && userIds.size > 0 && !userIds.has(snapshot.currentUserId)) {
      errors.push(`snapshot.currentUserId references unknown user "${snapshot.currentUserId}"`);
    }
    if (initialView?.activeUserId && !userIds.has(initialView.activeUserId)) {
      errors.push(`initialView.activeUserId references unknown user "${initialView.activeUserId}"`);
    }
    if (initialView?.activeTweetId && !tweetIds.has(initialView.activeTweetId)) {
      errors.push(`initialView.activeTweetId references unknown tweet "${initialView.activeTweetId}"`);
    }
    if (initialView?.activeThreadId && !threadIds.has(initialView.activeThreadId)) {
      errors.push(`initialView.activeThreadId references unknown thread "${initialView.activeThreadId}"`);
    }

    return { errors };
  },
  hydrate(context): XState {
    const snapshot = (context.snapshot?.snapshot as XSnapshot | undefined) ?? {};
    const initialView = context.initialView?.view as XInitialView | undefined;
    const state: XState = {
      ...(context.baseState as XState),
      users: [],
      tweets: [],
      timeline: [],
      notifications: [],
      dmThreads: [],
      dmMessages: [],
      navigationStack: [],
    };

    const users = (snapshot.users ?? []).map(toUser);
    const usersById = new Map(users.map((user) => [user.id, user]));

    for (const relation of snapshot.follows ?? []) {
      const follower = usersById.get(relation.followerId);
      const following = usersById.get(relation.followingId);
      if (!follower || !following) continue;
      if (!follower.followingIds.includes(following.id)) follower.followingIds.push(following.id);
      if (!following.followerIds.includes(follower.id)) following.followerIds.push(follower.id);
      follower.following = follower.followingIds.length;
      following.followers = following.followerIds.length;
    }

    const tweets = [
      ...(snapshot.tweets ?? []).map((tweet) => toTweet(tweet, 0)),
      ...(snapshot.replies ?? []).map((reply) => toTweet(reply, 0)),
      ...(snapshot.quotes ?? []).map((quote) => toTweet(quote, 0)),
    ];
    const tweetsById = new Map(tweets.map((tweet) => [tweet.id, tweet]));

    for (const tweet of tweets) {
      if (tweet.replyToId) {
        tweetsById.get(tweet.replyToId)?.replyIds.push(tweet.id);
      }
    }

    const notifications: XNotification[] = (snapshot.notifications ?? []).map((notification) => ({
      id: notification.id,
      type: notification.type,
      actorId: notification.actorId,
      tweetId: notification.tweetId,
      isMention: notification.isMention,
      createdAt: notification.createdAt ?? 0,
      title: notification.title,
      body: notification.body,
      read: notification.read ?? false,
    }));

    const dmThreads: XDMThread[] = (snapshot.threads ?? []).map((thread) => ({
      id: thread.id,
      participantIds: [...thread.participantIds],
      messageIds: [],
      title: thread.title,
      unreadCount: thread.unreadCount ?? 0,
      pinned: thread.pinned ?? false,
      typingUserId: null,
      lastMessageAt: null,
    }));
    const threadById = new Map(dmThreads.map((thread) => [thread.id, thread]));

    const dmMessages: XDMMessage[] = (snapshot.messages ?? []).map((message) => {
      const normalized = {
        id: message.id,
        threadId: message.threadId,
        senderId: message.senderId,
        text: message.text,
        createdAt: message.createdAt ?? 0,
      };
      const thread = threadById.get(message.threadId);
      thread?.messageIds.push(message.id);
      if (thread) {
        thread.lastMessageAt =
          thread.lastMessageAt === null || thread.lastMessageAt === undefined
            ? normalized.createdAt
            : Math.max(thread.lastMessageAt, normalized.createdAt);
      }
      return normalized;
    });

    state.users = users;
    state.tweets = tweets.sort((a, b) => b.createdAt - a.createdAt);
    state.timeline = state.tweets
      .filter((tweet) => !tweet.replyToId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((tweet) => tweet.id);
    state.notifications = notifications.sort((a, b) => b.createdAt - a.createdAt);
    state.dmThreads = dmThreads;
    state.dmMessages = dmMessages.sort((a, b) => a.createdAt - b.createdAt);
    state.currentUserId = snapshot.currentUserId ?? null;

    if (initialView) {
      state.currentScreen = initialView.screen;
      state.activeTweetId = initialView.activeTweetId ?? null;
      state.activeUserId = initialView.activeUserId ?? null;
      state.activeThreadId = initialView.activeThreadId ?? null;
      state.composeDraft = initialView.composeDraft ?? "";
      state.timelineTab = initialView.timelineTab ?? "forYou";
      state.profileTab = initialView.profileTab ?? "posts";
      state.notificationsTab = initialView.notificationsTab ?? "all";
      state.themeMode = initialView.themeMode ?? state.themeMode;
      state.lastNavFrame = 0;
      state.navigationStack = [];
      state.viewMode = initialView.screen === "thread" ? "CHAT" : initialView.screen === "compose" ? "FULLSCREEN" : "FEED";
      state.conversationId = initialView.screen === "thread" ? initialView.activeThreadId : undefined;
    }

    return state;
  },
};
