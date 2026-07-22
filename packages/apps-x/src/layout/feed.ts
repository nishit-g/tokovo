import type {
  FeedItemLayout,
  FeedLayoutState,
  LayoutContext,
  SemanticRegion,
} from "@tokovo/core";
import { measureXPost, X_PROFILE_HEADER_HEIGHT } from "./measure.js";
import { projectXFeed } from "./project.js";
import {
  requireTweet,
  requireUser,
  selectDMThreads,
  selectTimelineTweets,
  selectVisibleNotifications,
} from "../runtime/selectors.js";
import { rect, region, resolveXLayoutEnvironment, semantic } from "./shared.js";

export function computeXFeedLayout(ctx: LayoutContext): FeedLayoutState {
  const { viewportWidth: width, viewportHeight: height, appViewport } = ctx;
  const top = appViewport.interactiveInsets.top;
  const bottom = appViewport.interactiveInsets.bottom;
  const { state, experience } = resolveXLayoutEnvironment(ctx);
  const regions: Record<string, SemanticRegion> = {};
  const groups: Record<string, string[]> = {
    post: [],
    media: [],
    notification: [],
    thread: [],
  };
  const itemLayouts: Record<string, FeedItemLayout> = {};
  const headerHeight = experience.metrics.headerHeight;
  const navHeight = experience.metrics.navHeight;
  const navY = height - bottom - navHeight;
  let contentHeight = height;
  let firstVisibleItemId: string | undefined;
  let lastVisibleItemId: string | undefined;

  region(regions, "x.app", rect(0, 0, width, height), ["app"]);

  if (state.route.screen === "timeline") {
    const tabsHeight = 48;
    const headerY = top;
    const tabsY = headerY + headerHeight;
    const feedY = tabsY + tabsHeight;
    const feedHeight = Math.max(0, navY - feedY);
    const tweets = selectTimelineTweets(ctx.world, ctx.activeDeviceId);
    const projection = projectXFeed({
      state,
      tweets,
      width,
      viewportHeight: feedHeight,
      scrollY: state.feedScrollY,
    });
    contentHeight = projection.contentHeight;

    region(regions, "x.timeline.header", rect(0, headerY, width, headerHeight), ["header", "sticky"], { sticky: true });
    region(regions, "x.timeline.tabs", rect(0, tabsY, width, tabsHeight), ["tabs", "sticky"], { sticky: true });
    region(regions, "x.timeline.feed", rect(0, feedY, width, feedHeight), ["feed", "scroll"]);
    region(regions, "x.nav.primary", rect(0, navY, width, navHeight), ["nav", "sticky"], { sticky: true });
    region(regions, "x.compose.fab", rect(width - 72, navY - 72, 54, 54), ["compose", "fab", "sticky"], { sticky: true });

    for (const item of projection.visibleItems) {
      const cardY = feedY + item.y - state.feedScrollY;
      const tweet = item.tweet.repostOfId
        ? requireTweet(state, item.tweet.repostOfId, `tweet "${item.tweet.id}" repostOfId`)
        : item.tweet;
      const measurementSource = item.tweet.repostOfId
        ? { ...tweet, repostOfId: item.tweet.repostOfId }
        : tweet;
      const measurement = measureXPost(measurementSource, width);
      const cardId = `x.post.${item.id}`;
      const topPadding = experience.metrics.postPaddingY;
      const authorY = cardY + topPadding + measurement.repostLabelHeight;
      const contentX = 16 + experience.metrics.avatar + 12;
      const contentWidth = width - contentX - 16;
      const bodyY = authorY + measurement.headerHeight + (measurement.bodyHeight > 0 ? 5 : 0);
      const attachmentY = bodyY + measurement.bodyHeight + (measurement.attachmentHeight > 0 ? 10 : 0);
      const metricsY = cardY + measurement.totalHeight - measurement.metricsHeight - topPadding;

      itemLayouts[item.id] = {
        id: item.id,
        y: cardY,
        height: measurement.totalHeight,
        opacity: 1,
        translateY: 0,
        scale: 1,
      };
      region(regions, cardId, rect(0, cardY, width, measurement.totalHeight), ["post", "card"], { entityType: "tweet", entityId: item.id, entityRegion: "card" });
      region(regions, `${cardId}.author`, rect(contentX, authorY, contentWidth, measurement.headerHeight), ["post", "author"], { entityType: "tweet", entityId: item.id, entityRegion: "author" });
      if (measurement.bodyHeight > 0) {
        region(regions, `${cardId}.body`, rect(contentX, bodyY, contentWidth, measurement.bodyHeight), ["post", "body"], { entityType: "tweet", entityId: item.id, entityRegion: "body" });
      }
      if (measurement.attachmentHeight > 0) {
        const attachmentRegion = tweet.media ? "media" : tweet.poll ? "poll" : tweet.quoteTweetId ? "quote" : "link";
        const attachmentId = `${cardId}.${attachmentRegion}`;
        region(regions, attachmentId, rect(contentX, attachmentY, contentWidth, measurement.attachmentHeight), ["post", attachmentRegion], { entityType: "tweet", entityId: item.id, entityRegion: attachmentRegion });
        groups.media.push(attachmentId);
      }
      region(regions, `${cardId}.metrics`, rect(contentX, metricsY, contentWidth, measurement.metricsHeight), ["post", "metrics"], { entityType: "tweet", entityId: item.id, entityRegion: "metrics" });
      groups.post.push(cardId);
    }
    firstVisibleItemId = projection.visibleItems[0]?.id;
    lastVisibleItemId = projection.visibleItems.at(-1)?.id;
  } else if (state.route.screen === "tweet") {
    const headerY = top;
    const contentY = headerY + headerHeight;
    const tweetId = state.route.tweetId;
    if (!tweetId) throw new Error("X_ROUTE_TWEET_ID_REQUIRED");
    const tweet = requireTweet(state, tweetId, "route.tweetId");
    const measurement = measureXPost(tweet, width, true);
    const cardId = `x.post.${tweet.id}`;
    const cardY = contentY;
    const authorY = cardY + 12;
    const bodyY = authorY + measurement.headerHeight + (measurement.bodyHeight > 0 ? 5 : 0);
    const attachmentY = bodyY + measurement.bodyHeight + (measurement.attachmentHeight > 0 ? 10 : 0);
    region(regions, "x.tweet.header", rect(0, headerY, width, headerHeight), ["header", "sticky"], { sticky: true });
    region(regions, cardId, rect(0, cardY, width, measurement.totalHeight), ["post", "detail"], { entityType: "tweet", entityId: tweet.id, entityRegion: "card" });
    region(regions, `${cardId}.author`, rect(16, authorY, width - 32, measurement.headerHeight), ["post", "author"], { entityType: "tweet", entityId: tweet.id, entityRegion: "author" });
    if (measurement.bodyHeight > 0) region(regions, `${cardId}.body`, rect(16, bodyY, width - 32, measurement.bodyHeight), ["post", "body"], { entityType: "tweet", entityId: tweet.id, entityRegion: "body" });
    if (measurement.attachmentHeight > 0) {
      const attachmentRegion = tweet.media ? "media" : tweet.poll ? "poll" : tweet.quoteTweetId ? "quote" : "link";
      region(regions, `${cardId}.${attachmentRegion}`, rect(16, attachmentY, width - 32, measurement.attachmentHeight), ["post", attachmentRegion], { entityType: "tweet", entityId: tweet.id, entityRegion: attachmentRegion });
    }
    region(regions, `${cardId}.metrics`, rect(16, cardY + measurement.totalHeight - measurement.metricsHeight - 12, width - 32, measurement.metricsHeight), ["post", "metrics"], { entityType: "tweet", entityId: tweet.id, entityRegion: "metrics" });
    region(regions, "x.reply.composer", rect(0, cardY + measurement.totalHeight, width, 56), ["reply", "composer"]);
    region(regions, "x.nav.primary", rect(0, navY, width, navHeight), ["nav", "sticky"], { sticky: true });
    groups.post.push(cardId);
    contentHeight = measurement.totalHeight + 56;
    firstVisibleItemId = tweet.id;
    lastVisibleItemId = tweet.id;
  } else if (state.route.screen === "notifications") {
    const tabsHeight = 48;
    const listY = top + headerHeight + tabsHeight;
    const listHeight = Math.max(0, navY - listY);
    region(regions, "x.notifications.header", rect(0, top, width, headerHeight), ["header", "sticky"], { sticky: true });
    region(regions, "x.notifications.tabs", rect(0, top + headerHeight, width, tabsHeight), ["tabs", "sticky"], { sticky: true });
    region(regions, "x.notifications.list", rect(0, listY, width, listHeight), ["notifications", "list"]);
    region(regions, "x.nav.primary", rect(0, navY, width, navHeight), ["nav", "sticky"], { sticky: true });
    let y = listY;
    for (const notification of selectVisibleNotifications(ctx.world, ctx.activeDeviceId)) {
      const rowHeight = notification.tweetId ? 116 : 88;
      if (y <= listY + listHeight + 160) {
        const id = `x.notification.${notification.id}`;
        region(regions, id, rect(0, y, width, rowHeight), ["notification", notification.type], { entityType: "notification", entityId: notification.id, entityRegion: "row" });
        groups.notification.push(id);
      }
      y += rowHeight;
    }
    contentHeight = y - listY;
  } else if (state.route.screen === "messages") {
    const listY = top + headerHeight;
    const listHeight = Math.max(0, navY - listY);
    region(regions, "x.messages.header", rect(0, top, width, headerHeight), ["header", "sticky"], { sticky: true });
    region(regions, "x.messages.list", rect(0, listY, width, listHeight), ["messages", "list"]);
    region(regions, "x.nav.primary", rect(0, navY, width, navHeight), ["nav", "sticky"], { sticky: true });
    const threads = selectDMThreads(ctx.world, ctx.activeDeviceId);
    threads.slice(0, Math.ceil(listHeight / 74) + 2).forEach((thread, index) => {
      const id = `x.dm.${thread.id}`;
      region(regions, id, rect(0, listY + index * 74, width, 74), ["dm", "thread"], { entityType: "dm-thread", entityId: thread.id, entityRegion: "row" });
      groups.thread.push(id);
    });
    contentHeight = threads.length * 74;
  } else if (state.route.screen === "profile") {
    const userId = state.route.userId;
    if (!userId) throw new Error("X_ROUTE_USER_ID_REQUIRED");
    const user = requireUser(state, userId, "route.userId");
    const profileHeight = X_PROFILE_HEADER_HEIGHT;
    const sectionY = top + headerHeight;
    const tabsY = sectionY + profileHeight;
    const feedY = tabsY + 48;
    region(regions, "x.profile.app-header", rect(0, top, width, headerHeight), ["header", "sticky"], { sticky: true });
    region(regions, `x.profile.${user.id}.header`, rect(0, sectionY, width, profileHeight), ["profile", "header"], { entityType: "profile", entityId: user.id, entityRegion: "header" });
    region(regions, `x.profile.${user.id}.banner`, rect(0, sectionY, width, 124), ["profile", "banner"], { entityType: "profile", entityId: user.id, entityRegion: "banner" });
    region(regions, `x.profile.${user.id}.avatar`, rect(16, sectionY + 84, 84, 84), ["profile", "avatar"], { entityType: "profile", entityId: user.id, entityRegion: "avatar" });
    region(regions, "x.profile.tabs", rect(0, tabsY, width, 48), ["profile", "tabs"]);
    region(regions, "x.profile.feed", rect(0, feedY, width, Math.max(0, navY - feedY)), ["profile", "feed"]);
    region(regions, "x.nav.primary", rect(0, navY, width, navHeight), ["nav", "sticky"], { sticky: true });
    contentHeight = profileHeight;
  } else {
    throw new Error(`X_FEED_SCREEN_UNSUPPORTED: "${state.route.screen}"`);
  }

  return {
    kind: "FEED",
    cacheHint: "static",
    scrollY: state.feedScrollY,
    contentHeight,
    isAtBottom: false,
    itemLayouts,
    meta: { firstVisibleItemId, lastVisibleItemId },
    semantic: semantic(regions, groups),
  };
}
