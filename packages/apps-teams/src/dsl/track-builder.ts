import { parseTimeToFrames } from "@tokovo/dsl";
import { TEAMS_APP_ID, TEAMS_LIST_FILTERS, TEAMS_SELF_USER_ID } from "../constants.js";
import { TeamsDslError } from "../errors.js";
import type {
  TeamsEventMap,
  TeamsEventType,
  TeamsMessageTarget,
  TeamsTrackEvent,
  TeamsPresence,
} from "../types/index.js";

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

export function dmTarget(dmId: string): TeamsMessageTarget {
  return { kind: "dm", dmId };
}

export function threadTarget(
  channelId: string,
  threadId: string,
): TeamsMessageTarget {
  return { kind: "thread", channelId, threadId };
}

export class TeamsPointBuilderV2 {
  constructor(
    private readonly _frame: number,
    private readonly _deviceId: string,
    private readonly _events: TeamsTrackEvent[],
    private readonly _getOrder: GetDeclarationOrder,
    private readonly _currentUserId: string,
  ) {}

  private push<T extends TeamsEventType>(
    type: T,
    payload: TeamsEventMap[T],
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

  openChatList(
    filter: "all" | "unread" | "chat" | "channels" | "meetings" | "muted" = TEAMS_LIST_FILTERS.ALL,
  ): void {
    this.push("TEAMS_OPEN_CHAT_LIST", { filter });
  }

  openDm(dmId: string): void {
    this.push("TEAMS_OPEN_DM", { dmId: requireNonEmpty(dmId, "dmId") });
  }

  openChannel(channelId: string): void {
    this.push("TEAMS_OPEN_CHANNEL", {
      channelId: requireNonEmpty(channelId, "channelId"),
    });
  }

  openThread(channelId: string, threadId: string): void {
    this.push("TEAMS_OPEN_THREAD", {
      channelId: requireNonEmpty(channelId, "channelId"),
      threadId: requireNonEmpty(threadId, "threadId"),
    });
  }

  sendMessage(input: {
    target: TeamsMessageTarget;
    text: string;
    messageId?: string;
    senderId?: string;
    senderName?: string;
    typed?: boolean;
    charDelay?: number;
    mentionedUserIds?: string[];
    replyToMessageId?: string;
  }): void {
    const order = this._getOrder();
    this.push("TEAMS_MESSAGE_SEND", {
      ...input,
      senderId: input.senderId ?? this._currentUserId,
      text: requireNonEmpty(input.text, "text"),
      messageId: input.messageId ?? createMessageId("teams_send", this._frame, order),
    });
  }

  receiveMessage(input: {
    target: TeamsMessageTarget;
    senderId: string;
    senderName?: string;
    text: string;
    messageId?: string;
    typed?: boolean;
    charDelay?: number;
    mentionedUserIds?: string[];
    replyToMessageId?: string;
  }): void {
    const order = this._getOrder();
    this.push("TEAMS_MESSAGE_RECEIVE", {
      ...input,
      senderId: requireNonEmpty(input.senderId, "senderId"),
      text: requireNonEmpty(input.text, "text"),
      messageId: input.messageId ?? createMessageId("teams_receive", this._frame, order),
    });
  }

  startTyping(target: TeamsMessageTarget, userId: string): void {
    this.push("TEAMS_TYPING_START", {
      target,
      userId: requireNonEmpty(userId, "userId"),
    });
  }

  endTyping(target: TeamsMessageTarget, userId: string): void {
    this.push("TEAMS_TYPING_END", {
      target,
      userId: requireNonEmpty(userId, "userId"),
    });
  }

  setDraft(target: TeamsMessageTarget, text: string): void {
    this.push("TEAMS_DRAFT_SET", { target, text });
  }

  setPresence(userId: string, presence: TeamsPresence): void {
    this.push("TEAMS_PRESENCE_SET", { userId: requireNonEmpty(userId, "userId"), presence });
  }

  startCall(input: {
    callId: string;
    participantIds: string[];
    scope: "dm" | "channel" | "thread";
    dmId?: string;
    channelId?: string;
    threadId?: string;
    mode?: "audio" | "video";
    title?: string;
  }): void {
    if (input.scope === "dm" && !input.dmId) {
      throw new TeamsDslError("[teams-dsl] dmId is required when scope='dm'");
    }
    if ((input.scope === "channel" || input.scope === "thread") && !input.channelId) {
      throw new TeamsDslError("[teams-dsl] channelId is required for channel/thread calls");
    }
    if (input.scope === "thread" && !input.threadId) {
      throw new TeamsDslError("[teams-dsl] threadId is required when scope='thread'");
    }
    if (input.participantIds.length === 0) {
      throw new TeamsDslError("[teams-dsl] participantIds must include at least one participant");
    }
    this.push("TEAMS_CALL_START", {
      ...input,
      callId: requireNonEmpty(input.callId, "callId"),
      participantIds: input.participantIds,
      mode: input.mode ?? "audio",
    });
  }

  updateCall(input: {
    callId: string;
    participantIds?: string[];
    status?: "idle" | "ringing" | "active" | "ended";
    dominantSpeakerId?: string;
    title?: string;
  }): void {
    this.push("TEAMS_CALL_UPDATE", {
      callId: requireNonEmpty(input.callId, "callId"),
      participantIds: input.participantIds,
      status: input.status,
      dominantSpeakerId: input.dominantSpeakerId,
      title: input.title,
    });
  }

  endCall(callId: string): void {
    this.push("TEAMS_CALL_END", { callId: requireNonEmpty(callId, "callId") });
  }

  pushNotification(
    id: string,
    title: string,
    text: string,
    ttlFrames?: number,
    target?: { dmId?: string; channelId?: string; threadId?: string },
    kind: "mention" | "message" | "system" = "system",
  ): void {
    this.push("TEAMS_NOTIFICATION_PUSH", {
      id: requireNonEmpty(id, "notification.id"),
      title: requireNonEmpty(title, "notification.title"),
      text: requireNonEmpty(text, "notification.text"),
      kind,
      ttlFrames,
      target,
    });
  }

  dismissNotification(id: string): void {
    this.push("TEAMS_NOTIFICATION_DISMISS", {
      id: requireNonEmpty(id, "notification.id"),
    });
  }
}

export class TeamsTrackBuilderV2 {
  readonly _events: TeamsTrackEvent[] = [];

  constructor(
    private readonly _fps: number,
    private readonly _deviceId: string,
    private readonly _getOrder: GetDeclarationOrder,
    private readonly _currentUserId = TEAMS_SELF_USER_ID,
  ) {}

  at(time: string | number): TeamsPointBuilderV2 {
    const frame = typeof time === "number" ? time : parseTimeToFrames(time, this._fps);
    return new TeamsPointBuilderV2(
      frame,
      this._deviceId,
      this._events,
      this._getOrder,
      this._currentUserId,
    );
  }

  span(start: string | number, _end: string | number): TeamsPointBuilderV2 {
    const frame = typeof start === "number" ? start : parseTimeToFrames(start, this._fps);
    return new TeamsPointBuilderV2(
      frame,
      this._deviceId,
      this._events,
      this._getOrder,
      this._currentUserId,
    );
  }

  openChatList(
    time: string | number,
    filter: "all" | "unread" | "chat" | "channels" | "meetings" | "muted" = "all",
  ): this {
    this.at(time).openChatList(filter);
    return this;
  }

  openDm(dmId: string, time: string | number): this {
    this.at(time).openDm(dmId);
    return this;
  }

  openChannel(channelId: string, time: string | number): this {
    this.at(time).openChannel(channelId);
    return this;
  }

  openThread(channelId: string, threadId: string, time: string | number): this {
    this.at(time).openThread(channelId, threadId);
    return this;
  }
}

export { TeamsTrackBuilderV2 as TeamsTrackBuilder, TeamsPointBuilderV2 as TeamsPointBuilder };

export function createTeamsTrackBuilder(
  fps: number,
  deviceId: string,
  getOrder: GetDeclarationOrder,
  currentUserId = TEAMS_SELF_USER_ID,
): TeamsTrackBuilderV2 {
  return new TeamsTrackBuilderV2(fps, deviceId, getOrder, currentUserId);
}
