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
    timeline_feed: {
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
    reply_composer: {
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
    notifications_list: {
      anchorPoint: { x: 0.5, y: 0.46 },
      paddingPx: 16,
      targetFill: 0.82,
    },
    dm_thread: {
      anchorPoint: { x: 0.5, y: 0.55 },
      paddingPx: 16,
      targetFill: 0.85,
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
