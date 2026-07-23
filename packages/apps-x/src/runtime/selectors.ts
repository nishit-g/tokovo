import {
  getAppStateForDevice,
  requireAppStateForDevice,
  type WorldState,
} from "@tokovo/core";
import type {
  XDMMessage,
  XDMThread,
  XNotification,
  XState,
  XTweet,
  XUser,
} from "./state.js";

export function findXState(
  world: WorldState,
  deviceId: string,
): XState | undefined {
  return getAppStateForDevice<XState>(world, "app_x", deviceId);
}

export function requireXState(world: WorldState, deviceId: string): XState {
  const state = requireAppStateForDevice<XState>(world, "app_x", deviceId);
  if (state.schemaVersion !== 2) {
    throw new Error(
      `X_STATE_VERSION_UNSUPPORTED: expected 2, received ${String(state.schemaVersion)}`,
    );
  }
  return state;
}

export function findUser(
  state: XState,
  userId: string | null | undefined,
): XUser | undefined {
  return userId ? state.usersById[userId] : undefined;
}

export function requireUser(
  state: XState,
  userId: string,
  context = "selector",
): XUser {
  const user = state.usersById[userId];
  if (!user)
    throw new Error(
      `X_USER_MISSING: ${context} references unknown user "${userId}"`,
    );
  return user;
}

export function findTweet(
  state: XState,
  tweetId: string | null | undefined,
): XTweet | undefined {
  return tweetId ? state.tweetsById[tweetId] : undefined;
}

export function requireTweet(
  state: XState,
  tweetId: string,
  context = "selector",
): XTweet {
  const tweet = state.tweetsById[tweetId];
  if (!tweet)
    throw new Error(
      `X_TWEET_MISSING: ${context} references unknown tweet "${tweetId}"`,
    );
  return tweet;
}

export function selectTimelineTweets(
  world: WorldState,
  deviceId: string,
): XTweet[] {
  const state = requireXState(world, deviceId);
  const ordered = state.timelineIds.map((id) =>
    requireTweet(state, id, "timelineIds"),
  );
  if (state.timelineTab !== "following" || !state.currentUserId) return ordered;
  const currentUser = requireUser(state, state.currentUserId, "currentUserId");
  return ordered.filter(
    (tweet) =>
      tweet.authorId === currentUser.id ||
      currentUser.followingIds.includes(tweet.authorId),
  );
}

export function selectTweetsByAuthor(
  world: WorldState,
  deviceId: string,
  authorId: string,
): XTweet[] {
  const state = requireXState(world, deviceId);
  requireUser(state, authorId, "selectTweetsByAuthor");
  return Object.values(state.tweetsById)
    .filter((tweet) => tweet.authorId === authorId)
    .sort((left, right) => {
      const difference = right.createdAt - left.createdAt;
      return difference === 0 ? left.id.localeCompare(right.id) : difference;
    });
}

export function selectActiveTweet(world: WorldState, deviceId: string): XTweet {
  const state = requireXState(world, deviceId);
  if (state.route.screen !== "tweet" || !state.route.tweetId) {
    throw new Error("X_ROUTE_TARGET_REQUIRED: tweet screen requires tweetId");
  }
  return requireTweet(state, state.route.tweetId, "route.tweetId");
}

export function selectActiveUser(world: WorldState, deviceId: string): XUser {
  const state = requireXState(world, deviceId);
  if (state.route.screen !== "profile" || !state.route.userId) {
    throw new Error("X_ROUTE_TARGET_REQUIRED: profile screen requires userId");
  }
  return requireUser(state, state.route.userId, "route.userId");
}

export function selectNotifications(
  world: WorldState,
  deviceId: string,
): XNotification[] {
  const state = requireXState(world, deviceId);
  return state.notificationIds.map((id) => {
    const notification = state.notificationsById[id];
    if (!notification)
      throw new Error(
        `X_NOTIFICATION_MISSING: notificationIds references "${id}"`,
      );
    return notification;
  });
}

export function selectVisibleNotifications(
  world: WorldState,
  deviceId: string,
): XNotification[] {
  const state = requireXState(world, deviceId);
  const notifications = selectNotifications(world, deviceId);
  if (state.notificationsTab === "mentions") {
    return notifications.filter(
      (item) => item.isMention || item.type === "mention",
    );
  }
  if (state.notificationsTab === "verified") {
    return notifications.filter((item) =>
      Boolean(
        requireUser(state, item.actorId, `notification "${item.id}" actorId`)
          .verified,
      ),
    );
  }
  return notifications;
}

export interface XConversationTweet {
  tweet: XTweet;
  depth: number;
  role: "ancestor" | "focus" | "reply";
  continuesThread: boolean;
}

/**
 * Resolve the complete deterministic conversation around one focused post.
 * Ancestors are oldest-first; descendants are stable depth-first and then
 * chronological within each sibling set.
 */
export function selectTweetConversation(
  world: WorldState,
  deviceId: string,
  tweetId: string,
): XConversationTweet[] {
  const state = requireXState(world, deviceId);
  const focus = requireTweet(state, tweetId, "selectTweetConversation");
  const ancestors: XTweet[] = [];
  const visited = new Set<string>([focus.id]);
  let parentId = focus.replyToId;
  while (parentId) {
    if (visited.has(parentId)) {
      throw new Error(
        `X_REPLY_CYCLE: conversation around "${tweetId}" contains "${parentId}" twice`,
      );
    }
    visited.add(parentId);
    const parent = requireTweet(
      state,
      parentId,
      `tweet "${tweetId}" replyToId`,
    );
    ancestors.push(parent);
    parentId = parent.replyToId;
  }
  ancestors.reverse();

  const result: XConversationTweet[] = ancestors.map((tweet, index) => ({
    tweet,
    depth: index,
    role: "ancestor",
    continuesThread: true,
  }));
  result.push({
    tweet: focus,
    depth: ancestors.length,
    role: "focus",
    continuesThread: focus.replyIds.length > 0,
  });

  const sortedReplies = (parent: XTweet): XTweet[] =>
    parent.replyIds
      .map((id) => requireTweet(state, id, `tweet "${parent.id}" replyIds`))
      .sort((left, right) => {
        const difference = left.createdAt - right.createdAt;
        return difference === 0 ? left.id.localeCompare(right.id) : difference;
      });

  const directReplies = sortedReplies(focus);
  const stack = directReplies
    .map((reply, index) => ({
      reply,
      depth: ancestors.length + 1,
      continuesThread:
        reply.replyIds.length > 0 || index < directReplies.length - 1,
    }))
    .reverse();
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) break;
    const { reply, depth, continuesThread } = current;
    if (visited.has(reply.id)) {
      throw new Error(
        `X_REPLY_CYCLE: conversation around "${tweetId}" contains "${reply.id}" twice`,
      );
    }
    visited.add(reply.id);
    result.push({
      tweet: reply,
      depth,
      role: "reply",
      continuesThread,
    });
    const children = sortedReplies(reply);
    for (let index = children.length - 1; index >= 0; index -= 1) {
      const child = children[index];
      stack.push({
        reply: child,
        depth: depth + 1,
        continuesThread:
          child.replyIds.length > 0 || index < children.length - 1,
      });
    }
  }
  return result;
}

export function selectNotificationBadgeCount(
  world: WorldState,
  deviceId: string,
): number {
  return selectNotifications(world, deviceId).filter((item) => !item.read)
    .length;
}

export function selectDMThreads(
  world: WorldState,
  deviceId: string,
): XDMThread[] {
  const state = requireXState(world, deviceId);
  return state.dmThreadIds.map((id) => {
    const thread = state.dmThreadsById[id];
    if (!thread)
      throw new Error(`X_THREAD_MISSING: dmThreadIds references "${id}"`);
    return thread;
  });
}

export function selectActiveThread(
  world: WorldState,
  deviceId: string,
): XDMThread {
  const state = requireXState(world, deviceId);
  if (state.route.screen !== "thread" || !state.route.threadId) {
    throw new Error("X_ROUTE_TARGET_REQUIRED: thread screen requires threadId");
  }
  const thread = state.dmThreadsById[state.route.threadId];
  if (!thread)
    throw new Error(
      `X_THREAD_MISSING: route.threadId references "${state.route.threadId}"`,
    );
  return thread;
}

export function selectThreadMessages(
  world: WorldState,
  deviceId: string,
  threadId: string,
): XDMMessage[] {
  const state = requireXState(world, deviceId);
  const thread = state.dmThreadsById[threadId];
  if (!thread)
    throw new Error(
      `X_THREAD_MISSING: selectThreadMessages references "${threadId}"`,
    );
  return thread.messageIds.map((id) => {
    const message = state.dmMessagesById[id];
    if (!message)
      throw new Error(
        `X_MESSAGE_MISSING: thread "${threadId}" references "${id}"`,
      );
    return message;
  });
}

export function selectThreadDraft(
  world: WorldState,
  deviceId: string,
  threadId: string,
): string {
  const state = requireXState(world, deviceId);
  if (!state.dmThreadsById[threadId])
    throw new Error(
      `X_THREAD_MISSING: selectThreadDraft references "${threadId}"`,
    );
  return state.threadDrafts[threadId] ?? "";
}

export function selectUnreadThreadCount(
  world: WorldState,
  deviceId: string,
): number {
  return selectDMThreads(world, deviceId).reduce(
    (count, thread) => count + thread.unreadCount,
    0,
  );
}
