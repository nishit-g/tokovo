import type { PluginAnchorRegistry } from "@tokovo/core";

export const IMessageAnchors: PluginAnchorRegistry = {
  providers: {
    default: () => null,
  },
  framing: {
    imessage_list_header: {
      anchorPoint: { x: 0.5, y: 0.12 },
      paddingPx: 12,
      targetFill: 0.9,
    },
    imessage_list: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 16,
      targetFill: 0.86,
    },
    imessage_thread: {
      anchorPoint: { x: 0.5, y: 0.55 },
      paddingPx: 16,
      targetFill: 0.88,
    },
    message_list: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 16,
      targetFill: 0.86,
    },
    message_thread: {
      anchorPoint: { x: 0.5, y: 0.55 },
      paddingPx: 16,
      targetFill: 0.88,
    },
    lastMessage: {
      anchorPoint: { x: 0.5, y: 0.6 },
      paddingPx: 16,
      targetFill: 0.74,
    },
    imessage_composer: {
      anchorPoint: { x: 0.5, y: 0.9 },
      paddingPx: 10,
      targetFill: 0.6,
    },
    imessage_info: {
      anchorPoint: { x: 0.5, y: 0.45 },
      paddingPx: 16,
      targetFill: 0.88,
    },
    imessage_media: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 16,
      targetFill: 0.9,
    },
    device: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 0,
      targetFill: 1.0,
    },
  },
};
