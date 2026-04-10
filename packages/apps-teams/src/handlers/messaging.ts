import { TEAMS_SELF_USER_ID } from "../constants.js";
import type {
  TeamsDraftSetPayload,
  TeamsMessage,
  TeamsMessageReceivePayload,
  TeamsMessageSendPayload,
  TeamsState,
  TeamsTypingEndPayload,
  TeamsTypingStartPayload,
} from "../types/index.js";
import {
  defaultSenderName,
  ensureChannel,
  ensureDm,
  ensureThread,
  getTargetThreadId,
  isTargetActive,
  targetKey,
} from "./shared.js";

function syncDraftOnEntity(state: TeamsState, key: string, text: string): void {
  if (key.startsWith("dm:")) {
    const dmId = key.slice(3);
    const dm = state.dms[dmId];
    if (dm) {
      dm.draftText = text;
    }
    return;
  }

  const [, , threadId] = key.split(":");
  if (threadId && state.threads[threadId]) {
    state.threads[threadId].draftText = text;
  }
}

function recordMessage(
  state: TeamsState,
  payload: TeamsMessageSendPayload | TeamsMessageReceivePayload,
  direction: "send" | "receive",
  at: number,
): void {
  const target = payload.target;
  const threadId = getTargetThreadId(target);
  const key = targetKey(target);
  const senderId = payload.senderId;
  const senderName = defaultSenderName(state, senderId, payload.senderName);
  const mentionedUserIds = payload.mentionedUserIds ?? [];
  const isFromMe = senderId === TEAMS_SELF_USER_ID;

  if (target.kind === "dm") {
    const dm = ensureDm(state, target.dmId, [senderId, TEAMS_SELF_USER_ID]);
    dm.lastMessageId = payload.messageId;
  } else {
    const channel = ensureChannel(state, target.channelId, target.channelId);
    const thread = ensureThread(state, threadId, {
      channelId: target.channelId,
      title: state.threads[threadId]?.title ?? threadId,
      participantIds: [senderId, TEAMS_SELF_USER_ID],
    });
    if (!channel.threadIds.includes(threadId)) {
      channel.threadIds.push(threadId);
    }
    thread.replyCount += 1;
    thread.lastActivityFrame = at;
    channel.lastActivityFrame = at;
  }

  const message: TeamsMessage = {
    id: payload.messageId,
    target,
    threadId,
    channelId: target.kind === "thread" ? target.channelId : undefined,
    dmId: target.kind === "dm" ? target.dmId : undefined,
    senderId,
    senderName,
    text: payload.text,
    kind: "text",
    status: isFromMe && direction === "send" ? "sent" : "delivered",
    createdAtFrame: at,
    replyToMessageId: payload.replyToMessageId,
    mentionedUserIds,
    isFromMe,
  };

  state.messages[payload.messageId] = message;

  if (target.kind === "dm") {
    const dm = state.dms[target.dmId];
    if (!dm.messageIds.includes(payload.messageId)) {
      dm.messageIds.push(payload.messageId);
    }
    dm.lastMessageId = payload.messageId;
    if (direction === "receive" && !isTargetActive(state, target)) {
      dm.unreadCount += 1;
      if (mentionedUserIds.includes(TEAMS_SELF_USER_ID)) {
        dm.mentionCount += 1;
      }
    } else {
      dm.unreadCount = 0;
      dm.mentionCount = 0;
    }
  } else {
    const channel = state.channels[target.channelId];
    const thread = state.threads[target.threadId];
    if (!thread.messageIds.includes(payload.messageId)) {
      thread.messageIds.push(payload.messageId);
    }
    thread.lastActivityFrame = at;
    channel.lastActivityFrame = at;
    if (direction === "receive" && !isTargetActive(state, target)) {
      channel.unreadCount += 1;
      thread.unreadCount += 1;
      if (mentionedUserIds.includes(TEAMS_SELF_USER_ID)) {
        channel.mentionCount += 1;
        thread.mentionCount += 1;
      }
    } else {
      channel.unreadCount = 0;
      channel.mentionCount = 0;
      thread.unreadCount = 0;
      thread.mentionCount = 0;
    }
  }

  if (direction === "send" && state.drafts[key]) {
    state.drafts[key].text = "";
    syncDraftOnEntity(state, key, "");
  }
}

export function handleMessageSend(
  state: TeamsState,
  payload: TeamsMessageSendPayload,
  at: number,
): void {
  recordMessage(state, payload, "send", at);
}

export function handleMessageReceive(
  state: TeamsState,
  payload: TeamsMessageReceivePayload,
  at: number,
): void {
  recordMessage(state, payload, "receive", at);
}

export function handleTypingStart(
  state: TeamsState,
  payload: TeamsTypingStartPayload,
  at: number,
): void {
  const key = targetKey(payload.target);
  const typing = state.typing[key] ?? {
    key,
    userIds: [],
    startedAtFrame: at,
  };
  if (!typing.userIds.includes(payload.userId)) {
    typing.userIds.push(payload.userId);
  }
  typing.startedAtFrame = at;
  state.typing[key] = typing;

  if (payload.target.kind === "thread") {
    const thread = ensureThread(state, payload.target.threadId, {
      channelId: payload.target.channelId,
    });
    if (!thread.typingUserIds.includes(payload.userId)) {
      thread.typingUserIds.push(payload.userId);
    }
  }
}

export function handleTypingEnd(state: TeamsState, payload: TeamsTypingEndPayload): void {
  const key = targetKey(payload.target);
  const typing = state.typing[key];
  if (typing) {
    typing.userIds = typing.userIds.filter((id) => id !== payload.userId);
  }

  if (payload.target.kind === "thread") {
    const thread = state.threads[payload.target.threadId];
    if (thread) {
      thread.typingUserIds = thread.typingUserIds.filter((id) => id !== payload.userId);
    }
  }
}

export function handleDraftSet(
  state: TeamsState,
  payload: TeamsDraftSetPayload,
  at: number,
): void {
  const key = targetKey(payload.target);
  if (payload.target.kind === "dm") {
    ensureDm(state, payload.target.dmId).draftText = payload.text;
  } else {
    ensureThread(state, payload.target.threadId, {
      channelId: payload.target.channelId,
    }).draftText = payload.text;
  }
  state.drafts[key] = {
    key,
    text: payload.text,
    updatedAtFrame: at,
  };
  syncDraftOnEntity(state, key, payload.text);
}
