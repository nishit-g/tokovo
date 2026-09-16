import { xRouteShift, xLayoutCacheHint } from "../runtime/motion.js";
import { xInputFields } from "../input-fields.js";
import type { FeedItemLayout, FeedLayoutState, LayoutContext, SemanticRegion } from "@tokovo/core";
import { measureXPost, measureXProfile, measureXNotification, xComposerHeight } from "./measure.js";
import { projectXConversation, projectXFeed } from "./project.js";
import {
  requireTweet,
  requireUser,
  selectDMThreads,
  selectTimelineTweets,
  selectTweetConversation,
  selectProfileTweets,
  selectVisibleNotifications,
} from "../runtime/selectors.js";
import { xProfileDetails } from "../localization/index.js";
import type { XTweet } from "../runtime/state.js";
import { rect, region, resolveXLayoutEnvironment, semantic } from "./shared.js";

interface RegisterPostInput {
  tweet: XTweet;
  y: number;
  detail?: boolean;
}

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
  let activeScrollY = 0;
  let firstVisibleItemId: string | undefined;
  let lastVisibleItemId: string | undefined;

  const registerPost = ({ tweet, y, detail = false }: RegisterPostInput): number => {
    const displayed = tweet.repostOfId
      ? requireTweet(state, tweet.repostOfId, `tweet "${tweet.id}" repostOfId`)
      : tweet;
    const measurementSource = tweet.repostOfId
      ? { ...displayed, repostOfId: tweet.repostOfId }
      : displayed;
    const measurement = measureXPost(measurementSource, width, detail, experience.text);
    const cardId = `x.post.${tweet.id}`;
    const paddingY = detail ? 12 : experience.metrics.postPaddingY;
    const authorY = y + paddingY + measurement.repostLabelHeight;
    const contentX = detail ? 16 : 16 + experience.metrics.avatar + 12;
    const contentWidth = measurement.contentWidth;
    const bodyY =
      authorY +
      measurement.headerHeight +
      measurement.replyLabelHeight +
      (measurement.bodyHeight > 0 ? 5 : 0);
    const attachmentY =
      bodyY + measurement.bodyHeight + (measurement.attachmentHeight > 0 ? 10 : 0);
    const metricsY =
      y + measurement.totalHeight - measurement.metricsHeight - paddingY - 1 + (detail ? 38 : 0);

    itemLayouts[tweet.id] = {
      id: tweet.id,
      y,
      height: measurement.totalHeight,
      opacity: 1,
      translateY: 0,
      scale: 1,
    };
    region(
      regions,
      cardId,
      rect(0, y, width, measurement.totalHeight),
      ["post", detail ? "detail" : "card"],
      {
        entityType: "tweet",
        entityId: tweet.id,
        entityRegion: "card",
      },
    );
    region(
      regions,
      `${cardId}.author`,
      rect(contentX, authorY, contentWidth, measurement.headerHeight),
      ["post", "author"],
      {
        entityType: "tweet",
        entityId: tweet.id,
        entityRegion: "author",
      },
    );
    if (measurement.bodyHeight > 0) {
      region(
        regions,
        `${cardId}.body`,
        rect(contentX, bodyY, contentWidth, measurement.bodyHeight),
        ["post", "body"],
        {
          entityType: "tweet",
          entityId: tweet.id,
          entityRegion: "body",
        },
      );
    }
    if (measurement.primaryAttachmentHeight > 0) {
      const part = displayed.media ? "media" : displayed.poll ? "poll" : "link";
      const id = `${cardId}.${part}`;
      region(
        regions,
        id,
        rect(contentX, attachmentY, contentWidth, measurement.primaryAttachmentHeight),
        ["post", part],
        { entityType: "tweet", entityId: tweet.id, entityRegion: part },
      );
      groups.media.push(id);
    }
    if (measurement.quoteHeight > 0) {
      const id = `${cardId}.quote`;
      region(
        regions,
        id,
        rect(
          contentX,
          attachmentY +
            measurement.primaryAttachmentHeight +
            (measurement.primaryAttachmentHeight ? 10 : 0),
          contentWidth,
          measurement.quoteHeight,
        ),
        ["post", "quote"],
        { entityType: "tweet", entityId: tweet.id, entityRegion: "quote" },
      );
      groups.media.push(id);
    }
    region(
      regions,
      `${cardId}.metrics`,
      rect(contentX, metricsY, contentWidth, detail ? 38 : measurement.metricsHeight),
      ["post", "metrics"],
      {
        entityType: "tweet",
        entityId: tweet.id,
        entityRegion: "metrics",
      },
    );
    groups.post.push(cardId);
    return measurement.totalHeight;
  };

  region(regions, "x.app", rect(0, 0, width, height), ["app"]);

  if (state.route.screen === "timeline") {
    const tabsHeight = 48;
    const headerY = top;
    const tabsY = headerY + headerHeight;
    const feedY = tabsY + tabsHeight;
    const feedHeight = Math.max(0, navY - feedY);
    const tweets = selectTimelineTweets(ctx.world, ctx.activeDeviceId);
    activeScrollY = state.scroll.timeline;
    const projection = projectXFeed({
      tokens: experience.text,
      frame: ctx.t,
      reducedMotion: experience.reducedMotion,
      state,
      tweets,
      width,
      viewportHeight: feedHeight,
      scrollY: activeScrollY,
    });
    contentHeight = projection.contentHeight;

    region(
      regions,
      "x.timeline.header",
      rect(0, headerY, width, headerHeight),
      ["header", "sticky"],
      { sticky: true },
    );
    region(regions, "x.timeline.tabs", rect(0, tabsY, width, tabsHeight), ["tabs", "sticky"], {
      sticky: true,
    });
    region(regions, "x.timeline.feed", rect(0, feedY, width, feedHeight), ["feed", "scroll"]);
    region(regions, "x.nav.primary", rect(0, navY, width, navHeight), ["nav", "sticky"], {
      sticky: true,
    });
    region(
      regions,
      "x.compose.fab",
      rect(width - 72, navY - 72, 54, 54),
      ["compose", "fab", "sticky"],
      { sticky: true },
    );

    for (const item of projection.visibleItems) {
      registerPost({ tweet: item.tweet, y: feedY + item.y - activeScrollY });
    }
    firstVisibleItemId = projection.visibleItems[0]?.id;
    lastVisibleItemId = projection.visibleItems.at(-1)?.id;
  } else if (state.route.screen === "tweet") {
    const tweetId = state.route.tweetId;
    if (!tweetId) throw new Error("X_ROUTE_TWEET_ID_REQUIRED");
    const contentY = top + headerHeight;
    const viewportHeight = Math.max(0, navY - contentY);
    const conversation = selectTweetConversation(ctx.world, ctx.activeDeviceId, tweetId);
    activeScrollY = state.scroll.tweetById[tweetId] ?? 0;
    const composerHeight = xComposerHeight(
      ctx.inputValues?.[xInputFields.replyComposer(tweetId)] ?? "",
      width,
      experience.text,
      "reply",
    );
    const projection = projectXConversation({
      composerHeight,
      tokens: experience.text,
      state,
      conversation,
      width,
      viewportHeight,
      scrollY: activeScrollY,
    });

    region(regions, "x.tweet.header", rect(0, top, width, headerHeight), ["header", "sticky"], {
      sticky: true,
    });
    region(regions, "x.tweet.conversation", rect(0, contentY, width, viewportHeight), [
      "conversation",
      "scroll",
    ]);
    region(regions, "x.nav.primary", rect(0, navY, width, navHeight), ["nav", "sticky"], {
      sticky: true,
    });

    for (const item of projection.visibleItems) {
      registerPost({
        tweet: item.conversation.tweet,
        y: contentY + item.y - activeScrollY,
        detail: item.conversation.role === "focus",
      });
    }
    if (projection.composerVisible) {
      region(
        regions,
        "x.reply.composer",
        rect(0, contentY + projection.composerY - activeScrollY, width, composerHeight),
        ["reply", "composer"],
      );
    }
    contentHeight = projection.contentHeight;
    firstVisibleItemId = projection.visibleItems[0]?.id;
    lastVisibleItemId = projection.visibleItems.at(-1)?.id;
  } else if (state.route.screen === "notifications") {
    const tabsHeight = 48;
    const listY = top + headerHeight + tabsHeight;
    const listHeight = Math.max(0, navY - listY);
    activeScrollY = state.scroll.notifications;
    region(
      regions,
      "x.notifications.header",
      rect(0, top, width, headerHeight),
      ["header", "sticky"],
      { sticky: true },
    );
    region(
      regions,
      "x.notifications.tabs",
      rect(0, top + headerHeight, width, tabsHeight),
      ["tabs", "sticky"],
      { sticky: true },
    );
    region(regions, "x.notifications.list", rect(0, listY, width, listHeight), [
      "notifications",
      "list",
    ]);
    region(regions, "x.nav.primary", rect(0, navY, width, navHeight), ["nav", "sticky"], {
      sticky: true,
    });
    let cursor = 0;
    for (const notification of selectVisibleNotifications(ctx.world, ctx.activeDeviceId)) {
      const rowHeight = measureXNotification(notification, state, width, experience).height;
      const rowY = listY + cursor - activeScrollY;
      if (rowY + rowHeight >= listY && rowY <= listY + listHeight) {
        const id = `x.notification.${notification.id}`;
        region(regions, id, rect(0, rowY, width, rowHeight), ["notification", notification.type], {
          entityType: "notification",
          entityId: notification.id,
          entityRegion: "row",
        });
        groups.notification.push(id);
        firstVisibleItemId ??= notification.id;
        lastVisibleItemId = notification.id;
      }
      cursor += rowHeight;
    }
    contentHeight = cursor;
  } else if (state.route.screen === "messages") {
    const listY = top + headerHeight;
    const listHeight = Math.max(0, navY - listY);
    const threads = selectDMThreads(ctx.world, ctx.activeDeviceId);
    activeScrollY = state.scroll.messages;
    region(regions, "x.messages.header", rect(0, top, width, headerHeight), ["header", "sticky"], {
      sticky: true,
    });
    region(regions, "x.messages.list", rect(0, listY, width, listHeight), ["messages", "list"]);
    region(regions, "x.nav.primary", rect(0, navY, width, navHeight), ["nav", "sticky"], {
      sticky: true,
    });
    threads.forEach((thread, index) => {
      const rowY = listY + index * 74 - activeScrollY;
      if (rowY + 74 >= listY && rowY <= listY + listHeight) {
        const id = `x.dm.${thread.id}`;
        region(regions, id, rect(0, rowY, width, 74), ["dm", "thread"], {
          entityType: "dm-thread",
          entityId: thread.id,
          entityRegion: "row",
        });
        groups.thread.push(id);
        firstVisibleItemId ??= thread.id;
        lastVisibleItemId = thread.id;
      }
    });
    contentHeight = threads.length * 74;
  } else if (state.route.screen === "profile") {
    const userId = state.route.userId;
    if (!userId) throw new Error("X_ROUTE_USER_ID_REQUIRED");
    const user = requireUser(state, userId, "route.userId");
    const sectionY = top + headerHeight;
    const profileHeight = measureXProfile(
      user,
      width,
      experience.text,
      xProfileDetails(user, experience.locale, experience.t("joined")),
    ).height;
    activeScrollY = state.scroll.profileById[user.id] ?? 0;
    const profileY = sectionY - activeScrollY;
    const tabsY = profileY + profileHeight;
    let cursor = profileHeight + 48;
    const tweets = selectProfileTweets(ctx.world, ctx.activeDeviceId, user.id);

    region(
      regions,
      "x.profile.app-header",
      rect(0, top, width, headerHeight),
      ["header", "sticky"],
      { sticky: true },
    );
    region(
      regions,
      `x.profile.${user.id}.header`,
      rect(0, profileY, width, profileHeight),
      ["profile", "header"],
      {
        entityType: "profile",
        entityId: user.id,
        entityRegion: "header",
      },
    );
    region(
      regions,
      `x.profile.${user.id}.banner`,
      rect(0, profileY, width, 124),
      ["profile", "banner"],
      {
        entityType: "profile",
        entityId: user.id,
        entityRegion: "banner",
      },
    );
    region(
      regions,
      `x.profile.${user.id}.avatar`,
      rect(16, profileY + 84, 84, 84),
      ["profile", "avatar"],
      {
        entityType: "profile",
        entityId: user.id,
        entityRegion: "avatar",
      },
    );
    region(regions, "x.profile.tabs", rect(0, tabsY, width, 48), ["profile", "tabs"]);
    region(regions, "x.profile.feed", rect(0, sectionY, width, Math.max(0, navY - sectionY)), [
      "profile",
      "feed",
      "scroll",
    ]);
    region(regions, "x.nav.primary", rect(0, navY, width, navHeight), ["nav", "sticky"], {
      sticky: true,
    });
    for (const [index, tweet] of tweets.entries()) {
      if (state.profileTab === "media") {
        const cell = width / 3;
        const tileY = sectionY + profileHeight + 48 + Math.floor(index / 3) * cell - activeScrollY;
        if (tileY + cell >= sectionY && tileY <= navY) {
          for (const part of ["card", "media"] as const) {
            const id = `x.post.${tweet.id}${part === "card" ? "" : ".media"}`;
            region(
              regions,
              id,
              rect(
                (index % 3) * cell + (part === "media" ? 1 : 0),
                tileY + (part === "media" ? 1 : 0),
                cell - (part === "media" ? 2 : 0),
                cell - (part === "media" ? 2 : 0),
              ),
              ["post", part],
              {
                entityType: "tweet",
                entityId: tweet.id,
                entityRegion: part,
              },
            );
            groups[part === "card" ? "post" : "media"].push(id);
          }
          firstVisibleItemId ??= tweet.id;
          lastVisibleItemId = tweet.id;
        }
        cursor = profileHeight + 48 + Math.ceil(tweets.length / 3) * cell;
        continue;
      }
      const cardY = sectionY + cursor - activeScrollY;
      const cardHeight = measureXPost(tweet, width, false, experience.text).totalHeight;
      if (cardY + cardHeight >= sectionY && cardY <= navY) {
        registerPost({ tweet, y: cardY });
        firstVisibleItemId ??= tweet.id;
        lastVisibleItemId = tweet.id;
      }
      cursor += cardHeight;
    }
    contentHeight = cursor;
  } else {
    throw new Error(`X_FEED_SCREEN_UNSUPPORTED: "${state.route.screen}"`);
  }

  return {
    kind: "FEED",
    cacheHint: xLayoutCacheHint(
      state,
      ctx.t,
      experience.motion.routeFrames,
      experience.reducedMotion,
    ),
    scrollY: activeScrollY,
    contentHeight,
    isAtBottom: false,
    itemLayouts,
    meta: { firstVisibleItemId, lastVisibleItemId },
    semantic: semantic(regions, groups, {
      width,
      height,
      rtl: experience.direction === "rtl",
      shiftX: xRouteShift(
        state,
        ctx.t,
        width,
        experience.motion.routeFrames,
        experience.direction === "rtl",
      ),
    }),
  };
}
