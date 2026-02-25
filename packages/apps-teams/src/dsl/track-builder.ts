import { parseTimeToFrames } from "@tokovo/dsl";
import { TEAMS_APP_ID, TEAMS_SCREENS } from "../constants.js";
import { TeamsDslError } from "../errors.js";
import type { TeamsTrackEvent } from "../types/index.js";

type GetDeclarationOrder = () => number;

function createMessageId(prefix: string, frame: number, order: number): string {
  return `${prefix}_${frame}_${order}`;
}

function requireNonEmpty(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new TeamsDslError(`[teams-dsl] ${field} is required`);
  }
  return trimmed;
}

export class TeamsPointBuilder {
  constructor(
    private readonly _frame: number,
    private readonly _deviceId: string,
    private readonly _events: TeamsTrackEvent[],
    private readonly _getOrder: GetDeclarationOrder,
  ) {}

  private push<T extends TeamsTrackEvent["type"]>(
    type: T,
    payload: Extract<TeamsTrackEvent, { type: T }>["payload"],
  ): void {
    this._events.push({
      at: this._frame,
      kind: "APP",
      appId: TEAMS_APP_ID,
      deviceId: this._deviceId,
      type,
      payload,
      _declarationOrder: this._getOrder(),
    } as TeamsTrackEvent);
  }

  dmSend(input: {
    dmId: string;
    senderId: string;
    senderName: string;
    text: string;
    messageId?: string;
    typed?: boolean;
    charDelay?: number;
  }): void {
    const order = this._getOrder();
    this.push("TEAMS_DM_SEND", {
      ...input,
      dmId: requireNonEmpty(input.dmId, "dmId"),
      senderId: requireNonEmpty(input.senderId, "senderId"),
      senderName: requireNonEmpty(input.senderName, "senderName"),
      text: requireNonEmpty(input.text, "text"),
      messageId: input.messageId ?? createMessageId("dm", this._frame, order),
    });
  }

  dmReceive(input: {
    dmId: string;
    fromId: string;
    fromName: string;
    text: string;
    messageId?: string;
  }): void {
    const order = this._getOrder();
    this.push("TEAMS_DM_RECEIVE", {
      ...input,
      dmId: requireNonEmpty(input.dmId, "dmId"),
      fromId: requireNonEmpty(input.fromId, "fromId"),
      fromName: requireNonEmpty(input.fromName, "fromName"),
      text: requireNonEmpty(input.text, "text"),
      messageId: input.messageId ?? createMessageId("dm", this._frame, order),
    });
  }

  channelPost(input: {
    channelId: string;
    threadId: string;
    senderId: string;
    senderName: string;
    text: string;
    messageId?: string;
    typed?: boolean;
    charDelay?: number;
  }): void {
    const order = this._getOrder();
    this.push("TEAMS_CHANNEL_POST", {
      ...input,
      channelId: requireNonEmpty(input.channelId, "channelId"),
      threadId: requireNonEmpty(input.threadId, "threadId"),
      senderId: requireNonEmpty(input.senderId, "senderId"),
      senderName: requireNonEmpty(input.senderName, "senderName"),
      text: requireNonEmpty(input.text, "text"),
      messageId: input.messageId ?? createMessageId("ch", this._frame, order),
    });
  }

  channelReply(input: {
    channelId: string;
    threadId: string;
    senderId: string;
    senderName: string;
    text: string;
    messageId?: string;
    typed?: boolean;
    charDelay?: number;
  }): void {
    const order = this._getOrder();
    this.push("TEAMS_CHANNEL_REPLY", {
      ...input,
      channelId: requireNonEmpty(input.channelId, "channelId"),
      threadId: requireNonEmpty(input.threadId, "threadId"),
      senderId: requireNonEmpty(input.senderId, "senderId"),
      senderName: requireNonEmpty(input.senderName, "senderName"),
      text: requireNonEmpty(input.text, "text"),
      messageId: input.messageId ?? createMessageId("th", this._frame, order),
    });
  }

  openThread(channelId: string, threadId: string): void {
    this.push("TEAMS_THREAD_OPEN", {
      channelId: requireNonEmpty(channelId, "channelId"),
      threadId: requireNonEmpty(threadId, "threadId"),
    });
  }

  closeThread(threadId: string): void {
    this.push("TEAMS_THREAD_CLOSE", { threadId: requireNonEmpty(threadId, "threadId") });
  }

  setPresence(userId: string, presence: "available" | "busy" | "away" | "offline"): void {
    this.push("TEAMS_PRESENCE_SET", { userId: requireNonEmpty(userId, "userId"), presence });
  }

  mention(
    threadId: string,
    messageId: string,
    targetUserId: string,
    targetType: "user" | "team" = "user",
  ): void {
    this.push("TEAMS_MENTION_ADD", {
      threadId: requireNonEmpty(threadId, "threadId"),
      messageId: requireNonEmpty(messageId, "messageId"),
      targetUserId: requireNonEmpty(targetUserId, "targetUserId"),
      targetType,
    });
  }

  startCall(input: {
    callId: string;
    participantIds: string[];
    scope: "dm" | "channel";
    dmId?: string;
    channelId?: string;
  }): void {
    if (input.scope === "dm" && !input.dmId) {
      throw new TeamsDslError("[teams-dsl] dmId is required when scope='dm'");
    }
    if (input.scope === "channel" && !input.channelId) {
      throw new TeamsDslError("[teams-dsl] channelId is required when scope='channel'");
    }
    if (input.participantIds.length === 0) {
      throw new TeamsDslError("[teams-dsl] participantIds must include at least one participant");
    }
    this.push("TEAMS_CALL_START", {
      ...input,
      callId: requireNonEmpty(input.callId, "callId"),
      participantIds: input.participantIds,
    });
  }

  endCall(callId: string): void {
    this.push("TEAMS_CALL_END", { callId: requireNonEmpty(callId, "callId") });
  }

  notify(id: string, text: string, ttlFrames?: number): void {
    this.push("TEAMS_NOTIFICATION_PUSH", {
      id: requireNonEmpty(id, "notification.id"),
      text: requireNonEmpty(text, "notification.text"),
      ttlFrames,
    });
  }

  switchDm(dmId: string): void {
    const normalized = requireNonEmpty(dmId, "dmId");
    this.push("TEAMS_SET_ACTIVE_CHAT", { dmId: normalized });
    this.push("TEAMS_NAVIGATE_SCREEN", { screen: TEAMS_SCREENS.DM_THREAD });
  }

  switchChannel(channelId: string, threadId?: string): void {
    const normalizedChannel = requireNonEmpty(channelId, "channelId");
    const normalizedThread = threadId?.trim() ? threadId.trim() : undefined;
    this.push("TEAMS_SET_ACTIVE_CHANNEL", { channelId: normalizedChannel, threadId: normalizedThread });
    this.push("TEAMS_NAVIGATE_SCREEN", {
      screen: normalizedThread ? TEAMS_SCREENS.CHANNEL_THREAD : TEAMS_SCREENS.CHANNEL_FEED,
    });
  }

  openChatList(): void {
    this.push("TEAMS_NAVIGATE_SCREEN", { screen: TEAMS_SCREENS.CHAT_LIST });
  }
}

export class TeamsTrackBuilder {
  readonly _events: TeamsTrackEvent[] = [];

  constructor(
    private readonly _fps: number,
    private readonly _deviceId: string,
    private readonly _getOrder: GetDeclarationOrder,
  ) {}

  at(time: string | number): TeamsPointBuilder {
    const frame = typeof time === "number" ? time : parseTimeToFrames(time, this._fps);
    return new TeamsPointBuilder(frame, this._deviceId, this._events, this._getOrder);
  }

  span(start: string | number, _end: string | number): TeamsPointBuilder {
    const frame = typeof start === "number" ? start : parseTimeToFrames(start, this._fps);
    return new TeamsPointBuilder(frame, this._deviceId, this._events, this._getOrder);
  }

  openChatList(time: string | number): this {
    this.at(time).openChatList();
    return this;
  }

  switchDm(dmId: string, time: string | number): this {
    this.at(time).switchDm(dmId);
    return this;
  }

  switchChannel(channelId: string, time: string | number, threadId?: string): this {
    this.at(time).switchChannel(channelId, threadId);
    return this;
  }
}

export function createTeamsTrackBuilder(
  fps: number,
  deviceId: string,
  getOrder: GetDeclarationOrder,
): TeamsTrackBuilder {
  return new TeamsTrackBuilder(fps, deviceId, getOrder);
}
