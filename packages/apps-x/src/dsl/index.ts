import { parseTimeToFrames } from "@tokovo/dsl";
import type {
  InputCadenceIR,
  InputDirectionIR,
  InputKeyboardIR,
  InputSourceIR,
} from "@tokovo/ir";
import { xInputFields } from "../input-fields.js";
import type {
  ProfileTab,
  XTrackEvent,
  XTrackEventFor,
  XEventType,
  XEventPayloadMap,
  XScreen,
  NotificationsTab,
  TimelineTab,
  UserCreatePayload,
  TweetCreatePayload,
  TweetReplyPayload,
  TweetQuotePayload,
  TweetRepostPayload,
  XScrollSurface,
} from "../types/index.js";

type GetDeclarationOrder = () => number;

type PayloadInput<T extends XEventType> =
  | XEventPayloadMap[T]
  | ((order: number) => XEventPayloadMap[T]);

function createUserId(frame: number, order: number): string {
  return `user-${frame}-${order}`;
}

function createTweetId(frame: number, order: number): string {
  return `tw-${frame}-${order}`;
}

function createNotificationId(frame: number, order: number): string {
  return `nt-${frame}-${order}`;
}

function createThreadId(frame: number, order: number): string {
  return `dm-${frame}-${order}`;
}

function createMessageId(frame: number, order: number): string {
  return `msg-${frame}-${order}`;
}

type UserInput = Omit<UserCreatePayload, "id"> & { id?: string };

type TweetInput = Omit<TweetCreatePayload, "id"> & { id?: string };
type ReplyInput = Omit<TweetReplyPayload, "id"> & { id?: string };
type QuoteInput = Omit<TweetQuotePayload, "id"> & { id?: string };
type NotificationInput = {
  id?: string;
  type: "like" | "repost" | "reply" | "follow" | "mention" | "verified";
  actorId: string;
  tweetId?: string;
  isMention?: boolean;
  createdAt: number;
  title?: string;
  body?: string;
  read?: boolean;
};

type ThreadInput = {
  id?: string;
  participantIds: string[];
  title?: string;
  unreadCount?: number;
  pinned?: boolean;
};

export interface XTextInputOptions {
  duration?: string | number;
  style?: InputCadenceIR["style"];
  id?: string;
  locale?: string;
  direction?: InputDirectionIR;
  source?: InputSourceIR;
  seed?: string | number;
  cadence?: InputCadenceIR;
  keyboard?: InputKeyboardIR;
  correction?: {
    typed: string;
    replace: string;
    with: string;
    pauseFrames?: number;
  };
}

export interface XInputIntent {
  deviceId: string;
  fieldId: string;
  submitFrame: number;
  text: string;
  input: XTextInputOptions;
}

export type AddXInputIntent = (intent: XInputIntent) => void;

export interface XSubmitOptions {
  input?: XTextInputOptions;
}

class XPointBuilder {
  constructor(
    private _frame: number,
    private _deviceId: string,
    private _events: XTrackEvent[],
    private _getOrder: GetDeclarationOrder,
    private _addInputIntent?: AddXInputIntent,
  ) {}

  private _push<T extends XEventType>(
    type: T,
    payload: PayloadInput<T>,
    duration?: number,
  ): void {
    const order = this._getOrder();
    const resolvedPayload =
      typeof payload === "function" ? payload(order) : payload;
    const event: XTrackEventFor<T> = {
      at: this._frame,
      duration,
      kind: "APP",
      appId: "app_x",
      type,
      payload: resolvedPayload,
      deviceId: this._deviceId,
      _declarationOrder: order,
    };
    this._events.push(event as XTrackEvent);
  }

  createUser(data: UserInput): void {
    this._push("USER_CREATE", (order) => ({
      id: data.id ?? createUserId(this._frame, order),
      name: data.name,
      handle: data.handle,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      bannerUrl: data.bannerUrl,
      location: data.location,
      website: data.website,
      joinedAt: data.joinedAt,
      followers: data.followers,
      following: data.following,
      verified: data.verified ?? null,
    }));
  }

  setCurrentUser(userId: string): void {
    this._push("SET_CURRENT_USER", { userId });
  }

  followUser(followerId: string, followingId: string): void {
    this._push("FOLLOW_USER", { followerId, followingId });
  }

  unfollowUser(followerId: string, followingId: string): void {
    this._push("UNFOLLOW_USER", { followerId, followingId });
  }

  postTweet(data: TweetInput, options: XSubmitOptions = {}): void {
    if (options.input) {
      if (!this._addInputIntent) {
        throw new Error(
          "X_INPUT_INTEGRATION_MISSING: structured input requires the canonical code-first episode builder.",
        );
      }
      this._addInputIntent({
        deviceId: this._deviceId,
        fieldId: xInputFields.postComposer,
        submitFrame: this._frame,
        text: data.text,
        input: options.input,
      });
    }
    this._push("TWEET_CREATE", (order) => ({
      id: data.id ?? createTweetId(this._frame, order),
      authorId: data.authorId,
      text: data.text,
      createdAt: data.createdAt,
      media: data.media,
      linkPreview: data.linkPreview,
      poll: data.poll,
      hashtags: data.hashtags,
      mentions: data.mentions,
      quoteTweetId: data.quoteTweetId,
      likeCount: data.likeCount,
      repostCount: data.repostCount,
      viewCount: data.viewCount,
      bookmarkCount: data.bookmarkCount,
      shareCount: data.shareCount,
      likedBy: data.likedBy,
      bookmarkedBy: data.bookmarkedBy,
      sharedBy: data.sharedBy,
    }));
  }

  replyTweet(data: ReplyInput, options: XSubmitOptions = {}): void {
    if (options.input) {
      if (!this._addInputIntent) {
        throw new Error(
          "X_INPUT_INTEGRATION_MISSING: structured input requires the canonical code-first episode builder.",
        );
      }
      this._addInputIntent({
        deviceId: this._deviceId,
        fieldId: xInputFields.replyComposer(data.replyToId),
        submitFrame: this._frame,
        text: data.text,
        input: options.input,
      });
    }
    this._push("TWEET_REPLY", (order) => ({
      id: data.id ?? createTweetId(this._frame, order),
      authorId: data.authorId,
      text: data.text,
      replyToId: data.replyToId,
      createdAt: data.createdAt,
      media: data.media,
      linkPreview: data.linkPreview,
      poll: data.poll,
      hashtags: data.hashtags,
      mentions: data.mentions,
      quoteTweetId: data.quoteTweetId,
      likeCount: data.likeCount,
      repostCount: data.repostCount,
      viewCount: data.viewCount,
      bookmarkCount: data.bookmarkCount,
      shareCount: data.shareCount,
      likedBy: data.likedBy,
      bookmarkedBy: data.bookmarkedBy,
      sharedBy: data.sharedBy,
    }));
  }

  quoteTweet(data: QuoteInput): void {
    this._push("TWEET_QUOTE", (order) => ({
      id: data.id ?? createTweetId(this._frame, order),
      authorId: data.authorId,
      text: data.text,
      quoteTweetId: data.quoteTweetId,
      createdAt: data.createdAt,
      media: data.media,
      linkPreview: data.linkPreview,
      poll: data.poll,
      hashtags: data.hashtags,
      mentions: data.mentions,
      likeCount: data.likeCount,
      repostCount: data.repostCount,
      viewCount: data.viewCount,
      bookmarkCount: data.bookmarkCount,
      shareCount: data.shareCount,
      likedBy: data.likedBy,
      bookmarkedBy: data.bookmarkedBy,
      sharedBy: data.sharedBy,
    }));
  }

  repostTweet(data: Omit<TweetRepostPayload, "id"> & { id?: string }): void {
    this._push("TWEET_REPOST", (order) => ({
      id: data.id ?? createTweetId(this._frame, order),
      authorId: data.authorId,
      repostOfId: data.repostOfId,
      text: data.text,
      createdAt: data.createdAt,
    }));
  }

  likeTweet(tweetId: string, userId: string): void {
    this._push("TWEET_LIKE", { tweetId, userId });
  }

  unlikeTweet(tweetId: string, userId: string): void {
    this._push("TWEET_UNLIKE", { tweetId, userId });
  }

  viewTweet(tweetId: string): void {
    this._push("TWEET_VIEW", { tweetId });
  }

  bookmarkTweet(tweetId: string, userId: string): void {
    this._push("TWEET_BOOKMARK", { tweetId, userId });
  }

  unbookmarkTweet(tweetId: string, userId: string): void {
    this._push("TWEET_UNBOOKMARK", { tweetId, userId });
  }

  shareTweet(tweetId: string, userId: string): void {
    this._push("TWEET_SHARE", { tweetId, userId });
  }

  votePoll(tweetId: string, userId: string, optionId: string): void {
    this._push("TWEET_POLL_VOTE", { tweetId, userId, optionId });
  }

  setMediaPlayback(
    tweetId: string,
    state: "idle" | "playing" | "paused" | "complete",
    progress: number,
  ): void {
    this._push("TWEET_MEDIA_PLAYBACK", { tweetId, state, progress });
  }

  navigate(
    screen: XScreen,
    opts: { tweetId?: string; userId?: string; threadId?: string } = {},
  ): void {
    this._push("NAVIGATE", { screen, ...opts });
  }

  goBack(): void {
    this._push("NAVIGATE_BACK", {});
  }

  setComposeDraft(text: string): void {
    this._push("SET_COMPOSE_DRAFT", { text });
  }

  setComposerStatus(
    status: "idle" | "sending" | "failed",
    error?: string,
  ): void {
    this._push("SET_COMPOSER_STATUS", { status, error });
  }

  setThreadDraft(threadId: string, text: string): void {
    this._push("SET_THREAD_DRAFT", { threadId, text });
  }

  startTyping(threadId: string, userId: string): void {
    this._push("DM_TYPING_START", { threadId, userId });
  }

  stopTyping(threadId: string, userId: string): void {
    this._push("DM_TYPING_STOP", { threadId, userId });
  }

  setTimelineTab(tab: TimelineTab): void {
    this._push("SET_TIMELINE_TAB", { tab });
  }

  setProfileTab(tab: ProfileTab): void {
    this._push("SET_PROFILE_TAB", { tab });
  }

  setNotificationsTab(tab: NotificationsTab): void {
    this._push("SET_NOTIFICATIONS_TAB", { tab });
  }

  addNotification(data: NotificationInput): void {
    this._push("NOTIFICATION_ADD", (order) => ({
      id: data.id ?? createNotificationId(this._frame, order),
      type: data.type,
      actorId: data.actorId,
      tweetId: data.tweetId,
      isMention: data.isMention,
      createdAt: data.createdAt,
      title: data.title,
      body: data.body,
      read: data.read,
    }));
  }

  createThread(participantIds: string[], options?: string | ThreadInput): void {
    const input =
      typeof options === "string"
        ? { id: options, participantIds }
        : {
            id: options?.id,
            participantIds: options?.participantIds ?? participantIds,
            title: options?.title,
            unreadCount: options?.unreadCount,
            pinned: options?.pinned,
          };
    this._push("DM_THREAD_CREATE", (order) => ({
      id: input.id ?? createThreadId(this._frame, order),
      participantIds: input.participantIds,
      title: input.title,
      unreadCount: input.unreadCount,
      pinned: input.pinned,
    }));
  }

  sendMessage(
    data: {
      id?: string;
      threadId: string;
      senderId: string;
      text: string;
      createdAt: number;
      replyToMessageId?: string;
      delivery?: "sending" | "sent" | "delivered" | "read" | "failed";
    },
    options: XSubmitOptions = {},
  ): void {
    if (options.input) {
      if (!this._addInputIntent) {
        throw new Error(
          "X_INPUT_INTEGRATION_MISSING: structured input requires the canonical code-first episode builder.",
        );
      }
      this._addInputIntent({
        deviceId: this._deviceId,
        fieldId: xInputFields.threadComposer(data.threadId),
        submitFrame: this._frame,
        text: data.text,
        input: options.input,
      });
    }
    this._push("DM_SEND", (order) => ({
      id: data.id ?? createMessageId(this._frame, order),
      threadId: data.threadId,
      senderId: data.senderId,
      text: data.text,
      createdAt: data.createdAt,
      replyToMessageId: data.replyToMessageId,
      delivery: data.delivery,
    }));
  }

  receiveMessage(data: {
    id?: string;
    threadId: string;
    senderId: string;
    text: string;
    createdAt: number;
    replyToMessageId?: string;
  }): void {
    this._push("DM_RECEIVE", (order) => ({
      id: data.id ?? createMessageId(this._frame, order),
      threadId: data.threadId,
      senderId: data.senderId,
      text: data.text,
      createdAt: data.createdAt,
      replyToMessageId: data.replyToMessageId,
    }));
  }

  reactToMessage(messageId: string, userId: string, emoji: string): void {
    this._push("DM_REACT", { messageId, userId, emoji });
  }

  removeMessageReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): void {
    this._push("DM_UNREACT", { messageId, userId, emoji });
  }

  setMessageDelivery(
    messageId: string,
    delivery: "sending" | "sent" | "delivered" | "read" | "failed",
  ): void {
    this._push("DM_SET_DELIVERY", { messageId, delivery });
  }

  setScroll(surface: XScrollSurface, offset: number, targetId?: string): void {
    this._push("SET_SCROLL", { surface, offset, targetId });
  }

  scrollTimelineTo(offset: number): void {
    this.setScroll("timeline", offset);
  }

  scrollTweetTo(tweetId: string, offset: number): void {
    this.setScroll("tweet", offset, tweetId);
  }

  scrollNotificationsTo(offset: number): void {
    this.setScroll("notifications", offset);
  }

  scrollMessagesTo(offset: number): void {
    this.setScroll("messages", offset);
  }

  scrollProfileTo(userId: string, offset: number): void {
    this.setScroll("profile", offset, userId);
  }

  scrollThreadFromBottom(threadId: string, offset: number): void {
    this.setScroll("thread", offset, threadId);
  }
}

export function createXTrackBuilder(
  fps: number,
  deviceId: string,
  getOrder: GetDeclarationOrder,
  addInputIntent?: AddXInputIntent,
): XTrackBuilder {
  return new XTrackBuilder(fps, deviceId, getOrder, addInputIntent);
}

export class XTrackBuilder {
  _events: XTrackEvent[] = [];

  constructor(
    private _fps: number,
    private _deviceId: string,
    private _getOrder: GetDeclarationOrder,
    private _addInputIntent?: AddXInputIntent,
  ) {}

  at(time: string | number): XPointBuilder {
    const frame =
      typeof time === "number" ? time : parseTimeToFrames(time, this._fps);
    return new XPointBuilder(
      frame,
      this._deviceId,
      this._events,
      this._getOrder,
      this._addInputIntent,
    );
  }

  span(start: string | number, _end: string | number): XPointBuilder {
    return this.at(start);
  }
}
