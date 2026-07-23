import { measureXMessage, measureXPost } from "./measure.js";
import type { XConversationTweet } from "../runtime/selectors.js";
import type { XDMMessage, XState, XTweet } from "../runtime/state.js";

export interface XFeedProjectionItem {
  id: string;
  tweet: XTweet;
  y: number;
  height: number;
  visible: boolean;
}

export interface XFeedProjection {
  items: XFeedProjectionItem[];
  visibleItems: XFeedProjectionItem[];
  contentHeight: number;
}

export function projectXFeed(input: {
  state: XState;
  tweets: XTweet[];
  width: number;
  viewportHeight: number;
  scrollY: number;
  overscan?: number;
}): XFeedProjection {
  const overscan = input.overscan ?? 220;
  let y = 0;
  const items = input.tweets.map((tweet) => {
    const displayed = tweet.repostOfId
      ? input.state.tweetsById[tweet.repostOfId]
      : tweet;
    if (!displayed)
      throw new Error(
        `X_TWEET_MISSING: tweet "${tweet.id}" repostOfId references "${tweet.repostOfId}"`,
      );
    const height = measureXPost(
      tweet.repostOfId
        ? { ...displayed, repostOfId: tweet.repostOfId }
        : displayed,
      input.width,
    ).totalHeight;
    const viewportY = y - input.scrollY;
    const item: XFeedProjectionItem = {
      id: tweet.id,
      tweet,
      y,
      height,
      visible:
        viewportY + height >= -overscan &&
        viewportY <= input.viewportHeight + overscan,
    };
    y += height;
    return item;
  });
  return {
    items,
    visibleItems: items.filter((item) => item.visible),
    contentHeight: y,
  };
}

export interface XConversationProjectionItem {
  id: string;
  conversation: XConversationTweet;
  y: number;
  postHeight: number;
  slotHeight: number;
  visible: boolean;
}

export interface XConversationProjection {
  items: XConversationProjectionItem[];
  visibleItems: XConversationProjectionItem[];
  contentHeight: number;
  composerY: number;
  composerVisible: boolean;
}

export function projectXConversation(input: {
  state: XState;
  conversation: XConversationTweet[];
  width: number;
  viewportHeight: number;
  scrollY: number;
  overscan?: number;
}): XConversationProjection {
  const overscan = input.overscan ?? 220;
  let cursor = 0;
  let composerY = -1;
  const items = input.conversation.map((conversation) => {
    const { tweet } = conversation;
    const displayed = tweet.repostOfId
      ? input.state.tweetsById[tweet.repostOfId]
      : tweet;
    if (!displayed) {
      throw new Error(
        `X_TWEET_MISSING: tweet "${tweet.id}" repostOfId references "${tweet.repostOfId}"`,
      );
    }
    const postHeight = measureXPost(
      tweet.repostOfId
        ? { ...displayed, repostOfId: tweet.repostOfId }
        : displayed,
      input.width,
      conversation.role === "focus",
    ).totalHeight;
    const composerHeight = conversation.role === "focus" ? 56 : 0;
    if (composerHeight > 0) composerY = cursor + postHeight;
    const slotHeight = postHeight + composerHeight;
    const viewportY = cursor - input.scrollY;
    const item: XConversationProjectionItem = {
      id: tweet.id,
      conversation,
      y: cursor,
      postHeight,
      slotHeight,
      visible:
        viewportY + slotHeight >= -overscan &&
        viewportY <= input.viewportHeight + overscan,
    };
    cursor += slotHeight;
    return item;
  });
  const composerViewportY = composerY - input.scrollY;
  return {
    items,
    visibleItems: items.filter((item) => item.visible),
    contentHeight: cursor,
    composerY,
    composerVisible:
      composerY >= 0 &&
      composerViewportY + 56 >= -overscan &&
      composerViewportY <= input.viewportHeight + overscan,
  };
}

export interface XMessageProjectionItem {
  id: string;
  message: XDMMessage;
  y: number;
  height: number;
  bubbleHeight: number;
  reactionsHeight: number;
  bubbleWidth: number;
  startsRun: boolean;
  endsRun: boolean;
  visible: boolean;
}

export interface XThreadProjection {
  items: XMessageProjectionItem[];
  visibleItems: XMessageProjectionItem[];
  contentHeight: number;
  viewportStart: number;
}

export function projectXThread(input: {
  state: XState;
  threadId: string;
  messages: XDMMessage[];
  width: number;
  viewportHeight: number;
  overscan?: number;
}): XThreadProjection {
  const overscan = input.overscan ?? 160;
  const thread = input.state.dmThreadsById[input.threadId];
  if (!thread)
    throw new Error(
      `X_THREAD_MISSING: projection references unknown thread "${input.threadId}"`,
    );
  let cursor = 0;
  const items = input.messages.map((message, index) => {
    const previous = input.messages[index - 1];
    const next = input.messages[index + 1];
    const startsRun = !previous || previous.senderId !== message.senderId;
    const endsRun = !next || next.senderId !== message.senderId;
    if (startsRun && index > 0) cursor += 8;
    const measurement = measureXMessage(message.text, input.width, {
      hasReply: Boolean(message.replyToMessageId),
      hasReceipt: endsRun,
      reactionCount: message.reactions.length,
    });
    const senderLabelHeight =
      startsRun &&
      message.senderId !== input.state.currentUserId &&
      thread.participantIds.length > 2
        ? 18
        : 0;
    const item: XMessageProjectionItem = {
      id: message.id,
      message,
      y: cursor,
      height: measurement.height + senderLabelHeight,
      bubbleHeight: measurement.bubbleHeight + senderLabelHeight,
      reactionsHeight: measurement.reactionsHeight,
      bubbleWidth: measurement.bubbleWidth,
      startsRun,
      endsRun,
      visible: false,
    };
    cursor += item.height + 5;
    return item;
  });
  const upwardOffset =
    input.state.scroll.threadFromBottomById[input.threadId] ?? 0;
  const viewportStart = Math.max(
    0,
    cursor - input.viewportHeight - upwardOffset,
  );
  for (const item of items) {
    const viewportY = item.y - viewportStart;
    item.visible =
      viewportY + item.height >= -overscan &&
      viewportY <= input.viewportHeight + overscan;
  }
  return {
    items,
    visibleItems: items.filter((item) => item.visible),
    contentHeight: cursor,
    viewportStart,
  };
}
