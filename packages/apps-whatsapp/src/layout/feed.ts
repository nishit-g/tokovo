import type {
  FeedLayoutState,
  LayoutContext,
  LayoutRect,
  SemanticRegion,
} from "@tokovo/core";
import { requireAppStateForDevice } from "@tokovo/core";

import type { WhatsAppState } from "../types/index.js";
import type { WhatsAppConversation } from "../types/conversation.js";
import { resolveWhatsAppExperience } from "../experience/resolver.js";
import type { WhatsAppThemeId } from "../theme/index.js";
import { WHATSAPP_INTERACTION_TOKENS as tokens } from "../theme/index.js";
import {
  compareConversations,
  matchesChatFilter,
  selectScreenScroll,
} from "../runtime/selectors.js";

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
    appViewport,
    world,
    activeDeviceId,
  } = ctx;
  const contentTop = appViewport.interactiveInsets.top;
  const contentBottom = appViewport.interactiveInsets.bottom;

  const device = world.devices[activeDeviceId];
  if (!device) {
    throw new Error(
      `WHATSAPP_LAYOUT_DEVICE_MISSING: "${activeDeviceId}" is not in world state.`,
    );
  }
  const state = requireAppStateForDevice<WhatsAppState>(
    world,
    "app_whatsapp",
    activeDeviceId,
  );
  const experience = resolveWhatsAppExperience({
    platform: ctx.platform,
    appearance: device.appAppearance ?? device.os.appearance,
    themeId: device.appTheme as WhatsAppThemeId | undefined,
    locale: state.locale,
  });
  const waSpacing = experience.layout.app;
  const screen = state.currentScreen;

  const hasTabBar =
    screen === "chats" ||
    screen === "updates" ||
    screen === "calls" ||
    screen === "communities" ||
    screen === "settings";

  const tabBarH = hasTabBar ? waSpacing.tabBarHeight + contentBottom : 0;
  const tabBarY = Math.max(0, h - tabBarH);

  const headerH = (() => {
    if (screen === "chats") {
      // ChatListHeader structure:
      // - top bar: navBarHeight plus the resolved system content inset
      // - large title block: ~54 (includes padding + font)
      // - search block: searchBarHeight + 10 bottom padding
      // - filter chips: filterChipHeight + 12 bottom padding
      const titleBlock = 54;
      const searchBlock = waSpacing.searchBarHeight + 10;
      const chipsBlock = waSpacing.filterChipHeight + 12;
      return (
        contentTop +
        (waSpacing.navBarHeight + titleBlock + searchBlock + chipsBlock)
      );
    }

    // Other tab screens use a simple top bar below the platform content inset.
    return contentTop + waSpacing.navBarHeight;
  })();

  const bottomLimit = hasTabBar ? tabBarY : Math.max(0, h - contentBottom);
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
      .filter((conv) => matchesChatFilter(conv, state.chatFilter))
      .sort(compareConversations);
    const archivedCount = conversations.filter(
      (conv) => conv.isArchived,
    ).length;
    const rowHeight = waSpacing.chatListItemHeight;
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

    if (archivedCount > 0 && state.chatFilter === "all") {
      regions.archived_row = {
        id: "archived_row",
        rect: rect(0, listY, w, rowHeight),
        tags: ["row", "chat", "archived"],
      };
      listY += rowHeight;
    }

    visibleConversations.forEach((conv, index) => {
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
        rect: rect(16, rowRect.y + 10, 56, 56),
        tags: ["avatar", "chat"],
        metadata: { conversationId: conv.id, index },
      };
      regions[`${rowId}_title`] = {
        id: `${rowId}_title`,
        rect: rect(88, rowRect.y + 14, 190, 20),
        tags: ["title", "chat"],
        metadata: { conversationId: conv.id, index },
      };
      regions[`${rowId}_preview`] = {
        id: `${rowId}_preview`,
        rect: rect(88, rowRect.y + 38, 220, 18),
        tags: ["preview", "chat"],
        metadata: { conversationId: conv.id, index },
      };
    });
  } else if (screen === "updates") {
    const statusSectionTop = contentY + 34;
    const statusSectionHeight = 102;
    const statusSectionBottom = Math.min(
      bottomLimit,
      statusSectionTop + statusSectionHeight,
    );
    const channelsTop = Math.min(bottomLimit, statusSectionBottom + 34);
    const channelsHeight = Math.max(0, bottomLimit - channelsTop);
    const statusAuthors = [
      ...new Map(
        [...(state.statuses ?? [])]
          .sort((left, right) => right.postedAt - left.postedAt)
          .map((status) => [status.authorId, status] as const),
      ).values(),
    ];
    const channels = [...(state.channels ?? [])].sort((left, right) => {
      if (left.followed !== right.followed) return left.followed ? -1 : 1;
      return (
        (right.latestUpdate?.postedAt ?? 0) - (left.latestUpdate?.postedAt ?? 0)
      );
    });

    regions.updates_header = {
      id: "updates_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky", "updates"],
      metadata: { sticky: true },
    };
    regions.updates_status_strip = {
      id: "updates_status_strip",
      rect: rect(
        16,
        statusSectionTop,
        w - 32,
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

    const statusCardWidth = 66;
    const statusGap = 15;
    const statusCardY = statusSectionTop + 4;
    const statusStartX = 16;
    statusAuthors.forEach((status, index) => {
      const cardX = statusStartX + index * (statusCardWidth + statusGap);
      regions[`updates_status_${status.authorId}`] = {
        id: `updates_status_${status.authorId}`,
        rect: rect(cardX, statusCardY, statusCardWidth, 90),
        tags: ["status_card", "updates"],
        metadata: { authorId: status.authorId, index },
      };
    });

    const channelRowY = channelsTop;
    const channelRowHeight = 78;
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
        rect: rect(16, baseY + 13, 52, 52),
        tags: ["avatar", "channel"],
        metadata: { channelId: channel.id, index },
      };
      regions[`${rowId}_text`] = {
        id: `${rowId}_text`,
        rect: rect(79, baseY + 10, 210, 52),
        tags: ["content", "channel"],
        metadata: { channelId: channel.id, index },
      };
      regions[`${rowId}_cta`] = {
        id: `${rowId}_cta`,
        rect: rect(w - 104, baseY + 24, 72, 28),
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
      rect: rect(
        16,
        contentY + tokens.callLinkMarginTop,
        w - 32,
        tokens.callLinkHeight,
      ),
      tags: ["action", "calls"],
    };
    const callRowsTop =
      contentY +
      tokens.callLinkMarginTop +
      tokens.callLinkHeight +
      tokens.callLinkMarginBottom +
      tokens.sectionHeaderHeight +
      (conversations.some((chat) => chat.isFavorite)
        ? tokens.sectionHeaderHeight + tokens.favoritesHeight
        : 0);
    const callRowHeight = tokens.callRowHeight;
    [...(state.callLog ?? [])]
      .sort((left, right) => right.startedAt - left.startedAt)
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
      rect: rect(16, contentY + 14, w - 32, 70),
      tags: ["action", "community"],
    };
    const communityTop = contentY + 110;
    const communityHeight = 152;
    (state.communities ?? []).slice(0, 3).forEach((community, index) => {
      const rowId = `community_${community.id}`;
      regions[rowId] = {
        id: rowId,
        rect: rect(
          16,
          communityTop + index * communityHeight,
          w - 32,
          communityHeight - 10,
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
      rect: rect(16, contentY + 10, w - 32, 34),
      tags: ["search", "settings"],
    };
    regions.settings_profile = {
      id: "settings_profile",
      rect: rect(16, contentY + 52, w - 32, 78),
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
    const settingsRowsTop = contentY + 156;
    const settingsRowHeight = 54;
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
      rect: rect(16, contentY + 12, w - 32, 142),
      tags: ["hero", prefix],
    };
    regions[`${prefix}_actions`] = {
      id: `${prefix}_actions`,
      rect: rect(16, contentY + 112, w - 32, 46),
      tags: ["actions", prefix],
    };
    if (isGroup && conversation) {
      const membersTop = contentY + 330;
      regions.group_info_members = {
        id: "group_info_members",
        rect: rect(
          16,
          membersTop,
          w - 32,
          Math.max(0, bottomLimit - membersTop),
        ),
        tags: ["list", "members", "group_info"],
      };
      (conversation.members ?? []).slice(0, 6).forEach((member, index) => {
        const rowId = `group_member_${member.id}`;
        regions[rowId] = {
          id: rowId,
          rect: rect(16, membersTop + index * 58, w - 32, 58),
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

  const scrollY = selectScreenScroll(state, ctx.t);
  for (const region of Object.values(regions)) {
    if (
      region.metadata?.sticky ||
      region.tags?.includes("sticky") ||
      region.tags?.includes("list") ||
      ["app", "device", "content"].includes(region.id)
    )
      continue;
    region.rect = { ...region.rect, y: region.rect.y - scrollY };
  }
  return {
    kind: "FEED",
    cacheHint: state.screenScroll?.[state.currentScreen ?? "chats"]
      ? undefined
      : "static",
    scrollY,
    contentHeight: h,
    isAtBottom: false,
    itemLayouts: {},
    meta: {},
    semantic: semantic(regions),
  };
}
