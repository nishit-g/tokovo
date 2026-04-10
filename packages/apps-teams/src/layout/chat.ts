import type {
  ChatLayoutState,
  ChatMessageLayout,
  LayoutContext,
  LayoutRect,
  SemanticRegion,
} from "@tokovo/core";
import {
  selectActiveTypingUserIds,
  selectTeamsState,
  selectVisibleMessages,
} from "../selectors/index.js";

function rect(x: number, y: number, width: number, height: number): LayoutRect {
  return { x, y, width, height };
}

function semantic(regions: Record<string, SemanticRegion>, groups: Record<string, string[]>) {
  return { regions, groups };
}

function estimateBubbleHeight(text: string, hasReply: boolean): number {
  const lineCount = Math.max(1, Math.ceil(text.length / 26));
  return 30 + lineCount * 20 + (hasReply ? 30 : 0);
}

export function computeTeamsChatLayout(ctx: LayoutContext): ChatLayoutState {
  const state = selectTeamsState(ctx.world);
  const { viewportWidth: width, viewportHeight: height, safeAreaInsets } = ctx;
  const messages = state ? selectVisibleMessages(state) : [];
  const headerHeight = safeAreaInsets.top + 56;
  const composerHeight = 76 + safeAreaInsets.bottom;
  const contentTop = headerHeight + 8;
  const contentBottom = composerHeight;
  const messageLayouts: Record<string, ChatMessageLayout> = {};
  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, width, height), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, width, height), tags: ["app"] },
    teams_surface: { id: "teams_surface", rect: rect(0, 0, width, height), tags: ["surface"] },
    teams_header: { id: "teams_header", rect: rect(0, 0, width, headerHeight), tags: ["header", "sticky"] },
    teams_thread: {
      id: "teams_thread",
      rect: rect(0, headerHeight, width, Math.max(0, height - headerHeight)),
      tags: ["thread", "surface"],
    },
    teams_message_list: {
      id: "teams_message_list",
      rect: rect(0, contentTop, width, Math.max(0, height - contentTop - contentBottom)),
      tags: ["content", "messages"],
    },
    teams_composer: {
      id: "teams_composer",
      rect: rect(0, height - composerHeight, width, composerHeight),
      tags: ["composer", "sticky"],
    },
  };
  const groups: Record<string, string[]> = {
    message: [],
    mine: [],
    theirs: [],
  };

  let y = contentTop + 8;
  let lastMessageId: string | undefined;
  for (const message of messages) {
    const heightEstimate = estimateBubbleHeight(
      message.text,
      Boolean(message.replyToMessageId),
    );
    const bubbleWidth = Math.min(
      width * 0.74,
      Math.max(168, message.text.length * 5.5 + (message.replyToMessageId ? 24 : 0)),
    );
    const x = message.isFromMe ? width - bubbleWidth - 28 : 28;
    const messageRect = rect(x, y, bubbleWidth, heightEstimate);
    messageLayouts[message.id] = {
      id: message.id,
      y,
      height: heightEstimate,
      opacity: 1,
      translateY: 0,
      translateX: 0,
      rect: messageRect,
    };
    const regionId = `teams_message_${message.id}`;
    regions[regionId] = {
      id: regionId,
      rect: messageRect,
      tags: ["message", message.isFromMe ? "mine" : "theirs"],
      metadata: {
        messageId: message.id,
        senderId: message.senderId,
      },
    };
    groups.message.push(regionId);
    groups[message.isFromMe ? "mine" : "theirs"].push(regionId);
    lastMessageId = message.id;
    y += heightEstimate + 14;
  }

  const typingIds = state ? selectActiveTypingUserIds(state) : [];
  const typingLayout =
    typingIds.length > 0
      ? {
          y,
          height: 34,
          opacity: 1,
          rect: rect(24, y, 180, 34),
        }
      : null;

  if (typingLayout?.rect) {
    regions.teams_typing_indicator = {
      id: "teams_typing_indicator",
      rect: typingLayout.rect,
      tags: ["typing", "overlay"],
    };
  }

  return {
    kind: "CHAT",
    scrollY: 0,
    contentHeight: Math.max(height, y + composerHeight),
    isAtBottom: true,
    messageLayouts,
    typingLayout,
    meta: {
      lastMessageId,
      isGroupChat: Boolean(state?.activeThreadId),
    },
    semantic: semantic(regions, groups),
  };
}
