import {
  requireAppStateForDevice,
  type PluginReducer,
  type RuntimeEvent,
  type WorldState,
} from "@tokovo/core";
import { z } from "zod";
import {
  formatXSchemaIssues,
  xComposerStatusInputSchema,
  xDMDeliveryInputSchema,
  xIdSchema,
  xMediaPlaybackInputSchema,
  xMessageInputSchema,
  xNotificationInputSchema,
  xNotificationsTabSchema,
  xProfileTabSchema,
  xPollVoteInputSchema,
  xScreenSchema,
  xThreadInputSchema,
  xTimelineTabSchema,
  xTweetInputSchema,
  xUserInputSchema,
} from "../contract/schemas.js";
import {
  X_STATE_SCHEMA_VERSION,
  type XDMMessage,
  type XDMThread,
  type XNotification,
  type XRecentInteraction,
  type XRoute,
  type XState,
  type XTweet,
  type XUser,
} from "./state.js";

const relationSchema = z
  .object({ followerId: xIdSchema, followingId: xIdSchema })
  .strict();
const userTargetSchema = z.object({ userId: xIdSchema }).strict();
const tweetTargetSchema = z.object({ tweetId: xIdSchema }).strict();
const tweetActorSchema = z
  .object({ tweetId: xIdSchema, userId: xIdSchema })
  .strict();
const routeSchema = z
  .object({
    screen: xScreenSchema,
    tweetId: xIdSchema.optional(),
    userId: xIdSchema.optional(),
    threadId: xIdSchema.optional(),
  })
  .strict()
  .superRefine((route, context) => {
    const expected =
      route.screen === "tweet"
        ? "tweetId"
        : route.screen === "profile"
          ? "userId"
          : route.screen === "thread"
            ? "threadId"
            : null;
    if (expected && !route[expected]) {
      context.addIssue({
        code: "custom",
        message: `${route.screen} requires ${expected}`,
        path: [expected],
      });
    }
    for (const target of ["tweetId", "userId", "threadId"] as const) {
      if (route[target] && target !== expected) {
        context.addIssue({
          code: "custom",
          message: `${target} is invalid for ${route.screen}`,
          path: [target],
        });
      }
    }
  });
const draftSchema = z.object({ text: z.string().max(25_000) }).strict();
const threadDraftSchema = z
  .object({ threadId: xIdSchema, text: z.string().max(25_000) })
  .strict();
const threadActorSchema = z
  .object({ threadId: xIdSchema, userId: xIdSchema })
  .strict();
const dmReactionSchema = z
  .object({
    messageId: xIdSchema,
    userId: xIdSchema,
    emoji: z.string().trim().min(1).max(16),
  })
  .strict();
const scrollSchema = z
  .object({
    surface: z.enum([
      "timeline",
      "tweet",
      "notifications",
      "messages",
      "profile",
      "thread",
    ]),
    offset: z.number().finite().nonnegative(),
    targetId: xIdSchema.optional(),
  })
  .strict()
  .superRefine((scroll, context) => {
    const needsTarget =
      scroll.surface === "tweet" ||
      scroll.surface === "profile" ||
      scroll.surface === "thread";
    if (needsTarget && !scroll.targetId) {
      context.addIssue({
        code: "custom",
        message: `${scroll.surface} scroll requires targetId`,
        path: ["targetId"],
      });
    }
    if (!needsTarget && scroll.targetId) {
      context.addIssue({
        code: "custom",
        message: `${scroll.surface} scroll cannot include targetId`,
        path: ["targetId"],
      });
    }
  });

function requireScrollTarget(input: z.infer<typeof scrollSchema>): string {
  if (!input.targetId) {
    throw new Error(
      `X_SCROLL_TARGET_REQUIRED: ${input.surface} requires targetId`,
    );
  }
  return input.targetId;
}
const timelineTabPayloadSchema = z.object({ tab: xTimelineTabSchema }).strict();
const profileTabPayloadSchema = z.object({ tab: xProfileTabSchema }).strict();
const notificationsTabPayloadSchema = z
  .object({ tab: xNotificationsTabSchema })
  .strict();
const emptyPayloadSchema = z.object({}).strict();

function parsePayload<T>(
  event: { type: string; payload: unknown },
  schema: z.ZodType<T>,
): T {
  const result = schema.safeParse(event.payload);
  if (!result.success) {
    const detail = formatXSchemaIssues(
      result.error,
      `event.${event.type}.payload`,
    ).join("; ");
    throw new Error(`X_EVENT_PAYLOAD_INVALID: ${detail}`);
  }
  return result.data;
}

function getState(draft: WorldState, deviceId: string): XState {
  const state = requireAppStateForDevice<XState>(draft, "app_x", deviceId);
  if (state.schemaVersion !== X_STATE_SCHEMA_VERSION) {
    throw new Error(
      `X_STATE_VERSION_UNSUPPORTED: expected ${X_STATE_SCHEMA_VERSION}, received ${String(state.schemaVersion)}`,
    );
  }
  return state;
}

function requireUser(state: XState, id: string, context: string): XUser {
  const user = state.usersById[id];
  if (!user)
    throw new Error(
      `X_USER_MISSING: ${context} references unknown user "${id}"`,
    );
  return user;
}

function requireTweet(state: XState, id: string, context: string): XTweet {
  const tweet = state.tweetsById[id];
  if (!tweet)
    throw new Error(
      `X_TWEET_MISSING: ${context} references unknown tweet "${id}"`,
    );
  return tweet;
}

function requireThread(state: XState, id: string, context: string): XDMThread {
  const thread = state.dmThreadsById[id];
  if (!thread)
    throw new Error(
      `X_THREAD_MISSING: ${context} references unknown thread "${id}"`,
    );
  return thread;
}

function routesEqual(left: XRoute, right: XRoute): boolean {
  return (
    left.screen === right.screen &&
    left.tweetId === right.tweetId &&
    left.userId === right.userId &&
    left.threadId === right.threadId
  );
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

function validateRouteReferences(state: XState, route: XRoute): void {
  if (route.tweetId) requireTweet(state, route.tweetId, "route.tweetId");
  if (route.userId) requireUser(state, route.userId, "route.userId");
  if (route.threadId) requireThread(state, route.threadId, "route.threadId");
}

function setRoute(
  state: XState,
  route: XRoute,
  atFrame: number,
  direction: "forward" | "back",
): void {
  validateRouteReferences(state, route);
  const previous = { ...state.route };
  if (routesEqual(previous, route)) return;
  if (direction === "forward") state.navigationStack.push(previous);
  state.route = route;
  state.lastTransition = {
    from: previous,
    to: { ...route },
    atFrame,
    direction,
  };
  if (route.screen === "notifications") {
    for (const id of state.notificationIds)
      state.notificationsById[id].read = true;
  }
  if (route.screen === "thread" && route.threadId) {
    state.dmThreadsById[route.threadId].unreadCount = 0;
  }
  syncViewMode(state);
}

function insertTimelineTweet(state: XState, tweetId: string): void {
  const createdAt = state.tweetsById[tweetId].createdAt;
  const insertAt = state.timelineIds.findIndex((existingId) => {
    const existing = state.tweetsById[existingId];
    return (
      existing.createdAt < createdAt ||
      (existing.createdAt === createdAt &&
        existingId.localeCompare(tweetId) > 0)
    );
  });
  if (insertAt < 0) state.timelineIds.push(tweetId);
  else state.timelineIds.splice(insertAt, 0, tweetId);
}

function insertNotification(state: XState, notificationId: string): void {
  const createdAt = state.notificationsById[notificationId].createdAt;
  const insertAt = state.notificationIds.findIndex((existingId) => {
    const existing = state.notificationsById[existingId];
    return (
      existing.createdAt < createdAt ||
      (existing.createdAt === createdAt &&
        existingId.localeCompare(notificationId) > 0)
    );
  });
  if (insertAt < 0) state.notificationIds.push(notificationId);
  else state.notificationIds.splice(insertAt, 0, notificationId);
}

function sortThreads(state: XState): void {
  state.dmThreadIds.sort((leftId, rightId) => {
    const left = state.dmThreadsById[leftId];
    const right = state.dmThreadsById[rightId];
    if (left.pinned !== right.pinned) return left.pinned ? -1 : 1;
    const difference = (right.lastMessageAt ?? 0) - (left.lastMessageAt ?? 0);
    return difference === 0 ? leftId.localeCompare(rightId) : difference;
  });
}

function recordInteraction(
  state: XState,
  type: XRecentInteraction["type"],
  targetId: string,
  atFrame: number,
): void {
  state.recentInteraction = { type, targetId, atFrame };
}

function addDMMessage(
  state: XState,
  input: z.infer<typeof xMessageInputSchema>,
  direction: "incoming" | "outgoing",
): void {
  if (state.dmMessagesById[input.id]) {
    throw new Error(
      `X_MESSAGE_DUPLICATE: message "${input.id}" already exists`,
    );
  }
  const thread = requireThread(
    state,
    input.threadId,
    `ADD_DM_MESSAGE_${direction}.threadId`,
  );
  requireUser(state, input.senderId, `ADD_DM_MESSAGE_${direction}.senderId`);
  if (!thread.participantIds.includes(input.senderId)) {
    throw new Error(
      `X_THREAD_PARTICIPANT_REQUIRED: user "${input.senderId}" is not in thread "${input.threadId}"`,
    );
  }
  if (!state.currentUserId) {
    throw new Error(
      `X_CURRENT_USER_REQUIRED: ${direction} DM requires currentUserId`,
    );
  }
  if (direction === "outgoing" && input.senderId !== state.currentUserId) {
    throw new Error(
      `X_DM_OUTGOING_SENDER_INVALID: expected current user "${state.currentUserId}", received "${input.senderId}"`,
    );
  }
  if (direction === "incoming" && input.senderId === state.currentUserId) {
    throw new Error(
      `X_DM_INCOMING_SENDER_INVALID: current user "${state.currentUserId}" cannot be an incoming sender`,
    );
  }
  if (
    direction === "incoming" &&
    input.delivery !== undefined &&
    input.delivery !== "read"
  ) {
    throw new Error(
      `X_DM_INCOMING_DELIVERY_INVALID: incoming message "${input.id}" must be read or omit delivery`,
    );
  }
  if (input.replyToMessageId) {
    const target = state.dmMessagesById[input.replyToMessageId];
    if (!target) {
      throw new Error(
        `X_MESSAGE_MISSING: reply references unknown message "${input.replyToMessageId}"`,
      );
    }
    if (target.threadId !== input.threadId) {
      throw new Error(
        `X_DM_REPLY_THREAD_MISMATCH: message "${input.id}" cannot reply across threads`,
      );
    }
  }
  for (const reaction of input.reactions ?? []) {
    for (const userId of reaction.userIds) {
      requireUser(
        state,
        userId,
        `ADD_DM_MESSAGE_${direction}.reactions.userIds`,
      );
      if (!thread.participantIds.includes(userId)) {
        throw new Error(
          `X_THREAD_PARTICIPANT_REQUIRED: reaction user "${userId}" is not in thread "${input.threadId}"`,
        );
      }
    }
  }

  const message: XDMMessage = {
    ...input,
    reactions: (input.reactions ?? []).map((reaction) => ({
      emoji: reaction.emoji,
      userIds: [...reaction.userIds],
    })),
    delivery: input.delivery ?? (direction === "outgoing" ? "sent" : "read"),
  };
  state.dmMessagesById[input.id] = message;
  const insertAt = thread.messageIds.findIndex((id) => {
    const existing = state.dmMessagesById[id];
    return (
      existing.createdAt > message.createdAt ||
      (existing.createdAt === message.createdAt &&
        id.localeCompare(message.id) > 0)
    );
  });
  if (insertAt < 0) thread.messageIds.push(message.id);
  else thread.messageIds.splice(insertAt, 0, message.id);
  thread.lastMessageAt = Math.max(thread.lastMessageAt ?? 0, message.createdAt);
  thread.typingUserIds = thread.typingUserIds.filter(
    (id) => id !== message.senderId,
  );
  const active =
    state.route.screen === "thread" && state.route.threadId === thread.id;
  if (direction === "incoming" && !active) thread.unreadCount += 1;
  if (direction === "outgoing") state.threadDrafts[thread.id] = "";
  sortThreads(state);
}

function toUser(input: z.infer<typeof xUserInputSchema>): XUser {
  return {
    ...input,
    followers: input.followers ?? 0,
    following: input.following ?? 0,
    followerIds: [],
    followingIds: [],
    verified: input.verified ?? null,
  };
}

function toTweet(input: z.infer<typeof xTweetInputSchema>): XTweet {
  const pollVotes =
    input.poll?.options.reduce((total, option) => total + option.votes, 0) ?? 0;
  return {
    ...input,
    media: input.media
      ? {
          ...input.media,
          urls: [...input.media.urls],
          sensitive: input.media.sensitive ?? false,
          playback:
            input.media.type === "video"
              ? { state: "idle", progress: 0 }
              : null,
        }
      : undefined,
    poll: input.poll
      ? {
          ...input.poll,
          options: input.poll.options.map((option) => ({ ...option })),
          totalVotes: input.poll.totalVotes ?? pollVotes,
          selectedOptionId: input.poll.selectedOptionId ?? null,
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

export const xReducer: PluginReducer<"app_x"> = (
  draft: WorldState,
  event: RuntimeEvent & { kind: "APP"; appId: "app_x"; deviceId: string },
) => {
  const state = getState(draft, event.deviceId);

  switch (event.type) {
    case "ADD_USER": {
      const input = parsePayload(event, xUserInputSchema);
      if (state.usersById[input.id])
        throw new Error(`X_USER_DUPLICATE: user "${input.id}" already exists`);
      state.usersById[input.id] = toUser(input);
      break;
    }
    case "SET_CURRENT_USER": {
      const { userId } = parsePayload(event, userTargetSchema);
      requireUser(state, userId, "SET_CURRENT_USER");
      state.currentUserId = userId;
      break;
    }
    case "FOLLOW_USER": {
      const { followerId, followingId } = parsePayload(event, relationSchema);
      if (followerId === followingId)
        throw new Error("X_FOLLOW_SELF: a user cannot follow itself");
      const follower = requireUser(state, followerId, "FOLLOW_USER.followerId");
      const following = requireUser(
        state,
        followingId,
        "FOLLOW_USER.followingId",
      );
      if (!follower.followingIds.includes(followingId)) {
        follower.followingIds.push(followingId);
        following.followerIds.push(followerId);
        follower.following += 1;
        following.followers += 1;
        recordInteraction(state, "follow", followingId, event.at);
      }
      break;
    }
    case "UNFOLLOW_USER": {
      const { followerId, followingId } = parsePayload(event, relationSchema);
      const follower = requireUser(
        state,
        followerId,
        "UNFOLLOW_USER.followerId",
      );
      const following = requireUser(
        state,
        followingId,
        "UNFOLLOW_USER.followingId",
      );
      if (follower.followingIds.includes(followingId)) {
        follower.followingIds = follower.followingIds.filter(
          (id) => id !== followingId,
        );
        following.followerIds = following.followerIds.filter(
          (id) => id !== followerId,
        );
        follower.following -= 1;
        following.followers -= 1;
        recordInteraction(state, "unfollow", followingId, event.at);
      }
      break;
    }
    case "ADD_TWEET": {
      const input = parsePayload(event, xTweetInputSchema);
      if (state.tweetsById[input.id])
        throw new Error(
          `X_TWEET_DUPLICATE: tweet "${input.id}" already exists`,
        );
      requireUser(state, input.authorId, "ADD_TWEET.authorId");
      if (input.replyToId)
        requireTweet(state, input.replyToId, "ADD_TWEET.replyToId");
      if (input.repostOfId)
        requireTweet(state, input.repostOfId, "ADD_TWEET.repostOfId");
      if (input.quoteTweetId)
        requireTweet(state, input.quoteTweetId, "ADD_TWEET.quoteTweetId");
      input.likedBy?.forEach((id) =>
        requireUser(state, id, "ADD_TWEET.likedBy"),
      );
      input.bookmarkedBy?.forEach((id) =>
        requireUser(state, id, "ADD_TWEET.bookmarkedBy"),
      );
      input.sharedBy?.forEach((id) =>
        requireUser(state, id, "ADD_TWEET.sharedBy"),
      );
      const tweet = toTweet(input);
      state.tweetsById[tweet.id] = tweet;
      if (tweet.replyToId)
        state.tweetsById[tweet.replyToId].replyIds.push(tweet.id);
      else insertTimelineTweet(state, tweet.id);
      if (tweet.repostOfId) state.tweetsById[tweet.repostOfId].repostCount += 1;
      break;
    }
    case "LIKE_TWEET": {
      const { tweetId, userId } = parsePayload(event, tweetActorSchema);
      const tweet = requireTweet(state, tweetId, "LIKE_TWEET.tweetId");
      requireUser(state, userId, "LIKE_TWEET.userId");
      if (!tweet.likedBy.includes(userId)) {
        tweet.likedBy.push(userId);
        tweet.likeCount += 1;
        recordInteraction(state, "like", tweetId, event.at);
      }
      break;
    }
    case "UNLIKE_TWEET": {
      const { tweetId, userId } = parsePayload(event, tweetActorSchema);
      const tweet = requireTweet(state, tweetId, "UNLIKE_TWEET.tweetId");
      requireUser(state, userId, "UNLIKE_TWEET.userId");
      if (tweet.likedBy.includes(userId)) {
        tweet.likedBy = tweet.likedBy.filter((id) => id !== userId);
        tweet.likeCount = Math.max(0, tweet.likeCount - 1);
        recordInteraction(state, "unlike", tweetId, event.at);
      }
      break;
    }
    case "VIEW_TWEET": {
      const { tweetId } = parsePayload(event, tweetTargetSchema);
      requireTweet(state, tweetId, "VIEW_TWEET.tweetId").viewCount += 1;
      break;
    }
    case "BOOKMARK_TWEET": {
      const { tweetId, userId } = parsePayload(event, tweetActorSchema);
      const tweet = requireTweet(state, tweetId, "BOOKMARK_TWEET.tweetId");
      requireUser(state, userId, "BOOKMARK_TWEET.userId");
      if (!tweet.bookmarkedBy.includes(userId)) {
        tweet.bookmarkedBy.push(userId);
        tweet.bookmarkCount += 1;
        recordInteraction(state, "bookmark", tweetId, event.at);
      }
      break;
    }
    case "UNBOOKMARK_TWEET": {
      const { tweetId, userId } = parsePayload(event, tweetActorSchema);
      const tweet = requireTweet(state, tweetId, "UNBOOKMARK_TWEET.tweetId");
      requireUser(state, userId, "UNBOOKMARK_TWEET.userId");
      if (tweet.bookmarkedBy.includes(userId)) {
        tweet.bookmarkedBy = tweet.bookmarkedBy.filter((id) => id !== userId);
        tweet.bookmarkCount = Math.max(0, tweet.bookmarkCount - 1);
        recordInteraction(state, "unbookmark", tweetId, event.at);
      }
      break;
    }
    case "SHARE_TWEET": {
      const { tweetId, userId } = parsePayload(event, tweetActorSchema);
      const tweet = requireTweet(state, tweetId, "SHARE_TWEET.tweetId");
      requireUser(state, userId, "SHARE_TWEET.userId");
      if (!tweet.sharedBy.includes(userId)) {
        tweet.sharedBy.push(userId);
        tweet.shareCount += 1;
        recordInteraction(state, "share", tweetId, event.at);
      }
      break;
    }
    case "VOTE_POLL": {
      const { tweetId, userId, optionId } = parsePayload(
        event,
        xPollVoteInputSchema,
      );
      const tweet = requireTweet(state, tweetId, "VOTE_POLL.tweetId");
      requireUser(state, userId, "VOTE_POLL.userId");
      if (state.currentUserId !== userId) {
        throw new Error(
          `X_POLL_VOTER_NOT_CURRENT: user "${userId}" is not the current user`,
        );
      }
      if (!tweet.poll)
        throw new Error(`X_POLL_MISSING: tweet "${tweetId}" has no poll`);
      const option = tweet.poll.options.find(
        (candidate) => candidate.id === optionId,
      );
      if (!option)
        throw new Error(
          `X_POLL_OPTION_MISSING: poll on tweet "${tweetId}" has no option "${optionId}"`,
        );
      if (!tweet.poll.selectedOptionId) {
        tweet.poll.selectedOptionId = optionId;
        option.votes += 1;
        tweet.poll.totalVotes += 1;
        recordInteraction(state, "poll", tweetId, event.at);
      } else if (tweet.poll.selectedOptionId !== optionId) {
        throw new Error(
          `X_POLL_ALREADY_VOTED: poll on tweet "${tweetId}" already has a selection`,
        );
      }
      break;
    }
    case "SET_MEDIA_PLAYBACK": {
      const {
        tweetId,
        state: playbackState,
        progress,
      } = parsePayload(event, xMediaPlaybackInputSchema);
      const tweet = requireTweet(state, tweetId, "SET_MEDIA_PLAYBACK.tweetId");
      if (
        !tweet.media ||
        tweet.media.type !== "video" ||
        !tweet.media.playback
      ) {
        throw new Error(
          `X_VIDEO_MISSING: tweet "${tweetId}" does not contain video media`,
        );
      }
      tweet.media.playback = { state: playbackState, progress };
      break;
    }
    case "SET_SCREEN": {
      setRoute(state, parsePayload(event, routeSchema), event.at, "forward");
      break;
    }
    case "NAVIGATE_BACK": {
      parsePayload(event, emptyPayloadSchema);
      const previous = state.navigationStack.pop();
      if (previous) setRoute(state, previous, event.at, "back");
      break;
    }
    case "SET_COMPOSE_DRAFT": {
      state.composer.draft = parsePayload(event, draftSchema).text;
      if (state.composer.status === "failed") {
        state.composer.status = "idle";
        state.composer.error = null;
      }
      break;
    }
    case "SET_COMPOSER_STATUS": {
      const input = parsePayload(event, xComposerStatusInputSchema);
      state.composer.status = input.status;
      state.composer.error = input.error ?? null;
      break;
    }
    case "SET_THREAD_DRAFT": {
      const { threadId, text } = parsePayload(event, threadDraftSchema);
      requireThread(state, threadId, "SET_THREAD_DRAFT.threadId");
      state.threadDrafts[threadId] = text;
      break;
    }
    case "SET_SCROLL": {
      const input = parsePayload(event, scrollSchema);
      switch (input.surface) {
        case "timeline":
          state.scroll.timeline = input.offset;
          break;
        case "tweet":
          requireTweet(
            state,
            requireScrollTarget(input),
            "SET_SCROLL.targetId",
          );
          state.scroll.tweetById[requireScrollTarget(input)] = input.offset;
          break;
        case "notifications":
          state.scroll.notifications = input.offset;
          break;
        case "messages":
          state.scroll.messages = input.offset;
          break;
        case "profile":
          requireUser(state, requireScrollTarget(input), "SET_SCROLL.targetId");
          state.scroll.profileById[requireScrollTarget(input)] = input.offset;
          break;
        case "thread":
          requireThread(
            state,
            requireScrollTarget(input),
            "SET_SCROLL.targetId",
          );
          state.scroll.threadFromBottomById[requireScrollTarget(input)] =
            input.offset;
          break;
      }
      break;
    }
    case "START_DM_TYPING": {
      const { threadId, userId } = parsePayload(event, threadActorSchema);
      const thread = requireThread(state, threadId, "START_DM_TYPING.threadId");
      requireUser(state, userId, "START_DM_TYPING.userId");
      if (!thread.participantIds.includes(userId)) {
        throw new Error(
          `X_THREAD_PARTICIPANT_REQUIRED: user "${userId}" is not in thread "${threadId}"`,
        );
      }
      if (userId === state.currentUserId) {
        throw new Error(
          `X_DM_TYPING_CURRENT_USER_INVALID: local typing for "${userId}" must use an input session`,
        );
      }
      if (!thread.typingUserIds.includes(userId))
        thread.typingUserIds.push(userId);
      break;
    }
    case "STOP_DM_TYPING": {
      const { threadId, userId } = parsePayload(event, threadActorSchema);
      const thread = requireThread(state, threadId, "STOP_DM_TYPING.threadId");
      requireUser(state, userId, "STOP_DM_TYPING.userId");
      if (!thread.participantIds.includes(userId)) {
        throw new Error(
          `X_THREAD_PARTICIPANT_REQUIRED: user "${userId}" is not in thread "${threadId}"`,
        );
      }
      if (userId === state.currentUserId) {
        throw new Error(
          `X_DM_TYPING_CURRENT_USER_INVALID: local typing for "${userId}" must use an input session`,
        );
      }
      thread.typingUserIds = thread.typingUserIds.filter((id) => id !== userId);
      break;
    }
    case "SET_TIMELINE_TAB": {
      state.timelineTab = parsePayload(event, timelineTabPayloadSchema).tab;
      break;
    }
    case "SET_PROFILE_TAB": {
      state.profileTab = parsePayload(event, profileTabPayloadSchema).tab;
      break;
    }
    case "SET_NOTIFICATIONS_TAB": {
      state.notificationsTab = parsePayload(
        event,
        notificationsTabPayloadSchema,
      ).tab;
      if (state.route.screen === "notifications") {
        for (const id of state.notificationIds)
          state.notificationsById[id].read = true;
      }
      break;
    }
    case "ADD_NOTIFICATION": {
      const input = parsePayload(event, xNotificationInputSchema);
      if (state.notificationsById[input.id]) {
        throw new Error(
          `X_NOTIFICATION_DUPLICATE: notification "${input.id}" already exists`,
        );
      }
      requireUser(state, input.actorId, "ADD_NOTIFICATION.actorId");
      if (input.tweetId)
        requireTweet(state, input.tweetId, "ADD_NOTIFICATION.tweetId");
      const notification: XNotification = {
        ...input,
        read: input.read ?? state.route.screen === "notifications",
      };
      state.notificationsById[input.id] = notification;
      insertNotification(state, input.id);
      break;
    }
    case "ADD_DM_THREAD": {
      const input = parsePayload(event, xThreadInputSchema);
      if (state.dmThreadsById[input.id])
        throw new Error(
          `X_THREAD_DUPLICATE: thread "${input.id}" already exists`,
        );
      const participants = new Set(input.participantIds);
      if (participants.size !== input.participantIds.length) {
        throw new Error(
          `X_THREAD_PARTICIPANT_DUPLICATE: thread "${input.id}" repeats a participant`,
        );
      }
      input.participantIds.forEach((id) =>
        requireUser(state, id, "ADD_DM_THREAD.participantIds"),
      );
      const thread: XDMThread = {
        id: input.id,
        participantIds: [...input.participantIds],
        messageIds: [],
        title: input.title,
        unreadCount: input.unreadCount ?? 0,
        pinned: input.pinned ?? false,
        typingUserIds: [],
        lastMessageAt: null,
      };
      state.dmThreadsById[input.id] = thread;
      state.dmThreadIds.push(input.id);
      state.scroll.threadFromBottomById[input.id] = 0;
      sortThreads(state);
      break;
    }
    case "ADD_DM_MESSAGE_OUTGOING": {
      addDMMessage(state, parsePayload(event, xMessageInputSchema), "outgoing");
      break;
    }
    case "ADD_DM_MESSAGE_INCOMING": {
      addDMMessage(state, parsePayload(event, xMessageInputSchema), "incoming");
      break;
    }
    case "ADD_DM_REACTION": {
      const { messageId, userId, emoji } = parsePayload(
        event,
        dmReactionSchema,
      );
      const message = state.dmMessagesById[messageId];
      if (!message) {
        throw new Error(
          `X_MESSAGE_MISSING: ADD_DM_REACTION references unknown message "${messageId}"`,
        );
      }
      const thread = requireThread(
        state,
        message.threadId,
        "ADD_DM_REACTION.threadId",
      );
      requireUser(state, userId, "ADD_DM_REACTION.userId");
      if (!thread.participantIds.includes(userId)) {
        throw new Error(
          `X_THREAD_PARTICIPANT_REQUIRED: reaction user "${userId}" is not in thread "${thread.id}"`,
        );
      }
      const reaction = message.reactions.find(
        (candidate) => candidate.emoji === emoji,
      );
      if (reaction) {
        if (!reaction.userIds.includes(userId)) reaction.userIds.push(userId);
      } else {
        message.reactions.push({ emoji, userIds: [userId] });
      }
      recordInteraction(state, "dm-reaction", messageId, event.at);
      break;
    }
    case "REMOVE_DM_REACTION": {
      const { messageId, userId, emoji } = parsePayload(
        event,
        dmReactionSchema,
      );
      const message = state.dmMessagesById[messageId];
      if (!message) {
        throw new Error(
          `X_MESSAGE_MISSING: REMOVE_DM_REACTION references unknown message "${messageId}"`,
        );
      }
      requireUser(state, userId, "REMOVE_DM_REACTION.userId");
      message.reactions = message.reactions
        .map((reaction) =>
          reaction.emoji === emoji
            ? {
                ...reaction,
                userIds: reaction.userIds.filter((id) => id !== userId),
              }
            : reaction,
        )
        .filter((reaction) => reaction.userIds.length > 0);
      break;
    }
    case "SET_DM_DELIVERY": {
      const { messageId, delivery } = parsePayload(
        event,
        xDMDeliveryInputSchema,
      );
      const message = state.dmMessagesById[messageId];
      if (!message)
        throw new Error(
          `X_MESSAGE_MISSING: SET_DM_DELIVERY references unknown message "${messageId}"`,
        );
      if (message.senderId !== state.currentUserId) {
        throw new Error(
          `X_DM_DELIVERY_DIRECTION_INVALID: message "${messageId}" is not outgoing`,
        );
      }
      const transitions: Record<
        XDMMessage["delivery"],
        XDMMessage["delivery"][]
      > = {
        sending: ["sent", "failed"],
        failed: ["sending"],
        sent: ["delivered", "read"],
        delivered: ["read"],
        read: [],
      };
      if (
        delivery !== message.delivery &&
        !transitions[message.delivery].includes(delivery)
      ) {
        throw new Error(
          `X_DM_DELIVERY_TRANSITION_INVALID: message "${messageId}" cannot move from ${message.delivery} to ${delivery}`,
        );
      }
      message.delivery = delivery;
      break;
    }
    default:
      throw new Error(`X_EVENT_TYPE_UNSUPPORTED: "${event.type}"`);
  }

  state.layoutRevision += 1;
};
