import type {
  ChatLayoutState,
  FeedLayoutState,
  FullscreenLayoutState,
  LayoutContext,
  LayoutRect,
  PluginLayoutStrategy,
  SemanticRegion,
} from "@tokovo/core";

import type { XState } from "../runtime/state.js";
import { xSpacing } from "../config/tokens.js";

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

function computeXFeedLayout(ctx: LayoutContext): FeedLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets, world } = ctx;
  const safeTop = safeAreaInsets?.top ?? 0;
  const safeBottom = safeAreaInsets?.bottom ?? 0;
  const scale = w / DESIGN_WIDTH;
  const px = (v: number) => v * scale;

  const state = (world.appState?.app_x ?? {}) as Partial<XState>;
  const screen = state.currentScreen ?? "timeline";

  const navHeight = px(xSpacing.navHeight);
  const headerBase = px(xSpacing.headerHeight);
  const tabBarHeight = px(xSpacing.tabBarHeight);
  const screenPad = px(xSpacing.screenPadding);

  const navY = Math.max(0, h - safeBottom - navHeight);
  const headerH =
    screen === "timeline" || screen === "notifications" || screen === "messages"
      ? safeTop + headerBase + tabBarHeight
      : safeTop + headerBase;

  const feedY = headerH;
  const feedH = Math.max(0, navY - feedY);

  // "Tweet card" is a semantic focus target for the most visually dominant card
  // in the feed area. Keep it token-based and stable rather than percent-based.
  const tweetCardX = px(xSpacing.tweetPaddingH);
  const tweetCardW = Math.max(0, w - px(xSpacing.tweetPaddingH) * 2);
  const tweetCardY = feedY + px(xSpacing.tweetPaddingV);
  const tweetCardH = Math.min(320, Math.max(180, feedH * 0.45));

  const metricsRowH = px(44);
  const metricsRowY =
    tweetCardY + Math.max(0, tweetCardH - metricsRowH - px(12));

  const fabSize = px(xSpacing.fabSize);
  const fabX = Math.max(0, w - screenPad - fabSize);
  const fabY = Math.max(0, navY - screenPad - fabSize);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
    nav_bar: {
      id: "nav_bar",
      rect: rect(0, navY, w, navHeight),
      tags: ["nav", "sticky"],
      metadata: { sticky: true },
    },
  };

  if (screen === "timeline" || screen === "profile") {
    regions.timeline_header = {
      id: "timeline_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    if (screen === "profile") {
      regions.profile_header = {
        id: "profile_header",
        rect: rect(0, 0, w, headerH),
        tags: ["header", "profile", "sticky"],
        metadata: { sticky: true },
      };
    }
    regions.timeline_feed = {
      id: "timeline_feed",
      rect: rect(0, feedY, w, feedH),
      tags: ["feed", "scroll"],
    };
    regions.tweet_card = {
      id: "tweet_card",
      rect: rect(tweetCardX, tweetCardY, tweetCardW, tweetCardH),
      tags: ["tweet", "card"],
    };
    regions.metrics_row = {
      id: "metrics_row",
      rect: rect(tweetCardX, metricsRowY, tweetCardW, metricsRowH),
      tags: ["tweet", "metrics"],
    };
    regions.compose_fab = {
      id: "compose_fab",
      rect: rect(fabX, fabY, fabSize, fabSize),
      tags: ["compose", "fab", "sticky"],
      metadata: { sticky: true },
    };
  }

  if (screen === "tweet") {
    regions.timeline_header = {
      id: "timeline_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.tweet_card = {
      id: "tweet_card",
      rect: rect(
        tweetCardX,
        feedY + px(12),
        tweetCardW,
        Math.min(px(420), feedH * 0.6),
      ),
      tags: ["tweet", "detail"],
    };
    regions.metrics_row = {
      id: "metrics_row",
      rect: rect(
        tweetCardX,
        feedY +
          px(12) +
          Math.min(px(420), feedH * 0.6) -
          metricsRowH -
          px(12),
        tweetCardW,
        metricsRowH,
      ),
      tags: ["tweet", "metrics"],
    };
    regions.reply_composer = {
      id: "reply_composer",
      rect: rect(0, navY - px(120), w, px(120)),
      tags: ["composer"],
      metadata: { sticky: true },
    };
  }

  if (screen === "notifications") {
    regions.timeline_header = {
      id: "timeline_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.notifications_list = {
      id: "notifications_list",
      rect: rect(0, feedY, w, feedH),
      tags: ["list", "notifications"],
    };
  }

  if (screen === "messages") {
    regions.timeline_header = {
      id: "timeline_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.dm_thread = {
      id: "dm_thread",
      rect: rect(0, feedY, w, feedH),
      tags: ["dm", "list"],
    };
    regions.compose_fab = {
      id: "compose_fab",
      rect: rect(fabX, fabY, fabSize, fabSize),
      tags: ["compose", "fab", "sticky"],
      metadata: { sticky: true },
    };
  }

  return {
    kind: "FEED",
    scrollY: 0,
    contentHeight: h,
    isAtBottom: false,
    itemLayouts: {},
    meta: {},
    semantic: buildSemantic(regions),
  };
}

function computeXChatLayout(ctx: LayoutContext): ChatLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets } = ctx;
  const safeTop = safeAreaInsets?.top ?? 0;
  const safeBottom = safeAreaInsets?.bottom ?? 0;
  const scale = w / DESIGN_WIDTH;
  const px = (v: number) => v * scale;

  const headerH = safeTop + px(xSpacing.headerHeight);
  const composerH = px(120);
  const composerY = Math.max(0, h - safeBottom - composerH);
  const threadY = headerH;
  const threadH = Math.max(0, composerY - threadY);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
    dm_thread: { id: "dm_thread", rect: rect(0, threadY, w, threadH), tags: ["dm", "thread"] },
    reply_composer: {
      id: "reply_composer",
      rect: rect(0, composerY, w, composerH),
      tags: ["composer", "sticky"],
      metadata: { sticky: true },
    },
  };

  return {
    kind: "CHAT",
    scrollY: 0,
    contentHeight: h,
    isAtBottom: true,
    messageLayouts: {},
    meta: {},
    semantic: buildSemantic(regions),
  };
}

function computeXFullscreenLayout(ctx: LayoutContext): FullscreenLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets } = ctx;
  const safeTop = safeAreaInsets?.top ?? 0;
  const safeBottom = safeAreaInsets?.bottom ?? 0;
  const scale = w / DESIGN_WIDTH;
  const px = (v: number) => v * scale;

  const headerH = safeTop + px(xSpacing.headerHeight);
  const composerH = Math.max(0, h - headerH - safeBottom);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
    reply_composer: {
      id: "reply_composer",
      rect: rect(0, headerH, w, composerH),
      tags: ["compose"],
    },
  };

  return {
    kind: "FULLSCREEN",
    meta: {},
    semantic: buildSemantic(regions),
  };
}

export const xLayoutStrategies: PluginLayoutStrategy[] = [
  { viewKind: "FEED", computeLayout: computeXFeedLayout },
  { viewKind: "CHAT", computeLayout: computeXChatLayout },
  { viewKind: "FULLSCREEN", computeLayout: computeXFullscreenLayout },
];
