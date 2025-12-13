import { LayoutContext, ChatLayoutState, ChatMessageLayout, TypingLayout } from "../types";
import {
    MessageLayoutConfig,
    DEFAULT_LAYOUT_CONFIG,
    calculateMessageHeight,
    applyEasing,
    MessageForHeight,
} from "@tokovo/apps-whatsapp";

// =============================================================================
// CONFIGURABLE CHAT LAYOUT STRATEGY
// =============================================================================

/**
 * Compute chat layout using the configurable layout system.
 * Supports smooth scrolling, configurable heights, and future features.
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

    const messageLayouts: Record<string, ChatMessageLayout> = {};
    let currentY = config.spacing.topPadding;
    let lastMessageId: string | undefined;

    // 1. Layout messages with configurable heights
    for (const msg of messages) {
        // Calculate height using the config-based function
        const msgForHeight: MessageForHeight = {
            type: msg.type as MessageForHeight["type"],
            text: msg.text,
            caption: (msg as any).caption,
            from: msg.from,
            reactions: (msg as any).reactions,
            replyTo: (msg as any).replyTo,
            linkPreview: (msg as any).linkPreview,
        };

        const height = calculateMessageHeight(msgForHeight, config);

        // Calculate bubble width
        let bubbleWidth: number;
        const msgType = msg.type || "text";

        if (msgType === "system") {
            bubbleWidth = viewportWidth * 0.6; // Centered system message
        } else if (msgType === "voice") {
            bubbleWidth = 450; // Fixed voice message width
        } else if (msgType === "image" || msgType === "video" || msgType === "gif") {
            bubbleWidth = viewportWidth * config.spacing.bubbleMaxWidth;
        } else {
            // Text messages: width based on content
            const textLength = msg.text?.length || 0;
            const avgCharWidth = 14;
            const maxCharsOnLine = Math.min(textLength, config.heights.text.charsPerLine);
            const textWidth = maxCharsOnLine * avgCharWidth + 72;
            bubbleWidth = Math.min(
                viewportWidth * config.spacing.bubbleMaxWidth,
                Math.max(textWidth, 150)
            );
        }

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
        const rectX = isMe
            ? viewportWidth - config.spacing.bubbleMargin - bubbleWidth
            : config.spacing.bubbleMargin;

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
        currentY += height + config.spacing.gap;
    }

    // 2. Typing indicator
    let typingLayout: TypingLayout | null = null;
    const isTyping = Object.values(conversation.typing || {}).some(v => v);
    if (isTyping) {
        const height = 120; // Typing bubble height
        typingLayout = {
            y: currentY,
            height,
            opacity: 1,
            rect: {
                x: config.spacing.bubbleMargin,
                y: currentY,
                width: 150,
                height,
            },
        };
        currentY += height + config.spacing.gap;
    }

    const contentHeight = currentY + config.spacing.bottomPadding;

    // 3. Scroll Position with smooth scrolling
    let scrollY = 0;
    if (config.scroll.lockToBottom) {
        const maxScroll = Math.max(0, contentHeight - viewportHeight);

        // For now, instant scroll (smooth scroll can be added with cursor tracking)
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
            lastMessageId
        }
    };
}

// For backward compatibility, export the config types
export { MessageLayoutConfig, DEFAULT_LAYOUT_CONFIG };
