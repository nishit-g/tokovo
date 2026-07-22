import {
  getAppStateForDevice,
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
  getChatChromeGeometry,
  type MessageLayoutConfig,
  type MessageForGap,
  type MessageType,
  type GapContext,
} from "../config/index.js";
import type {
  WhatsAppMessage,
  WhatsAppConversation,
  WhatsAppState,
} from "../types/index.js";
import { computeConversationLayout, getLayoutCache } from "./cache.js";
import { projectWhatsAppThread } from "../thread/projector.js";
import { createWhatsAppThreadWindow } from "../thread/window.js";
import { getBaseTime } from "../utils/messages.js";
import { resolveTypingMembers } from "../utils/participants.js";

type LayoutMessage = WhatsAppMessage;

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
 * - Semantic Region Generation (Subjects)
 */
export function computeChatLayout(
  ctx: LayoutContext,
  layoutConfig: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG,
): ChatLayoutState {
  const { world, t, activeConversationId, viewportHeight, viewportWidth } = ctx;
  const config = layoutConfig;
  // Layout context dimensions and React CSS values are both logical points.
  // Physical-pixel scaling happens above the app surface in the renderer.
  const px = (value: number) => value;

  const appState = (getAppStateForDevice(
    world,
    "app_whatsapp",
    ctx.activeDeviceId,
  ) || {}) as Partial<WhatsAppState>;
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
  const thread = projectWhatsAppThread({
    conversationId: activeConversationId,
    messages: conversation.messages,
    conversation,
    ownerName: world.devices[ctx.activeDeviceId]?.ownerName,
    baseTime: getBaseTime(world, ctx.activeDeviceId),
    fps: world.config?.fps ?? 30,
    locale: appState.locale ?? "en-US",
  });
  const viewportFocusMessageId =
    appState.threadViewport?.conversationId === activeConversationId
      ? appState.threadViewport.focusMessageId
      : undefined;
  const threadWindow = createWhatsAppThreadWindow(thread, {
    focusMessageId: viewportFocusMessageId,
  });
  const allMessages = threadWindow.blocks.flatMap((block) =>
    block.kind === "system"
      ? [block.message]
      : block.items.map((item) => item.message),
  );
  const projectedConversation: WhatsAppConversation = {
    ...conversation,
    messages: allMessages,
  };
  const lastVisibleIndex = findLastVisibleIndex(allMessages, t);

  const layoutCache = getLayoutCache(ctx.layoutCache);
  const conversationLayout = computeConversationLayout(projectedConversation, {
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
    media: [],
    reply: [],
    reactions: [],
  };

  const safeAreaTop = ctx.safeAreaInsets?.top ?? 0;
  const safeAreaBottom = ctx.safeAreaInsets?.bottom ?? 0;
  const chromeGeometry = getChatChromeGeometry({
    top: safeAreaTop,
    bottom: safeAreaBottom,
  });

  let lastMessageId: string | undefined;

  // ==========================================================
  // SINGLE-PASS LAYOUT ALGORITHM
  // ==========================================================
  for (let i = 0; i <= lastVisibleIndex; i++) {
    const msg = allMessages[i] as LayoutMessage;
    const msgType = (msg.type || "text") as MessageType;
    const rawMessageType = msg.type || "text";
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

    const subjectId = msg.id;
    semanticRegions[subjectId] = {
      id: subjectId,
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
    semanticGroups["message"].push(subjectId);
    if (msgType === "system") {
      semanticGroups["system"].push(subjectId);
    }

    const innerX = rect.x + px(8);
    const innerWidth = Math.max(0, rect.width - px(16));
    let contentTop = rect.y + px(8);

    if (msg.replyTo) {
      const replyRect = {
        x: innerX,
        y: contentTop,
        width: innerWidth,
        height: Math.min(px(46), Math.max(px(28), rect.height * 0.26)),
      };
      semanticRegions[`reply_${msg.id}`] = {
        id: `reply_${msg.id}`,
        rect: replyRect,
        tags: ["reply", "message_fragment"],
        metadata: { messageId: msg.id },
      };
      semanticGroups.reply.push(`reply_${msg.id}`);
      contentTop += replyRect.height + px(6);
    }

    const isMediaSemanticType =
      msg.type === "image" ||
      msg.type === "video" ||
      msg.type === "gif" ||
      msg.type === "document" ||
      msg.type === "contact" ||
      msg.type === "location" ||
      msg.type === "voice" ||
      msg.type === "sticker";

    if (isMediaSemanticType) {
      const mediaHeightRatio =
        rawMessageType === "voice" ||
        rawMessageType === "document" ||
        rawMessageType === "contact"
          ? 0.44
          : rawMessageType === "location"
            ? 0.62
            : 0.72;
      const mediaRect = {
        x: innerX,
        y: contentTop,
        width: innerWidth,
        height: Math.max(
          px(32),
          Math.min(rect.height - px(16), rect.height * mediaHeightRatio),
        ),
      };
      semanticRegions[`media_${msg.id}`] = {
        id: `media_${msg.id}`,
        rect: mediaRect,
        tags: ["media", rawMessageType],
        metadata: { messageId: msg.id, type: rawMessageType },
      };
      semanticGroups.media.push(`media_${msg.id}`);
    }

    if (msg.reactions && msg.reactions.length > 0) {
      const reactionsRect = {
        x: isOutgoing(msg) ? rect.x + rect.width - px(74) : rect.x + px(8),
        y: rect.y + rect.height - px(14),
        width: px(66),
        height: px(18),
      };
      semanticRegions[`reactions_${msg.id}`] = {
        id: `reactions_${msg.id}`,
        rect: reactionsRect,
        tags: ["reactions", "overlay"],
        metadata: { messageId: msg.id },
      };
      semanticGroups.reactions.push(`reactions_${msg.id}`);
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
  const typingMembers = resolveTypingMembers(conversation);
  const typingActor = typingMembers[0]?.id;
  const isTyping = typingActor !== undefined;

  if (isTyping) {
    const typingConfig = config.messageTypes.typing;
    const typingHeight = typingConfig.height.base;
    const typingWidth = typingConfig.width.fixed || typingConfig.width.min;

    // Calculate gap before typing indicator
    const lastMsg =
      lastVisibleIndex >= 0
        ? (allMessages[lastVisibleIndex] as LayoutMessage)
        : undefined;
    if (lastMsg) {
      const prevForGap: MessageForGap = {
        type: lastMsg.type as MessageType,
        from: lastMsg.from,
        at: lastMsg.at,
        hasReply: lastMsg.replyTo !== undefined && lastMsg.replyTo !== null,
        hasReactions: (lastMsg.reactions?.length ?? 0) > 0,
      };
      const typingForGap: MessageForGap = {
        type: "typing",
        from: typingActor,
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

    // --- SEMANTIC SUBJECT FOR TYPING ---
    const typingSubjectId = "typing_indicator";
    semanticRegions[typingSubjectId] = {
      id: typingSubjectId,
      rect,
      tags: ["typing", "indicator"],
    };

    currentY += typingHeight;
  }

  const lastVisibleLayout =
    lastMessageId !== undefined
      ? conversationLayout.messageLayouts.get(lastMessageId)
      : undefined;
  const lastVisibleBottom =
    lastVisibleLayout?.y !== undefined &&
    lastVisibleLayout?.height !== undefined
      ? lastVisibleLayout.y + lastVisibleLayout.height
      : config.spacing.global.topPadding;
  const rawContentBottom = Math.max(currentY, lastVisibleBottom);
  const messageBottomInset = px(chromeGeometry.messageBottomInset);
  const viewportOffsetY =
    viewportHeight - messageBottomInset - rawContentBottom;

  // The React thread is a bottom-aligned window, not a scrollable copy of the
  // full conversation. Translate every non-sticky chat region into those same
  // viewport coordinates before exposing semantic subjects to the camera.
  for (const layout of Object.values(messageLayouts)) {
    layout.y += viewportOffsetY;
    if (layout.rect) {
      layout.rect = { ...layout.rect, y: layout.rect.y + viewportOffsetY };
    }
  }
  if (typingLayout) {
    typingLayout.y += viewportOffsetY;
    if (typingLayout.rect) {
      typingLayout.rect = {
        ...typingLayout.rect,
        y: typingLayout.rect.y + viewportOffsetY,
      };
    }
  }
  for (const region of Object.values(semanticRegions)) {
    region.rect = { ...region.rect, y: region.rect.y + viewportOffsetY };
  }

  // ==========================================================
  // INPUT AREA SUBJECT (Semantic only, not visual layout item)
  // ==========================================================
  // Actually, Input Area is fixed to bottom of viewport usually, or below content?
  // In chat layout, contentHeight includes padding. Input area is separate.
  // Ideally, the InputArea component itself should report this, but since we compute layout here:
  // We can define a "logical" input area subject at the bottom of the viewport.

  const INPUT_HEIGHT = px(UI_CONSTANTS.INPUT_MIN_HEIGHT + safeAreaBottom);
  const HEADER_HEIGHT = px(chromeGeometry.headerHeight);

  const PROFILE_SIZE = px(UI_CONSTANTS.HEADER_AVATAR_SIZE);
  const PROFILE_X_OFFSET = px(10 + (24 + 17) + 10);
  const PROFILE_Y_OFFSET =
    safeAreaTop + (px(UI_CONSTANTS.HEADER_CONTENT_HEIGHT) - PROFILE_SIZE) / 2;

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

  if (appState.replyComposer?.conversationId === activeConversationId) {
    semanticRegions.reply_composer = {
      id: "reply_composer",
      rect: {
        x: px(10),
        y: Math.max(0, inputRect.y - px(66)),
        width: viewportWidth - px(20),
        height: px(56),
      },
      tags: ["reply", "composer", "overlay"],
      metadata: { messageId: appState.replyComposer.messageId },
    };
  }

  if (
    appState.activeGesture?.conversationId === activeConversationId &&
    appState.activeGesture.gesture === "long_press" &&
    appState.activeGesture.phase === "completed"
  ) {
    semanticRegions.message_actions = {
      id: "message_actions",
      rect: {
        x: px(16),
        y: Math.max(0, inputRect.y - px(184)),
        width: viewportWidth - px(32),
        height: px(138),
      },
      tags: ["message", "actions", "overlay"],
      metadata: { messageId: appState.activeGesture.messageId },
    };
  }

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

  const contentHeight = rawContentBottom + messageBottomInset;

  // ==========================================================
  // SCROLL POSITION
  // ==========================================================
  let scrollY = 0;
  if (config.scroll.lockToBottom) {
    scrollY = Math.max(0, -viewportOffsetY);
  }

  return {
    kind: "CHAT",
    scrollY,
    contentHeight,
    isAtBottom: true,
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

function isOutgoing(message: LayoutMessage): boolean {
  return message.from === "me";
}

function findLastVisibleIndex(
  messages: WhatsAppMessage[],
  frame: number,
): number {
  if (messages.length === 0) return -1;

  let low = 0;
  let high = messages.length - 1;
  let result = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const at = messages[mid]?.at ?? 0;
    if (at <= frame) {
      result = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return result;
}
