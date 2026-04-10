import type { ViewKind } from "@tokovo/core";
import type {
  InstagramNotificationType,
  InstagramProfileTab,
  InstagramScreen,
  InstagramThemeMode,
} from "../types/events.js";

export interface InstagramUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  followers: number;
  following: number;
  followerIds: string[];
  followingIds: string[];
  verified: boolean;
}

export interface InstagramPost {
  id: string;
  authorId: string;
  imageUrl: string;
  caption: string;
  createdAt: number;
  location?: string;
  aspect: "square" | "portrait" | "landscape";
  likeCount: number;
  commentCount: number;
  commentIds: string[];
  likedBy: string[];
}

export interface InstagramComment {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: number;
}

export interface InstagramStory {
  id: string;
  authorId: string;
  mediaUrl: string;
  createdAt: number;
  durationFrames: number;
  accentColor?: string;
}

export interface InstagramStorySet {
  id: string;
  userId: string;
  storyIds: string[];
  lastViewedStoryId: string | null;
}

export interface InstagramDMThread {
  id: string;
  participantIds: string[];
  title?: string;
  unreadCount: number;
  pinned: boolean;
  typingUserId: string | null;
  messageIds: string[];
  lastMessageAt: number | null;
}

export interface InstagramDMMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: number;
  storyId?: string;
}

export interface InstagramNotification {
  id: string;
  type: InstagramNotificationType;
  actorId: string;
  postId?: string;
  threadId?: string;
  storyId?: string;
  title?: string;
  body?: string;
  createdAt: number;
  read: boolean;
}

export interface InstagramComposerDraft {
  caption: string;
  imageUrl?: string;
  location?: string;
}

export interface InstagramRoute {
  screen: InstagramScreen;
  postId?: string;
  profileId?: string;
  threadId?: string;
  storySetId?: string;
  storyId?: string;
}

export interface InstagramState {
  viewMode: ViewKind;
  conversationId?: string;
  users: InstagramUser[];
  posts: InstagramPost[];
  comments: InstagramComment[];
  storySets: InstagramStorySet[];
  stories: InstagramStory[];
  dmThreads: InstagramDMThread[];
  dmMessages: InstagramDMMessage[];
  notifications: InstagramNotification[];
  currentScreen: InstagramScreen;
  currentUserId: string | null;
  activePostId: string | null;
  activeProfileId: string | null;
  activeThreadId: string | null;
  activeStorySetId: string | null;
  activeStoryId: string | null;
  threadDrafts: Record<string, string>;
  composerDraft: InstagramComposerDraft;
  profileTab: InstagramProfileTab;
  navigationStack: InstagramRoute[];
  lastNavFrame: number;
  statusBarTheme: "light" | "dark";
  themeMode: InstagramThemeMode;
}

export function createInstagramInitialState(): InstagramState {
  return {
    viewMode: "FEED",
    conversationId: undefined,
    users: [],
    posts: [],
    comments: [],
    storySets: [],
    stories: [],
    dmThreads: [],
    dmMessages: [],
    notifications: [],
    currentScreen: "home",
    currentUserId: null,
    activePostId: null,
    activeProfileId: null,
    activeThreadId: null,
    activeStorySetId: null,
    activeStoryId: null,
    threadDrafts: {},
    composerDraft: {
      caption: "",
      imageUrl: undefined,
      location: undefined,
    },
    profileTab: "posts",
    navigationStack: [],
    lastNavFrame: 0,
    statusBarTheme: "dark",
    themeMode: "light",
  };
}
