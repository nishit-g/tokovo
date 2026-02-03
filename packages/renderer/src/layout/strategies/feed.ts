import { LayoutContext, FeedLayoutState, FeedItemLayout } from "../types";

interface FeedPost {
  id: string;
  caption?: string;
}

interface FeedAppState {
  posts?: FeedPost[];
  scrollPosition?: number;
}

export function computeFeedLayout(ctx: LayoutContext): FeedLayoutState {
  const { world, t, activeAppId, config, viewportHeight } = ctx;
  const feedConfig = config?.feed;
  if (!feedConfig) {
    return {
      kind: "FEED",
      scrollY: 0,
      contentHeight: 0,
      isAtBottom: true,
      itemLayouts: {},
      meta: {},
    };
  }

  const appState = world.appState?.[activeAppId] as
    | { feed?: FeedAppState }
    | undefined;
  const posts = appState?.feed?.posts || [];

  const itemLayouts: Record<string, FeedItemLayout> = {};
  let currentY = feedConfig.topPadding;

  for (const post of posts) {
    const captionLength = post.caption?.length || 0;
    const lines = Math.ceil(
      Math.max(1, captionLength) / feedConfig.charsPerLine,
    );
    const height = feedConfig.baseCardHeight + lines * feedConfig.lineHeight;

    itemLayouts[post.id] = {
      id: post.id,
      y: currentY,
      height,
      opacity: 1,
      translateY: 0,
      scale: 1,
    };

    currentY += height + feedConfig.verticalGap;
  }

  const contentHeight = currentY + feedConfig.bottomPadding;

  let scrollY = 0;
  if (feedConfig.autoScroll) {
    const speed = 50 / 30;
    scrollY = t * speed;
  } else if (appState?.feed?.scrollPosition !== undefined) {
    scrollY = appState.feed.scrollPosition;
  }

  const maxScroll = Math.max(0, contentHeight - viewportHeight);
  scrollY = Math.min(scrollY, maxScroll);

  return {
    kind: "FEED",
    scrollY,
    contentHeight,
    isAtBottom: Math.abs(scrollY - maxScroll) < 10,
    itemLayouts,
    meta: {},
  };
}
