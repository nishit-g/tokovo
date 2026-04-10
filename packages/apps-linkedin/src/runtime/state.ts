import type { ViewKind } from "@tokovo/core";
import type { LIReactionType, LIScreen, LIThemeMode, LIPostVisibility } from "../types/events.js";

export interface LIUser {
  id: string;
  name: string;
  handle: string;
  headline?: string;
  avatarUrl?: string;
  location?: string;
  company?: string;
  about?: string;
  connections: number;
  followers: number;
  profileViews?: number;
  impressionCount?: number;
  connectionIds: string[];
  followerIds: string[];
}

export interface LIMedia {
  type: "image" | "video" | "link";
  urls?: string[];
  aspect?: "square" | "wide" | "tall";
}

export interface LILinkPreview {
  url: string;
  domain: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export interface LIComment {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: number;
}

export interface LIPost {
  id: string;
  authorId: string;
  text: string;
  createdAt: number;
  visibility: LIPostVisibility;
  media?: LIMedia;
  linkPreview?: LILinkPreview;
  hashtags: string[];
  mentions: string[];
  reactions: Partial<Record<LIReactionType, number>>;
  reactedBy: Record<string, LIReactionType>;
  commentIds: string[];
  repostOfId?: string;
  viewCount: number;
}

export interface LINotification {
  id: string;
  type: "reaction" | "comment" | "repost" | "connection" | "follow" | "message";
  actorId: string;
  postId?: string;
  threadId?: string;
  title?: string;
  body?: string;
  createdAt: number;
  unread: boolean;
}

export interface LIDMThread {
  id: string;
  participantIds: string[];
  messageIds: string[];
  title?: string;
  unreadCount: number;
  pinned: boolean;
  lastMessageId?: string | null;
  lastMessageAt?: number | null;
  draftText: string;
  typingParticipantIds: string[];
}

export interface LIDMMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: number;
}

export interface LIRoute {
  screen: LIScreen;
  postId?: string;
  userId?: string;
  threadId?: string;
}

export interface LinkedInState {
  /** Required by the Tokovo LayoutEngine. */
  viewMode: ViewKind;
  /** Required when viewMode === "CHAT". */
  conversationId?: string;

  users: LIUser[];
  posts: LIPost[];
  comments: LIComment[];
  feed: string[];

  notifications: LINotification[];
  dmThreads: LIDMThread[];
  dmMessages: LIDMMessage[];

  currentScreen: LIScreen;
  activePostId: string | null;
  activeUserId: string | null;
  activeThreadId: string | null;
  currentUserId: string | null;

  composeDraft: string;
  navigationStack: LIRoute[];
  lastNavFrame: number;
  statusBarTheme?: "light" | "dark";
  themeMode: LIThemeMode;
}

export function createLinkedInInitialState(): LinkedInState {
  return {
    viewMode: "FEED",
    conversationId: undefined,

    users: [],
    posts: [],
    comments: [],
    feed: [],

    notifications: [],
    dmThreads: [],
    dmMessages: [],

    currentScreen: "feed",
    activePostId: null,
    activeUserId: null,
    activeThreadId: null,
    currentUserId: null,

    composeDraft: "",
    navigationStack: [],
    lastNavFrame: 0,
    statusBarTheme: "dark",
    themeMode: "light",
  };
}
