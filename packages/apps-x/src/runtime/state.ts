import type { ViewKind } from "@tokovo/core";

export interface XUser {
  id: string;
  name: string;
  handle: string;
  bio?: string;
  avatarUrl?: string;
  followers: number;
  following: number;
  followerIds: string[];
  followingIds: string[];
  verified: "blue" | "gold" | "grey" | null;
}

export interface XMedia {
  type: "image" | "video" | "link" | "poll";
  urls?: string[];
  aspect?: "square" | "wide" | "tall";
}

export interface XLinkPreview {
  url: string;
  domain: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export interface XPollOption {
  label: string;
  votes: number;
}

export interface XPoll {
  options: XPollOption[];
  totalVotes: number;
  endsAt?: number;
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
  viewCount: number;
  bookmarkCount: number;
  shareCount: number;
}

export type NotificationType =
  | "like"
  | "repost"
  | "reply"
  | "follow"
  | "mention";

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
}

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

export interface XRoute {
  screen: XScreen;
  tweetId?: string;
  userId?: string;
  threadId?: string;
}

export type XThemeMode = "dark" | "light" | "storybook";

export interface XState {
  /** Required by the Tokovo LayoutEngine. */
  viewMode: ViewKind;
  /** Required when viewMode === "CHAT". */
  conversationId?: string;
  users: XUser[];
  tweets: XTweet[];
  timeline: string[];
  notifications: XNotification[];
  dmThreads: XDMThread[];
  dmMessages: XDMMessage[];
  currentScreen: XScreen;
  activeTweetId: string | null;
  activeUserId: string | null;
  activeThreadId: string | null;
  currentUserId: string | null;
  composeDraft: string;
  threadDrafts: Record<string, string>;
  notificationsTab: NotificationsTab;
  timelineTab: TimelineTab;
  profileTab: ProfileTab;
  navigationStack: XRoute[];
  lastNavFrame: number;
  statusBarTheme?: "light" | "dark";
  themeMode: XThemeMode;
}

export function createXInitialState(): XState {
  return {
    viewMode: "FEED",
    conversationId: undefined,
    users: [],
    tweets: [],
    timeline: [],
    notifications: [],
    dmThreads: [],
    dmMessages: [],
    currentScreen: "timeline",
    activeTweetId: null,
    activeUserId: null,
    activeThreadId: null,
    currentUserId: null,
    composeDraft: "",
    threadDrafts: {},
    notificationsTab: "all",
    timelineTab: "forYou",
    profileTab: "posts",
    navigationStack: [],
    lastNavFrame: 0,
    statusBarTheme: "dark",
    themeMode: "dark",
  };
}
