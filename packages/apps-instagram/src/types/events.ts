import type { TrackEventBase } from "@tokovo/ir";

export type InstagramScreen =
  | "home"
  | "story"
  | "notifications"
  | "inbox"
  | "thread"
  | "profile"
  | "composer";

export type InstagramThemeMode = "light" | "dark" | "storybook";
export type InstagramProfileTab = "posts" | "tagged";
export type InstagramNotificationType =
  | "like"
  | "comment"
  | "follow"
  | "dm"
  | "story_reply";

export interface InstagramUserPayload {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  followers?: number;
  following?: number;
  verified?: boolean;
}

export interface InstagramFollowPayload {
  followerId: string;
  followingId: string;
}

export interface InstagramPostPayload {
  id: string;
  authorId: string;
  imageUrl: string;
  caption: string;
  createdAt?: number;
  location?: string;
  likeCount?: number;
  commentCount?: number;
  aspect?: "square" | "portrait" | "landscape";
  typed?: boolean;
  charDelay?: number;
}

export interface InstagramPostLikePayload {
  postId: string;
  userId: string;
}

export interface InstagramCommentPayload {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt?: number;
}

export interface InstagramStoryItemPayload {
  id: string;
  authorId: string;
  mediaUrl: string;
  createdAt?: number;
  durationFrames?: number;
  accentColor?: string;
}

export interface InstagramStorySetPayload {
  id: string;
  userId: string;
  items: InstagramStoryItemPayload[];
}

export interface InstagramStoryOpenPayload {
  storySetId: string;
  storyId?: string;
}

export interface InstagramStoryAdvancePayload {
  storySetId: string;
  direction?: "next" | "prev";
}

export interface InstagramStoryReplyPayload {
  id: string;
  storyId: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt?: number;
  typed?: boolean;
  charDelay?: number;
}

export interface InstagramDMThreadPayload {
  id: string;
  participantIds: string[];
  title?: string;
  unreadCount?: number;
  pinned?: boolean;
}

export interface InstagramDMMessagePayload {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt?: number;
  storyId?: string;
  typed?: boolean;
  charDelay?: number;
}

export interface InstagramThreadDraftPayload {
  threadId: string;
  text: string;
}

export interface InstagramThreadTypingPayload {
  threadId: string;
  userId: string | null;
}

export interface InstagramNotificationPayload {
  id: string;
  type: InstagramNotificationType;
  actorId: string;
  postId?: string;
  threadId?: string;
  storyId?: string;
  title?: string;
  body?: string;
  createdAt?: number;
  read?: boolean;
}

export interface InstagramDismissNotificationPayload {
  id: string;
}

export interface InstagramNavigatePayload {
  screen: InstagramScreen;
  postId?: string;
  profileId?: string;
  threadId?: string;
  storySetId?: string;
  storyId?: string;
}

export interface InstagramComposerDraftPayload {
  caption: string;
  imageUrl?: string;
  location?: string;
}

export interface InstagramSetCurrentUserPayload {
  userId: string;
}

export interface InstagramSetProfileTabPayload {
  tab: InstagramProfileTab;
}

export interface InstagramSetThemeModePayload {
  mode: InstagramThemeMode;
}

export type InstagramEventType =
  | "USER_ADD"
  | "SET_CURRENT_USER"
  | "FOLLOW_USER"
  | "POST_ADD"
  | "POST_LIKE"
  | "POST_COMMENT"
  | "STORY_SET_ADD"
  | "STORY_OPEN"
  | "STORY_ADVANCE"
  | "STORY_REPLY"
  | "DM_THREAD_ADD"
  | "DM_MESSAGE_ADD"
  | "SET_THREAD_DRAFT"
  | "SET_THREAD_TYPING"
  | "NOTIFICATION_ADD"
  | "NOTIFICATION_DISMISS"
  | "NAVIGATE"
  | "NAVIGATE_BACK"
  | "SET_COMPOSER_DRAFT"
  | "SET_PROFILE_TAB"
  | "SET_THEME_MODE";

export type InstagramEventKind =
  | "INSTAGRAM_ADD_USER"
  | "INSTAGRAM_SET_CURRENT_USER"
  | "INSTAGRAM_FOLLOW_USER"
  | "INSTAGRAM_ADD_POST"
  | "INSTAGRAM_LIKE_POST"
  | "INSTAGRAM_ADD_COMMENT"
  | "INSTAGRAM_ADD_STORY_SET"
  | "INSTAGRAM_OPEN_STORY"
  | "INSTAGRAM_ADVANCE_STORY"
  | "INSTAGRAM_ADD_DM_THREAD"
  | "INSTAGRAM_ADD_DM_MESSAGE"
  | "INSTAGRAM_SET_THREAD_DRAFT"
  | "INSTAGRAM_SET_THREAD_TYPING"
  | "INSTAGRAM_ADD_NOTIFICATION"
  | "INSTAGRAM_DISMISS_NOTIFICATION"
  | "INSTAGRAM_SET_SCREEN"
  | "INSTAGRAM_SET_ACTIVE_POST"
  | "INSTAGRAM_SET_ACTIVE_PROFILE"
  | "INSTAGRAM_SET_ACTIVE_THREAD"
  | "INSTAGRAM_SET_ACTIVE_STORY_SET"
  | "INSTAGRAM_SET_ACTIVE_STORY"
  | "INSTAGRAM_NAVIGATE_BACK"
  | "INSTAGRAM_SET_COMPOSER_DRAFT"
  | "INSTAGRAM_SET_PROFILE_TAB"
  | "INSTAGRAM_SET_THEME_MODE";

export type InstagramEventPayloadMap = {
  USER_ADD: InstagramUserPayload;
  SET_CURRENT_USER: InstagramSetCurrentUserPayload;
  FOLLOW_USER: InstagramFollowPayload;
  POST_ADD: InstagramPostPayload;
  POST_LIKE: InstagramPostLikePayload;
  POST_COMMENT: InstagramCommentPayload;
  STORY_SET_ADD: InstagramStorySetPayload;
  STORY_OPEN: InstagramStoryOpenPayload;
  STORY_ADVANCE: InstagramStoryAdvancePayload;
  STORY_REPLY: InstagramStoryReplyPayload;
  DM_THREAD_ADD: InstagramDMThreadPayload;
  DM_MESSAGE_ADD: InstagramDMMessagePayload;
  SET_THREAD_DRAFT: InstagramThreadDraftPayload;
  SET_THREAD_TYPING: InstagramThreadTypingPayload;
  NOTIFICATION_ADD: InstagramNotificationPayload;
  NOTIFICATION_DISMISS: InstagramDismissNotificationPayload;
  NAVIGATE: InstagramNavigatePayload;
  NAVIGATE_BACK: Record<string, never>;
  SET_COMPOSER_DRAFT: InstagramComposerDraftPayload;
  SET_PROFILE_TAB: InstagramSetProfileTabPayload;
  SET_THEME_MODE: InstagramSetThemeModePayload;
};

export type InstagramTrackEventFor<T extends InstagramEventType> = TrackEventBase & {
  kind: "APP";
  appId: "app_instagram";
  type: T;
  payload: InstagramEventPayloadMap[T];
};

export type InstagramTrackEvent = {
  [K in InstagramEventType]: InstagramTrackEventFor<K>;
}[InstagramEventType];
