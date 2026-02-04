import {
  LayoutContext,
  ChatLayoutState,
  ChatMessageLayout,
  TypingLayout,
  SemanticRegion,
} from "@tokovo/core";
import {
  DEFAULT_LAYOUT_CONFIG,
  calculateSmartGap,
  applyEasing,
  UI_CONSTANTS,
  type MessageLayoutConfig,
  type MessageForGap,
  type MessageType,
  type GapContext,
} from "../config";
import { MessageData, WhatsAppMessage, WhatsAppConversation } from "../types";
import { computeConversationLayout, getLayoutCache } from "./cache";

type LayoutMessage = MessageData & {
  replyTo?: { messageId: string; text: string; from: string };
  reactions?: { emoji: string; count: number }[];
  linkPreview?: { url: string; title?: string };
};

// =============================================================================
// PRODUCTION-GRADE CHAT LAYOUT STRATEGY (PLUGIN)
// =============================================================================

/**
 * Compute chat layout using the production-grade configurable layout system.
 *
 * Features:
 * - Single-pass layout algorithm (efficient)
 * - Deterministic "Visual Run" gap calculation (No heuristics)
 * - Group chat member awareness with interruption handling
 * - Per-message-type spacing overrides
 * - Fully configurable via MessageLayoutConfig
 * - Semantic Region Generation (Anchors)
 */
export function computeChatLayout(
  ctx: LayoutContext,
  layoutConfig: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG,
): ChatLayoutState {
  const { world, t, activeConversationId, viewportHeight, viewportWidth } = ctx;
  const config = layoutConfig;

  const appState = (world.appState?.["app_whatsapp"] || {}) as {
    conversations?: Record<string, unknown>;
  };
  const conversations = (appState.conversations || {}) as Record<
    string,
    WhatsAppConversation
  >;

  if (!activeConversationId || !conversations[activeConversationId]) {
    return {
      kind: "CHAT",
      scrollY: 0,
      contentHeight: 0,
      isAtBottom: true,
      messageLayouts: {},
      meta: {},
    };
  }

  const conversation = conversations[activeConversationId];
  const allMessages = conversation.messages as WhatsAppMessage[];
  const messages = allMessages.filter(
    (m: WhatsAppMessage) => m.at === undefined || m.at <= t,
  );

  const layoutCache = getLayoutCache(ctx.layoutCache);
  const conversationLayout = computeConversationLayout(conversation, {
    viewportWidth,
    viewportHeight,
    layoutConfig: config,
    cache: layoutCache,
  });

  const messageLayouts: Record<string, ChatMessageLayout> = {};
  const semanticRegions: Record<string, SemanticRegion> = {};
  const semanticGroups: Record<string, string[]> = {
    message: [],
    system: [],
  };

  let lastMessageId: string | undefined;

  // ==========================================================
  // SINGLE-PASS LAYOUT ALGORITHM
  // ==========================================================
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i] as LayoutMessage;
    const msgType = (msg.type || "text") as MessageType;
    const baseLayout = conversationLayout.messageLayouts.get(msg.id);
    if (!baseLayout) {
      continue;
    }

    const timeSinceAppear = t - baseLayout.messageAt;
    let opacity = 1;
    let translateX = 0;
    const translateY = 0;

    if (
      timeSinceAppear >= 0 &&
      timeSinceAppear < config.animation.messageAppearDuration
    ) {
      const progress = timeSinceAppear / config.animation.messageAppearDuration;
      const ease = applyEasing(progress, "easeOut");
      opacity = ease;

      const offset = config.animation.messageAppearOffset * (1 - ease);
      translateX = baseLayout.isMe ? offset : -offset;
    }

    const rect = baseLayout.rect;

    messageLayouts[msg.id] = {
      id: msg.id,
      y: baseLayout.y,
      height: baseLayout.height,
      opacity,
      translateY,
      translateX,
      rect,
    };

    const anchorId = msg.id;
    semanticRegions[anchorId] = {
      id: anchorId,
      rect,
      tags: [
        "message",
        msg.from === "me" ? "message_me" : "message_other",
        msgType,
      ],
      metadata: {
        from: msg.from,
        type: msgType,
        timestamp: msg.timestamp,
      },
    };
    semanticGroups["message"].push(anchorId);
    if (msgType === "system") {
      semanticGroups["system"].push(anchorId);
    }

    lastMessageId = msg.id;
  }

  let currentY = config.spacing.global.topPadding;
  if (lastMessageId) {
    const lastLayout = conversationLayout.messageLayouts.get(lastMessageId);
    if (lastLayout) {
      currentY = lastLayout.y + lastLayout.height;
    }
  }

  // ==========================================================
  // TYPING INDICATOR
  // ==========================================================
  let typingLayout: TypingLayout | null = null;
  const isTyping = Object.values(conversation.typing || {}).some((v) => v);

  if (isTyping) {
    const typingConfig = config.messageTypes.typing;
    const typingHeight = typingConfig.height.base;
    const typingWidth = typingConfig.width.fixed || typingConfig.width.min;

    // Calculate gap before typing indicator
    const lastMsg = messages[messages.length - 1] as LayoutMessage | undefined;
    if (lastMsg) {
      const prevForGap: MessageForGap = {
        type: lastMsg.type as MessageType,
        from: lastMsg.from,
        at: lastMsg.at,
        hasReply:
          lastMsg.replyTo !== undefined && lastMsg.replyTo !== null,
        hasReactions: (lastMsg.reactions?.length ?? 0) > 0,
      };
      const typingForGap: MessageForGap = {
        type: "typing",
        from: "other", // Typing is always from other person
        hasReply: false,
        hasReactions: false,
      };

      const gapContext: GapContext = {
        prevMessage: prevForGap,
        nextMessage: typingForGap,
      };

      const gap = calculateSmartGap(gapContext, config);
      const lastLayout = conversationLayout.messageLayouts.get(lastMsg.id);
      const lastMessageBottom =
        lastLayout?.y !== undefined && lastLayout?.height !== undefined
          ? lastLayout.y + lastLayout.height
          : config.spacing.global.topPadding;

      currentY = lastMessageBottom + gap;
    }

    const rect = {
      x: config.spacing.global.bubbleMargin,
      y: currentY,
      width: typingWidth,
      height: typingHeight,
    };

    typingLayout = {
      y: currentY,
      height: typingHeight,
      opacity: 1,
      rect,
    };

    // --- SEMANTIC ANCHOR FOR TYPING ---
    const typingAnchorId = "typing_indicator";
    semanticRegions[typingAnchorId] = {
      id: typingAnchorId,
      rect,
      tags: ["typing", "indicator"],
    };

    currentY += typingHeight;
  }

  // ==========================================================
  // INPUT AREA ANCHOR (Semantic only, not visual layout item)
  // ==========================================================
  // Actually, Input Area is fixed to bottom of viewport usually, or below content?
  // In chat layout, contentHeight includes padding. Input area is separate.
  // Ideally, the InputArea component itself should report this, but since we compute layout here:
  // We can define a "logical" input area anchor at the bottom of the viewport.

  const INPUT_HEIGHT = UI_CONSTANTS.INPUT_MIN_HEIGHT;

  const safeAreaTop = ctx.safeAreaInsets?.top ?? 47;
  const HEADER_HEIGHT = UI_CONSTANTS.HEADER_CONTENT_HEIGHT + safeAreaTop;

  const PROFILE_SIZE = UI_CONSTANTS.HEADER_AVATAR_SIZE;
  const PROFILE_X_OFFSET = 10 + (24 + 17) + 10;
  const PROFILE_Y_OFFSET =
    safeAreaTop + (UI_CONSTANTS.HEADER_CONTENT_HEIGHT - PROFILE_SIZE) / 2;

  const inputRect = {
    x: 0,
    y: viewportHeight - INPUT_HEIGHT,
    width: viewportWidth,
    height: INPUT_HEIGHT,
  };

  semanticRegions["input_area"] = {
    id: "input_area",
    rect: inputRect,
    tags: ["input", "footer"],
    metadata: { sticky: true },
  };

  // Header Region (Sticky Top)
  semanticRegions["header"] = {
    id: "header",
    rect: { x: 0, y: 0, width: viewportWidth, height: HEADER_HEIGHT },
    tags: ["header", "nav"],
    metadata: { sticky: true },
  };

  // Profile Region (Inside Header)
  semanticRegions["profile"] = {
    id: "profile",
    rect: {
      x: PROFILE_X_OFFSET,
      y: PROFILE_Y_OFFSET,
      width: PROFILE_SIZE,
      height: PROFILE_SIZE,
    },
    tags: ["profile", "avatar"],
    metadata: { sticky: true },
  };

  const lastVisibleLayout =
    lastMessageId !== undefined
      ? conversationLayout.messageLayouts.get(lastMessageId)
      : undefined;
  const lastVisibleBottom =
    lastVisibleLayout?.y !== undefined && lastVisibleLayout?.height !== undefined
      ? lastVisibleLayout.y + lastVisibleLayout.height
      : config.spacing.global.topPadding;
  const contentHeight = Math.max(
    currentY,
    lastVisibleBottom,
  ) + config.spacing.global.bottomPadding;

  // ==========================================================
  // SCROLL POSITION
  // ==========================================================
  let scrollY = 0;
  if (config.scroll.lockToBottom) {
    const maxScroll = Math.max(0, contentHeight - viewportHeight);
    scrollY = maxScroll;
  }

  return {
    kind: "CHAT",
    scrollY,
    contentHeight,
    isAtBottom: Math.abs(scrollY - (contentHeight - viewportHeight)) < 10,
    messageLayouts,
    typingLayout,
    meta: {
      lastMessageId,
      isGroupChat: conversationLayout.isGroupChat, // Expose for components
    },
    semantic: {
      regions: semanticRegions,
      groups: semanticGroups,
    },
  };
}
