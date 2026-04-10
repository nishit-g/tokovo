import type { TrackEventBase } from "@tokovo/ir";

export type XEventType =
  | "USER_CREATE"
  | "SET_CURRENT_USER"
  | "FOLLOW_USER"
  | "UNFOLLOW_USER"
  | "TWEET_CREATE"
  | "TWEET_REPLY"
  | "TWEET_REPOST"
  | "TWEET_QUOTE"
  | "TWEET_LIKE"
  | "TWEET_VIEW"
  | "TWEET_BOOKMARK"
  | "TWEET_SHARE"
  | "NAVIGATE"
  | "NAVIGATE_BACK"
  | "SET_COMPOSE_DRAFT"
  | "SET_THREAD_DRAFT"
  | "SET_THREAD_TYPING"
  | "SET_TIMELINE_TAB"
  | "SET_PROFILE_TAB"
  | "SET_NOTIFICATIONS_TAB"
  | "NOTIFICATION_ADD"
  | "DM_THREAD_CREATE"
  | "DM_SEND"
  | "SET_THEME_MODE";

export type XEventKind =
  | "ADD_USER"
  | "SET_CURRENT_USER"
  | "FOLLOW_USER"
  | "UNFOLLOW_USER"
  | "ADD_TWEET"
  | "LIKE_TWEET"
  | "VIEW_TWEET"
  | "BOOKMARK_TWEET"
  | "SHARE_TWEET"
  | "SET_SCREEN"
  | "SET_ACTIVE_TWEET"
  | "SET_ACTIVE_USER"
  | "SET_ACTIVE_THREAD"
  | "SET_COMPOSE_DRAFT"
  | "SET_THREAD_DRAFT"
  | "SET_THREAD_TYPING"
  | "SET_TIMELINE_TAB"
  | "SET_PROFILE_TAB"
  | "SET_NOTIFICATIONS_TAB"
  | "ADD_NOTIFICATION"
  | "ADD_DM_THREAD"
  | "ADD_DM_MESSAGE"
  | "NAVIGATE_BACK"
  | "SET_THEME_MODE";

export type XScreen =
  | "timeline"
  | "tweet"
  | "compose"
  | "profile"
  | "notifications"
  | "messages"
  | "thread";

export type NotificationsTab = "all" | "mentions";
export type TimelineTab = "forYou" | "following";
export type ProfileTab = "posts" | "replies" | "media" | "likes";
export type XThemeMode = "dark" | "light" | "ghibli";

export type MediaType = "image" | "video" | "link" | "poll";

export interface MediaPayload {
  type: MediaType;
  urls?: string[];
  aspect?: "square" | "wide" | "tall";
}

export interface LinkPreviewPayload {
  url: string;
  domain: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export interface PollOptionPayload {
  label: string;
  votes: number;
}

export interface PollPayload {
  options: PollOptionPayload[];
  totalVotes?: number;
  endsAt?: number;
}

export interface UserCreatePayload {
  id: string;
  name: string;
  handle: string;
  bio?: string;
  avatarUrl?: string;
  followers?: number;
  following?: number;
  verified?: "blue" | "gold" | "grey" | null;
}

export interface SetCurrentUserPayload {
  userId: string;
}

export interface FollowUserPayload {
  followerId: string;
  followingId: string;
}

export interface TweetBasePayload {
  id: string;
  authorId: string;
  text: string;
  createdAt?: number;
  media?: MediaPayload;
  linkPreview?: LinkPreviewPayload;
  poll?: PollPayload;
  hashtags?: string[];
  mentions?: string[];
  quoteTweetId?: string;
  viewCount?: number;
  bookmarkCount?: number;
  shareCount?: number;
  /**
   * If true, lowerer may emit device keyboard events to make the post feel authored.
   * Requires a prior NAVIGATE -> compose event on the same device for deterministic timing.
   * UI should read keyboard typed progress while keyboard is visible for best effect.
   */
  typed?: boolean;
  /** Frames per character for keyboard typing animation */
  charDelay?: number;
}

export type TweetCreatePayload = TweetBasePayload;

export interface TweetReplyPayload extends TweetBasePayload {
  replyToId: string;
}

export interface TweetRepostPayload {
  id: string;
  authorId: string;
  repostOfId: string;
  text?: string;
  createdAt?: number;
}

export interface TweetQuotePayload extends TweetBasePayload {
  quoteTweetId: string;
}

export interface TweetLikePayload {
  tweetId: string;
  userId: string;
}

export interface TweetViewPayload {
  tweetId: string;
}

export interface TweetBookmarkPayload {
  tweetId: string;
  userId: string;
}

export interface TweetSharePayload {
  tweetId: string;
  userId: string;
}

export interface NavigatePayload {
  screen: XScreen;
  tweetId?: string;
  userId?: string;
  threadId?: string;
}

export interface ComposeDraftPayload {
  text: string;
}

export interface ThreadDraftPayload {
  threadId: string;
  text: string;
}

export interface ThreadTypingPayload {
  threadId: string;
  userId: string | null;
}

export interface TimelineTabPayload {
  tab: TimelineTab;
}

export interface ProfileTabPayload {
  tab: ProfileTab;
}

export interface NotificationsTabPayload {
  tab: NotificationsTab;
}

export type NotificationType =
  | "like"
  | "repost"
  | "reply"
  | "follow"
  | "mention";

export interface NotificationAddPayload {
  id: string;
  type: NotificationType;
  actorId: string;
  tweetId?: string;
  isMention?: boolean;
  createdAt?: number;
  title?: string;
  body?: string;
  read?: boolean;
}

export interface DMThreadCreatePayload {
  id: string;
  participantIds: string[];
  title?: string;
  unreadCount?: number;
  pinned?: boolean;
}

export interface DMSendPayload {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt?: number;
  typed?: boolean;
  charDelay?: number;
}

export type XEventPayloadMap = {
  USER_CREATE: UserCreatePayload;
  SET_CURRENT_USER: SetCurrentUserPayload;
  FOLLOW_USER: FollowUserPayload;
  UNFOLLOW_USER: FollowUserPayload;
  TWEET_CREATE: TweetCreatePayload;
  TWEET_REPLY: TweetReplyPayload;
  TWEET_REPOST: TweetRepostPayload;
  TWEET_QUOTE: TweetQuotePayload;
  TWEET_LIKE: TweetLikePayload;
  TWEET_VIEW: TweetViewPayload;
  TWEET_BOOKMARK: TweetBookmarkPayload;
  TWEET_SHARE: TweetSharePayload;
  NAVIGATE: NavigatePayload;
  NAVIGATE_BACK: Record<string, never>;
  SET_COMPOSE_DRAFT: ComposeDraftPayload;
  SET_THREAD_DRAFT: ThreadDraftPayload;
  SET_THREAD_TYPING: ThreadTypingPayload;
  SET_TIMELINE_TAB: TimelineTabPayload;
  SET_PROFILE_TAB: ProfileTabPayload;
  SET_NOTIFICATIONS_TAB: NotificationsTabPayload;
  NOTIFICATION_ADD: NotificationAddPayload;
  DM_THREAD_CREATE: DMThreadCreatePayload;
  DM_SEND: DMSendPayload;
  SET_THEME_MODE: { mode: XThemeMode };
};

export type XTrackEventFor<T extends XEventType> = TrackEventBase & {
  kind: "APP";
  appId: "app_x";
  type: T;
  payload: XEventPayloadMap[T];
};

export type XTrackEvent = {
  [K in XEventType]: XTrackEventFor<K>;
}[XEventType];
