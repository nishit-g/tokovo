import { TEAMS_SELF_USER_ID, TEAMS_SCREENS, TEAMS_TABS } from "../constants.js";
import type {
  TeamsChannel,
  TeamsDm,
  TeamsMessageTarget,
  TeamsState,
  TeamsThread,
  TeamsUser,
} from "../types/index.js";

export function syncViewMode(state: TeamsState): void {
  switch (state.screen) {
    case TEAMS_SCREENS.DM_THREAD:
    case TEAMS_SCREENS.CHANNEL_THREAD:
      state.viewMode = "CHAT";
      state.ui.activeTab = TEAMS_TABS.CHAT;
      break;
    case TEAMS_SCREENS.CALL_OVERLAY:
      state.viewMode = "FULLSCREEN";
      state.ui.activeTab = TEAMS_TABS.CALLS;
      break;
    case TEAMS_SCREENS.CHANNEL_FEED:
    case TEAMS_SCREENS.CHAT_LIST:
    default:
      state.viewMode = "FEED";
      state.ui.activeTab = TEAMS_TABS.CHAT;
      break;
  }
  state.ui.surface = state.screen;
}

export function setSurface(state: TeamsState, screen: TeamsState["screen"]): void {
  state.screen = screen;
  state.ui.surface = screen;
  syncViewMode(state);
}

export function ensureUser(
  state: TeamsState,
  input: Partial<TeamsUser> & { id: string },
): TeamsUser {
  const existing = state.users[input.id];
  if (existing) {
    Object.assign(existing, input);
    existing.displayName ||= input.id;
    return existing;
  }

  const created: TeamsUser = {
    id: input.id,
    displayName: input.displayName ?? input.id,
    shortName: input.shortName,
    avatar: input.avatar,
    role: input.role,
    headline: input.headline,
  };
  state.users[input.id] = created;
  return created;
}

export function ensureDm(
  state: TeamsState,
  dmId: string,
  participantIds: string[] = [],
): TeamsDm {
  if (!state.dms[dmId]) {
    state.dms[dmId] = {
      id: dmId,
      participantIds,
      messageIds: [],
      unreadCount: 0,
      mentionCount: 0,
    };
  }
  const dm = state.dms[dmId];
  if (participantIds.length > 0) {
    dm.participantIds = [...new Set([...dm.participantIds, ...participantIds])];
  }
  return dm;
}

export function ensureChannel(
  state: TeamsState,
  channelId: string,
  name = channelId,
): TeamsChannel {
  if (!state.channels[channelId]) {
    state.channels[channelId] = {
      id: channelId,
      name,
      memberIds: [],
      threadIds: [],
      unreadCount: 0,
      mentionCount: 0,
    };
  }
  return state.channels[channelId];
}

export function ensureThread(
  state: TeamsState,
  threadId: string,
  options: Partial<TeamsThread> = {},
): TeamsThread {
  if (!state.threads[threadId]) {
    state.threads[threadId] = {
      id: threadId,
      channelId: options.channelId,
      dmId: options.dmId,
      title: options.title ?? threadId,
      participantIds: options.participantIds ?? [],
      messageIds: [],
      unreadCount: options.unreadCount ?? 0,
      mentionCount: options.mentionCount ?? 0,
      replyCount: 0,
      typingUserIds: [],
      state: options.state ?? "open",
    };
  }
  const thread = state.threads[threadId];
  if (options.channelId) thread.channelId = options.channelId;
  if (options.dmId) thread.dmId = options.dmId;
  if (options.title) thread.title = options.title;
  if (options.participantIds && options.participantIds.length > 0) {
    thread.participantIds = [...new Set([...thread.participantIds, ...options.participantIds])];
  }
  return thread;
}

export function targetKey(target: TeamsMessageTarget): string {
  return target.kind === "dm"
    ? `dm:${target.dmId}`
    : `thread:${target.channelId}:${target.threadId}`;
}

export function isTargetActive(state: TeamsState, target: TeamsMessageTarget): boolean {
  if (target.kind === "dm") {
    return state.screen === TEAMS_SCREENS.DM_THREAD && state.activeDmId === target.dmId;
  }
  return (
    state.screen === TEAMS_SCREENS.CHANNEL_THREAD &&
    state.activeChannelId === target.channelId &&
    state.activeThreadId === target.threadId
  );
}

export function getTargetThreadId(target: TeamsMessageTarget): string {
  return target.kind === "dm" ? target.dmId : target.threadId;
}

export function setActiveDm(state: TeamsState, dmId: string): void {
  state.activeDmId = dmId;
  state.activeChannelId = undefined;
  state.activeThreadId = undefined;
  ensureDm(state, dmId);
  state.dms[dmId].unreadCount = 0;
  state.dms[dmId].mentionCount = 0;
  setSurface(state, TEAMS_SCREENS.DM_THREAD);
}

export function setActiveChannel(state: TeamsState, channelId: string): void {
  state.activeChannelId = channelId;
  state.activeDmId = undefined;
  state.activeThreadId = undefined;
  ensureChannel(state, channelId);
  state.channels[channelId].unreadCount = 0;
  state.channels[channelId].mentionCount = 0;
  setSurface(state, TEAMS_SCREENS.CHANNEL_FEED);
}

export function setActiveThread(
  state: TeamsState,
  channelId: string,
  threadId: string,
): void {
  ensureChannel(state, channelId);
  ensureThread(state, threadId, { channelId });
  const channel = state.channels[channelId];
  if (!channel.threadIds.includes(threadId)) {
    channel.threadIds.push(threadId);
  }
  state.activeChannelId = channelId;
  state.activeThreadId = threadId;
  state.activeDmId = undefined;
  channel.unreadCount = 0;
  channel.mentionCount = 0;
  state.threads[threadId].unreadCount = 0;
  state.threads[threadId].mentionCount = 0;
  setSurface(state, TEAMS_SCREENS.CHANNEL_THREAD);
}

export function setChatList(state: TeamsState, filter?: TeamsState["ui"]["activeListFilter"]): void {
  state.activeDmId = undefined;
  state.activeChannelId = undefined;
  state.activeThreadId = undefined;
  if (filter) {
    state.ui.activeListFilter = filter;
  }
  setSurface(state, TEAMS_SCREENS.CHAT_LIST);
}

export function defaultSenderName(state: TeamsState, senderId: string, explicit?: string): string {
  if (explicit) return explicit;
  if (senderId === TEAMS_SELF_USER_ID) return "You";
  return state.users[senderId]?.displayName ?? senderId;
}
