import type {
  FeedItemLayout,
  FeedLayoutState,
  LayoutContext,
  LayoutRect,
  SemanticRegion,
} from "@tokovo/core";
import { selectChannelFeedRows, selectChatListRows, selectTeamsState } from "../selectors/index.js";

function rect(x: number, y: number, width: number, height: number): LayoutRect {
  return { x, y, width, height };
}

function semantic(regions: Record<string, SemanticRegion>, groups: Record<string, string[]> = {}) {
  return { regions, groups };
}

export function computeTeamsFeedLayout(ctx: LayoutContext): FeedLayoutState {
  const state = selectTeamsState(ctx.world) ?? undefined;
  const { viewportWidth: width, viewportHeight: height, safeAreaInsets } = ctx;
  const rows =
    state?.screen === "channel_feed"
      ? selectChannelFeedRows(state)
      : state
        ? selectChatListRows(state)
        : [];
  const headerHeight = safeAreaInsets.top + 56;
  const filterHeight = state?.screen === "chat_list" ? 40 : 0;
  const tabBarHeight = 49 + safeAreaInsets.bottom;
  const contentY = headerHeight + filterHeight;
  const contentWidth = width - 32;
  const itemLayouts: Record<string, FeedItemLayout> = {};
  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, width, height), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, width, height), tags: ["app"] },
    teams_surface: { id: "teams_surface", rect: rect(0, 0, width, height), tags: ["surface"] },
    teams_header: { id: "teams_header", rect: rect(0, 0, width, headerHeight), tags: ["header", "sticky"] },
    teams_content: {
      id: "teams_content",
      rect: rect(0, contentY, width, Math.max(0, height - contentY - tabBarHeight)),
      tags: ["content", "feed"],
    },
    teams_tabbar: {
      id: "teams_tabbar",
      rect: rect(0, height - tabBarHeight, width, tabBarHeight),
      tags: ["navigation", "sticky"],
    },
  };
  const groups: Record<string, string[]> = {
    row: [],
    dm: [],
    channel: [],
    threadCard: [],
  };

  if (filterHeight > 0) {
    regions.teams_filters = {
      id: "teams_filters",
      rect: rect(0, headerHeight, width, filterHeight),
      tags: ["filters", "sticky"],
    };
  }

  let rowY = contentY + 8;
  for (const row of rows) {
    const emphasized = row.unreadCount > 0 || row.mentionCount > 0;
    const rowHeight = emphasized ? 76 : 72;
    itemLayouts[row.id] = {
      id: row.id,
      y: rowY,
      height: rowHeight,
      opacity: 1,
      translateY: 0,
      scale: 1,
    };
    const regionId =
      state?.screen === "channel_feed" ? `teams_thread_card_${row.id}` : `teams_row_${row.id}`;
    regions[regionId] = {
      id: regionId,
      rect: rect(16, rowY, contentWidth, rowHeight),
      tags: [
        state?.screen === "channel_feed" ? "thread_card" : "row",
        "tap_target",
      ],
      metadata: { id: row.id },
    };
    groups.row.push(regionId);
    if (state?.screen === "channel_feed") {
      groups.threadCard.push(regionId);
    } else if (row.kind === "dm") {
      groups.dm.push(regionId);
    } else {
      groups.channel.push(regionId);
    }
    rowY += rowHeight;
  }

  return {
    kind: "FEED",
    scrollY: 0,
    contentHeight: Math.max(height, rowY + tabBarHeight),
    isAtBottom: false,
    itemLayouts,
    meta: {
      firstVisibleItemId: rows[0]?.id,
      lastVisibleItemId: rows[rows.length - 1]?.id,
    },
    semantic: semantic(regions, groups),
  };
}
