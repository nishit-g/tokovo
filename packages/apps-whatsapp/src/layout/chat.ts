import {
  requireAppStateForDevice,
  LayoutContext,
  ChatLayoutState,
  ChatMessageLayout,
  TypingLayout,
  SemanticRegion,
} from "@tokovo/core";
import { WHATSAPP_INTERACTION_TOKENS as tokens } from "../theme/index.js";
import {
  DEFAULT_LAYOUT_CONFIG,
  calculateSmartGap,
  applyEasing,
  UI_CONSTANTS,
  getChatChromeGeometry,
  getComposerExtraHeight,
  getReactionWidth,
  getThemedMessageLayout,
  type MessageLayoutConfig,
  type MessageForGap,
  type MessageType,
  type GapContext,
} from "../config/index.js";
import type { WhatsAppMessage, WhatsAppConversation, WhatsAppState } from "../types/index.js";
import { computeConversationLayout, getLayoutCache } from "./cache.js";
import { projectWhatsAppThread } from "../thread/projector.js";
import { createWhatsAppThreadWindow } from "../thread/window.js";
import { getBaseTime } from "../utils/messages.js";
import { resolveTypingMembers } from "../utils/participants.js";
import { messageActionKeys, messageActionRect } from "../presentation/message-actions.js";
import { resolveWhatsAppExperience } from "../experience/resolver.js";
import type { WhatsAppThemeId } from "../theme/index.js";

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
  // Layout context dimensions and React CSS values are both logical points.
  // Physical-pixel scaling happens above the app surface in the renderer.
  const px = (value: number) => value;

  const appState = requireAppStateForDevice<WhatsAppState>(
    world,
    "app_whatsapp",
    ctx.activeDeviceId,
  );
  const device = world.devices[ctx.activeDeviceId];
  if (!device) throw new Error(`WHATSAPP_LAYOUT_DEVICE_MISSING: "${ctx.activeDeviceId}"`);
  const { theme } = resolveWhatsAppExperience({
    platform: ctx.platform,
    appearance: device.appAppearance ?? device.os.appearance,
    themeId: device.appTheme as WhatsAppThemeId | undefined,
    locale: appState.locale ?? "en-US",
  });
  const config = getThemedMessageLayout(theme, layoutConfig);
  const conversations = (appState.conversations || {}) as Record<string, WhatsAppConversation>;

  if (!activeConversationId || !conversations[activeConversationId]) {
    throw new Error(
      `WHATSAPP_CHAT_CONTEXT_MISSING: device "${ctx.activeDeviceId}" requires an active conversation`,
    );
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
    block.kind === "system" ? [block.message] : block.items.map((item) => item.message),
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

  const contentTop = ctx.appViewport.interactiveInsets.top;
  const contentBottom = ctx.appViewport.interactiveInsets.bottom;
  const chromeGeometry = getChatChromeGeometry({
    top: contentTop,
    bottom: contentBottom,
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
    const translateX = 0;
    let translateY = 0;

    if (
      baseLayout.messageAt > 0 &&
      timeSinceAppear >= 0 &&
      timeSinceAppear < (world.config?.fps ?? 30) * 0.24
    ) {
      const progress = timeSinceAppear / ((world.config?.fps ?? 30) * 0.24);
      const ease = applyEasing(progress, "easeOut");
      opacity = ease;

      translateY = 8 * (1 - ease);
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
      tags: ["message", msg.from === "me" ? "message_me" : "message_other", msgType],
      metadata: {
        from: msg.from,
        type: msgType,
        timestamp: msg.timestamp,
        ...(msgType === "text" ? { textSizePx: theme.typography.messageFontSize } : {}),
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
        rawMessageType === "voice" || rawMessageType === "document" || rawMessageType === "contact"
          ? 0.44
          : rawMessageType === "location"
            ? 0.62
            : 0.72;
      const mediaRect = {
        x: innerX,
        y: contentTop,
        width: innerWidth,
        height: Math.max(px(32), Math.min(rect.height - px(16), rect.height * mediaHeightRatio)),
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
        x: isOutgoing(msg)
          ? rect.x + rect.width - tokens.reactionInset - getReactionWidth(msg.reactions)
          : rect.x + tokens.reactionInset,
        y: rect.y + rect.height - tokens.reactionHeight,
        width: getReactionWidth(msg.reactions),
        height: tokens.reactionHeight,
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
      lastVisibleIndex >= 0 ? (allMessages[lastVisibleIndex] as LayoutMessage) : undefined;
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
    lastMessageId !== undefined ? conversationLayout.messageLayouts.get(lastMessageId) : undefined;
  const lastVisibleBottom =
    lastVisibleLayout?.y !== undefined && lastVisibleLayout?.height !== undefined
      ? lastVisibleLayout.y + lastVisibleLayout.height
      : config.spacing.global.topPadding;
  const rawContentBottom = Math.max(currentY, lastVisibleBottom);
  const composerExtra = getComposerExtraHeight(
    ctx.inputValues?.composer ?? conversation.draftText ?? "",
    viewportWidth,
  );
  const messageBottomInset = px(chromeGeometry.messageBottomInset) + composerExtra;
  const pinnedHeight = conversation.pinnedMessage ? 53 : 0;
  const replyHeight = appState.replyComposer?.conversationId === activeConversationId ? 66 : 0;
  const threadTop = chromeGeometry.headerHeight + pinnedHeight;
  const threadBottom = viewportHeight - messageBottomInset - replyHeight;
  // Grow the newest slot from authored time. No previous-frame state: seeking
  // directly to a frame produces the same scroll position as sequential replay.
  let pendingHeight = 0;
  for (let i = 0; i <= lastVisibleIndex; i++) {
    const base = conversationLayout.messageLayouts.get(allMessages[i].id);
    const item = messageLayouts[allMessages[i].id];
    if (!base || !item) continue;
    for (const prefix of ["reply_", "media_", "reactions_"]) {
      const region = semanticRegions[`${prefix}${item.id}`];
      if (region) region.rect = { ...region.rect, y: region.rect.y - pendingHeight };
    }
    item.y -= pendingHeight;
    if (item.rect) item.rect = { ...item.rect, y: item.rect.y - pendingHeight };
    const age = t - base.messageAt;
    if (base.messageAt > 0 && age >= 0) {
      const progress = applyEasing(
        Math.min(1, age / ((world.config?.fps ?? 30) * 0.24)),
        "easeOut",
      );
      pendingHeight += base.height * (1 - progress);
    }
    const reactionsStartedAt = allMessages[i].reactionsStartedAt;
    if (reactionsStartedAt !== undefined && (allMessages[i].reactions?.length ?? 0) > 0) {
      const age = Math.max(0, t - reactionsStartedAt);
      pendingHeight +=
        config.additions.reaction *
        (1 -
          applyEasing(
            Math.min(1, age / ((world.config?.fps ?? 30) * tokens.reactionSeconds)),
            "easeOut",
          ));
    }
    semanticRegions[item.id].rect = item.rect!;
  }
  const animatedBottom = rawContentBottom - pendingHeight;
  if (typingLayout) {
    typingLayout.y -= pendingHeight;
    if (typingLayout.rect)
      typingLayout.rect = {
        ...typingLayout.rect,
        y: typingLayout.rect.y - pendingHeight,
      };
    semanticRegions.typing_indicator.rect = typingLayout.rect!;
  }
  const topOffset = threadTop - config.spacing.global.topPadding;
  const bottomOffset = threadBottom - animatedBottom;
  const viewportOffsetY =
    theme.spacing.shortThreadAlignment === "start"
      ? Math.min(topOffset, bottomOffset)
      : bottomOffset;

  // Match the app-owned thread alignment before exposing camera subjects.
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
  for (const item of Object.values(messageLayouts)) {
    const region = semanticRegions[item.id];
    region.rect = { ...region.rect, y: region.rect.y + item.translateY };
    if (item.id === lastMessageId && item.opacity < 1) {
      const top = Math.min(threadBottom - 1, Math.max(threadTop, region.rect.y));
      region.rect = {
        ...region.rect,
        y: top,
        height: Math.max(1, Math.min(threadBottom, region.rect.y + region.rect.height) - top),
      };
    }
  }

  // ==========================================================
  // INPUT AREA SUBJECT (Semantic only, not visual layout item)
  // ==========================================================
  // Actually, Input Area is fixed to bottom of viewport usually, or below content?
  // In chat layout, contentHeight includes padding. Input area is separate.
  // Ideally, the InputArea component itself should report this, but since we compute layout here:
  // We can define a "logical" input area subject at the bottom of the viewport.

  const INPUT_HEIGHT = px(UI_CONSTANTS.INPUT_MIN_HEIGHT + contentBottom) + composerExtra;
  const HEADER_HEIGHT = px(chromeGeometry.headerHeight);

  const PROFILE_SIZE = px(UI_CONSTANTS.HEADER_AVATAR_SIZE);
  const PROFILE_X_OFFSET = px(10 + (24 + 17) + 10);
  const PROFILE_Y_OFFSET = contentTop + (px(UI_CONSTANTS.HEADER_CONTENT_HEIGHT) - PROFILE_SIZE) / 2;

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
  semanticRegions.thread = {
    id: "thread",
    rect: {
      x: 0,
      y: threadTop,
      width: viewportWidth,
      // Paint wallpaper through the clearance, not a white strip that visually
      // joins the last bubble to the composer. Content still stops 20pt above it.
      height: Math.max(0, inputRect.y - replyHeight - threadTop),
    },
    tags: ["thread"],
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
    const selectedRect = messageLayouts[appState.activeGesture.messageId]?.rect;
    const selectedMessage = thread.messagesById.get(appState.activeGesture.messageId);
    if (!selectedRect || !selectedMessage)
      throw new Error("WhatsApp action menu requires a visible message anchor");
    semanticRegions.message_actions = {
      id: "message_actions",
      rect: messageActionRect(
        selectedRect,
        semanticRegions.thread.rect,
        messageActionKeys(selectedMessage).length,
      ),
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

function findLastVisibleIndex(messages: WhatsAppMessage[], frame: number): number {
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
