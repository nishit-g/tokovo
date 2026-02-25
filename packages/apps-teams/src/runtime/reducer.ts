import type { PluginReducer, WorldState } from "@tokovo/core";
import { TEAMS_APP_ID } from "../constants.js";
import type { TeamsDm, TeamsThread, TeamsState, TeamsTrackEvent } from "../types/index.js";

function isTeamsAppEvent(event: unknown): event is TeamsTrackEvent {
  if (!event || typeof event !== "object") return false;
  const maybe = event as { kind?: string; appId?: string; type?: string; payload?: unknown };
  return (
    maybe.kind === "APP" &&
    maybe.appId === TEAMS_APP_ID &&
    typeof maybe.type === "string" &&
    maybe.payload !== undefined
  );
}

function createInitialTeamsState(): TeamsState {
  return {
    viewMode: "FEED",
    screen: "chat_list",
    users: {},
    dms: {},
    channels: {},
    threads: {},
    messages: {},
    notifications: {},
    presence: {},
    calls: {},
  };
}

function syncViewMode(state: TeamsState): void {
  switch (state.screen) {
    case "dm_thread":
    case "channel_thread":
      state.viewMode = "CHAT";
      return;
    case "call_overlay":
      state.viewMode = "FULLSCREEN";
      return;
    case "chat_list":
    case "channel_feed":
    default:
      state.viewMode = "FEED";
      return;
  }
}

function getState(draft: WorldState): TeamsState {
  if (!draft.appState[TEAMS_APP_ID]) {
    draft.appState[TEAMS_APP_ID] = createInitialTeamsState();
  }
  const state = draft.appState[TEAMS_APP_ID] as TeamsState;
  syncViewMode(state);
  return state;
}

function ensureDm(state: TeamsState, dmId: string): TeamsDm {
  if (!state.dms[dmId]) {
    state.dms[dmId] = {
      id: dmId,
      participantIds: [],
      messageIds: [],
      unreadCount: 0,
    };
  }
  return state.dms[dmId] as TeamsDm;
}

function ensureThread(state: TeamsState, threadId: string): TeamsThread {
  if (!state.threads[threadId]) {
    state.threads[threadId] = {
      id: threadId,
      messageIds: [],
    };
  }
  return state.threads[threadId] as TeamsThread;
}

function ensureChannel(state: TeamsState, channelId: string): void {
  if (!state.channels[channelId]) {
    state.channels[channelId] = {
      id: channelId,
      name: channelId,
      memberIds: [],
      threadIds: [],
      unreadCount: 0,
    };
  }
}

function pushMessageId(target: { messageIds: string[] }, messageId: string): void {
  if (!target.messageIds.includes(messageId)) {
    target.messageIds.push(messageId);
  }
}

export const teamsReducer: PluginReducer<typeof TEAMS_APP_ID> = (
  draft,
  event,
): void => {
  if (!isTeamsAppEvent(event)) return;
  const state = getState(draft);

  switch (event.type) {
    case "TEAMS_NAVIGATE_SCREEN": {
      state.screen = event.payload.screen;
      syncViewMode(state);
      return;
    }
    case "TEAMS_SET_ACTIVE_CHAT": {
      ensureDm(state, event.payload.dmId);
      state.activeDmId = event.payload.dmId;
      state.screen = "dm_thread";
      syncViewMode(state);
      return;
    }
    case "TEAMS_SET_ACTIVE_CHANNEL": {
      ensureChannel(state, event.payload.channelId);
      state.activeChannelId = event.payload.channelId;
      state.activeThreadId = event.payload.threadId;
      state.screen = event.payload.threadId ? "channel_thread" : "channel_feed";
      syncViewMode(state);
      return;
    }
    case "TEAMS_DM_SEND": {
      const dm = ensureDm(state, event.payload.dmId);
      state.messages[event.payload.messageId] = {
        id: event.payload.messageId,
        threadId: event.payload.dmId,
        senderId: event.payload.senderId,
        senderName: event.payload.senderName,
        text: event.payload.text,
        kind: "text",
        createdAtFrame: event.at,
      };
      pushMessageId(dm, event.payload.messageId);
      return;
    }
    case "TEAMS_DM_RECEIVE": {
      const dm = ensureDm(state, event.payload.dmId);
      state.messages[event.payload.messageId] = {
        id: event.payload.messageId,
        threadId: event.payload.dmId,
        senderId: event.payload.fromId,
        senderName: event.payload.fromName,
        text: event.payload.text,
        kind: "text",
        createdAtFrame: event.at,
      };
      pushMessageId(dm, event.payload.messageId);
      if (state.activeDmId !== event.payload.dmId) {
        dm.unreadCount += 1;
      }
      return;
    }
    case "TEAMS_CHANNEL_POST":
    case "TEAMS_CHANNEL_REPLY": {
      ensureChannel(state, event.payload.channelId);
      const thread = ensureThread(state, event.payload.threadId);
      thread.channelId = event.payload.channelId;
      if (!state.channels[event.payload.channelId].threadIds.includes(event.payload.threadId)) {
        state.channels[event.payload.channelId].threadIds.push(event.payload.threadId);
      }
      state.messages[event.payload.messageId] = {
        id: event.payload.messageId,
        threadId: event.payload.threadId,
        senderId: event.payload.senderId,
        senderName: event.payload.senderName,
        text: event.payload.text,
        kind: "text",
        createdAtFrame: event.at,
      };
      pushMessageId(thread, event.payload.messageId);
      return;
    }
    case "TEAMS_THREAD_OPEN": {
      const thread = ensureThread(state, event.payload.threadId);
      thread.channelId = event.payload.channelId;
      state.activeChannelId = event.payload.channelId;
      state.activeThreadId = event.payload.threadId;
      state.screen = "channel_thread";
      syncViewMode(state);
      return;
    }
    case "TEAMS_THREAD_CLOSE": {
      if (state.activeThreadId === event.payload.threadId) {
        state.activeThreadId = undefined;
        state.screen = "channel_feed";
        syncViewMode(state);
      }
      return;
    }
    case "TEAMS_MENTION_ADD": {
      const message = state.messages[event.payload.messageId];
      if (!message) return;
      const ids = message.mentionedUserIds ?? [];
      if (!ids.includes(event.payload.targetUserId)) {
        ids.push(event.payload.targetUserId);
      }
      message.mentionedUserIds = ids;
      return;
    }
    case "TEAMS_PRESENCE_SET": {
      state.presence[event.payload.userId] = event.payload.presence;
      return;
    }
    case "TEAMS_CALL_START": {
      state.calls[event.payload.callId] = {
        id: event.payload.callId,
        participantIds: event.payload.participantIds,
        status: "active",
        startedAtFrame: event.at,
      };
      state.activeCallId = event.payload.callId;
      state.screen = "call_overlay";
      syncViewMode(state);
      return;
    }
    case "TEAMS_CALL_END": {
      const call = state.calls[event.payload.callId];
      if (call) {
        call.status = "ended";
        call.endedAtFrame = event.at;
      }
      if (state.activeCallId === event.payload.callId) {
        state.activeCallId = undefined;
        state.screen = state.activeThreadId ? "channel_thread" : state.activeDmId ? "dm_thread" : "chat_list";
        syncViewMode(state);
      }
      return;
    }
    case "TEAMS_NOTIFICATION_PUSH": {
      state.notifications[event.payload.id] = {
        id: event.payload.id,
        text: event.payload.text,
        appId: TEAMS_APP_ID,
        createdAtFrame: event.at,
        expiresAtFrame: event.at + (event.payload.ttlFrames ?? 180),
      };
      return;
    }
    default:
      return;
  }
};
