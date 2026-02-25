import type { TrackEventBase } from "@tokovo/ir";
import type { TeamsPresence, TeamsScreen } from "./state.js";

export interface TeamsDmSendPayload {
  dmId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  text: string;
  typed?: boolean;
  charDelay?: number;
}

export interface TeamsDmReceivePayload {
  dmId: string;
  messageId: string;
  fromId: string;
  fromName: string;
  text: string;
}

export interface TeamsChannelPostPayload {
  channelId: string;
  threadId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  text: string;
  typed?: boolean;
  charDelay?: number;
}

export interface TeamsChannelReplyPayload {
  channelId: string;
  threadId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  text: string;
  typed?: boolean;
  charDelay?: number;
}

export interface TeamsThreadOpenPayload {
  channelId: string;
  threadId: string;
}

export interface TeamsThreadClosePayload {
  threadId: string;
}

export interface TeamsSetActiveChatPayload {
  dmId: string;
}

export interface TeamsSetActiveChannelPayload {
  channelId: string;
  threadId?: string;
}

export interface TeamsMentionAddPayload {
  threadId: string;
  messageId: string;
  targetUserId: string;
  targetType: "user" | "team";
}

export interface TeamsPresenceSetPayload {
  userId: string;
  presence: TeamsPresence;
}

export interface TeamsCallStartPayload {
  callId: string;
  participantIds: string[];
  scope: "dm" | "channel";
  dmId?: string;
  channelId?: string;
}

export interface TeamsCallEndPayload {
  callId: string;
}

export interface TeamsNotificationPushPayload {
  id: string;
  text: string;
  ttlFrames?: number;
}

export interface TeamsNavigateScreenPayload {
  screen: TeamsScreen;
}

export type TeamsEventMap = {
  TEAMS_DM_SEND: TeamsDmSendPayload;
  TEAMS_DM_RECEIVE: TeamsDmReceivePayload;
  TEAMS_CHANNEL_POST: TeamsChannelPostPayload;
  TEAMS_CHANNEL_REPLY: TeamsChannelReplyPayload;
  TEAMS_THREAD_OPEN: TeamsThreadOpenPayload;
  TEAMS_THREAD_CLOSE: TeamsThreadClosePayload;
  TEAMS_SET_ACTIVE_CHAT: TeamsSetActiveChatPayload;
  TEAMS_SET_ACTIVE_CHANNEL: TeamsSetActiveChannelPayload;
  TEAMS_MENTION_ADD: TeamsMentionAddPayload;
  TEAMS_PRESENCE_SET: TeamsPresenceSetPayload;
  TEAMS_CALL_START: TeamsCallStartPayload;
  TEAMS_CALL_END: TeamsCallEndPayload;
  TEAMS_NOTIFICATION_PUSH: TeamsNotificationPushPayload;
  TEAMS_NAVIGATE_SCREEN: TeamsNavigateScreenPayload;
};

export type TeamsEventType = keyof TeamsEventMap;

export type TeamsTrackEvent = TrackEventBase & {
  kind: "APP";
  appId: "app_teams";
  deviceId: string;
} & {
  [K in TeamsEventType]: {
    type: K;
    payload: TeamsEventMap[K];
  };
}[TeamsEventType];

export function isTeamsEvent(event: unknown): event is TeamsTrackEvent {
  return (
    typeof event === "object" &&
    event !== null &&
    (event as { kind?: string }).kind === "APP" &&
    (event as { appId?: string }).appId === "app_teams"
  );
}
