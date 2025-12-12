import { LayoutContext, ChatLayoutState, ChatMessageLayout, TypingLayout } from "../types";

export function computeChatLayout(ctx: LayoutContext): ChatLayoutState {
    const { world, t, activeConversationId, config, viewportHeight } = ctx;
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

    // 1. Layout messages
    for (const msg of messages) {
        // Calculate height based on message type
        let height: number;

        if (msg.type === "system") {
            // System messages are shorter (single line centered pill)
            height = 90;
        } else if (msg.type === "voice") {
            // Voice messages have fixed height
            height = 180;
        } else {
            // Text messages: calculate based on text length
            const textLength = msg.text?.length || 0;
            const lines = Math.ceil(Math.max(1, textLength) / chatConfig.charsPerLine);
            // Add extra height for sender name in group chats
            const hasSenderName = msg.from && msg.from !== "me" && msg.from !== "system";
            const senderNameHeight = hasSenderName ? 45 : 0;
            height = lines * chatConfig.lineHeight + 30 + senderNameHeight;
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

        messageLayouts[msg.id] = {
            id: msg.id,
            y: currentY,
            height,
            opacity,
            translateY
        };

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
            opacity: 1
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
            lastMessageId: messages.length > 0 ? messages[messages.length - 1].id : undefined
        }
    };
}
