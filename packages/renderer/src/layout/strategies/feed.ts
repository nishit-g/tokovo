import { LayoutContext, FeedLayoutState, FeedItemLayout } from "../types";

export function computeFeedLayout(ctx: LayoutContext): FeedLayoutState {
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
