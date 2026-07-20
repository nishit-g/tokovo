import type { PluginAnchorRegistry } from "@tokovo/core";

export const WhatsAppAnchorFraming: NonNullable<
  PluginAnchorRegistry["framing"]
> = {
    message: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 40,
      targetFill: 0.6,
    },
    message_me: {
      anchorPoint: { x: 0.6, y: 0.5 },
      paddingPx: 40,
      targetFill: 0.6,
    },
    message_other: {
      anchorPoint: { x: 0.4, y: 0.5 },
      paddingPx: 40,
      targetFill: 0.6,
    },
    lastMessage: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 40,
      targetFill: 0.6,
    },
    lastMedia: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 22,
      targetFill: 0.68,
    },
    lastReply: {
      anchorPoint: { x: 0.5, y: 0.38 },
      paddingPx: 18,
      targetFill: 0.44,
    },
    device: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 0,
      targetFill: 1.0,
    },
    typing_indicator: {
      anchorPoint: { x: 0.35, y: 0.5 },
      paddingPx: 30,
      targetFill: 0.3,
    },
    input_area: {
      anchorPoint: { x: 0.5, y: 0.8 },
      paddingPx: 20,
      targetFill: 0.9,
    },
    reply_composer: {
      anchorPoint: { x: 0.5, y: 0.78 },
      paddingPx: 14,
      targetFill: 0.72,
    },
    message_actions: {
      anchorPoint: { x: 0.5, y: 0.66 },
      paddingPx: 16,
      targetFill: 0.78,
    },
    media_viewer: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 0,
      targetFill: 1,
    },
    media_viewer_content: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 10,
      targetFill: 0.94,
    },
    chat_thread: {
      anchorPoint: { x: 0.5, y: 0.52 },
      paddingPx: 24,
      targetFill: 0.84,
    },
    header: {
      anchorPoint: { x: 0.5, y: 0.15 },
      paddingPx: 10,
      targetFill: 0.9,
    },
    calls_list: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 14,
      targetFill: 0.9,
    },
    updates_header: {
      anchorPoint: { x: 0.5, y: 0.15 },
      paddingPx: 10,
      targetFill: 0.9,
    },
    updates_status_strip: {
      anchorPoint: { x: 0.5, y: 0.32 },
      paddingPx: 18,
      targetFill: 0.86,
    },
    updates_channels: {
      anchorPoint: { x: 0.5, y: 0.58 },
      paddingPx: 18,
      targetFill: 0.84,
    },
    updates_channels_hero: {
      anchorPoint: { x: 0.5, y: 0.46 },
      paddingPx: 16,
      targetFill: 0.88,
    },
    updates_list: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 14,
      targetFill: 0.94,
    },
    chat_row: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 10,
      targetFill: 0.92,
    },
    channel_row: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 10,
      targetFill: 0.92,
    },
    profile: {
      anchorPoint: { x: 0.2, y: 0.15 },
      paddingPx: 50,
      targetFill: 0.4,
    },
    chat_content: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 20,
      targetFill: 0.8,
    },
    app: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 0,
      targetFill: 1.0,
    },
};
