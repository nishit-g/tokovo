import type { PluginAnchorRegistry } from "@tokovo/core";

export const xAnchors: PluginAnchorRegistry = {
  providers: {
    default: () => null,
  },
  framing: {
    timeline_header: {
      anchorPoint: { x: 0.5, y: 0.08 },
      paddingPx: 8,
      targetFill: 0.9,
    },
    timeline_tabs: {
      anchorPoint: { x: 0.5, y: 0.14 },
      paddingPx: 10,
      targetFill: 0.9,
    },
    timeline_feed: {
      anchorPoint: { x: 0.5, y: 0.45 },
      paddingPx: 16,
      targetFill: 0.82,
    },
    timeline: {
      anchorPoint: { x: 0.5, y: 0.45 },
      paddingPx: 16,
      targetFill: 0.82,
    },
    tweet_card: {
      anchorPoint: { x: 0.5, y: 0.4 },
      paddingPx: 14,
      targetFill: 0.8,
    },
    metrics_row: {
      anchorPoint: { x: 0.5, y: 0.62 },
      paddingPx: 12,
      targetFill: 0.7,
    },
    timeline_primary_row: {
      anchorPoint: { x: 0.5, y: 0.36 },
      paddingPx: 12,
      targetFill: 0.78,
    },
    timeline_primary_avatar: {
      anchorPoint: { x: 0.22, y: 0.31 },
      paddingPx: 8,
      targetFill: 0.36,
    },
    timeline_primary_content: {
      anchorPoint: { x: 0.58, y: 0.36 },
      paddingPx: 12,
      targetFill: 0.74,
    },
    timeline_primary_media: {
      anchorPoint: { x: 0.56, y: 0.44 },
      paddingPx: 10,
      targetFill: 0.72,
    },
    timeline_primary_actions: {
      anchorPoint: { x: 0.56, y: 0.55 },
      paddingPx: 10,
      targetFill: 0.7,
    },
    reply_composer: {
      anchorPoint: { x: 0.5, y: 0.78 },
      paddingPx: 10,
      targetFill: 0.7,
    },
    composer: {
      anchorPoint: { x: 0.5, y: 0.78 },
      paddingPx: 10,
      targetFill: 0.7,
    },
    compose_fab: {
      anchorPoint: { x: 0.82, y: 0.86 },
      paddingPx: 8,
      targetFill: 0.2,
    },
    profile_header: {
      anchorPoint: { x: 0.5, y: 0.22 },
      paddingPx: 10,
      targetFill: 0.88,
    },
    profile_banner: {
      anchorPoint: { x: 0.5, y: 0.24 },
      paddingPx: 8,
      targetFill: 0.82,
    },
    profile_avatar: {
      anchorPoint: { x: 0.26, y: 0.34 },
      paddingPx: 8,
      targetFill: 0.5,
    },
    profile_tabs: {
      anchorPoint: { x: 0.5, y: 0.46 },
      paddingPx: 10,
      targetFill: 0.82,
    },
    notifications_list: {
      anchorPoint: { x: 0.5, y: 0.46 },
      paddingPx: 16,
      targetFill: 0.82,
    },
    notifications_row_0: {
      anchorPoint: { x: 0.5, y: 0.24 },
      paddingPx: 10,
      targetFill: 0.75,
    },
    notification_card: {
      anchorPoint: { x: 0.5, y: 0.24 },
      paddingPx: 10,
      targetFill: 0.75,
    },
    notifications_row_0_avatar: {
      anchorPoint: { x: 0.24, y: 0.24 },
      paddingPx: 8,
      targetFill: 0.36,
    },
    notifications_row_0_content: {
      anchorPoint: { x: 0.62, y: 0.24 },
      paddingPx: 10,
      targetFill: 0.66,
    },
    dm_thread: {
      anchorPoint: { x: 0.5, y: 0.55 },
      paddingPx: 16,
      targetFill: 0.85,
    },
    dm_row_0: {
      anchorPoint: { x: 0.5, y: 0.24 },
      paddingPx: 10,
      targetFill: 0.76,
    },
    dm_row_0_avatar: {
      anchorPoint: { x: 0.22, y: 0.24 },
      paddingPx: 8,
      targetFill: 0.35,
    },
    dm_row_0_content: {
      anchorPoint: { x: 0.6, y: 0.24 },
      paddingPx: 10,
      targetFill: 0.68,
    },
    tweet_detail_header: {
      anchorPoint: { x: 0.5, y: 0.22 },
      paddingPx: 10,
      targetFill: 0.78,
    },
    tweet_detail_body: {
      anchorPoint: { x: 0.5, y: 0.33 },
      paddingPx: 10,
      targetFill: 0.76,
    },
    tweet_detail_media: {
      anchorPoint: { x: 0.5, y: 0.46 },
      paddingPx: 10,
      targetFill: 0.74,
    },
    tweet_detail_quote: {
      anchorPoint: { x: 0.5, y: 0.58 },
      paddingPx: 10,
      targetFill: 0.72,
    },
    thread_header: {
      anchorPoint: { x: 0.5, y: 0.1 },
      paddingPx: 8,
      targetFill: 0.9,
    },
    dm_message_latest: {
      anchorPoint: { x: 0.5, y: 0.68 },
      paddingPx: 10,
      targetFill: 0.74,
    },
    reply_input: {
      anchorPoint: { x: 0.42, y: 0.84 },
      paddingPx: 8,
      targetFill: 0.65,
    },
    reply_send_button: {
      anchorPoint: { x: 0.82, y: 0.84 },
      paddingPx: 8,
      targetFill: 0.42,
    },
    compose_header: {
      anchorPoint: { x: 0.5, y: 0.1 },
      paddingPx: 8,
      targetFill: 0.9,
    },
    compose_editor: {
      anchorPoint: { x: 0.5, y: 0.42 },
      paddingPx: 12,
      targetFill: 0.78,
    },
    compose_footer: {
      anchorPoint: { x: 0.5, y: 0.86 },
      paddingPx: 8,
      targetFill: 0.72,
    },
    nav_bar: {
      anchorPoint: { x: 0.5, y: 0.95 },
      paddingPx: 8,
      targetFill: 0.6,
    },
    device: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 0,
      targetFill: 1.0,
    },
  },
};
