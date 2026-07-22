import React from "react";
import { useCurrentFrame } from "remotion";
import { requireAppStateForDevice, WorldState } from "@tokovo/core";
import { ArchiveIcon, ChevronRightIcon } from "../Icons.js";
import { ChatListHeader } from "../ChatListHeader.js";
import { TabNavigation } from "../TabNavigation.js";
import { ChatListItem } from "../ChatListItem.js";
import type {
  WhatsAppConversation,
  WhatsAppState,
  WhatsAppStatusUpdate,
} from "../../types/index.js";
import { formatConversationListTimestamp, getBaseTime } from "../../utils/messages.js";
import { resolveTypingMembers } from "../../utils/participants.js";
import { resolveDeliveryStage } from "../../utils/status.js";
import { useTheme, useWhatsAppLocale } from "../../experience/ExperienceContext.js";
import type { WhatsAppChatFilter } from "../../presentation/strategy.js";
import type { StatusSegmentState } from "../StatusRing.js";
import { formatWhatsAppNumber } from "../../localization/index.js";

// =============================================================================
// TYPES
// =============================================================================

export interface ChatListScreenProps {
  world: WorldState;
  deviceId: string;
  contentInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  width: number;
  height: number;
}

function normalizeIdentity(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function getConversationStatusSegments(
  conversation: WhatsAppConversation,
  statuses: readonly WhatsAppStatusUpdate[],
): StatusSegmentState[] {
  const identities = new Set([
    normalizeIdentity(conversation.id),
    normalizeIdentity(conversation.name),
    ...(conversation.members ?? []).map((member) => normalizeIdentity(member.id)),
  ]);

  return statuses
    .filter(
      (status) =>
        identities.has(normalizeIdentity(status.authorId)) ||
        normalizeIdentity(status.authorName) === normalizeIdentity(conversation.name),
    )
    .sort((left, right) => left.postedAt - right.postedAt)
    .map((status) => (status.viewed ? "viewed" : "unviewed"));
}

// =============================================================================
// ARCHIVED ROW COMPONENT
// =============================================================================

const ArchivedRow: React.FC<{ count: number }> = ({ count }) => {
  const theme = useTheme();
  const { locale, t } = useWhatsAppLocale();
  const { uiSpacing: spacing, uiTypography: typography } = theme;
  return (
    <div
      style={{
        display: "flex",
        height: spacing.chatListItemHeight,
        alignItems: "center",
        paddingInlineStart: spacing.avatarMarginLeft,
        paddingInlineEnd: spacing.contentMarginRight,
        cursor: "pointer",
        backgroundColor: theme.colors.background,
        borderBottom: `0.5px solid ${theme.colors.divider}`,
      }}
    >
      {/* Archive Icon */}
      <div
        style={{
          width: spacing.avatarSize,
          display: "flex",
          justifyContent: "center",
          marginInlineEnd: spacing.contentMarginLeft,
        }}
      >
        <ArchiveIcon color={theme.colors.timestamp} size={20} />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            ...typography.headline,
            color: theme.colors.receivedBubbleText,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {t("chat.archived")}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {count > 0 && (
            <span
              style={{
                ...typography.body,
                color: theme.colors.timestamp,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {formatWhatsAppNumber(locale, count)}
            </span>
          )}
          <ChevronRightIcon color={theme.colors.timestamp} size={14} />
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

const EmptyState: React.FC<{ filter: WhatsAppChatFilter }> = ({ filter }) => {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  const { uiTypography: typography } = theme;
  const getMessage = () => {
    switch (filter) {
      case "unread":
        return {
          glyph: "check" as const,
          title: t("empty.noUnreadTitle"),
          subtitle: t("empty.noUnreadBody"),
        };
      case "favorites":
        return {
          glyph: "star" as const,
          title: t("empty.noFavoritesTitle"),
          subtitle: t("empty.noFavoritesBody"),
        };
      case "groups":
        return {
          glyph: "group" as const,
          title: t("empty.noGroupsTitle"),
          subtitle: t("empty.noGroupsBody"),
        };
      case "drafts":
        return {
          glyph: "draft" as const,
          title: t("empty.noDraftsTitle"),
          subtitle: t("empty.noDraftsBody"),
        };
      default:
        return {
          glyph: "chat" as const,
          title: t("empty.noChatsTitle"),
          subtitle: t("empty.noChatsBody"),
        };
    }
  };

  const { glyph, title, subtitle } = getMessage();

  return (
    <div
      style={{
        padding: "80px 40px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          marginBottom: 20,
          borderRadius: 24,
          display: "grid",
          placeItems: "center",
          background: theme.colors.surfaceMuted,
          border: `1px solid ${theme.colors.divider}`,
          color: theme.colors.accent,
        }}
      >
        <svg width="42" height="42" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {glyph === "check" ? (
            <path
              d="m12 25 8 8 17-19"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : glyph === "star" ? (
            <path
              d="m24 7 5.2 10.6L41 19.3l-8.5 8.3 2 11.7L24 33.8l-10.5 5.5 2-11.7L7 19.3l11.8-1.7L24 7Z"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          ) : glyph === "group" ? (
            <>
              <circle cx="18" cy="19" r="7" stroke="currentColor" strokeWidth="3" />
              <circle cx="33" cy="21" r="5" stroke="currentColor" strokeWidth="3" />
              <path
                d="M7 39c1-8 6-12 11-12s10 4 11 12M28 29c6 0 10 3 11 9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </>
          ) : glyph === "draft" ? (
            <>
              <path
                d="M11 35 13 25 31 7l10 10-18 18-10 2 2-10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path d="m29 10 9 9" stroke="currentColor" strokeWidth="3" />
            </>
          ) : (
            <path
              d="M7 22c0-8 7-14 17-14s17 6 17 14-7 14-17 14c-3 0-5.7-.5-8.2-1.5L8 39l2.2-7.4A13 13 0 0 1 7 22Z"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>
      <div
        style={{
          ...typography.headline,
          fontSize: 20,
          color: theme.colors.receivedBubbleText,
          fontFamily: theme.typography.fontFamily,
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          ...typography.body,
          color: theme.colors.timestamp,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  world,
  deviceId,
  contentInsets,
  width: _width,
  height: _height,
}) => {
  const theme = useTheme();
  const { locale, t } = useWhatsAppLocale();
  const { uiSpacing: spacing } = theme;
  const currentFrame = useCurrentFrame();
  const baseTime = getBaseTime(world, deviceId);

  // TokovoRenderer already provides contentInsets in design coordinates.
  const contentInsetTop = contentInsets.top;
  const contentInsetBottom = contentInsets.bottom;

  // Extract app state and conversations
  const appState = requireAppStateForDevice<WhatsAppState>(
    world,
    "app_whatsapp",
    deviceId,
  );
  const activeFilter = appState.chatFilter ?? "all";
  const statuses = appState.statuses ?? [];
  const allConversations = (
    Object.values(appState.conversations || {}) as WhatsAppConversation[]
  ).sort((a, b) => {
    // Sort: Pinned first, then by last message time
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    const aLastMsg = a.messages?.[a.messages.length - 1];
    const bLastMsg = b.messages?.[b.messages.length - 1];
    const aTime = a.lastMessageAt ?? aLastMsg?.at ?? 0;
    const bTime = b.lastMessageAt ?? bLastMsg?.at ?? 0;

    if (aTime !== bTime) return bTime - aTime;
    const aName = a.name ?? "";
    const bName = b.name ?? "";
    return aName < bName ? -1 : aName > bName ? 1 : 0;
  });

  // Apply filters
  const filteredConversations = allConversations.filter((conv) => {
    if (conv.isArchived) return false; // Don't show archived in main list

    switch (activeFilter) {
      case "unread":
        return (conv.unreadCount || 0) > 0;
      case "favorites":
        return conv.isPinned;
      case "groups":
        return conv.type === "group";
      case "drafts":
        return Boolean(conv.draftText?.trim());
      default:
        return true;
    }
  });

  // Calculate total unread for tab badge
  const totalUnread = allConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  // Count archived conversations
  const archivedCount = allConversations.filter((c) => c.isArchived).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        backgroundColor: theme.colors.background,
        position: "relative",
        fontFamily: theme.typography.fontFamily,
        overflow: "hidden",
      }}
    >
      {/* Header (Sticky) */}
      <ChatListHeader
        contentInsetTop={contentInsetTop}
        activeFilter={activeFilter}
        showEditButton={false}
        showDraftsFilter={allConversations.some((conversation) =>
          Boolean(conversation.draftText?.trim()),
        )}
      />

      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          overflowX: "hidden",
          backgroundColor: theme.colors.background,
          paddingBottom: spacing.tabBarHeight + contentInsetBottom,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Archived Row (only show if there are archived chats and "all" filter is active) */}
        {archivedCount > 0 && activeFilter === "all" && <ArchivedRow count={archivedCount} />}

        {/* Conversations List */}
        {filteredConversations.length > 0 ? (
          <div role="list" aria-label={t("nav.chats")}>
            {filteredConversations.map((conv, i) => {
              const messages = conv.messages ?? [];

              const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
              const lastRenderable =
                [...messages]
                  .reverse()
                  .find((msg) => msg.type !== "system" || msg.systemType !== "date_change") ??
                lastMsg;

              // Determine media type
              let mediaType: "photo" | "video" | "voice" | "document" | "gif" | "sticker" | null =
                null;
              if (lastRenderable?.type === "image" || lastRenderable?.imageUrl) mediaType = "photo";
              else if (lastRenderable?.type === "video" || lastRenderable?.videoUrl)
                mediaType = "video";
              else if (lastRenderable?.type === "voice") mediaType = "voice";
              else if (lastRenderable?.type === "document" || lastRenderable?.documentUrl)
                mediaType = "document";
              else if (lastRenderable?.type === "gif" || lastRenderable?.gifUrl) mediaType = "gif";
              else if (lastRenderable?.type === "sticker" || lastRenderable?.stickerUrl)
                mediaType = "sticker";

              // Determine sender name for groups
              let senderName: string | undefined;
              if (conv.type === "group" && lastRenderable) {
                if (lastRenderable.from === "me") {
                  senderName = t("chat.you");
                } else if (lastRenderable.senderName) {
                  senderName = lastRenderable.senderName;
                } else if (lastRenderable.from) {
                  // Try to get name from members
                  const member = conv.members?.find((m) => m.id === lastRenderable.from);
                  senderName = member?.name || lastRenderable.from;
                }
              } else if (lastRenderable?.from === "me") {
                senderName = undefined; // Don't show "You:" for DMs
              }

              // Determine read status
              let status: "sending" | "sent" | "delivered" | "read" | "failed" | undefined;
              if (lastRenderable?.from === "me") {
                status = resolveDeliveryStage(lastRenderable, currentFrame);
              }

              // Check if someone is typing
              const typingMembers = resolveTypingMembers(conv);
              const isTyping = typingMembers.length > 0;
              const typingText = (() => {
                if (!isTyping) return undefined;
                if (conv.type !== "group") return t("chat.typing");
                if (typingMembers.length === 1)
                  return t("chat.memberTyping", { name: typingMembers[0].name });
                return t("chat.manyMembersTyping", {
                  first: typingMembers[0].name,
                  count: typingMembers.length - 1,
                });
              })();

              const lastMessagePreview = (() => {
                if (!lastRenderable) return t("chat.noMessages");
                if (lastRenderable.text) return lastRenderable.text;
                switch (lastRenderable.type) {
                  case "contact":
                    return t("message.contact");
                  case "location":
                    return t("message.location");
                  case "system":
                    return lastRenderable.text ?? t("message.systemUpdate");
                  case "call":
                    return lastRenderable.callType === "video"
                      ? t("message.videoCall")
                      : t("message.voiceCall");
                  case "call_missed":
                    return lastRenderable.callType === "video"
                      ? t("message.missedVideoCall")
                      : t("message.missedVoiceCall");
                  case "screenshot_alert":
                    return t("message.screenshotAlert");
                  case "document":
                    return lastRenderable.fileName
                      ? t("message.documentNamed", {
                          name: lastRenderable.fileName,
                        })
                      : t("message.document");
                  case "voice":
                    return t("message.voice");
                  case "gif":
                    return t("message.gif");
                  case "sticker":
                    return t("message.sticker");
                  case "image":
                    return t("message.photo");
                  case "video":
                    return t("message.video");
                  default:
                    return t("message.media");
                }
              })();

              return (
                <ChatListItem
                  key={conv.id}
                  id={conv.id}
                  name={conv.name || t("chat.unknown")}
                  avatarUrl={conv.avatar}
                  groupAvatars={
                    conv.type === "group"
                      ? conv.members
                          ?.map((m) => m.avatar)
                          .filter((avatar): avatar is string => Boolean(avatar))
                      : undefined
                  }
                  lastMessage={lastMessagePreview}
                  timestamp={
                    formatConversationListTimestamp(
                      lastRenderable?.timestampMs ?? lastMsg?.timestampMs,
                      baseTime,
                      locale,
                    ) ||
                    lastRenderable?.timestamp ||
                    lastMsg?.timestamp ||
                    ""
                  }
                  unreadCount={conv.unreadCount || 0}
                  status={status}
                  isTyping={isTyping}
                  isLast={i === filteredConversations.length - 1}
                  isMuted={conv.isMuted}
                  isPinned={conv.isPinned}
                  statusSegments={getConversationStatusSegments(conv, statuses)}
                  mediaType={mediaType}
                  senderName={senderName}
                  typingText={typingText}
                  locked={conv.preferences?.chatLock}
                  verifiedBusiness={conv.contact?.verifiedBusiness}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState filter={activeFilter} />
        )}
      </div>

      {/* Tab Navigation (Fixed Bottom) */}
      <TabNavigation
        activeTab="chats"
        contentInsetBottom={contentInsetBottom}
        unreadChatsCount={totalUnread}
      />
    </div>
  );
};

export default ChatListScreen;
