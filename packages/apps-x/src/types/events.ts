import type { TrackEventBase } from "@tokovo/ir";

export const X_AUTHORING_EVENT_TYPES = [
  "USER_CREATE",
  "SET_CURRENT_USER",
  "FOLLOW_USER",
  "UNFOLLOW_USER",
  "TWEET_CREATE",
  "TWEET_REPLY",
  "TWEET_REPOST",
  "TWEET_QUOTE",
  "TWEET_LIKE",
  "TWEET_UNLIKE",
  "TWEET_VIEW",
  "TWEET_BOOKMARK",
  "TWEET_UNBOOKMARK",
  "TWEET_SHARE",
  "TWEET_POLL_VOTE",
  "TWEET_MEDIA_PLAYBACK",
  "NAVIGATE",
  "NAVIGATE_BACK",
  "SET_COMPOSE_DRAFT",
  "SET_COMPOSER_STATUS",
  "SET_THREAD_DRAFT",
  "SET_SCROLL",
  "DM_TYPING_START",
  "DM_TYPING_STOP",
  "SET_TIMELINE_TAB",
  "SET_PROFILE_TAB",
  "SET_NOTIFICATIONS_TAB",
  "NOTIFICATION_ADD",
  "MARK_NOTIFICATION_READ",
  "DM_THREAD_CREATE",
  "DM_SEND",
  "DM_RECEIVE",
  "DM_REACT",
  "DM_UNREACT",
  "DM_SET_DELIVERY",
] as const;

export type XEventType = (typeof X_AUTHORING_EVENT_TYPES)[number];

export type XEventKind =
  | "ADD_USER"
  | "SET_CURRENT_USER"
  | "FOLLOW_USER"
  | "UNFOLLOW_USER"
  | "ADD_TWEET"
  | "LIKE_TWEET"
  | "UNLIKE_TWEET"
  | "VIEW_TWEET"
  | "BOOKMARK_TWEET"
  | "UNBOOKMARK_TWEET"
  | "SHARE_TWEET"
  | "VOTE_POLL"
  | "SET_MEDIA_PLAYBACK"
  | "SET_SCREEN"
  | "SET_COMPOSE_DRAFT"
  | "SET_COMPOSER_STATUS"
  | "SET_THREAD_DRAFT"
  | "SET_SCROLL"
  | "START_DM_TYPING"
  | "STOP_DM_TYPING"
  | "SET_TIMELINE_TAB"
  | "SET_PROFILE_TAB"
  | "SET_NOTIFICATIONS_TAB"
  | "ADD_NOTIFICATION"
  | "MARK_NOTIFICATION_READ"
  | "ADD_DM_THREAD"
  | "ADD_DM_MESSAGE_OUTGOING"
  | "ADD_DM_MESSAGE_INCOMING"
  | "ADD_DM_REACTION"
  | "REMOVE_DM_REACTION"
  | "SET_DM_DELIVERY"
  | "NAVIGATE_BACK";

export type XScreen =
  | "timeline"
  | "tweet"
  | "compose"
  | "profile"
  | "notifications"
  | "messages"
  | "thread";

export type NotificationsTab = "all" | "verified" | "mentions";
export type TimelineTab = "forYou" | "following";
export type ProfileTab = "posts" | "replies" | "media" | "likes";
export type MediaType = "image" | "video";

export interface MediaPayload {
  type: MediaType;
  urls: string[];
  aspect: "square" | "wide" | "tall";
  alt?: string;
  posterUrl?: string;
  durationSeconds?: number;
  sensitive?: boolean;
}

export interface LinkPreviewPayload {
  url: string;
  domain: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export interface PollOptionPayload {
  id: string;
  label: string;
  votes: number;
}

export interface PollPayload {
  options: PollOptionPayload[];
  totalVotes?: number;
  endsAt?: number;
  selectedOptionId?: string;
}

export interface UserCreatePayload {
  id: string;
  name: string;
  handle: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  website?: string;
  joinedAt?: number;
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
  createdAt: number;
  media?: MediaPayload;
  linkPreview?: LinkPreviewPayload;
  poll?: PollPayload;
  hashtags?: string[];
  mentions?: string[];
  quoteTweetId?: string;
  likeCount?: number;
  repostCount?: number;
  viewCount?: number;
  bookmarkCount?: number;
  shareCount?: number;
  likedBy?: string[];
  bookmarkedBy?: string[];
  sharedBy?: string[];
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
  createdAt: number;
}

export interface TweetQuotePayload extends TweetBasePayload {
  quoteTweetId: string;
}

export interface TweetLikePayload {
  tweetId: string;
  userId: string;
}

export interface TweetPollVotePayload {
  tweetId: string;
  userId: string;
  optionId: string;
}

export interface TweetMediaPlaybackPayload {
  tweetId: string;
  state: "idle" | "playing" | "paused" | "complete";
  progress: number;
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

export interface ComposerStatusPayload {
  status: "idle" | "sending" | "failed";
  error?: string;
}

export interface ThreadDraftPayload {
  threadId: string;
  text: string;
}

export interface DMThreadActorPayload {
  threadId: string;
  userId: string;
}

export type XScrollSurface =
  | "timeline"
  | "tweet"
  | "notifications"
  | "messages"
  | "profile"
  | "thread";

export interface XScrollPayload {
  durationFrames?: number;
  surface: XScrollSurface;
  offset: number;
  targetId?: string;
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

export type NotificationType = "like" | "repost" | "reply" | "follow" | "mention" | "verified";

export interface NotificationAddPayload {
  id: string;
  type: NotificationType;
  actorId: string;
  tweetId?: string;
  isMention?: boolean;
  createdAt: number;
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
  createdAt: number;
  replyToMessageId?: string;
  delivery?: "sending" | "sent" | "delivered" | "read" | "failed";
}

export type DMReceivePayload = Omit<DMSendPayload, "delivery">;

export interface DMReactionPayload {
  messageId: string;
  userId: string;
  emoji: string;
}

export interface DMDeliveryPayload {
  messageId: string;
  delivery: "sending" | "sent" | "delivered" | "read" | "failed";
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
  TWEET_UNLIKE: TweetLikePayload;
  TWEET_VIEW: TweetViewPayload;
  TWEET_BOOKMARK: TweetBookmarkPayload;
  TWEET_UNBOOKMARK: TweetBookmarkPayload;
  TWEET_SHARE: TweetSharePayload;
  TWEET_POLL_VOTE: TweetPollVotePayload;
  TWEET_MEDIA_PLAYBACK: TweetMediaPlaybackPayload;
  NAVIGATE: NavigatePayload;
  NAVIGATE_BACK: Record<string, never>;
  SET_COMPOSE_DRAFT: ComposeDraftPayload;
  SET_COMPOSER_STATUS: ComposerStatusPayload;
  SET_THREAD_DRAFT: ThreadDraftPayload;
  SET_SCROLL: XScrollPayload;
  DM_TYPING_START: DMThreadActorPayload;
  DM_TYPING_STOP: DMThreadActorPayload;
  SET_TIMELINE_TAB: TimelineTabPayload;
  SET_PROFILE_TAB: ProfileTabPayload;
  SET_NOTIFICATIONS_TAB: NotificationsTabPayload;
  NOTIFICATION_ADD: NotificationAddPayload;
  MARK_NOTIFICATION_READ: { id: string; badgeCount?: number };
  DM_THREAD_CREATE: DMThreadCreatePayload;
  DM_SEND: DMSendPayload;
  DM_RECEIVE: DMReceivePayload;
  DM_REACT: DMReactionPayload;
  DM_UNREACT: DMReactionPayload;
  DM_SET_DELIVERY: DMDeliveryPayload;
};

export type XTrackEventFor<T extends XEventType> = TrackEventBase & {
  kind: "APP";
  appId: "app_x";
  deviceId: string;
  type: T;
  payload: XEventPayloadMap[T];
};

export type XTrackEvent = {
  [K in XEventType]: XTrackEventFor<K>;
}[XEventType];
