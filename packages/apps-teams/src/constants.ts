export const TEAMS_APP_ID = "app_teams" as const;
export const TEAMS_VERSION = "2.0.0" as const;
export const TEAMS_DISPLAY_NAME = "Microsoft Teams" as const;
export const TEAMS_DEFAULT_DEVICE_WIDTH = 393 as const;
export const TEAMS_DEFAULT_DEVICE_HEIGHT = 852 as const;
export const TEAMS_SELF_USER_ID = "u_me" as const;

export const TEAMS_SCREENS = {
  CHAT_LIST: "chat_list",
  DM_THREAD: "dm_thread",
  CHANNEL_FEED: "channel_feed",
  CHANNEL_THREAD: "channel_thread",
  CALL_OVERLAY: "call_overlay",
} as const;

export const TEAMS_LIST_FILTERS = {
  ALL: "all",
  UNREAD: "unread",
  CHAT: "chat",
  CHANNELS: "channels",
  MEETINGS: "meetings",
  MUTED: "muted",
} as const;

export const TEAMS_TABS = {
  CHAT: "chat",
  TEAMS: "teams",
  CALENDAR: "calendar",
  CALLS: "calls",
  MORE: "more",
} as const;

export const TEAMS_PRESENCE = {
  AVAILABLE: "available",
  BUSY: "busy",
  AWAY: "away",
  OFFLINE: "offline",
} as const;

export const TEAMS_CALL_STATUS = {
  IDLE: "idle",
  RINGING: "ringing",
  ACTIVE: "active",
  ENDED: "ended",
} as const;

export const TEAMS_CALL_MODES = {
  AUDIO: "audio",
  VIDEO: "video",
} as const;
