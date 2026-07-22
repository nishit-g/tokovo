import type {
  FeedLayoutState,
  LayoutContext,
  LayoutRect,
  SemanticRegion,
} from "@tokovo/core";
import { getAppStateForDevice } from "@tokovo/core";

import type { WhatsAppState } from "../types/index.js";
import type { WhatsAppConversation } from "../types/conversation.js";
import { resolveWhatsAppExperience } from "../experience/resolver.js";
import type { WhatsAppThemeId } from "../theme/index.js";

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
 * communities, profile). It intentionally focuses on stable cinematic subjects
 * rather than pixel-perfect DOM replication.
 */
export function computeFeedLayout(ctx: LayoutContext): FeedLayoutState {
  const {
    viewportWidth: w,
    viewportHeight: h,
    safeAreaInsets,
    world,
    activeDeviceId,
  } = ctx;
  const safeTop = safeAreaInsets?.top ?? 0;
  const safeBottom = safeAreaInsets?.bottom ?? 0;

  // All WhatsApp UI is authored for a 393pt design width. Renderer scales it.
  const scale = w / DESIGN_WIDTH;
  const px = (v: number) => v * scale;
  const device = world.devices[activeDeviceId];
  const state =
    getAppStateForDevice<Partial<WhatsAppState>>(
      world,
      "app_whatsapp",
      activeDeviceId,
    ) ?? {};
  const experience = resolveWhatsAppExperience({
    platform: device?.profileId.toLowerCase().includes("pixel")
      ? "android"
      : "ios",
    appearance: device?.appAppearance ?? "light",
    themeId: device?.appTheme as WhatsAppThemeId | undefined,
    locale: state.locale ?? "en-US",
  });
  const waSpacing = experience.layout.app;
  const screen = state.currentScreen ?? "chats";

  const hasTabBar =
    screen === "chats" ||
    screen === "updates" ||
    screen === "calls" ||
    screen === "communities" ||
    screen === "settings";

  const tabBarH = hasTabBar ? px(waSpacing.tabBarHeight) + safeBottom : 0;
  const tabBarY = Math.max(0, h - tabBarH);

  const headerH = (() => {
    if (screen === "chats") {
      // ChatListHeader structure:
      // - top bar: navBarHeight + safeTop (handled via safeTop + px(navBarHeight))
      // - large title block: ~54 (includes padding + font)
      // - search block: searchBarHeight + 10 bottom padding
      // - filter chips: filterChipHeight + 12 bottom padding
      const titleBlock = 54;
      const searchBlock = waSpacing.searchBarHeight + 10;
      const chipsBlock = waSpacing.filterChipHeight + 12;
      return (
        safeTop +
        px(waSpacing.navBarHeight + titleBlock + searchBlock + chipsBlock)
      );
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

  if (screen === "chats") {
    const visibleConversations = conversations
      .filter((conv) => !conv.isArchived)
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0);
      });
    const archivedCount = conversations.filter(
      (conv) => conv.isArchived,
    ).length;
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
  } else if (screen === "updates") {
    const statusSectionTop = contentY + px(34);
    const statusSectionHeight = px(102);
    const statusSectionBottom = Math.min(
      bottomLimit,
      statusSectionTop + statusSectionHeight,
    );
    const channelsTop = Math.min(bottomLimit, statusSectionBottom + px(34));
    const channelsHeight = Math.max(0, bottomLimit - channelsTop);
    const statusAuthors = [
      ...new Map(
        [...(state.statuses ?? [])]
          .sort((left, right) => right.postedAt - left.postedAt)
          .map((status) => [status.authorId, status] as const),
      ).values(),
    ].slice(0, 4);
    const channels = [...(state.channels ?? [])]
      .sort((left, right) => {
        if (left.followed !== right.followed) return left.followed ? -1 : 1;
        return (
          (right.latestUpdate?.postedAt ?? 0) -
          (left.latestUpdate?.postedAt ?? 0)
        );
      })
      .slice(0, 4);

    regions.updates_header = {
      id: "updates_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky", "updates"],
      metadata: { sticky: true },
    };
    regions.updates_status_strip = {
      id: "updates_status_strip",
      rect: rect(
        px(16),
        statusSectionTop,
        w - px(32),
        Math.max(0, statusSectionBottom - statusSectionTop),
      ),
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

    const statusCardWidth = px(66);
    const statusGap = px(15);
    const statusCardY = statusSectionTop + px(4);
    const statusStartX = px(16);
    statusAuthors.forEach((status, index) => {
      const cardX = statusStartX + index * (statusCardWidth + statusGap);
      regions[`updates_status_${status.authorId}`] = {
        id: `updates_status_${status.authorId}`,
        rect: rect(cardX, statusCardY, statusCardWidth, px(90)),
        tags: ["status_card", "updates"],
        metadata: { authorId: status.authorId, index },
      };
    });

    const channelRowY = channelsTop;
    const channelRowHeight = px(78);
    channels.forEach((channel, index) => {
      const baseY = channelRowY + index * channelRowHeight;
      if (baseY + channelRowHeight > bottomLimit) return;
      const rowId = `channel_row_${channel.id}`;
      regions[rowId] = {
        id: rowId,
        rect: rect(0, baseY, w, channelRowHeight),
        tags: ["row", "channel", "updates"],
        metadata: { channelId: channel.id, index },
      };
      regions[`${rowId}_avatar`] = {
        id: `${rowId}_avatar`,
        rect: rect(px(16), baseY + px(13), px(52), px(52)),
        tags: ["avatar", "channel"],
        metadata: { channelId: channel.id, index },
      };
      regions[`${rowId}_text`] = {
        id: `${rowId}_text`,
        rect: rect(px(79), baseY + px(10), px(210), px(52)),
        tags: ["content", "channel"],
        metadata: { channelId: channel.id, index },
      };
      regions[`${rowId}_cta`] = {
        id: `${rowId}_cta`,
        rect: rect(w - px(104), baseY + px(24), px(72), px(28)),
        tags: ["cta", "channel"],
        metadata: { channelId: channel.id, index },
      };
    });
  } else if (screen === "calls") {
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
    regions.calls_link = {
      id: "calls_link",
      rect: rect(px(16), contentY + px(14), w - px(32), px(58)),
      tags: ["action", "calls"],
    };
    const callRowsTop = contentY + px(92);
    const callRowHeight = px(66);
    [...(state.callLog ?? [])]
      .sort((left, right) => right.startedAt - left.startedAt)
      .slice(0, 6)
      .forEach((entry, index) => {
        const rowId = `call_row_${entry.id}`;
        regions[rowId] = {
          id: rowId,
          rect: rect(0, callRowsTop + index * callRowHeight, w, callRowHeight),
          tags: ["row", "call", entry.direction, entry.mode],
          metadata: { callId: entry.id, index },
        };
      });
  } else if (screen === "communities") {
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
    regions.communities_new = {
      id: "communities_new",
      rect: rect(px(16), contentY + px(14), w - px(32), px(70)),
      tags: ["action", "community"],
    };
    const communityTop = contentY + px(110);
    const communityHeight = px(152);
    (state.communities ?? []).slice(0, 3).forEach((community, index) => {
      const rowId = `community_${community.id}`;
      regions[rowId] = {
        id: rowId,
        rect: rect(
          px(16),
          communityTop + index * communityHeight,
          w - px(32),
          communityHeight - px(10),
        ),
        tags: ["card", "community"],
        metadata: { communityId: community.id, index },
      };
    });
  } else if (screen === "settings") {
    regions.settings_header = {
      id: "settings_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky", "settings"],
      metadata: { sticky: true },
    };
    regions.settings_list = {
      id: "settings_list",
      rect: rect(0, contentY, w, contentH),
      tags: ["list", "settings"],
    };
    regions.settings_search = {
      id: "settings_search",
      rect: rect(px(16), contentY + px(10), w - px(32), px(34)),
      tags: ["search", "settings"],
    };
    regions.settings_profile = {
      id: "settings_profile",
      rect: rect(px(16), contentY + px(52), w - px(32), px(78)),
      tags: ["profile", "settings"],
    };
    const settingsRows = [
      "account",
      "privacy",
      "avatar",
      "chats",
      "notifications",
      "storage",
      "linked_devices",
      "help",
      "invite",
    ] as const;
    const settingsRowsTop = contentY + px(156);
    const settingsRowHeight = px(54);
    settingsRows.forEach((row, index) => {
      const rowId = `settings_${row}`;
      regions[rowId] = {
        id: rowId,
        rect: rect(
          0,
          settingsRowsTop + index * settingsRowHeight,
          w,
          settingsRowHeight,
        ),
        tags: ["row", "settings"],
        metadata: { setting: row, index },
      };
    });
  } else if (screen === "profile") {
    const conversationId = state.conversationId;
    const conversation = conversationId
      ? (state.conversations ?? {})[conversationId]
      : undefined;
    const isGroup = conversation?.type === "group";
    const prefix = isGroup ? "group_info" : "profile";
    regions[`${prefix}_header`] = {
      id: `${prefix}_header`,
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky", prefix],
      metadata: { sticky: true },
    };
    regions[`${prefix}_content`] = {
      id: `${prefix}_content`,
      rect: rect(0, contentY, w, contentH),
      tags: ["content", prefix],
    };
    regions[`${prefix}_hero`] = {
      id: `${prefix}_hero`,
      rect: rect(px(16), contentY + px(12), w - px(32), px(142)),
      tags: ["hero", prefix],
    };
    regions[`${prefix}_actions`] = {
      id: `${prefix}_actions`,
      rect: rect(px(16), contentY + px(112), w - px(32), px(46)),
      tags: ["actions", prefix],
    };
    if (isGroup && conversation) {
      const membersTop = contentY + px(330);
      regions.group_info_members = {
        id: "group_info_members",
        rect: rect(
          px(16),
          membersTop,
          w - px(32),
          Math.max(0, bottomLimit - membersTop),
        ),
        tags: ["list", "members", "group_info"],
      };
      (conversation.members ?? []).slice(0, 6).forEach((member, index) => {
        const rowId = `group_member_${member.id}`;
        regions[rowId] = {
          id: rowId,
          rect: rect(px(16), membersTop + index * px(58), w - px(32), px(58)),
          tags: ["row", "member", "group_info"],
          metadata: { memberId: member.id, index },
        };
      });
    }
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
