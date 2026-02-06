import type {
  FeedLayoutState,
  LayoutContext,
  LayoutRect,
  SemanticRegion,
} from "@tokovo/core";

import type { WhatsAppState } from "../types";
import { waSpacing } from "../config/tokens";

const DESIGN_WIDTH = 393;

function rect(x: number, y: number, width: number, height: number): LayoutRect {
  return { x, y, width, height };
}

function semantic(regions: Record<string, SemanticRegion>) {
  return { regions, groups: {} };
}

/**
 * WhatsApp FEED layout strategy.
 *
 * This provides semantic regions for non-chat screens (chat list, status, calls,
 * communities, profile). It intentionally focuses on stable camera anchors
 * rather than pixel-perfect DOM replication.
 */
export function computeFeedLayout(ctx: LayoutContext): FeedLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets, world } = ctx;
  const safeTop = safeAreaInsets?.top ?? 0;
  const safeBottom = safeAreaInsets?.bottom ?? 0;

  // All WhatsApp UI is authored for a 393pt design width. Renderer scales it.
  const scale = w / DESIGN_WIDTH;
  const px = (v: number) => v * scale;

  const state = (world.appState?.app_whatsapp ?? {}) as Partial<WhatsAppState>;
  const screen = state.currentScreen ?? "chats";

  const normalizedScreen =
    screen === "main" || screen === "list" || screen === "chats-list"
      ? "chats"
      : screen;

  const hasTabBar =
    normalizedScreen === "chats" ||
    normalizedScreen === "status" ||
    normalizedScreen === "calls" ||
    normalizedScreen === "communities" ||
    normalizedScreen === "settings";

  const tabBarH = hasTabBar ? px(waSpacing.tabBarHeight) + safeBottom : 0;
  const tabBarY = Math.max(0, h - tabBarH);

  const headerH = (() => {
    if (normalizedScreen === "chats") {
      // ChatListHeader structure:
      // - top bar: navBarHeight + safeTop (handled via safeTop + px(navBarHeight))
      // - large title block: ~54 (includes padding + font)
      // - search block: searchBarHeight + 10 bottom padding
      // - filter chips: filterChipHeight + 12 bottom padding
      const titleBlock = 54;
      const searchBlock = waSpacing.searchBarHeight + 10;
      const chipsBlock = waSpacing.filterChipHeight + 12;
      return safeTop + px(waSpacing.navBarHeight + titleBlock + searchBlock + chipsBlock);
    }

    // Other tab screens use a simple iOS top bar (nav height + safe area).
    return safeTop + px(waSpacing.navBarHeight);
  })();

  const bottomLimit = hasTabBar ? tabBarY : Math.max(0, h - safeBottom);
  const contentY = Math.min(headerH, bottomLimit);
  const contentH = Math.max(0, bottomLimit - contentY);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
  };

  if (hasTabBar) {
    regions.tab_bar = {
      id: "tab_bar",
      rect: rect(0, tabBarY, w, tabBarH),
      tags: ["tabbar", "sticky"],
      metadata: { sticky: true },
    };
  }

  if (normalizedScreen === "chats") {
    regions.chat_list_header = {
      id: "chat_list_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.chat_list = {
      id: "chat_list",
      rect: rect(0, contentY, w, contentH),
      tags: ["list"],
    };
  } else if (normalizedScreen === "status") {
    regions.status_header = {
      id: "status_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.status_list = {
      id: "status_list",
      rect: rect(0, contentY, w, contentH),
      tags: ["list", "status"],
    };
  } else if (normalizedScreen === "calls") {
    regions.calls_header = {
      id: "calls_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.calls_list = {
      id: "calls_list",
      rect: rect(0, contentY, w, contentH),
      tags: ["list", "calls"],
    };
  } else if (normalizedScreen === "communities") {
    regions.communities_header = {
      id: "communities_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.communities_list = {
      id: "communities_list",
      rect: rect(0, contentY, w, contentH),
      tags: ["list", "communities"],
    };
  } else if (normalizedScreen === "profile") {
    regions.profile_header = {
      id: "profile_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.profile_content = {
      id: "profile_content",
      rect: rect(0, contentY, w, contentH),
      tags: ["content", "profile"],
    };
  } else {
    // Defensive: still expose a generic content region.
    regions.header = {
      id: "header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.content = {
      id: "content",
      rect: rect(0, contentY, w, contentH),
      tags: ["content"],
    };
  }

  return {
    kind: "FEED",
    scrollY: 0,
    contentHeight: h,
    isAtBottom: false,
    itemLayouts: {},
    meta: {},
    semantic: semantic(regions),
  };
}
