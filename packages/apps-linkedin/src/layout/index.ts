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
import { liSpacing } from "../ui/tokens.js";

const DESIGN_WIDTH = 393;

function rect(x: number, y: number, width: number, height: number): LayoutRect {
  return { x, y, width, height };
}

function buildSemantic(
  regions: Record<string, SemanticRegion>,
  groups: Record<string, string[]> = {},
) {
  return { regions, groups };
}

function computeFeedLayout(ctx: LayoutContext): FeedLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets, world } = ctx;
  const safeTop = safeAreaInsets?.top ?? 0;
  const safeBottom = safeAreaInsets?.bottom ?? 0;
  const scale = w / DESIGN_WIDTH;
  const px = (v: number) => v * scale;

  const state = (world.appState?.app_linkedin ?? {}) as Partial<LinkedInState>;
  const screen = state.currentScreen ?? "feed";

  const navH = px(liSpacing.navHeight);
  const navY = Math.max(0, h - safeBottom - navH);

  const headerH = safeTop + px(liSpacing.headerHeight);
  const contentY = headerH;
  const contentH = Math.max(0, navY - contentY);

  const cardX = px(liSpacing.cardPaddingH);
  const cardW = Math.max(0, w - 2 * cardX);
  const cardY = contentY + px(liSpacing.cardPaddingV);
  const cardH = Math.min(px(420), Math.max(px(240), contentH * 0.55));

  const reactionRowH = px(liSpacing.reactionRowHeight);
  const reactionRowY = cardY + Math.max(0, cardH - reactionRowH - px(12));

  const fabSize = px(liSpacing.fabSize);
  const fabX = Math.max(0, w - px(liSpacing.screenPadding) - fabSize);
  const fabY = Math.max(0, navY - px(liSpacing.screenPadding) - fabSize);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
    li_nav_bar: {
      id: "li_nav_bar",
      rect: rect(0, navY, w, navH),
      tags: ["nav", "sticky"],
      metadata: { sticky: true },
    },
    li_header: {
      id: "li_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    },
  };

  if (screen === "feed") {
    regions.li_feed = {
      id: "li_feed",
      rect: rect(0, contentY, w, contentH),
      tags: ["feed", "scroll"],
    };
    regions.li_post_card = {
      id: "li_post_card",
      rect: rect(cardX, cardY, cardW, cardH),
      tags: ["post", "card"],
    };
    regions.li_reaction_row = {
      id: "li_reaction_row",
      rect: rect(cardX, reactionRowY, cardW, reactionRowH),
      tags: ["post", "reactions"],
    };
    regions.li_compose_fab = {
      id: "li_compose_fab",
      rect: rect(fabX, fabY, fabSize, fabSize),
      tags: ["compose", "fab", "sticky"],
      metadata: { sticky: true },
    };
  }

  if (screen === "profile") {
    regions.li_profile_header = {
      id: "li_profile_header",
      rect: rect(0, 0, w, headerH + px(liSpacing.profileHeaderExtra)),
      tags: ["profile", "header", "sticky"],
      metadata: { sticky: true },
    };
    regions.li_feed = {
      id: "li_feed",
      rect: rect(0, headerH + px(liSpacing.profileHeaderExtra), w, Math.max(0, navY - (headerH + px(liSpacing.profileHeaderExtra)))),
      tags: ["feed", "scroll"],
    };
    regions.li_post_card = {
      id: "li_post_card",
      rect: rect(cardX, headerH + px(liSpacing.profileHeaderExtra) + px(liSpacing.cardPaddingV), cardW, Math.min(px(360), contentH * 0.45)),
      tags: ["post", "card"],
    };
  }

  if (screen === "notifications") {
    regions.li_notifications_list = {
      id: "li_notifications_list",
      rect: rect(0, contentY, w, contentH),
      tags: ["list", "notifications"],
    };
  }

  if (screen === "messages") {
    regions.li_messages_list = {
      id: "li_messages_list",
      rect: rect(0, contentY, w, contentH),
      tags: ["list", "messages"],
    };
  }

  if (screen === "post") {
    regions.li_post_detail = {
      id: "li_post_detail",
      rect: rect(0, contentY, w, contentH),
      tags: ["post", "detail"],
    };
    regions.li_comment_composer = {
      id: "li_comment_composer",
      rect: rect(0, navY - px(liSpacing.commentComposerHeight), w, px(liSpacing.commentComposerHeight)),
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
  const px = (v: number) => v * scale;

  const headerH = safeTop + px(liSpacing.headerHeight);
  const composerH = px(liSpacing.dmComposerHeight) + safeBottom;
  const composerY = Math.max(0, h - composerH);
  const threadY = headerH;
  const threadH = Math.max(0, composerY - threadY);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
    li_dm_thread: {
      id: "li_dm_thread",
      rect: rect(0, threadY, w, threadH),
      tags: ["dm", "thread"],
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
  const px = (v: number) => v * scale;

  const top = safeTop + px(liSpacing.headerHeight);
  const sheetH = Math.max(0, h - top - safeBottom);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
    li_compose_sheet: {
      id: "li_compose_sheet",
      rect: rect(0, top, w, sheetH),
      tags: ["compose"],
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
