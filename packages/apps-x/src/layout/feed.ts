import type {
  FeedLayoutState,
  LayoutContext,
  SemanticRegion,
} from "@tokovo/core";
import type { XState } from "../runtime/state.js";
import { xSpacing } from "../config/tokens.js";
import { buildSemantic, createPx, rect } from "./shared.js";

export function computeXFeedLayout(ctx: LayoutContext): FeedLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets, world } = ctx;
  const safeTop = safeAreaInsets?.top ?? 0;
  const safeBottom = safeAreaInsets?.bottom ?? 0;
  const px = createPx(w);

  const state = (world.appState?.app_x ?? {}) as Partial<XState>;
  const screen = state.currentScreen ?? "timeline";

  const navHeight = px(xSpacing.navHeight);
  const headerBase = px(xSpacing.headerHeight);
  const tabBarHeight = px(xSpacing.tabBarHeight);
  const screenPad = px(xSpacing.screenPadding);
  const navY = Math.max(0, h - safeBottom - navHeight);
  const feedWidth = Math.max(0, w - screenPad * 2);
  const avatarSize = px(xSpacing.avatarSize);
  const avatarGap = px(xSpacing.avatarGap);
  const fabSize = px(xSpacing.fabSize);
  const fabX = Math.max(0, w - screenPad - fabSize);
  const fabY = Math.max(0, navY - screenPad - fabSize);

  const headerH =
    screen === "timeline" || screen === "notifications" || screen === "messages"
      ? safeTop + headerBase + tabBarHeight
      : safeTop + headerBase;
  const feedY = headerH;
  const feedH = Math.max(0, navY - feedY);
  const tweetCardY = feedY + px(10);
  const tweetCardH = Math.min(px(328), Math.max(px(208), feedH * 0.42));
  const metricsRowH = px(44);
  const contentX = screenPad + avatarSize + avatarGap;

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

  if (screen === "timeline") {
    regions.timeline_header = {
      id: "timeline_header",
      rect: rect(0, 0, w, safeTop + headerBase),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.timeline_tabs = {
      id: "timeline_tabs",
      rect: rect(0, safeTop + headerBase, w, tabBarHeight),
      tags: ["tabs", "sticky"],
      metadata: { sticky: true },
    };
    regions.timeline_feed = {
      id: "timeline_feed",
      rect: rect(0, feedY, w, feedH),
      tags: ["feed", "scroll"],
    };
    regions.tweet_card = {
      id: "tweet_card",
      rect: rect(screenPad, tweetCardY, feedWidth, tweetCardH),
      tags: ["tweet", "card"],
    };
    regions.timeline_primary_row = {
      id: "timeline_primary_row",
      rect: rect(screenPad, tweetCardY, feedWidth, tweetCardH),
      tags: ["tweet", "row", "primary"],
    };
    regions.timeline_primary_avatar = {
      id: "timeline_primary_avatar",
      rect: rect(screenPad, tweetCardY + px(4), avatarSize, avatarSize),
      tags: ["tweet", "avatar"],
    };
    regions.timeline_primary_content = {
      id: "timeline_primary_content",
      rect: rect(
        contentX,
        tweetCardY + px(4),
        Math.max(0, w - contentX - screenPad),
        Math.max(0, tweetCardH - px(72)),
      ),
      tags: ["tweet", "content"],
    };
    regions.timeline_primary_media = {
      id: "timeline_primary_media",
      rect: rect(
        contentX,
        tweetCardY + px(90),
        Math.max(0, w - contentX - screenPad),
        Math.max(px(96), tweetCardH * 0.42),
      ),
      tags: ["tweet", "media"],
    };
    regions.metrics_row = {
      id: "metrics_row",
      rect: rect(
        contentX,
        tweetCardY + tweetCardH - metricsRowH - px(6),
        Math.max(0, w - contentX - screenPad),
        metricsRowH,
      ),
      tags: ["tweet", "metrics"],
    };
    regions.timeline_primary_actions = {
      id: "timeline_primary_actions",
      rect: regions.metrics_row.rect,
      tags: ["tweet", "actions"],
    };
    regions.compose_fab = {
      id: "compose_fab",
      rect: rect(fabX, fabY, fabSize, fabSize),
      tags: ["compose", "fab", "sticky"],
      metadata: { sticky: true },
    };
  }

  if (screen === "tweet") {
    const detailCardH = Math.min(px(440), Math.max(px(260), feedH * 0.56));
    regions.timeline_header = {
      id: "timeline_header",
      rect: rect(0, 0, w, safeTop + headerBase),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.tweet_card = {
      id: "tweet_card",
      rect: rect(screenPad, feedY + px(12), feedWidth, detailCardH),
      tags: ["tweet", "detail"],
    };
    regions.tweet_detail_header = {
      id: "tweet_detail_header",
      rect: rect(screenPad, feedY + px(18), feedWidth, px(62)),
      tags: ["tweet", "detail", "header"],
    };
    regions.tweet_detail_body = {
      id: "tweet_detail_body",
      rect: rect(screenPad, feedY + px(86), feedWidth, Math.max(px(96), detailCardH * 0.26)),
      tags: ["tweet", "detail", "body"],
    };
    regions.tweet_detail_media = {
      id: "tweet_detail_media",
      rect: rect(screenPad, feedY + px(188), feedWidth, Math.max(px(120), detailCardH * 0.24)),
      tags: ["tweet", "detail", "media"],
    };
    regions.tweet_detail_quote = {
      id: "tweet_detail_quote",
      rect: rect(screenPad, feedY + px(260), feedWidth, px(102)),
      tags: ["tweet", "detail", "quote"],
    };
    regions.metrics_row = {
      id: "metrics_row",
      rect: rect(screenPad, feedY + detailCardH - metricsRowH, feedWidth, metricsRowH),
      tags: ["tweet", "metrics"],
    };
    regions.reply_composer = {
      id: "reply_composer",
      rect: rect(0, navY - px(98), w, px(98)),
      tags: ["composer", "sticky"],
      metadata: { sticky: true },
    };
  }

  if (screen === "notifications") {
    regions.timeline_header = {
      id: "timeline_header",
      rect: rect(0, 0, w, safeTop + headerBase),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.timeline_tabs = {
      id: "timeline_tabs",
      rect: rect(0, safeTop + headerBase, w, tabBarHeight),
      tags: ["tabs", "sticky"],
      metadata: { sticky: true },
    };
    regions.notifications_list = {
      id: "notifications_list",
      rect: rect(0, feedY, w, feedH),
      tags: ["notifications", "list"],
    };
    regions.notifications_row_0 = {
      id: "notifications_row_0",
      rect: rect(screenPad, feedY + px(6), feedWidth, px(92)),
      tags: ["notifications", "row"],
    };
    regions.notifications_row_0_avatar = {
      id: "notifications_row_0_avatar",
      rect: rect(screenPad + px(42), feedY + px(30), px(34), px(34)),
      tags: ["notifications", "avatar"],
    };
    regions.notifications_row_0_content = {
      id: "notifications_row_0_content",
      rect: rect(screenPad + px(90), feedY + px(20), Math.max(0, w - screenPad - px(90)), px(58)),
      tags: ["notifications", "content"],
    };
  }

  if (screen === "messages") {
    regions.timeline_header = {
      id: "timeline_header",
      rect: rect(0, 0, w, safeTop + headerBase),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.message_search = {
      id: "message_search",
      rect: rect(screenPad, feedY + px(8), feedWidth, px(44)),
      tags: ["messages", "search"],
    };
    regions.message_requests = {
      id: "message_requests",
      rect: rect(screenPad, feedY + px(62), feedWidth, px(64)),
      tags: ["messages", "requests"],
    };
    regions.dm_thread = {
      id: "dm_thread",
      rect: rect(0, feedY + px(136), w, Math.max(0, feedH - px(136))),
      tags: ["dm", "list"],
    };
    regions.dm_row_0 = {
      id: "dm_row_0",
      rect: rect(screenPad, feedY + px(144), feedWidth, px(78)),
      tags: ["dm", "row"],
    };
    regions.dm_row_0_avatar = {
      id: "dm_row_0_avatar",
      rect: rect(screenPad, feedY + px(156), px(48), px(48)),
      tags: ["dm", "avatar"],
    };
    regions.dm_row_0_content = {
      id: "dm_row_0_content",
      rect: rect(screenPad + px(60), feedY + px(154), Math.max(0, w - screenPad * 2 - px(60)), px(50)),
      tags: ["dm", "content"],
    };
    regions.compose_fab = {
      id: "compose_fab",
      rect: rect(fabX, fabY, fabSize, fabSize),
      tags: ["compose", "fab", "sticky"],
      metadata: { sticky: true },
    };
  }

  if (screen === "profile") {
    regions.profile_header = {
      id: "profile_header",
      rect: rect(0, 0, w, safeTop + headerBase),
      tags: ["profile", "header", "sticky"],
      metadata: { sticky: true },
    };
    regions.profile_banner = {
      id: "profile_banner",
      rect: rect(0, feedY, w, px(xSpacing.bannerHeight)),
      tags: ["profile", "banner"],
    };
    regions.profile_avatar = {
      id: "profile_avatar",
      rect: rect(screenPad, feedY + px(xSpacing.bannerHeight) - px(36), px(82), px(82)),
      tags: ["profile", "avatar"],
    };
    regions.profile_tabs = {
      id: "profile_tabs",
      rect: rect(0, feedY + px(xSpacing.bannerHeight) + px(156), w, tabBarHeight),
      tags: ["profile", "tabs"],
    };
    regions.timeline_feed = {
      id: "timeline_feed",
      rect: rect(0, feedY + px(xSpacing.bannerHeight) + px(200), w, Math.max(0, feedH - px(200))),
      tags: ["profile", "feed"],
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
