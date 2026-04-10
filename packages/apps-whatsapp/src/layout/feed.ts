import type {
  FeedLayoutState,
  LayoutContext,
  LayoutRect,
  SemanticRegion,
} from "@tokovo/core";

import type { WhatsAppState } from "../types/index.js";
import type { WhatsAppConversation } from "../types/conversation.js";
import { waSpacing } from "../config/tokens.js";

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
 * This provides semantic regions for non-chat screens (chat list, updates, calls,
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
      : screen === "status"
        ? "updates"
      : screen;

  const hasTabBar =
    normalizedScreen === "chats" ||
    normalizedScreen === "updates" ||
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

  const conversations = Object.values(
    (state.conversations ?? {}) as Record<string, WhatsAppConversation>,
  );

  if (hasTabBar) {
    regions.tab_bar = {
      id: "tab_bar",
      rect: rect(0, tabBarY, w, tabBarH),
      tags: ["tabbar", "sticky"],
      metadata: { sticky: true },
    };
  }

  if (normalizedScreen === "chats") {
    const visibleConversations = conversations
      .filter((conv) => !conv.isArchived)
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0);
      });
    const archivedCount = conversations.filter((conv) => conv.isArchived).length;
    const rowHeight = px(waSpacing.chatListItemHeight);
    let listY = contentY;

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

    if (archivedCount > 0) {
      regions.archived_row = {
        id: "archived_row",
        rect: rect(0, listY, w, rowHeight),
        tags: ["row", "chat", "archived"],
      };
      listY += rowHeight;
    }

    visibleConversations.slice(0, 8).forEach((conv, index) => {
      const rowId = `chat_row_${conv.id}`;
      const rowRect = rect(0, listY + index * rowHeight, w, rowHeight);
      regions[rowId] = {
        id: rowId,
        rect: rowRect,
        tags: ["row", "chat", conv.type === "group" ? "group" : "dm"],
        metadata: { conversationId: conv.id, index },
      };
      regions[`${rowId}_avatar`] = {
        id: `${rowId}_avatar`,
        rect: rect(px(16), rowRect.y + px(10), px(56), px(56)),
        tags: ["avatar", "chat"],
        metadata: { conversationId: conv.id, index },
      };
      regions[`${rowId}_title`] = {
        id: `${rowId}_title`,
        rect: rect(px(88), rowRect.y + px(14), px(190), px(20)),
        tags: ["title", "chat"],
        metadata: { conversationId: conv.id, index },
      };
      regions[`${rowId}_preview`] = {
        id: `${rowId}_preview`,
        rect: rect(px(88), rowRect.y + px(38), px(220), px(18)),
        tags: ["preview", "chat"],
        metadata: { conversationId: conv.id, index },
      };
    });
  } else if (normalizedScreen === "updates") {
    const statusSectionTop = contentY + px(88);
    const statusSectionHeight = px(154);
    const statusSectionBottom = Math.min(bottomLimit, statusSectionTop + statusSectionHeight);
    const channelsTop = Math.min(bottomLimit, statusSectionBottom + px(20));
    const channelsHeight = Math.max(0, bottomLimit - channelsTop);
    const statusConversations = conversations.filter((conv) => conv.hasStatus).slice(0, 5);
    const channelConversations = conversations
      .filter((conv) => conv.isChannel || conv.isVerifiedBusiness)
      .slice(0, 6);

    regions.updates_header = {
      id: "updates_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky", "updates"],
      metadata: { sticky: true },
    };
    regions.updates_status_strip = {
      id: "updates_status_strip",
      rect: rect(px(16), statusSectionTop, w - px(32), Math.max(0, statusSectionBottom - statusSectionTop)),
      tags: ["list", "status", "updates"],
    };
    regions.updates_channels = {
      id: "updates_channels",
      rect: rect(0, channelsTop, w, channelsHeight),
      tags: ["list", "channels", "updates"],
    };
    regions.updates_list = {
      id: "updates_list",
      rect: rect(0, contentY, w, contentH),
      tags: ["list", "updates"],
    };

    const statusCardWidth = px(108);
    const statusGap = px(14);
    const statusCardY = statusSectionTop + px(4);
    const statusStartX = px(16);
    statusConversations.forEach((conv, index) => {
      const cardX = statusStartX + index * (statusCardWidth + statusGap);
      regions[`updates_status_${conv.id}`] = {
        id: `updates_status_${conv.id}`,
        rect: rect(cardX, statusCardY, statusCardWidth, px(118)),
        tags: ["status_card", "updates"],
        metadata: { conversationId: conv.id, index },
      };
    });

    const heroY = channelsTop;
    regions.updates_channels_hero = {
      id: "updates_channels_hero",
      rect: rect(px(16), heroY, w - px(32), px(92)),
      tags: ["hero", "channels", "updates"],
    };

    const channelRowY = heroY + px(108);
    const channelRowHeight = px(88);
    channelConversations.forEach((conv, index) => {
      const baseY = channelRowY + index * channelRowHeight;
      if (baseY + channelRowHeight > bottomLimit) return;
      const rowId = `channel_row_${conv.id}`;
      regions[rowId] = {
        id: rowId,
        rect: rect(0, baseY, w, channelRowHeight),
        tags: ["row", "channel", "updates"],
        metadata: { conversationId: conv.id, index },
      };
      regions[`${rowId}_avatar`] = {
        id: `${rowId}_avatar`,
        rect: rect(px(16), baseY + px(16), px(56), px(56)),
        tags: ["avatar", "channel"],
        metadata: { conversationId: conv.id, index },
      };
      regions[`${rowId}_text`] = {
        id: `${rowId}_text`,
        rect: rect(px(88), baseY + px(12), px(210), px(48)),
        tags: ["content", "channel"],
        metadata: { conversationId: conv.id, index },
      };
      regions[`${rowId}_cta`] = {
        id: `${rowId}_cta`,
        rect: rect(w - px(92), baseY + px(24), px(60), px(28)),
        tags: ["cta", "channel"],
        metadata: { conversationId: conv.id, index },
      };
    });
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
    cacheHint: "static",
    scrollY: 0,
    contentHeight: h,
    isAtBottom: false,
    itemLayouts: {},
    meta: {},
    semantic: semantic(regions),
  };
}
