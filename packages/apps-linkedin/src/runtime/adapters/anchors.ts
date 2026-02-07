import type { PluginAnchorRegistry } from "@tokovo/core";

export const linkedInAnchors: PluginAnchorRegistry = {
  providers: {
    default: () => null,
  },
  framing: {
    li_header: {
      anchorPoint: { x: 0.5, y: 0.1 },
      paddingPx: 10,
      targetFill: 0.9,
    },
    li_feed: {
      anchorPoint: { x: 0.5, y: 0.48 },
      paddingPx: 16,
      targetFill: 0.82,
    },
    li_post_card: {
      anchorPoint: { x: 0.5, y: 0.44 },
      paddingPx: 14,
      targetFill: 0.82,
    },
    li_reaction_row: {
      anchorPoint: { x: 0.5, y: 0.64 },
      paddingPx: 12,
      targetFill: 0.75,
    },
    li_compose_fab: {
      anchorPoint: { x: 0.82, y: 0.86 },
      paddingPx: 8,
      targetFill: 0.25,
    },
    li_profile_header: {
      anchorPoint: { x: 0.5, y: 0.24 },
      paddingPx: 12,
      targetFill: 0.9,
    },
    li_notifications_list: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 16,
      targetFill: 0.84,
    },
    li_messages_list: {
      anchorPoint: { x: 0.5, y: 0.52 },
      paddingPx: 16,
      targetFill: 0.86,
    },
    li_dm_thread: {
      anchorPoint: { x: 0.5, y: 0.56 },
      paddingPx: 16,
      targetFill: 0.86,
    },
    li_dm_composer: {
      anchorPoint: { x: 0.5, y: 0.86 },
      paddingPx: 10,
      targetFill: 0.7,
    },
    li_compose_sheet: {
      anchorPoint: { x: 0.5, y: 0.55 },
      paddingPx: 16,
      targetFill: 0.9,
    },
    li_nav_bar: {
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

