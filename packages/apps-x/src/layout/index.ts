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
  const avatarSize = px(xSpacing.avatarSize);
  const avatarGap = px(xSpacing.avatarGap);
  const timelineContentX = tweetCardX + avatarSize + avatarGap;
  const timelineContentW = Math.max(0, tweetCardW - avatarSize - avatarGap);

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
    regions.timeline_tabs = {
      id: "timeline_tabs",
      rect: rect(0, safeTop + headerBase, w, tabBarHeight),
      tags: ["tabs", "header", "sticky"],
      metadata: { sticky: true },
    };
    if (screen === "profile") {
      regions.profile_header = {
        id: "profile_header",
        rect: rect(0, 0, w, headerH),
        tags: ["header", "profile", "sticky"],
        metadata: { sticky: true },
      };
      regions.profile_banner = {
        id: "profile_banner",
        rect: rect(0, feedY, w, px(xSpacing.bannerHeight)),
        tags: ["profile", "banner"],
      };
      regions.profile_avatar = {
        id: "profile_avatar",
        rect: rect(screenPad, feedY + px(xSpacing.bannerHeight) - avatarSize * 0.8, avatarSize * 2, avatarSize * 2),
        tags: ["profile", "avatar"],
      };
      regions.profile_tabs = {
        id: "profile_tabs",
        rect: rect(0, feedY + px(xSpacing.bannerHeight) + px(160), w, tabBarHeight),
        tags: ["profile", "tabs"],
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
    regions.timeline_primary_row = {
      id: "timeline_primary_row",
      rect: rect(tweetCardX, tweetCardY, tweetCardW, tweetCardH),
      tags: ["tweet", "row", "primary"],
    };
    regions.timeline_primary_avatar = {
      id: "timeline_primary_avatar",
      rect: rect(tweetCardX, tweetCardY + px(8), avatarSize, avatarSize),
      tags: ["tweet", "avatar", "primary"],
    };
    regions.timeline_primary_content = {
      id: "timeline_primary_content",
      rect: rect(timelineContentX, tweetCardY + px(8), timelineContentW, Math.max(0, tweetCardH - px(16))),
      tags: ["tweet", "content", "primary"],
    };
    regions.timeline_primary_media = {
      id: "timeline_primary_media",
      rect: rect(timelineContentX, tweetCardY + px(92), timelineContentW, Math.max(px(90), tweetCardH * 0.42)),
      tags: ["tweet", "media", "primary"],
    };
    regions.metrics_row = {
      id: "metrics_row",
      rect: rect(tweetCardX, metricsRowY, tweetCardW, metricsRowH),
      tags: ["tweet", "metrics"],
    };
    regions.timeline_primary_actions = {
      id: "timeline_primary_actions",
      rect: rect(timelineContentX, metricsRowY, timelineContentW, metricsRowH),
      tags: ["tweet", "actions", "primary"],
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
    regions.tweet_detail_header = {
      id: "tweet_detail_header",
      rect: rect(tweetCardX, feedY + px(16), tweetCardW, px(56)),
      tags: ["tweet", "detail", "header"],
    };
    regions.tweet_detail_body = {
      id: "tweet_detail_body",
      rect: rect(tweetCardX, feedY + px(72), tweetCardW, Math.min(px(200), feedH * 0.34)),
      tags: ["tweet", "detail", "body"],
    };
    regions.tweet_detail_media = {
      id: "tweet_detail_media",
      rect: rect(tweetCardX, feedY + px(166), tweetCardW, Math.min(px(180), feedH * 0.3)),
      tags: ["tweet", "detail", "media"],
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
    regions.tweet_detail_quote = {
      id: "tweet_detail_quote",
      rect: rect(tweetCardX, feedY + px(228), tweetCardW, px(96)),
      tags: ["tweet", "detail", "quote"],
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
    regions.notifications_row_0 = {
      id: "notifications_row_0",
      rect: rect(screenPad, feedY + px(6), Math.max(0, w - screenPad * 2), px(84)),
      tags: ["notifications", "row"],
    };
    regions.notifications_row_0_avatar = {
      id: "notifications_row_0_avatar",
      rect: rect(screenPad + px(40), feedY + px(24), avatarSize * 0.8, avatarSize * 0.8),
      tags: ["notifications", "avatar"],
    };
    regions.notifications_row_0_content = {
      id: "notifications_row_0_content",
      rect: rect(screenPad + px(88), feedY + px(22), Math.max(0, w - screenPad * 2 - px(88)), px(50)),
      tags: ["notifications", "content"],
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
    regions.dm_row_0 = {
      id: "dm_row_0",
      rect: rect(screenPad, feedY + px(8), Math.max(0, w - screenPad * 2), px(74)),
      tags: ["dm", "row"],
    };
    regions.dm_row_0_avatar = {
      id: "dm_row_0_avatar",
      rect: rect(screenPad, feedY + px(18), avatarSize, avatarSize),
      tags: ["dm", "avatar"],
    };
    regions.dm_row_0_content = {
      id: "dm_row_0_content",
      rect: rect(screenPad + avatarSize + avatarGap, feedY + px(18), Math.max(0, w - screenPad * 2 - avatarSize - avatarGap), px(44)),
      tags: ["dm", "content"],
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
    thread_header: {
      id: "thread_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "dm", "sticky"],
      metadata: { sticky: true },
    },
    dm_thread: { id: "dm_thread", rect: rect(0, threadY, w, threadH), tags: ["dm", "thread"] },
    dm_message_latest: {
      id: "dm_message_latest",
      rect: rect(px(xSpacing.screenPadding), threadY + Math.max(0, threadH - px(116)), w - px(xSpacing.screenPadding) * 2, px(68)),
      tags: ["dm", "message", "latest"],
    },
    reply_composer: {
      id: "reply_composer",
      rect: rect(0, composerY, w, composerH),
      tags: ["composer", "sticky"],
      metadata: { sticky: true },
    },
    reply_input: {
      id: "reply_input",
      rect: rect(px(xSpacing.screenPadding), composerY + px(14), w - px(xSpacing.screenPadding) * 2 - px(72), px(42)),
      tags: ["composer", "input"],
    },
    reply_send_button: {
      id: "reply_send_button",
      rect: rect(w - px(xSpacing.screenPadding) - px(58), composerY + px(14), px(58), px(42)),
      tags: ["composer", "send"],
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
    compose_header: {
      id: "compose_header",
      rect: rect(0, 0, w, headerH),
      tags: ["compose", "header", "sticky"],
      metadata: { sticky: true },
    },
    reply_composer: {
      id: "reply_composer",
      rect: rect(0, headerH, w, composerH),
      tags: ["compose"],
    },
    compose_editor: {
      id: "compose_editor",
      rect: rect(px(xSpacing.screenPadding), headerH + px(12), w - px(xSpacing.screenPadding) * 2, Math.max(0, composerH - px(84))),
      tags: ["compose", "editor"],
    },
    compose_footer: {
      id: "compose_footer",
      rect: rect(px(xSpacing.screenPadding), h - safeBottom - px(56), w - px(xSpacing.screenPadding) * 2, px(44)),
      tags: ["compose", "footer"],
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
