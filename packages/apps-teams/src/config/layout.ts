export const TeamsLayoutConfig = {
  rowHeights: {
    dmListRow: 72,
    channelRow: 56,
    messageRow: 52,
  },
  thread: {
    gutterWidth: 10,
    panelMinWidth: 146,
  },
  unread: {
    markerSize: 8,
    offsetX: 10,
    offsetY: 12,
  },
  callOverlay: {
    height: 58,
    avatarSize: 28,
    controlsGap: 8,
  },
} as const;

export const TeamsInteractionConfig = {
  typingIndicatorCadenceFrames: 12,
  notificationTtlFrames: 180,
  mentionHighlightFrames: 36,
} as const;

export const TeamsPerfConfig = {
  memo: {
    layoutKeyPrefix: "teams-layout",
  },
  listWindow: {
    maxVisibleRows: 60,
  },
} as const;

export const TeamsFeatureFlags = {
  channelsEnabled: true,
  callsEnabled: true,
  mentionsEnabled: true,
  deterministicUi: true,
} as const;
