import {
  requireAppStateForDevice,
  type ChatLayoutState,
  type FeedLayoutState,
  type FullscreenLayoutState,
  type LayoutContext,
  type LayoutRect,
  type PluginLayoutStrategy,
  type SemanticRegion,
} from "@tokovo/core";

import type { IMessageState } from "../types/index.js";
import { iMessageSpacing } from "../config/tokens.js";
import { computeMessageGap, getReplyPreview } from "../config/layout-config.js";
import { composerExtraHeight, dateLabel, messageGeometry } from "./message.js";

function rect(x: number, y: number, width: number, height: number): LayoutRect {
  return { x, y, width, height };
}

function buildSemantic(
  regions: Record<string, SemanticRegion>,
  groups: Record<string, string[]> = {},
) {
  return { regions, groups };
}

function computeIMessageFeedLayout(ctx: LayoutContext): FeedLayoutState {
  const { viewportWidth: w, viewportHeight: h, appViewport, world } = ctx;
  const contentTop = appViewport.interactiveInsets.top;
  const contentBottom = appViewport.interactiveInsets.bottom;

  const state = requireAppStateForDevice<IMessageState>(world, "app_imessage", ctx.activeDeviceId);
  const screen = state.currentScreen ?? "list";

  const headerH = contentTop + iMessageSpacing.listHeaderHeight;
  const listY = headerH;
  const listH = Math.max(0, h - contentBottom - listY);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
  };

  if (screen === "list") {
    regions.imessage_list_header = {
      id: "imessage_list_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.imessage_list = {
      id: "imessage_list",
      rect: rect(0, listY, w, listH),
      tags: ["list"],
    };
    regions.imessage_list_row_0 = {
      id: "imessage_list_row_0",
      rect: rect(0, listY, w, iMessageSpacing.listItemHeight),
      tags: ["list", "row"],
    };
    regions.imessage_list_row_0_avatar = {
      id: "imessage_list_row_0_avatar",
      rect: rect(
        24,
        listY + (iMessageSpacing.listItemHeight - iMessageSpacing.listAvatarSize) / 2,
        iMessageSpacing.listAvatarSize,
        iMessageSpacing.listAvatarSize,
      ),
      tags: ["list", "avatar"],
    };
    regions.imessage_list_row_0_content = {
      id: "imessage_list_row_0_content",
      rect: rect(86, listY + 10, Math.max(0, w - 102), 62),
      tags: ["list", "content"],
    };
  } else {
    // Defensive: if state/viewMode mismatched, still emit list subjects.
    regions.imessage_list_header = {
      id: "imessage_list_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.imessage_list = {
      id: "imessage_list",
      rect: rect(0, listY, w, listH),
      tags: ["list"],
    };
  }

  return {
    kind: "FEED",
    cacheHint: "static",
    scrollY: 0,
    contentHeight: h,
    isAtBottom: false,
    itemLayouts: {},
    meta: {},
    semantic: buildSemantic(regions),
  };
}

function computeIMessageChatLayout(ctx: LayoutContext): ChatLayoutState {
  const { viewportWidth: w, viewportHeight: h, appViewport } = ctx;
  const contentTop = appViewport.interactiveInsets.top;
  const contentBottom = appViewport.interactiveInsets.bottom;

  const state = requireAppStateForDevice<IMessageState>(
    ctx.world,
    "app_imessage",
    ctx.activeDeviceId,
  );
  const conversation = state.conversations?.[state.activeConversationId ?? ""];
  const extraHeight = composerExtraHeight(
    ctx.inputValues?.composer ?? conversation?.draft ?? "",
    w,
  );
  const headerH =
    contentTop + iMessageSpacing.headerHeight + (state.searchQuery !== undefined ? 52 : 0);
  const composerH = iMessageSpacing.inputHeight + contentBottom + extraHeight;
  const composerY = Math.max(0, h - composerH);
  const threadY = headerH;
  const threadH = Math.max(0, composerY - threadY);
  const messages = (conversation?.messages ?? []).filter((message) => message.timestamp <= ctx.t);
  const lastOutgoing = messages.findLast(
    (message) => message.fromMe && !message.isUnsent && !message.isSystem,
  )?.id;
  const messageLayouts: ChatLayoutState["messageLayouts"] = {};
  let y = 46;
  let pending = 0;
  for (let index = 0; index < messages.length; index++) {
    const message = messages[index];
    const previous = messages[index - 1];
    y += computeMessageGap(previous, message) + (dateLabel(message, previous) ? 32 : 0);
    const sender = Boolean(
      conversation?.isGroup && !message.fromMe && previous?.senderId !== message.senderId,
    );
    const geometry = messageGeometry(
      message,
      w,
      getReplyPreview(messages, index),
      sender,
      message.id === lastOutgoing,
    );
    const age = ctx.t - message.timestamp;
    const progress =
      message.timestamp <= 0
        ? 1
        : Math.min(1, Math.max(0, age / ((ctx.world.config?.fps ?? 30) * 0.24)));
    const eased = 1 - (1 - progress) ** 3;
    const x =
      message.isSystem || message.isUnsent ? 16 : message.fromMe ? w - 16 - geometry.width : 16;
    messageLayouts[message.id] = {
      id: message.id,
      y: y - pending,
      height: geometry.height,
      opacity: eased,
      translateX: 0,
      translateY: 8 * (1 - eased),
      rect: rect(x, y - pending, geometry.width, geometry.height),
    };
    y += geometry.height;
    pending += geometry.height * (1 - eased);
  }
  const typing = Object.values(conversation?.typing ?? {}).some(Boolean);
  const contentHeight = y - pending + (typing ? 50 : 0) + 16;
  const scrollY = Math.max(0, contentHeight - threadH);
  for (const item of Object.values(messageLayouts)) {
    item.y += threadY - scrollY;
    item.rect = { ...item.rect!, y: item.y };
  }

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
    imessage_chat_header: {
      id: "imessage_chat_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    },
    imessage_thread: {
      id: "imessage_thread",
      rect: rect(0, threadY, w, threadH),
      tags: ["thread"],
    },
    imessage_composer: {
      id: "imessage_composer",
      rect: rect(0, composerY, w, composerH),
      tags: ["composer", "sticky"],
      metadata: { sticky: true },
    },
    imessage_input: {
      id: "imessage_input",
      rect: rect(
        iMessageSpacing.inputPaddingH + 32 + iMessageSpacing.inputIconGap,
        composerY + iMessageSpacing.inputPaddingV,
        Math.max(0, w - iMessageSpacing.inputPaddingH * 2 - 32 - iMessageSpacing.inputIconGap),
        iMessageSpacing.inputFieldHeight + extraHeight,
      ),
      tags: ["composer", "input"],
    },
  };
  for (const message of messages) {
    const item = messageLayouts[message.id];
    regions[message.id] = {
      id: message.id,
      rect: { ...item.rect!, y: item.y + item.translateY },
      tags: ["thread", "message"],
      metadata: { messageId: message.id },
    };
  }
  const lastId = messages.at(-1)?.id;
  if (lastId) {
    regions.imessage_last_message = {
      ...regions[lastId],
      id: "imessage_last_message",
      tags: ["thread", "message", "latest"],
    };
    const item = messageLayouts[lastId];
    if (item.opacity < 1) {
      const region = regions.imessage_last_message;
      const bottom = composerY - 16;
      const top = Math.min(bottom - 1, Math.max(threadY, region.rect.y));
      region.rect = { ...region.rect, y: top, height: Math.max(1, Math.min(bottom, region.rect.y + region.rect.height) - top) };
    }
  }
  const typingLayout = typing
    ? {
        y: threadY + y - pending + 12 - scrollY,
        height: 32,
        opacity: 1,
        rect: rect(16, threadY + y - pending + 12 - scrollY, 60, 32),
      }
    : null;

  return {
    kind: "CHAT",
    scrollY,
    contentHeight,
    isAtBottom: true,
    messageLayouts,
    typingLayout,
    meta: { lastMessageId: lastId },
    semantic: buildSemantic(regions),
  };
}

function computeIMessageFullscreenLayout(ctx: LayoutContext): FullscreenLayoutState {
  const { viewportWidth: w, viewportHeight: h, appViewport, world } = ctx;
  const contentTop = appViewport.interactiveInsets.top;
  const contentBottom = appViewport.interactiveInsets.bottom;

  const state = requireAppStateForDevice<IMessageState>(world, "app_imessage", ctx.activeDeviceId);
  const screen = state.currentScreen ?? "info";

  const topY = contentTop + iMessageSpacing.detailHeaderHeight;
  const contentH = Math.max(0, h - topY - contentBottom);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
  };

  if (screen === "media") {
    regions.imessage_fullscreen_header = {
      id: "imessage_fullscreen_header",
      rect: rect(0, 0, w, topY),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.imessage_media = {
      id: "imessage_media",
      rect: rect(0, topY, w, contentH),
      tags: ["media"],
    };
  } else {
    regions.imessage_fullscreen_header = {
      id: "imessage_fullscreen_header",
      rect: rect(0, 0, w, topY),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.imessage_info = {
      id: "imessage_info",
      rect: rect(0, topY, w, contentH),
      tags: ["info"],
    };
  }

  return {
    kind: "FULLSCREEN",
    cacheHint: "static",
    meta: {},
    semantic: buildSemantic(regions),
  };
}

export const iMessageLayoutStrategies: PluginLayoutStrategy[] = [
  { viewKind: "FEED", computeLayout: computeIMessageFeedLayout },
  { viewKind: "CHAT", computeLayout: computeIMessageChatLayout },
  { viewKind: "FULLSCREEN", computeLayout: computeIMessageFullscreenLayout },
];
