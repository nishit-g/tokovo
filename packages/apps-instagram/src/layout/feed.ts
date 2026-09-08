import {
  requireAppStateForDevice,
  type FeedLayoutState,
  type LayoutContext,
  type SemanticRegion,
} from "@tokovo/core";
import type { InstagramState } from "../runtime/state.js";
import { instagramSpacing } from "../config/tokens.js";
import {
  computeInstagramFeedScrollY,
  estimateInstagramPostHeight,
  getInstagramMediaHeight,
} from "../feed-metrics.js";
import { buildSemantic, rect } from "./shared.js";

export function computeInstagramFeedLayout(ctx: LayoutContext): FeedLayoutState {
  const { viewportWidth: w, viewportHeight: h, appViewport, world } = ctx;
  const contentTop = appViewport.interactiveInsets.top;
  const contentBottom = appViewport.interactiveInsets.bottom;
  const state = requireAppStateForDevice<InstagramState>(
    world,
    "app_instagram",
    ctx.activeDeviceId,
  );
  const screen = state.currentScreen ?? "home";
  const headerH = contentTop + instagramSpacing.headerHeight;
  const navH = instagramSpacing.tabBarHeight;
  const hasBottomNav = screen === "home" || screen === "notifications" || screen === "profile";
  const navY = hasBottomNav ? h - contentBottom - navH : h - contentBottom;
  const screenPad = instagramSpacing.screenPadding;
  const feedY = headerH;
  const feedH = Math.max(0, navY - feedY);
  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
  };
  if (hasBottomNav) {
    regions.bottom_nav = {
      id: "bottom_nav",
      rect: rect(0, navY, w, navH),
      tags: ["nav", "sticky"],
      metadata: { sticky: true },
    };
  }

  if (screen === "home") {
    const posts = [...(state.posts ?? [])].sort((a, b) => b.createdAt - a.createdAt);
    const commentCounts = new Map<string, number>();
    for (const comment of state.comments ?? []) {
      commentCounts.set(comment.postId, (commentCounts.get(comment.postId) ?? 0) + 1);
    }
    const storyH = instagramSpacing.storyTrayHeight;
    const activePostId = state.activePostId ?? null;
    const scrollY = computeInstagramFeedScrollY(posts, commentCounts, activePostId, w);
    const contentStartY = headerH - scrollY;

    regions.home_header = {
      id: "home_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.stories_tray = {
      id: "stories_tray",
      rect: rect(0, contentStartY, w, storyH),
      tags: ["stories", "tray"],
    };
    regions.feed_list = {
      id: "feed_list",
      rect: rect(0, headerH, w, feedH),
      tags: ["feed", "scroll"],
    };
    let postY = contentStartY + storyH;
    let visibleIndex = 0;
    for (const post of posts) {
      const postHeight = estimateInstagramPostHeight(post, commentCounts.get(post.id) ?? 0, w);
      const mediaHeight = getInstagramMediaHeight(post, w);
      if (postY + postHeight >= headerH - 24 && postY <= navY + 24 && visibleIndex < 3) {
        const regionId = `feed_post_${visibleIndex}`;
        regions[regionId] = {
          id: regionId,
          rect: rect(0, postY, w, postHeight),
          tags: ["feed", "post"],
          metadata: { postId: post.id },
        };
        regions[`${regionId}_media`] = {
          id: `${regionId}_media`,
          rect: rect(0, postY + 56, w, mediaHeight),
          tags: ["feed", "post", "media"],
          metadata: { postId: post.id },
        };
        regions[`${regionId}_comments`] = {
          id: `${regionId}_comments`,
          rect: rect(screenPad, postY + 56 + mediaHeight + 52, w - screenPad * 2, 92),
          tags: ["feed", "post", "comments"],
          metadata: { postId: post.id },
        };
        regions[`${regionId}_actions`] = {
          id: `${regionId}_actions`,
          rect: rect(screenPad, postY + 56 + mediaHeight + 10, w - screenPad * 2, 30),
          tags: ["feed", "post", "actions"],
          metadata: { postId: post.id },
        };
        if (post.id === activePostId || (!activePostId && visibleIndex === 0)) {
          regions.feed_post_focus = {
            id: "feed_post_focus",
            rect: rect(0, postY, w, postHeight),
            tags: ["feed", "post", "focus"],
            metadata: { postId: post.id },
          };
          regions.feed_post_focus_comments = {
            id: "feed_post_focus_comments",
            rect: rect(screenPad, postY + 56 + mediaHeight + 52, w - screenPad * 2, 108),
            tags: ["feed", "post", "comments", "focus"],
            metadata: { postId: post.id },
          };
        }
        visibleIndex += 1;
      }
      postY += postHeight;
    }

    if (visibleIndex === 0) {
      regions.feed_post_0 = {
        id: "feed_post_0",
        rect: rect(0, headerH + storyH, w, 540),
        tags: ["feed", "post"],
      };
      regions.feed_post_0_media = {
        id: "feed_post_0_media",
        rect: rect(0, headerH + storyH + 56, w, 484),
        tags: ["feed", "post", "media"],
      };
      regions.feed_post_0_actions = {
        id: "feed_post_0_actions",
        rect: rect(screenPad, headerH + storyH + 56 + 484 + 10, w - screenPad * 2, 30),
        tags: ["feed", "post", "actions"],
      };
      regions.feed_post_focus = regions.feed_post_0;
    }

    return {
      kind: "FEED",
      scrollY,
      contentHeight: Math.max(
        h,
        storyH +
          posts.reduce(
            (sum, post) =>
              sum + estimateInstagramPostHeight(post, commentCounts.get(post.id) ?? 0, w),
            0,
          ),
      ),
      isAtBottom:
        activePostId !== null &&
        activePostId !== undefined &&
        posts[posts.length - 1]?.id === activePostId,
      itemLayouts: {},
      meta: {},
      semantic: buildSemantic(regions),
    };
  }

  if (screen === "notifications") {
    regions.notifications_header = {
      id: "notifications_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.notifications_list = {
      id: "notifications_list",
      rect: rect(0, feedY, w, feedH),
      tags: ["notifications", "list"],
    };
    regions.notifications_row_0 = {
      id: "notifications_row_0",
      rect: rect(screenPad, feedY + 12, w - screenPad * 2, 78),
      tags: ["notifications", "row"],
    };
  }

  if (screen === "inbox") {
    regions.inbox_header = {
      id: "inbox_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.inbox_search = {
      id: "inbox_search",
      rect: rect(screenPad, headerH + 10, w - screenPad * 2, 40),
      tags: ["inbox", "search"],
    };
    regions.inbox_list = {
      id: "inbox_list",
      rect: rect(0, headerH + 60, w, feedH - 60),
      tags: ["inbox", "list"],
    };
    regions.dm_row_0 = {
      id: "dm_row_0",
      rect: rect(screenPad, headerH + 74, w - screenPad * 2, 74),
      tags: ["dm", "row"],
    };
  }

  if (screen === "profile") {
    regions.profile_header = {
      id: "profile_header",
      rect: rect(0, 0, w, headerH + 180),
      tags: ["profile", "header"],
    };
    regions.profile_grid = {
      id: "profile_grid",
      rect: rect(0, headerH + 220, w, Math.max(0, feedH - 220)),
      tags: ["profile", "grid"],
    };
    regions.profile_grid_0 = {
      id: "profile_grid_0",
      rect: rect(0, headerH + 224, w / 3, w / 3),
      tags: ["profile", "grid", "item"],
    };
  }

  return {
    kind: "FEED",
    scrollY: 0,
    contentHeight: h,
    isAtBottom: true,
    itemLayouts: {},
    meta: {},
    semantic: buildSemantic(regions),
  };
}
