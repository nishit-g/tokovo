import type { ViewKind } from "@tokovo/core";

export const X_STATE_SCHEMA_VERSION = 2 as const;

export type XLocale = "en-US" | "ar-SA" | "hi-IN";

export interface XUser {
  id: string;
  name: string;
  handle: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  website?: string;
  joinedAt?: number;
  followers: number;
  following: number;
  followerIds: string[];
  followingIds: string[];
  verified: "blue" | "gold" | "grey" | null;
}

export interface XMedia {
  type: "image" | "video";
  urls: string[];
  aspect: "square" | "wide" | "tall";
  alt?: string;
  posterUrl?: string;
  sensitive: boolean;
  playback: {
    state: "idle" | "playing" | "paused" | "complete";
    progress: number;
  } | null;
}

export interface XLinkPreview {
  url: string;
  domain: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export interface XPollOption {
  id: string;
  label: string;
  votes: number;
}

export interface XPoll {
  options: XPollOption[];
  totalVotes: number;
  endsAt?: number;
  selectedOptionId: string | null;
}

export interface XTweet {
  id: string;
  authorId: string;
  text: string;
  createdAt: number;
  replyToId?: string;
  repostOfId?: string;
  quoteTweetId?: string;
  media?: XMedia;
  linkPreview?: XLinkPreview;
  poll?: XPoll;
  hashtags: string[];
  mentions: string[];
  likeCount: number;
  repostCount: number;
  replyIds: string[];
  likedBy: string[];
  bookmarkedBy: string[];
  sharedBy: string[];
  viewCount: number;
  bookmarkCount: number;
  shareCount: number;
}

export type NotificationType =
  | "like"
  | "repost"
  | "reply"
  | "follow"
  | "mention"
  | "verified";

export interface XNotification {
  id: string;
  type: NotificationType;
  actorId: string;
  tweetId?: string;
  isMention?: boolean;
  createdAt: number;
  title?: string;
  body?: string;
  read: boolean;
}

export interface XDMThread {
  id: string;
  participantIds: string[];
  messageIds: string[];
  title?: string;
  unreadCount: number;
  pinned: boolean;
  typingUserId: string | null;
  lastMessageAt: number | null;
}

export interface XDMMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: number;
  delivery: "sending" | "sent" | "failed";
}

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

export interface XRoute {
  screen: XScreen;
  tweetId?: string;
  userId?: string;
  threadId?: string;
}

export interface XRouteTransition {
  from: XRoute;
  to: XRoute;
  atFrame: number;
  direction: "forward" | "back";
}

export interface XComposerState {
  draft: string;
  status: "idle" | "sending" | "failed";
  error: string | null;
}

export interface XState {
  schemaVersion: typeof X_STATE_SCHEMA_VERSION;
  layoutRevision: number;
  locale: XLocale;
  /** Required by the Tokovo LayoutEngine. */
  viewMode: ViewKind;
  /** Required when viewMode === "CHAT". */
  conversationId?: string;
  usersById: Record<string, XUser>;
  tweetsById: Record<string, XTweet>;
  timelineIds: string[];
  notificationsById: Record<string, XNotification>;
  notificationIds: string[];
  dmThreadsById: Record<string, XDMThread>;
  dmThreadIds: string[];
  dmMessagesById: Record<string, XDMMessage>;
  route: XRoute;
  currentUserId: string | null;
  composer: XComposerState;
  threadDrafts: Record<string, string>;
  notificationsTab: NotificationsTab;
  timelineTab: TimelineTab;
  profileTab: ProfileTab;
  navigationStack: XRoute[];
  lastTransition: XRouteTransition | null;
  feedScrollY: number;
  threadScrollYById: Record<string, number>;
}

export function createXInitialState(): XState {
  return {
    schemaVersion: X_STATE_SCHEMA_VERSION,
    layoutRevision: 0,
    locale: "en-US",
    viewMode: "FEED",
    conversationId: undefined,
    usersById: {},
    tweetsById: {},
    timelineIds: [],
    notificationsById: {},
    notificationIds: [],
    dmThreadsById: {},
    dmThreadIds: [],
    dmMessagesById: {},
    route: { screen: "timeline" },
    currentUserId: null,
    composer: { draft: "", status: "idle", error: null },
    threadDrafts: {},
    notificationsTab: "all",
    timelineTab: "forYou",
    profileTab: "posts",
    navigationStack: [],
    lastTransition: null,
    feedScrollY: 0,
    threadScrollYById: {},
  };
}
