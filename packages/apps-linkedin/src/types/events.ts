import type { TrackEventBase } from "@tokovo/ir";

export type LIEventType =
  | "USER_CREATE"
  | "SET_CURRENT_USER"
  | "CONNECT_USERS"
  | "DISCONNECT_USERS"
  | "POST_CREATE"
  | "POST_REPOST"
  | "POST_REACT"
  | "POST_COMMENT"
  | "POST_VIEW"
  | "NAVIGATE"
  | "NAVIGATE_BACK"
  | "SET_COMPOSE_DRAFT"
  | "SET_THEME_MODE"
  | "NOTIFICATION_ADD"
  | "DM_THREAD_CREATE"
  | "DM_SEND";

export type LIEventKind =
  | "LINKEDIN_ADD_USER"
  | "LINKEDIN_SET_CURRENT_USER"
  | "LINKEDIN_CONNECT_USERS"
  | "LINKEDIN_DISCONNECT_USERS"
  | "LINKEDIN_ADD_POST"
  | "LINKEDIN_REPOST_POST"
  | "LINKEDIN_REACT_POST"
  | "LINKEDIN_ADD_COMMENT"
  | "LINKEDIN_VIEW_POST"
  | "LINKEDIN_SET_SCREEN"
  | "LINKEDIN_SET_ACTIVE_POST"
  | "LINKEDIN_SET_ACTIVE_USER"
  | "LINKEDIN_SET_ACTIVE_THREAD"
  | "LINKEDIN_SET_COMPOSE_DRAFT"
  | "LINKEDIN_SET_THEME_MODE"
  | "LINKEDIN_ADD_NOTIFICATION"
  | "LINKEDIN_ADD_DM_THREAD"
  | "LINKEDIN_ADD_DM_MESSAGE"
  | "LINKEDIN_NAVIGATE_BACK";

export type LIScreen =
  | "feed"
  | "post"
  | "compose"
  | "profile"
  | "notifications"
  | "messages"
  | "thread";

export type LIThemeMode = "light" | "dark" | "storybook";

export type LIPostVisibility = "public" | "connections";

export type LIReactionType =
  | "like"
  | "celebrate"
  | "support"
  | "love"
  | "insightful"
  | "curious";

export interface UserCreatePayload {
  id: string;
  name: string;
  handle: string;
  headline?: string;
  avatarUrl?: string;
  location?: string;
  company?: string;
  about?: string;
  connections?: number;
  followers?: number;
  profileViews?: number;
  impressionCount?: number;
}

export interface SetCurrentUserPayload {
  userId: string;
}

export interface ConnectUsersPayload {
  a: string;
  b: string;
}

export interface PostBasePayload {
  id: string;
  authorId: string;
  text: string;
  createdAt?: number;
  visibility?: LIPostVisibility;
  media?: { type: "image" | "video" | "link"; urls?: string[]; aspect?: "square" | "wide" | "tall" };
  linkPreview?: { url: string; domain: string; title: string; description?: string; imageUrl?: string };
  hashtags?: string[];
  mentions?: string[];
  typed?: boolean;
  charDelay?: number;
}

export type PostCreatePayload = PostBasePayload;

export interface PostRepostPayload {
  id: string;
  authorId: string;
  repostOfId: string;
  text?: string;
  createdAt?: number;
}

export interface PostReactPayload {
  postId: string;
  userId: string;
  reaction: LIReactionType;
}

export interface PostCommentPayload {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt?: number;
  typed?: boolean;
  charDelay?: number;
}

export interface PostViewPayload {
  postId: string;
}

export interface NavigatePayload {
  screen: LIScreen;
  postId?: string;
  userId?: string;
  threadId?: string;
}

export interface ComposeDraftPayload {
  text: string;
}

export type NotificationType =
  | "reaction"
  | "comment"
  | "repost"
  | "connection"
  | "follow"
  | "message";

export interface NotificationAddPayload {
  id: string;
  type: NotificationType;
  actorId: string;
  postId?: string;
  threadId?: string;
  title?: string;
  body?: string;
  createdAt?: number;
  unread?: boolean;
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

export type LIEventPayloadMap = {
  USER_CREATE: UserCreatePayload;
  SET_CURRENT_USER: SetCurrentUserPayload;
  CONNECT_USERS: ConnectUsersPayload;
  DISCONNECT_USERS: ConnectUsersPayload;
  POST_CREATE: PostCreatePayload;
  POST_REPOST: PostRepostPayload;
  POST_REACT: PostReactPayload;
  POST_COMMENT: PostCommentPayload;
  POST_VIEW: PostViewPayload;
  NAVIGATE: NavigatePayload;
  NAVIGATE_BACK: Record<string, never>;
  SET_COMPOSE_DRAFT: ComposeDraftPayload;
  SET_THEME_MODE: { mode: LIThemeMode };
  NOTIFICATION_ADD: NotificationAddPayload;
  DM_THREAD_CREATE: DMThreadCreatePayload;
  DM_SEND: DMSendPayload;
};

export type LITrackEventFor<T extends LIEventType> = TrackEventBase & {
  kind: "APP";
  appId: "app_linkedin";
  type: T;
  payload: LIEventPayloadMap[T];
};

export type LITrackEvent = {
  [K in LIEventType]: LITrackEventFor<K>;
}[LIEventType];
