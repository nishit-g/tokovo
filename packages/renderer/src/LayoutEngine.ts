import {
    LayoutContext,
    LayoutState,
    LayoutConfig,
    ChatLayoutState,
    FeedLayoutState,
    StoryLayoutState,
    LockscreenLayoutState,
    TransitionLayoutState,
    ChatMessageLayout,
    TypingLayout,
    FeedItemLayout,
    StoryItemLayout,
    NotificationLayout
} from "./types";

// --- Default Configuration ---

export const defaultLayoutConfig: LayoutConfig = {
    cinematicMode: "NONE",
    chat: {
        bubbleWidth: 0.75, // 75% of screen width
        baseBubbleHeight: 60,
        charsPerLine: 30,
        lineHeight: 40,
        verticalGap: 15,
        topPadding: 120, // Space for header
        bottomPadding: 100, // Space for input
        messageAppearDuration: 15, // frames
        messageAppearOffset: 10, // px
        scrollEasingDuration: 20, // frames
        maxScrollCatchupSpeed: 50, // px/frame
        lockToBottom: true
    },
    feed: {
        cardWidth: 1.0, // 100% width
        baseCardHeight: 600,
        verticalGap: 20,
        topPadding: 150, // Header + Stories
        bottomPadding: 150, // Bottom nav
        charsPerLine: 40,
        lineHeight: 30,
        scrollEasingDuration: 20,
        maxScrollCatchupSpeed: 50,
        startAtTop: true,
        autoScroll: false
    },
    story: {
        defaultStoryDuration: 150, // 5 seconds at 30fps
        progressBarHeight: 4,
        storyGap: 0,
        storyTransitionDuration: 15
    },
    lockscreen: {
        topPadding: 150,
        notificationGap: 10,
        notificationWidth: 0.9,
        baseNotificationHeight: 100,
        charsPerLine: 40,
        lineHeight: 30,
        stackMaxNotifications: 5,
        appearDuration: 15
    },
    transition: {
        defaultScale: 1.0,
        zoomedScale: 1.2,
        panDuration: 30,
        zoomDuration: 30
    }
};

// --- Core Compute Function ---

export function computeLayout(ctx: LayoutContext): LayoutState {
    // Merge provided config with defaults
    const config = { ...defaultLayoutConfig, ...ctx.config };
    const fullCtx = { ...ctx, config };

    switch (ctx.viewKind) {
        case "CHAT":
            return computeChatLayout(fullCtx);
        case "FEED":
            return computeFeedLayout(fullCtx);
        case "STORY":
            return computeStoryLayout(fullCtx);
        case "LOCKSCREEN":
            return computeLockscreenLayout(fullCtx);
        case "TRANSITION":
            return computeTransitionLayout(fullCtx);
        default:
            // Fallback to empty transition state
            return {
                kind: "TRANSITION",
                deviceTranslateX: 0,
                deviceTranslateY: 0,
                deviceScale: 1,
                deviceRotation: 0,
                overlayOpacity: 0,
                meta: {}
            };
    }
}

// --- Strategy Placeholders ---

function computeChatLayout(ctx: LayoutContext): ChatLayoutState {
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
    const messages = conversation.messages.filter(m => m.at <= t);

    const messageLayouts: Record<string, ChatMessageLayout> = {};
    let currentY = chatConfig.topPadding;

    // 1. Layout messages
    for (const msg of messages) {
        // Calculate height
        // Simple heuristic: chars per line
        const textLength = msg.text?.length || 0;
        const lines = Math.ceil(Math.max(1, textLength) / chatConfig.charsPerLine);
        const height = lines * chatConfig.lineHeight + 20; // +20 for internal padding

        // Animation: Slide in / Fade in
        const timeSinceAppear = t - msg.at;
        let opacity = 1;
        let translateY = 0;

        if (timeSinceAppear < chatConfig.messageAppearDuration) {
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

function computeFeedLayout(ctx: LayoutContext): FeedLayoutState {
    const { world, t, activeAppId, config, viewportHeight } = ctx;
    const feedConfig = config!.feed!;

    // Get feed data from app state
    // Heuristic: look for "feed" property in the active app state
    const appState = world.appState?.[activeAppId];
    const posts = appState?.feed?.posts || [];

    const itemLayouts: Record<string, FeedItemLayout> = {};
    let currentY = feedConfig.topPadding;

    // 1. Layout posts
    for (const post of posts) {
        // Calculate height
        // Heuristic: base height + caption lines
        const captionLength = post.caption?.length || 0;
        const lines = Math.ceil(Math.max(1, captionLength) / feedConfig.charsPerLine);
        const height = feedConfig.baseCardHeight + (lines * feedConfig.lineHeight);

        itemLayouts[post.id] = {
            id: post.id,
            y: currentY,
            height,
            opacity: 1,
            translateY: 0,
            scale: 1
        };

        currentY += height + feedConfig.verticalGap;
    }

    const contentHeight = currentY + feedConfig.bottomPadding;

    // 2. Scroll Position
    // Default: start at top (0)
    // If autoScroll is enabled, scroll over time
    let scrollY = 0;
    if (feedConfig.autoScroll) {
        // Simple auto-scroll: 50px per second (assuming 30fps)
        const speed = 50 / 30;
        scrollY = t * speed;
    } else if (appState?.feed?.scrollPosition !== undefined) {
        // Use scroll position from app state if available (manual control)
        scrollY = appState.feed.scrollPosition;
    }

    // Clamp scroll
    const maxScroll = Math.max(0, contentHeight - viewportHeight);
    scrollY = Math.min(scrollY, maxScroll);

    return {
        kind: "FEED",
        scrollY,
        contentHeight,
        isAtBottom: Math.abs(scrollY - maxScroll) < 10,
        itemLayouts,
        meta: {
            // TODO: Calculate visible items
        }
    };
}

function computeStoryLayout(ctx: LayoutContext): StoryLayoutState {
    const { world, t, activeAppId, config } = ctx;
    const storyConfig = config!.story!;

    // Get stories from app state
    const appState = world.appState?.[activeAppId];
    // Find active user's stories
    // Heuristic: activeStoryId format "username:storyId"
    // Or just use the first user in the stories list for now if no ID
    const activeStoryId = ctx.activeStoryId || appState?.stories?.activeStoryId;

    let stories: any[] = [];
    let activeUserIndex = 0;

    if (activeStoryId) {
        const username = activeStoryId.split(':')[0];
        const user = appState?.stories?.users.find((u: any) => u.username === username);
        if (user) {
            stories = user.stories;
        }
    } else if (appState?.stories?.users?.length > 0) {
        // Fallback to first user
        stories = appState.stories.users[0].stories;
    }

    const storyCount = stories.length;
    if (storyCount === 0) {
        return {
            kind: "STORY",
            activeStoryIndex: 0,
            storyCount: 0,
            storyProgress: 0,
            storyLayouts: []
        };
    }

    // Calculate active index based on time
    // We assume t starts at 0 when the story view opens. 
    // In a real app, we might need a "startT" in the context or meta.
    // For now, let's assume global t maps to story progress.

    const totalDuration = storyCount * storyConfig.defaultStoryDuration;
    // Loop or clamp? Let's clamp.
    const effectiveT = Math.max(0, Math.min(t, totalDuration - 1));

    const activeStoryIndex = Math.floor(effectiveT / storyConfig.defaultStoryDuration);
    const timeInStory = effectiveT % storyConfig.defaultStoryDuration;
    const storyProgress = timeInStory / storyConfig.defaultStoryDuration;

    const storyLayouts: StoryItemLayout[] = stories.map((story: any, index: number) => {
        let opacity = 0;
        let scale = 1;
        let translateX = 0;

        if (index === activeStoryIndex) {
            opacity = 1;
            // Subtle zoom effect
            scale = 1 + (storyProgress * 0.05);
        } else if (index < activeStoryIndex) {
            // Previous story
            opacity = 0;
            translateX = -100; // Move left
        } else {
            // Next story
            opacity = 0;
            translateX = 100; // Move right
        }

        return {
            id: story.id,
            index,
            translateX,
            translateY: 0,
            scale,
            opacity
        };
    });

    return {
        kind: "STORY",
        activeStoryIndex,
        storyCount,
        storyProgress,
        storyLayouts
    };
}

function computeLockscreenLayout(ctx: LayoutContext): LockscreenLayoutState {
    const { world, t, activeDeviceId, config } = ctx;
    const lockConfig = config!.lockscreen!;

    const device = world.devices[activeDeviceId];
    const notifications = device?.notifications || [];

    const notificationLayouts: NotificationLayout[] = [];
    let currentY = lockConfig.topPadding;

    // Layout notifications
    // Show only the last N notifications
    const visibleNotifications = notifications.slice(-lockConfig.stackMaxNotifications);

    for (const notification of visibleNotifications) {
        // Calculate height
        // Heuristic: base height + text length
        const textLength = (notification.title?.length || 0) + (notification.body?.length || 0);
        const lines = Math.ceil(Math.max(1, textLength) / lockConfig.charsPerLine);
        const height = lockConfig.baseNotificationHeight + (lines * lockConfig.lineHeight);

        // Animation: Slide in
        // Assuming we have an 'at' time for notifications, but the type might not have it.
        // If not, we just show them.
        // Let's assume we want them to appear instantly for now.

        notificationLayouts.push({
            id: notification.id,
            y: currentY,
            height,
            opacity: 1,
            translateY: 0
        });

        currentY += height + lockConfig.notificationGap;
    }

    return {
        kind: "LOCKSCREEN",
        notificationLayouts,
        meta: {}
    };
}

function computeTransitionLayout(ctx: LayoutContext): TransitionLayoutState {
    const { world, t, config } = ctx;
    const transitionConfig = config!.transition!;

    // Basic transition logic based on camera state
    // If camera.type is "TRANSITION", we use its params
    // Otherwise we use defaults

    let deviceScale = transitionConfig.defaultScale;
    let deviceTranslateX = 0;
    let deviceTranslateY = 0;
    let deviceRotation = 0;
    let overlayOpacity = 0;

    if (world.camera?.type === "TRANSITION") {
        // TODO: Implement complex transitions based on camera params
        // For now, just a placeholder
    }

    return {
        kind: "TRANSITION",
        deviceTranslateX,
        deviceTranslateY,
        deviceScale,
        deviceRotation,
        overlayOpacity,
        meta: {}
    };
}
