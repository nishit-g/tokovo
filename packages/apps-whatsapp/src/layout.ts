import { LayoutContext, ChatLayoutState, ChatMessageLayout, TypingLayout, SemanticRegion } from "@tokovo/core";
import {
    DEFAULT_LAYOUT_CONFIG,
    calculateMessageHeight,
    calculateSmartGap,
    calculateBubbleWidth,
    applyEasing,
    isMessageCentered,
    doesMessageBreakGrouping,
    type MessageLayoutConfig,  // Type import
    type MessageForHeight,     // Type import
    type MessageForGap,        // Type import
    type MessageType,          // Type import
    type GapContext,           // Type import
} from "./config";
import { UI_CONSTANTS } from "./config";
import { MessageData } from "./types";

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
    layoutConfig: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG
): ChatLayoutState {
    const { world, t, activeConversationId, viewportHeight, viewportWidth } = ctx;
    const config = layoutConfig;

    if (!activeConversationId || !world.conversations[activeConversationId]) {
        return {
            kind: "CHAT",
            scrollY: 0,
            contentHeight: 0,
            isAtBottom: true,
            messageLayouts: {},
            meta: {}
        };
    }

    const conversation = world.conversations[activeConversationId];
    // Filter messages visible at time t
    const messages = conversation.messages.filter(m => m.at === undefined || m.at <= t);

    // Detect if this is a group chat (more than 2 unique senders)
    const uniqueSenders = new Set(messages.map(m => m.from));
    const isGroupChat = uniqueSenders.size > 2;

    const messageLayouts: Record<string, ChatMessageLayout> = {};
    const semanticRegions: Record<string, SemanticRegion> = {};
    const semanticGroups: Record<string, string[]> = {
        message: [],
        system: [],
    };

    let currentY = config.spacing.global.topPadding;
    let lastMessageId: string | undefined;

    // ==========================================================
    // SINGLE-PASS LAYOUT ALGORITHM
    // ==========================================================
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i] as unknown as MessageData;
        const prevMsg = i > 0 ? messages[i - 1] as unknown as MessageData : undefined;
        const msgType = (msg.type || "text") as MessageType;

        // Calculate gap from previous message
        if (prevMsg) {
            const prevForGap: MessageForGap = {
                type: prevMsg.type as MessageType,
                from: prevMsg.from,
                at: prevMsg.at,
                hasReply: (prevMsg as any).replyTo != null,
                hasReactions: (prevMsg as any).reactions?.length > 0,
                hasLinkPreview: (prevMsg as any).linkPreview != null,
            };
            const nextForGap: MessageForGap = {
                type: msg.type as MessageType,
                from: msg.from,
                at: msg.at,
                hasReply: (msg as any).replyTo != null,
                hasReactions: (msg as any).reactions?.length > 0,
                hasLinkPreview: (msg as any).linkPreview != null,
            };

            const gapContext: GapContext = {
                prevMessage: prevForGap,
                nextMessage: nextForGap,
            };

            const gap = calculateSmartGap(gapContext, config);
            currentY += gap;
        }

        // Calculate height using the config-based function
        const msgForHeight: MessageForHeight = {
            type: msgType,
            text: (msg as any).text,
            caption: (msg as any).caption,
            from: msg.from,
            // Enhanced Visual Run Logic: Find previous groupable message
            // Enhanced Visual Run Logic: Determine previous groupable context
            prevFrom: (() => {
                const prev = i > 0 ? messages[i - 1] : undefined;
                if (!prev) return undefined;

                const prevType = (prev.type || "text") as MessageType;
                // Policy A: Strict Grouping Reset
                if (doesMessageBreakGrouping(prevType, config)) return "BREAK";

                return prev.from;
            })(),
            isGroupChat,              // Pass group chat status
            reactions: (msg as any).reactions,
            replyTo: (msg as any).replyTo,
            linkPreview: (msg as any).linkPreview,
        };

        const height = calculateMessageHeight(msgForHeight, viewportWidth, config);

        // Calculate bubble width using per-type config
        const bubbleWidth = calculateBubbleWidth(msgForHeight, viewportWidth, config);

        const isMe = msg.from === "me";

        // Animation: Horizontal Slide in (Safety First)
        // Vertical animation risks overlapping with the next bubble (like typing indicator)
        // because layout assumes final position. Horizontal slide avoids this collision.
        const messageAt = msg.at ?? 0;
        const timeSinceAppear = t - messageAt;
        let opacity = 1;
        let translateX = 0;
        // Ensure translateY is 0 to prevent vertical overlap
        const translateY = 0;

        if (timeSinceAppear >= 0 && timeSinceAppear < config.animation.messageAppearDuration) {
            const progress = timeSinceAppear / config.animation.messageAppearDuration;
            const ease = applyEasing(progress, "easeOut");
            opacity = ease;

            // Slide in from side
            // Me (Right): Slide from right (+offset -> 0)
            // Other (Left): Slide from left (-offset -> 0) 
            const offset = config.animation.messageAppearOffset * (1 - ease);
            translateX = isMe ? offset : -offset;
        }

        // Compute rect for director targeting
        const isCentered = isMessageCentered(msgType, config);

        let rectX: number;
        if (isCentered) {
            // Center system messages
            rectX = (viewportWidth - bubbleWidth) / 2;
        } else {
            rectX = isMe
                ? viewportWidth - config.spacing.global.bubbleMargin - bubbleWidth
                : config.spacing.global.bubbleMargin;
        }

        const rect = {
            x: rectX,
            y: currentY,
            width: bubbleWidth,
            height,
        };

        messageLayouts[msg.id] = {
            id: msg.id,
            y: currentY,
            height,
            opacity,
            translateY,
            translateX,
            rect,
        };

        // --- SEMANTIC ANCHOR GENERATION ---

        // 1. Message Anchor
        const anchorId = msg.id;
        semanticRegions[anchorId] = {
            id: anchorId,
            rect,
            tags: ["message", msg.from === "me" ? "message_me" : "message_other", msgType],
            metadata: {
                from: msg.from,
                type: msgType,
                timestamp: msg.timestamp
            }
        };
        semanticGroups["message"].push(anchorId);
        if (msgType === "system") {
            semanticGroups["system"].push(anchorId);
        }

        lastMessageId = msg.id;
        currentY += height;
    }

    // ==========================================================
    // TYPING INDICATOR
    // ==========================================================
    let typingLayout: TypingLayout | null = null;
    const isTyping = Object.values(conversation.typing || {}).some(v => v);

    if (isTyping) {
        const typingConfig = config.messageTypes.typing;
        const typingHeight = typingConfig.height.base;
        const typingWidth = typingConfig.width.fixed || typingConfig.width.min;

        // Calculate gap before typing indicator
        const lastMsg = messages[messages.length - 1];
        if (lastMsg) {
            const prevForGap: MessageForGap = {
                type: lastMsg.type as MessageType,
                from: lastMsg.from,
                at: lastMsg.at,
                hasReply: (lastMsg as any).replyTo != null,
                hasReactions: (lastMsg as any).reactions?.length > 0,
            };
            const typingForGap: MessageForGap = {
                type: "typing",
                from: "other",  // Typing is always from other person
                hasReply: false,
                hasReactions: false,
            };

            const gapContext: GapContext = {
                prevMessage: prevForGap,
                nextMessage: typingForGap,
            };

            const gap = calculateSmartGap(gapContext, config);
            currentY += gap;
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
    const inputHeight = config.messageTypes.text.height.base; // Approximate or from config
    // Actually, Input Area is fixed to bottom of viewport usually, or below content?
    // In chat layout, contentHeight includes padding. Input area is separate.
    // Ideally, the InputArea component itself should report this, but since we compute layout here:
    // We can define a "logical" input area anchor at the bottom of the viewport.

    const INPUT_HEIGHT = UI_CONSTANTS.INPUT_MIN_HEIGHT;

    // HEADER CONSTANTS (From Shared Config)
    // Note: This relies on ChatScreen's default safeAreaInsets if not provided in layout ctx
    // In layout context, we might not have insets.
    // Let's assume iPhone 16 default top inset (47) + Content Height (60) = 107
    // TODO: Pass safeAreaInsets to layout context for perfect alignment
    const SAFE_AREA_TOP_ASSUMED = 47;
    const HEADER_HEIGHT = UI_CONSTANTS.HEADER_CONTENT_HEIGHT + SAFE_AREA_TOP_ASSUMED;

    // Profile Position Calculation
    const PROFILE_SIZE = UI_CONSTANTS.HEADER_AVATAR_SIZE;
    // X = Left Padding + Back Button + Margin + Margin (Approximate check against Header.tsx flex)
    // Header.tsx: paddingLeft(10) + BackBtn(24+5+17+margin) + Avatar
    // Let's reverse engineer exact X from Header.tsx visual flow:
    // Pl(10) + BackBtnWrapper(marginRight 5) + Avatar
    // BackBtnWrapper: Width is roughly 24 (icon) + 17 (text) + gaps
    const PROFILE_X_OFFSET = 10 + (24 + 17) + 10; // Approx 61px

    // Y = SafeAreaTop + (ContentHeight - AvatarSize)/2
    const PROFILE_Y_OFFSET = SAFE_AREA_TOP_ASSUMED + (UI_CONSTANTS.HEADER_CONTENT_HEIGHT - PROFILE_SIZE) / 2;

    const inputRect = {
        x: 0,
        y: viewportHeight - INPUT_HEIGHT,
        width: viewportWidth,
        height: INPUT_HEIGHT
    };

    semanticRegions["input_area"] = {
        id: "input_area",
        rect: inputRect,
        tags: ["input", "footer"],
        metadata: { sticky: true }
    };

    // Header Region (Sticky Top)
    semanticRegions["header"] = {
        id: "header",
        rect: { x: 0, y: 0, width: viewportWidth, height: HEADER_HEIGHT },
        tags: ["header", "nav"],
        metadata: { sticky: true }
    };

    // Profile Region (Inside Header)
    semanticRegions["profile"] = {
        id: "profile",
        rect: { x: PROFILE_X_OFFSET, y: PROFILE_Y_OFFSET, width: PROFILE_SIZE, height: PROFILE_SIZE },
        tags: ["profile", "avatar"],
        metadata: { sticky: true }
    };


    const contentHeight = currentY + config.spacing.global.bottomPadding;

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
            isGroupChat,  // Expose for components
        },
        semantic: {
            regions: semanticRegions,
            groups: semanticGroups
        }
    };
}
