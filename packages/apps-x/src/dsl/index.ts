import { parseTimeToFrames } from "@tokovo/dsl";
import type {
  XTrackEvent,
  XTrackEventFor,
  XEventType,
  XEventPayloadMap,
  XScreen,
  NotificationsTab,
  UserCreatePayload,
  TweetCreatePayload,
  TweetReplyPayload,
  TweetQuotePayload,
  TweetRepostPayload,
} from "../types";

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
  type: "like" | "repost" | "reply" | "follow" | "mention";
  actorId: string;
  tweetId?: string;
  isMention?: boolean;
  createdAt?: number;
};

type ThreadInput = {
  id?: string;
  participantIds: string[];
};

type MessageInput = {
  id?: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt?: number;
};

type SeedInput = {
  users?: UserInput[];
  tweets?: TweetInput[];
  replies?: ReplyInput[];
  quotes?: QuoteInput[];
  notifications?: NotificationInput[];
  threads?: ThreadInput[];
  messages?: MessageInput[];
  follows?: Array<{ followerId: string; followingId: string }>;
  currentUserId?: string;
  composeDraft?: string;
  notificationsTab?: NotificationsTab;
  screen?: XScreen;
  activeTweetId?: string;
  activeUserId?: string;
  activeThreadId?: string;
};

class XPointBuilder {
  constructor(
    private _frame: number,
    private _deviceId: string,
    private _events: XTrackEvent[],
    private _getOrder: GetDeclarationOrder,
  ) {}

  private _push<T extends XEventType>(
    type: T,
    payload: PayloadInput<T>,
    duration?: number,
  ): void {
    const order = this._getOrder();
    const resolvedPayload = typeof payload === "function" ? payload(order) : payload;
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

  postTweet(data: TweetInput): void {
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
      viewCount: data.viewCount,
      bookmarkCount: data.bookmarkCount,
      shareCount: data.shareCount,
    }));
  }

  replyTweet(data: ReplyInput): void {
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
      viewCount: data.viewCount,
      bookmarkCount: data.bookmarkCount,
      shareCount: data.shareCount,
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
      viewCount: data.viewCount,
      bookmarkCount: data.bookmarkCount,
      shareCount: data.shareCount,
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

  viewTweet(tweetId: string): void {
    this._push("TWEET_VIEW", { tweetId });
  }

  bookmarkTweet(tweetId: string, userId: string): void {
    this._push("TWEET_BOOKMARK", { tweetId, userId });
  }

  shareTweet(tweetId: string, userId: string): void {
    this._push("TWEET_SHARE", { tweetId, userId });
  }

  navigate(screen: XScreen, opts: { tweetId?: string; userId?: string; threadId?: string } = {}): void {
    this._push("NAVIGATE", { screen, ...opts });
  }

  goBack(): void {
    this._push("NAVIGATE_BACK", {});
  }

  setComposeDraft(text: string): void {
    this._push("SET_COMPOSE_DRAFT", { text });
  }

  setNotificationsTab(tab: NotificationsTab): void {
    this._push("SET_NOTIFICATIONS_TAB", { tab });
  }

  addNotification(data: {
    id?: string;
    type: "like" | "repost" | "reply" | "follow" | "mention";
    actorId: string;
    tweetId?: string;
    isMention?: boolean;
    createdAt?: number;
  }): void {
    this._push("NOTIFICATION_ADD", (order) => ({
      id: data.id ?? createNotificationId(this._frame, order),
      type: data.type,
      actorId: data.actorId,
      tweetId: data.tweetId,
      isMention: data.isMention,
      createdAt: data.createdAt,
    }));
  }

  createThread(participantIds: string[], id?: string): void {
    this._push("DM_THREAD_CREATE", (order) => ({
      id: id ?? createThreadId(this._frame, order),
      participantIds,
    }));
  }

  sendMessage(data: {
    id?: string;
    threadId: string;
    senderId: string;
    text: string;
    createdAt?: number;
  }): void {
    this._push("DM_SEND", (order) => ({
      id: data.id ?? createMessageId(this._frame, order),
      threadId: data.threadId,
      senderId: data.senderId,
      text: data.text,
      createdAt: data.createdAt,
    }));
  }
}

class XSpanBuilder {
  constructor(
    private _frame: number,
    private _duration: number,
    private _deviceId: string,
    private _events: XTrackEvent[],
    private _getOrder: GetDeclarationOrder,
  ) {}

  private _push<T extends XEventType>(type: T, payload: PayloadInput<T>): void {
    const order = this._getOrder();
    const resolvedPayload = typeof payload === "function" ? payload(order) : payload;
    const event: XTrackEventFor<T> = {
      at: this._frame,
      duration: this._duration,
      kind: "APP",
      appId: "app_x",
      type,
      payload: resolvedPayload,
      deviceId: this._deviceId,
      _declarationOrder: order,
    };
    this._events.push(event as XTrackEvent);
  }

  setComposeDraft(text: string): void {
    this._push("SET_COMPOSE_DRAFT", { text });
  }
}

export class XTrackBuilder {
  _events: XTrackEvent[] = [];

  constructor(
    private _fps: number,
    private _deviceId: string,
    private _getOrder: GetDeclarationOrder,
  ) {}

  at(time: string | number): XPointBuilder {
    const frame = typeof time === "number" ? time : parseTimeToFrames(time, this._fps);
    return new XPointBuilder(frame, this._deviceId, this._events, this._getOrder);
  }

  span(start: string | number, end: string | number): XSpanBuilder {
    const startFrame = typeof start === "number" ? start : parseTimeToFrames(start, this._fps);
    const endFrame = typeof end === "number" ? end : parseTimeToFrames(end, this._fps);
    const duration = Math.max(0, endFrame - startFrame);
    return new XSpanBuilder(startFrame, duration, this._deviceId, this._events, this._getOrder);
  }

  seed(data: SeedInput, time: string | number = 0): void {
    const point = this.at(time);
    data.users?.forEach((user) => point.createUser(user));
    data.follows?.forEach((pair) => point.followUser(pair.followerId, pair.followingId));
    data.currentUserId && point.setCurrentUser(data.currentUserId);
    data.tweets?.forEach((tweet) => point.postTweet(tweet));
    data.replies?.forEach((reply) => point.replyTweet(reply));
    data.quotes?.forEach((quote) => point.quoteTweet(quote));
    data.notifications?.forEach((note) => point.addNotification(note));
    data.threads?.forEach((thread) => point.createThread(thread.participantIds, thread.id));
    data.messages?.forEach((message) => point.sendMessage(message));
    data.composeDraft && point.setComposeDraft(data.composeDraft);
    data.notificationsTab && point.setNotificationsTab(data.notificationsTab);
    if (data.screen) {
      point.navigate(data.screen, {
        tweetId: data.activeTweetId,
        userId: data.activeUserId,
        threadId: data.activeThreadId,
      });
    }
  }
}
