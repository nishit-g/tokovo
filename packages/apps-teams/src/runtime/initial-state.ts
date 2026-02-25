import type { TeamsState } from "../types/index.js";

export function createTeamsInitialState(): TeamsState {
  return {
    viewMode: "FEED",
    screen: "chat_list",
    activeDmId: undefined,
    activeChannelId: undefined,
    activeThreadId: undefined,
    activeCallId: undefined,
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
