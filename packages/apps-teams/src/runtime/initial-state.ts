import type { TeamsState } from "../types/index.js";

export function createTeamsInitialState(): TeamsState {
  return {
    viewMode: "FEED",
    screen: "chat_list",
    ui: {
      surface: "chat_list",
      activeListFilter: "all",
      activeTab: "chat",
      notificationIds: [],
    },
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
    drafts: {},
    typing: {},
    presence: {},
    calls: {},
  };
}
