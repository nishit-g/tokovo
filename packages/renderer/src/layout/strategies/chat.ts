import { LayoutContext, ChatLayoutState, ChatMessageLayout, TypingLayout } from "../types";

// Constants for rect calculation (match WhatsApp UI)
const BUBBLE_MARGIN_HORIZONTAL = 36;
const BUBBLE_MAX_WIDTH_PERCENT = 0.78;
const TYPING_BUBBLE_WIDTH = 150;

export function computeChatLayout(ctx: LayoutContext): ChatLayoutState {
    const { world, t, activeConversationId, config, viewportHeight, viewportWidth } = ctx;
    const chatConfig = config!.chat!;

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
    // Messages without 'at' field (initial messages) are always visible
    // Messages with 'at' field are visible when at <= t
    const messages = conversation.messages.filter(m => m.at === undefined || m.at <= t);

    const messageLayouts: Record<string, ChatMessageLayout> = {};
    let currentY = chatConfig.topPadding;
    let lastMessageId: string | undefined;

    // 1. Layout messages
    for (const msg of messages) {
        // Calculate height based on message type
        let height: number;
        let bubbleWidth: number;

        if (msg.type === "system") {
            // System messages are shorter (single line centered pill)
            height = 80;
            bubbleWidth = viewportWidth * 0.6; // Centered system message
        } else if (msg.type === "voice") {
            // Voice messages have fixed height
            height = 180;
            bubbleWidth = 450; // Fixed voice message width
        } else {
            // Text messages: calculate based on text length
            const textLength = msg.text?.length || 0;
            const lines = Math.ceil(Math.max(1, textLength) / chatConfig.charsPerLine);

            // Height breakdown:
            // - Top/bottom padding: 24px each = 48px (at 3x = 144)
            // - Text: lines * lineHeight
            // - Timestamp row: ~40px (at 3x = 120)
            // - Sender name (groups): additional 50px
            const basepadding = 48;         // Top + bottom padding (16px each at 3x)
            const timestampHeight = 40;     // Timestamp row
            const hasSenderName = msg.from && msg.from !== "me" && msg.from !== "system";
            const senderNameHeight = hasSenderName ? 45 : 0;

            height = basepadding + (lines * chatConfig.lineHeight) + timestampHeight + senderNameHeight;

            // Width: Use same line-wrap logic as height
            // Width based on actual content lines, not raw length
            const avgCharWidth = 14; // Approximate at 3x scale
            const maxCharsOnLine = Math.min(textLength, chatConfig.charsPerLine);
            const textWidth = maxCharsOnLine * avgCharWidth + 72; // + padding
            bubbleWidth = Math.min(viewportWidth * BUBBLE_MAX_WIDTH_PERCENT, Math.max(textWidth, 150));
        }

        // Animation: Slide in / Fade in
        const messageAt = msg.at ?? 0;
        const timeSinceAppear = t - messageAt;
        let opacity = 1;
        let translateY = 0;

        if (timeSinceAppear >= 0 && timeSinceAppear < chatConfig.messageAppearDuration) {
            const progress = timeSinceAppear / chatConfig.messageAppearDuration;
            // Simple ease-out
            const ease = 1 - Math.pow(1 - progress, 3);
            opacity = ease;
            translateY = chatConfig.messageAppearOffset * (1 - ease);
        }

        // Compute rect for director targeting
        const isMe = msg.from === "me";
        const rectX = isMe
            ? viewportWidth - BUBBLE_MARGIN_HORIZONTAL - bubbleWidth
            : BUBBLE_MARGIN_HORIZONTAL;

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
        currentY += height + chatConfig.verticalGap;
    }

    // 2. Typing indicator
    let typingLayout: TypingLayout | null = null;
    const isTyping = Object.values(conversation.typing || {}).some(v => v);
    if (isTyping) {
        const height = chatConfig.baseBubbleHeight;
        typingLayout = {
            y: currentY,
            height,
            opacity: 1,
            rect: {
                x: BUBBLE_MARGIN_HORIZONTAL,
                y: currentY,
                width: TYPING_BUBBLE_WIDTH,
                height,
            },
        };
        currentY += height + chatConfig.verticalGap;
    }

    const contentHeight = currentY + chatConfig.bottomPadding;

    // 3. Scroll Position
    // Lock to bottom logic
    let scrollY = 0;
    if (chatConfig.lockToBottom) {
        const maxScroll = Math.max(0, contentHeight - viewportHeight);
        scrollY = maxScroll;

        // TODO: Implement smooth scrolling based on message arrival times if needed
        // For now, instant snap to bottom is robust
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

