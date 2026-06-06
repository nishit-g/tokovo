import type { TrackEventBase } from "@tokovo/ir";
import { TEAMS_APP_ID } from "../constants.js";
import type { TeamsMessageTarget } from "../types/messages.js";

type TeamsPresence = "available" | "busy" | "away" | "offline";
type TeamsListFilter = "all" | "unread" | "chat" | "channels" | "meetings" | "muted";
type TeamsCallStatus = "idle" | "ringing" | "active" | "ended";
type TeamsCallMode = "audio" | "video";
type TeamsCallScope = "dm" | "channel" | "thread";
type TeamsNotificationKind = "mention" | "message" | "system";

export interface TeamsOpenChatListPayload {
  filter?: TeamsListFilter;
}

export interface TeamsOpenDmPayload {
  dmId: string;
}

export interface TeamsOpenChannelPayload {
  channelId: string;
}

export interface TeamsOpenThreadPayload {
  channelId: string;
  threadId: string;
}

export interface TeamsMessageSendPayload {
  messageId: string;
  senderId: string;
  senderName?: string;
  text: string;
  target: TeamsMessageTarget;
  mentionedUserIds?: string[];
  replyToMessageId?: string;
  typed?: boolean;
  charDelay?: number;
}

export type TeamsMessageReceivePayload = TeamsMessageSendPayload;

export interface TeamsTypingStartPayload {
  target: TeamsMessageTarget;
  userId: string;
}

export interface TeamsTypingEndPayload {
  target: TeamsMessageTarget;
  userId: string;
}

export interface TeamsDraftSetPayload {
  target: TeamsMessageTarget;
  text: string;
}

export interface TeamsPresenceSetPayload {
  userId: string;
  presence: TeamsPresence;
}

export interface TeamsNotificationPushPayload {
  id: string;
  title: string;
  text: string;
  kind?: TeamsNotificationKind;
  ttlFrames?: number;
  target?: {
    dmId?: string;
    channelId?: string;
    threadId?: string;
  };
}

export interface TeamsNotificationDismissPayload {
  id: string;
}

export interface TeamsCallStartPayload {
  callId: string;
  participantIds: string[];
  status?: TeamsCallStatus;
  mode: TeamsCallMode;
  scope: TeamsCallScope;
  dmId?: string;
  channelId?: string;
  threadId?: string;
  title?: string;
}

export interface TeamsCallUpdatePayload {
  callId: string;
  participantIds?: string[];
  status?: TeamsCallStatus;
  dominantSpeakerId?: string;
  title?: string;
}

export interface TeamsCallEndPayload {
  callId: string;
}

export type TeamsEventMap = {
  TEAMS_OPEN_CHAT_LIST: TeamsOpenChatListPayload;
  TEAMS_OPEN_DM: TeamsOpenDmPayload;
  TEAMS_OPEN_CHANNEL: TeamsOpenChannelPayload;
  TEAMS_OPEN_THREAD: TeamsOpenThreadPayload;
  TEAMS_MESSAGE_SEND: TeamsMessageSendPayload;
  TEAMS_MESSAGE_RECEIVE: TeamsMessageReceivePayload;
  TEAMS_TYPING_START: TeamsTypingStartPayload;
  TEAMS_TYPING_END: TeamsTypingEndPayload;
  TEAMS_DRAFT_SET: TeamsDraftSetPayload;
  TEAMS_PRESENCE_SET: TeamsPresenceSetPayload;
  TEAMS_NOTIFICATION_PUSH: TeamsNotificationPushPayload;
  TEAMS_NOTIFICATION_DISMISS: TeamsNotificationDismissPayload;
  TEAMS_CALL_START: TeamsCallStartPayload;
  TEAMS_CALL_UPDATE: TeamsCallUpdatePayload;
  TEAMS_CALL_END: TeamsCallEndPayload;
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

export const TEAMS_EVENT_TYPES: TeamsEventType[] = [
  "TEAMS_OPEN_CHAT_LIST",
  "TEAMS_OPEN_DM",
  "TEAMS_OPEN_CHANNEL",
  "TEAMS_OPEN_THREAD",
  "TEAMS_MESSAGE_SEND",
  "TEAMS_MESSAGE_RECEIVE",
  "TEAMS_TYPING_START",
  "TEAMS_TYPING_END",
  "TEAMS_DRAFT_SET",
  "TEAMS_PRESENCE_SET",
  "TEAMS_NOTIFICATION_PUSH",
  "TEAMS_NOTIFICATION_DISMISS",
  "TEAMS_CALL_START",
  "TEAMS_CALL_UPDATE",
  "TEAMS_CALL_END",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isTarget(value: unknown): value is TeamsMessageTarget {
  if (!isRecord(value) || !isNonEmptyString(value.kind)) return false;
  if (value.kind === "dm") {
    return isNonEmptyString(value.dmId);
  }
  if (value.kind === "thread") {
    return isNonEmptyString(value.channelId) && isNonEmptyString(value.threadId);
  }
  return false;
}

function hasMessageShape(value: unknown): value is TeamsMessageSendPayload {
  return (
    isRecord(value) &&
    isNonEmptyString(value.messageId) &&
    isNonEmptyString(value.senderId) &&
    isNonEmptyString(value.text) &&
    isTarget(value.target) &&
    (value.senderName === undefined || isNonEmptyString(value.senderName)) &&
    (value.mentionedUserIds === undefined || isStringArray(value.mentionedUserIds)) &&
    (value.replyToMessageId === undefined || isNonEmptyString(value.replyToMessageId)) &&
    (value.typed === undefined || typeof value.typed === "boolean") &&
    (value.charDelay === undefined || isNumber(value.charDelay))
  );
}

function validatePayload(type: TeamsEventType, payload: unknown): boolean {
  if (!isRecord(payload)) return false;

  switch (type) {
    case "TEAMS_OPEN_CHAT_LIST":
      return (
        payload.filter === undefined ||
        ["all", "unread", "chat", "channels", "meetings", "muted"].includes(
          String(payload.filter),
        )
      );
    case "TEAMS_OPEN_DM":
      return isNonEmptyString(payload.dmId);
    case "TEAMS_OPEN_CHANNEL":
      return isNonEmptyString(payload.channelId);
    case "TEAMS_OPEN_THREAD":
      return isNonEmptyString(payload.channelId) && isNonEmptyString(payload.threadId);
    case "TEAMS_MESSAGE_SEND":
    case "TEAMS_MESSAGE_RECEIVE":
      return hasMessageShape(payload);
    case "TEAMS_TYPING_START":
    case "TEAMS_TYPING_END":
      return isTarget(payload.target) && isNonEmptyString(payload.userId);
    case "TEAMS_DRAFT_SET":
      return isTarget(payload.target) && typeof payload.text === "string";
    case "TEAMS_PRESENCE_SET":
      return (
        isNonEmptyString(payload.userId) &&
        ["available", "busy", "away", "offline"].includes(String(payload.presence))
      );
    case "TEAMS_NOTIFICATION_PUSH":
      return (
        isNonEmptyString(payload.id) &&
        isNonEmptyString(payload.title) &&
        isNonEmptyString(payload.text)
      );
    case "TEAMS_NOTIFICATION_DISMISS":
      return isNonEmptyString(payload.id);
    case "TEAMS_CALL_START":
      return (
        isNonEmptyString(payload.callId) &&
        isStringArray(payload.participantIds) &&
        payload.participantIds.length > 0 &&
        ["audio", "video"].includes(String(payload.mode)) &&
        ["dm", "channel", "thread"].includes(String(payload.scope))
      );
    case "TEAMS_CALL_UPDATE":
      return isNonEmptyString(payload.callId);
    case "TEAMS_CALL_END":
      return isNonEmptyString(payload.callId);
    default:
      return false;
  }
}

export function parseTeamsEvent(event: unknown): TeamsTrackEvent | null {
  if (!isRecord(event)) return null;
  if (event.kind !== "APP" || event.appId !== TEAMS_APP_ID) return null;
  if (!isNonEmptyString(event.deviceId) || !isNumber(event.at) || !isNonEmptyString(event.type)) {
    return null;
  }
  if (!TEAMS_EVENT_TYPES.includes(event.type as TeamsEventType)) return null;
  if (!validatePayload(event.type as TeamsEventType, event.payload)) return null;
  return event as unknown as TeamsTrackEvent;
}

export function isTeamsEvent(event: unknown): event is TeamsTrackEvent {
  return parseTeamsEvent(event) !== null;
}
