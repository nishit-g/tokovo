import type { TeamsMessage } from "./messages.js";

export interface TeamsUser {
  id: string;
  displayName: string;
  avatar?: string;
}

export interface TeamsDm {
  id: string;
  participantIds: string[];
  messageIds: string[];
  unreadCount: number;
}

export interface TeamsChannel {
  id: string;
  name: string;
  memberIds: string[];
  threadIds: string[];
  unreadCount: number;
}

export interface TeamsThread {
  id: string;
  channelId?: string;
  dmId?: string;
  messageIds: string[];
  topic?: string;
}

export interface TeamsCall {
  id: string;
  participantIds: string[];
  status: "idle" | "ringing" | "active" | "ended";
  startedAtFrame?: number;
  endedAtFrame?: number;
}

export interface TeamsNotification {
  id: string;
  text: string;
  appId: "app_teams";
  createdAtFrame: number;
  expiresAtFrame: number;
}

export type TeamsEntityMaps = {
  users: Record<string, TeamsUser>;
  dms: Record<string, TeamsDm>;
  channels: Record<string, TeamsChannel>;
  threads: Record<string, TeamsThread>;
  messages: Record<string, TeamsMessage>;
  notifications: Record<string, TeamsNotification>;
};
