import { LayoutContext, ChatLayoutState, ChatMessageLayout, TypingLayout } from "../types";
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
} from "@tokovo/apps-whatsapp";

// =============================================================================
// PRODUCTION-GRADE CHAT LAYOUT STRATEGY
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
    let currentY = config.spacing.global.topPadding;
    let lastMessageId: string | undefined;

    // ==========================================================
    // SINGLE-PASS LAYOUT ALGORITHM
    // ==========================================================
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const prevMsg = i > 0 ? messages[i - 1] : undefined;
        const msgType = (msg.type || "text") as MessageType;

        // Calculate gap from previous message
        if (prevMsg) {
            const prevForGap: MessageForGap = {
                type: prevMsg.type as MessageType,
                from: prevMsg.from,
                at: prevMsg.at,
                hasReply: (prevMsg as any).replyTo != null,
                hasReactions: (prevMsg as any).reactions?.length > 0,
            };
            const nextForGap: MessageForGap = {
                type: msg.type as MessageType,
                from: msg.from,
                at: msg.at,
                hasReply: (msg as any).replyTo != null,
                hasReactions: (msg as any).reactions?.length > 0,
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
            text: msg.text,
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

        const height = calculateMessageHeight(msgForHeight, config);

        // Calculate bubble width using per-type config
        const bubbleWidth = calculateBubbleWidth(msgForHeight, viewportWidth, config);

        // Animation: Slide in / Fade in with configurable duration
        const messageAt = msg.at ?? 0;
        const timeSinceAppear = t - messageAt;
        let opacity = 1;
        let translateY = 0;

        if (timeSinceAppear >= 0 && timeSinceAppear < config.animation.messageAppearDuration) {
            const progress = timeSinceAppear / config.animation.messageAppearDuration;
            const ease = applyEasing(progress, "easeOut");
            opacity = ease;
            translateY = config.animation.messageAppearOffset * (1 - ease);
        }

        // Compute rect for director targeting
        const isMe = msg.from === "me";
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

        messageLayouts[msg.id] = {
            id: msg.id,
            y: currentY,
            height,
            opacity,
            translateY,
            rect: {
                x: rectX,
                y: currentY,
                width: bubbleWidth,
                height,
            },
        };

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

        typingLayout = {
            y: currentY,
            height: typingHeight,
            opacity: 1,
            rect: {
                x: config.spacing.global.bubbleMargin,
                y: currentY,
                width: typingWidth,
                height: typingHeight,
            },
        };
        currentY += typingHeight;
    }

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
        }
    };
}

// For backward compatibility, export the config types
export { MessageLayoutConfig, DEFAULT_LAYOUT_CONFIG };
