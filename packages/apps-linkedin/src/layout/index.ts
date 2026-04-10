import type {
  ChatLayoutState,
  FeedLayoutState,
  FullscreenLayoutState,
  LayoutContext,
  LayoutRect,
  PluginLayoutStrategy,
  SemanticRegion,
} from "@tokovo/core";

import type { LinkedInState } from "../runtime/state.js";
import { getLinkedInFeedLayoutMetrics } from "../feed-metrics.js";
import { liSpacing } from "../ui/tokens.js";

const DESIGN_WIDTH = 393;

function rect(x: number, y: number, width: number, height: number): LayoutRect {
  return { x, y, width, height };
}

function buildSemantic(regions: Record<string, SemanticRegion>, groups: Record<string, string[]> = {}) {
  return { regions, groups };
}

function getAppState(ctx: LayoutContext): Partial<LinkedInState> {
  return (ctx.world.appState?.app_linkedin ?? {}) as Partial<LinkedInState>;
}

function getFeedFocusIndex(state: Partial<LinkedInState>): number {
  if (!state.feed?.length) return 0;
  if (!state.activePostId) return 0;
  const index = state.feed.indexOf(state.activePostId);
  return index >= 0 ? index : 0;
}

function computeFeedLayout(ctx: LayoutContext): FeedLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets } = ctx;
  const safeTop = safeAreaInsets?.top ?? 0;
  const safeBottom = safeAreaInsets?.bottom ?? 0;
  const scale = w / DESIGN_WIDTH;
  const px = (value: number) => value * scale;
  const state = getAppState(ctx);
  const screen = state.currentScreen ?? "feed";

  const navH = px(liSpacing.navHeight);
  const navY = Math.max(0, h - safeBottom - navH);
  const headerH = safeTop + px(liSpacing.headerHeight);
  const contentY = headerH;
  const contentH = Math.max(0, navY - contentY);
  const cardX = px(liSpacing.screenPadding);
  const cardW = Math.max(0, w - cardX * 2);
  const gap = px(liSpacing.sm);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
    li_header: {
      id: "li_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    },
    li_nav_bar: {
      id: "li_nav_bar",
      rect: rect(0, navY, w, navH),
      tags: ["nav", "sticky"],
      metadata: { sticky: true },
    },
  };

  if (screen === "feed") {
    const composerH = px(liSpacing.feedComposerHeight);
    const sortH = px(liSpacing.sortRowHeight);
    const focusIndex = getFeedFocusIndex(state);
    const feedCount = Math.max(1, state.feed?.length ?? 1);
    const metrics = getLinkedInFeedLayoutMetrics(feedCount, focusIndex, scale, contentH);
    const contentHeight = composerH + gap + sortH + gap + metrics.contentHeight - metrics.feedTop;
    const scrollY = metrics.scrollY;
    const focusCardY =
      contentY +
      composerH +
      gap +
      sortH +
      gap +
      metrics.feedTop +
      focusIndex * (metrics.baseCardHeight + metrics.gap) -
      scrollY;
    const focusCardH = Math.min(metrics.focusedCardHeight, contentH - px(12));

    regions.li_feed = { id: "li_feed", rect: rect(0, contentY, w, contentH), tags: ["feed", "scroll"] };
    regions.li_feed_composer = {
      id: "li_feed_composer",
      rect: rect(cardX, contentY + px(8) - scrollY, cardW, composerH),
      tags: ["feed", "composer"],
    };
    regions.li_feed_sort = {
      id: "li_feed_sort",
      rect: rect(cardX, contentY + composerH + gap + px(8) - scrollY, cardW, sortH),
      tags: ["feed", "sort"],
    };
    regions.li_post_focus = {
      id: "li_post_focus",
      rect: rect(cardX, focusCardY, cardW, focusCardH),
      tags: ["post", "card", "focus"],
    };
    regions.li_post_focus_media = {
      id: "li_post_focus_media",
      rect: rect(cardX, focusCardY + px(162), cardW, px(liSpacing.postMediaHeight)),
      tags: ["post", "media", "focus"],
    };
    regions.li_post_focus_reactions = {
      id: "li_post_focus_reactions",
      rect: rect(cardX, focusCardY + focusCardH - px(118), cardW, px(34)),
      tags: ["post", "reactions", "focus"],
    };
    regions.li_post_focus_comments = {
      id: "li_post_focus_comments",
      rect: rect(cardX, focusCardY + focusCardH - px(82), cardW, px(42)),
      tags: ["post", "comments", "focus"],
    };
    regions.li_post_card = regions.li_post_focus;
    regions.li_reaction_row = regions.li_post_focus_reactions;
    regions.li_compose_fab = regions.li_feed_composer;

    return {
      kind: "FEED",
      cacheHint: "static",
      scrollY,
      contentHeight,
      isAtBottom: scrollY + contentH >= contentHeight - 2,
      itemLayouts: {},
      meta: {},
      semantic: buildSemantic(regions, {
        focus: ["li_post_focus", "li_post_focus_media", "li_post_focus_reactions", "li_post_focus_comments"],
      }),
    };
  }

  if (screen === "profile") {
    const heroH = px(liSpacing.profileHeroHeight);
    const highlightsH = px(liSpacing.profileHighlightsHeight);
    const postsY = contentY + heroH + highlightsH + px(liSpacing.profilePostsTopGap);

    regions.li_profile_header = {
      id: "li_profile_header",
      rect: rect(0, contentY, w, heroH),
      tags: ["profile", "header"],
    };
    regions.li_profile_actions = {
      id: "li_profile_actions",
      rect: rect(cardX, contentY + heroH - px(liSpacing.profileActionsHeight) - px(16), cardW, px(liSpacing.profileActionsHeight)),
      tags: ["profile", "actions"],
    };
    regions.li_profile_highlights = {
      id: "li_profile_highlights",
      rect: rect(cardX, contentY + heroH + px(8), cardW, highlightsH),
      tags: ["profile", "highlights"],
    };
    regions.li_profile_posts = {
      id: "li_profile_posts",
      rect: rect(0, postsY, w, Math.max(0, navY - postsY)),
      tags: ["profile", "posts", "scroll"],
    };
    regions.li_post_focus = {
      id: "li_post_focus",
      rect: rect(cardX, postsY + px(12), cardW, px(liSpacing.postCardHeight)),
      tags: ["post", "card", "focus"],
    };
  } else if (screen === "notifications") {
    regions.li_notifications_list = {
      id: "li_notifications_list",
      rect: rect(0, contentY, w, contentH),
      tags: ["notifications", "list", "scroll"],
    };
    regions.li_notifications_focus_row = {
      id: "li_notifications_focus_row",
      rect: rect(0, contentY + px(12), w, px(liSpacing.listRowHeight)),
      tags: ["notifications", "row", "focus"],
    };
  } else if (screen === "messages") {
    const searchBlockH = px(liSpacing.inputHeight + 96);
    const fabSize = px(liSpacing.fabSize);

    regions.li_messages_search = {
      id: "li_messages_search",
      rect: rect(cardX, contentY + px(8), cardW, searchBlockH),
      tags: ["messages", "search"],
    };
    regions.li_messages_list = {
      id: "li_messages_list",
      rect: rect(0, contentY + searchBlockH, w, Math.max(0, contentH - searchBlockH)),
      tags: ["messages", "list", "scroll"],
    };
    regions.li_messages_focus_row = {
      id: "li_messages_focus_row",
      rect: rect(0, contentY + searchBlockH + px(8), w, px(liSpacing.listRowHeight)),
      tags: ["messages", "row", "focus"],
    };
    regions.li_compose_fab = {
      id: "li_compose_fab",
      rect: rect(w - cardX - fabSize, navY - px(14) - fabSize, fabSize, fabSize),
      tags: ["messages", "compose", "sticky"],
      metadata: { sticky: true },
    };
  } else if (screen === "post") {
    const composerH = px(liSpacing.commentComposerHeight);
    const detailH = Math.max(0, contentH - composerH);

    regions.li_post_detail = {
      id: "li_post_detail",
      rect: rect(0, contentY, w, detailH),
      tags: ["post", "detail", "scroll"],
    };
    regions.li_post_detail_card = {
      id: "li_post_detail_card",
      rect: rect(cardX, contentY + px(8), cardW, px(liSpacing.postCardExpandedHeight)),
      tags: ["post", "card"],
    };
    regions.li_post_detail_comments = {
      id: "li_post_detail_comments",
      rect: rect(cardX, contentY + px(liSpacing.postCardExpandedHeight) + px(20), cardW, Math.max(0, detailH - px(liSpacing.postCardExpandedHeight) - px(28))),
      tags: ["post", "comments", "scroll"],
    };
    regions.li_comment_composer = {
      id: "li_comment_composer",
      rect: rect(0, navY - composerH, w, composerH),
      tags: ["composer", "sticky"],
      metadata: { sticky: true },
    };
  }

  return {
    kind: "FEED",
    cacheHint: "static",
    scrollY: 0,
    contentHeight: h,
    isAtBottom: false,
    itemLayouts: {},
    meta: {},
    semantic: buildSemantic(regions),
  };
}

function computeChatLayout(ctx: LayoutContext): ChatLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets } = ctx;
  const safeTop = safeAreaInsets?.top ?? 0;
  const safeBottom = safeAreaInsets?.bottom ?? 0;
  const scale = w / DESIGN_WIDTH;
  const px = (value: number) => value * scale;

  const headerH = safeTop + px(liSpacing.messageHeaderHeight);
  const composerH = px(liSpacing.dmComposerHeight) + safeBottom;
  const composerY = Math.max(0, h - composerH);
  const threadY = headerH;
  const threadH = Math.max(0, composerY - threadY);
  const bubbleW = Math.max(0, w * 0.66);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
    li_dm_header: {
      id: "li_dm_header",
      rect: rect(0, 0, w, headerH),
      tags: ["dm", "header", "sticky"],
      metadata: { sticky: true },
    },
    li_dm_thread: {
      id: "li_dm_thread",
      rect: rect(0, threadY, w, threadH),
      tags: ["dm", "thread", "scroll"],
    },
    li_dm_focus_message: {
      id: "li_dm_focus_message",
      rect: rect(w - bubbleW - px(liSpacing.screenPadding), composerY - px(140), bubbleW, px(44)),
      tags: ["dm", "message", "focus"],
    },
    li_dm_composer: {
      id: "li_dm_composer",
      rect: rect(0, composerY, w, composerH),
      tags: ["composer", "sticky"],
      metadata: { sticky: true },
    },
  };

  return {
    kind: "CHAT",
    cacheHint: "static",
    scrollY: 0,
    contentHeight: h,
    isAtBottom: true,
    messageLayouts: {},
    meta: {},
    semantic: buildSemantic(regions),
  };
}

function computeFullscreenLayout(ctx: LayoutContext): FullscreenLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets } = ctx;
  const safeTop = safeAreaInsets?.top ?? 0;
  const safeBottom = safeAreaInsets?.bottom ?? 0;
  const scale = w / DESIGN_WIDTH;
  const px = (value: number) => value * scale;

  const headerH = safeTop + px(liSpacing.headerHeight);
  const bottomBarH = px(64) + safeBottom;

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
    li_compose_header: {
      id: "li_compose_header",
      rect: rect(0, 0, w, headerH),
      tags: ["compose", "header", "sticky"],
      metadata: { sticky: true },
    },
    li_compose_sheet: {
      id: "li_compose_sheet",
      rect: rect(0, headerH, w, Math.max(0, h - headerH - bottomBarH)),
      tags: ["compose"],
    },
    li_compose_actions: {
      id: "li_compose_actions",
      rect: rect(0, h - bottomBarH, w, bottomBarH),
      tags: ["compose", "actions", "sticky"],
      metadata: { sticky: true },
    },
  };

  return {
    kind: "FULLSCREEN",
    cacheHint: "static",
    meta: {},
    semantic: buildSemantic(regions),
  };
}

export const linkedInLayoutStrategies: PluginLayoutStrategy[] = [
  { viewKind: "FEED", computeLayout: computeFeedLayout },
  { viewKind: "CHAT", computeLayout: computeChatLayout },
  { viewKind: "FULLSCREEN", computeLayout: computeFullscreenLayout },
];
