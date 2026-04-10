import type { TeamsMessage } from "./messages.js";

export interface TeamsUser {
  id: string;
  displayName: string;
  shortName?: string;
  avatar?: string;
  role?: string;
  headline?: string;
}

export interface TeamsDm {
  id: string;
  participantIds: string[];
  messageIds: string[];
  unreadCount: number;
  mentionCount: number;
  lastMessageId?: string;
  draftText?: string;
  muted?: boolean;
  pinned?: boolean;
}

export interface TeamsChannel {
  id: string;
  name: string;
  memberIds: string[];
  threadIds: string[];
  unreadCount: number;
  mentionCount: number;
  description?: string;
  lastActivityFrame?: number;
  isPrivate?: boolean;
}

export interface TeamsThread {
  id: string;
  channelId?: string;
  dmId?: string;
  messageIds: string[];
  title?: string;
  participantIds: string[];
  unreadCount: number;
  mentionCount: number;
  replyCount: number;
  lastActivityFrame?: number;
  draftText?: string;
  typingUserIds: string[];
  state: "open" | "resolved";
}

export interface TeamsCall {
  id: string;
  participantIds: string[];
  status: "idle" | "ringing" | "active" | "ended";
  mode: "audio" | "video";
  scope: "dm" | "channel" | "thread";
  dmId?: string;
  channelId?: string;
  threadId?: string;
  title?: string;
  dominantSpeakerId?: string;
  startedAtFrame?: number;
  endedAtFrame?: number;
}

export interface TeamsNotification {
  id: string;
  title: string;
  text: string;
  kind: "mention" | "message" | "system";
  appId: "app_teams";
  createdAtFrame: number;
  expiresAtFrame: number;
  target?: {
    dmId?: string;
    channelId?: string;
    threadId?: string;
  };
  dismissedAtFrame?: number;
}

export interface TeamsDraft {
  key: string;
  text: string;
  updatedAtFrame: number;
}

export interface TeamsTypingState {
  key: string;
  userIds: string[];
  startedAtFrame: number;
}

export type TeamsEntityMaps = {
  users: Record<string, TeamsUser>;
  dms: Record<string, TeamsDm>;
  channels: Record<string, TeamsChannel>;
  threads: Record<string, TeamsThread>;
  messages: Record<string, TeamsMessage>;
  notifications: Record<string, TeamsNotification>;
  calls: Record<string, TeamsCall>;
  drafts: Record<string, TeamsDraft>;
  typing: Record<string, TeamsTypingState>;
};
