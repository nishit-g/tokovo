import React from "react";
import { useCurrentFrame } from "remotion";
import { WorldState } from "@tokovo/core";
import { ArchiveIcon, ChevronRightIcon } from "../Icons.js";
import { ChatListHeader } from "../ChatListHeader.js";
import { TabNavigation } from "../TabNavigation.js";
import { ChatListItem } from "../ChatListItem.js";
import type {
  WhatsAppConversation,
  WhatsAppState,
  WhatsAppStatusUpdate,
} from "../../types/index.js";
import {
  formatConversationListTimestamp,
  getBaseTime,
} from "../../utils/messages.js";
import { resolveTypingMembers } from "../../utils/participants.js";
import { resolveDeliveryStage } from "../../utils/status.js";
import {
  useTheme,
  useWhatsAppLocale,
} from "../../experience/ExperienceContext.js";
import type { WhatsAppChatFilter } from "../../presentation/strategy.js";
import type { StatusSegmentState } from "../StatusRing.js";
import { formatWhatsAppNumber } from "../../localization/index.js";

// =============================================================================
// TYPES
// =============================================================================

export interface ChatListScreenProps {
  world: WorldState;
  safeAreaInsets?: {
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
          emoji: "✅",
          title: t("empty.noUnreadTitle"),
          subtitle: t("empty.noUnreadBody"),
        };
      case "favorites":
        return {
          emoji: "⭐",
          title: t("empty.noFavoritesTitle"),
          subtitle: t("empty.noFavoritesBody"),
        };
      case "groups":
        return {
          emoji: "👥",
          title: t("empty.noGroupsTitle"),
          subtitle: t("empty.noGroupsBody"),
        };
      case "drafts":
        return {
          emoji: "✍️",
          title: t("empty.noDraftsTitle"),
          subtitle: t("empty.noDraftsBody"),
        };
      default:
        return {
          emoji: "💬",
          title: t("empty.noChatsTitle"),
          subtitle: t("empty.noChatsBody"),
        };
    }
  };

  const { emoji, title, subtitle } = getMessage();

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
      <div style={{ fontSize: 64, marginBottom: 20 }}>{emoji}</div>
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
  safeAreaInsets,
  width: _width,
  height: _height,
}) => {
  const theme = useTheme();
  const { locale, t } = useWhatsAppLocale();
  const { uiSpacing: spacing } = theme;
  const currentFrame = useCurrentFrame();
  const deviceId = Object.keys(world.devices || {})[0];
  const baseTime = getBaseTime(world, deviceId);

  // TokovoRenderer already provides safeAreaInsets in design coordinates.
  const safeAreaTop = safeAreaInsets?.top ?? 47;
  const safeAreaBottom = safeAreaInsets?.bottom ?? 34;

  // Extract app state and conversations
  const appState = (world.appState?.["app_whatsapp"] || {}) as WhatsAppState;
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
  const totalUnread = allConversations.reduce(
    (sum, conv) => sum + (conv.unreadCount || 0),
    0,
  );

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
        safeAreaTop={safeAreaTop}
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
          paddingBottom: spacing.tabBarHeight + safeAreaBottom,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Archived Row (only show if there are archived chats and "all" filter is active) */}
        {archivedCount > 0 && activeFilter === "all" && (
          <ArchivedRow count={archivedCount} />
        )}

        {/* Conversations List */}
        {filteredConversations.length > 0 ? (
          <div role="list" aria-label={t("nav.chats")}>
            {filteredConversations.map((conv, i) => {
              const messages = conv.messages ?? [];

              const lastMsg =
                messages.length > 0
                  ? messages[messages.length - 1]
                  : null;
              const lastRenderable =
                [...messages]
                  .reverse()
                  .find(
                    (msg) =>
                      msg.type !== "system" || msg.systemType !== "date_change",
                  ) ?? lastMsg;

              // Determine media type
              let mediaType:
                | "photo"
                | "video"
                | "voice"
                | "document"
                | "gif"
                | "sticker"
                | null = null;
              if (lastRenderable?.type === "image" || lastRenderable?.imageUrl)
                mediaType = "photo";
              else if (
                lastRenderable?.type === "video" ||
                lastRenderable?.videoUrl
              )
                mediaType = "video";
              else if (lastRenderable?.type === "voice")
                mediaType = "voice";
              else if (
                lastRenderable?.type === "document" ||
                lastRenderable?.documentUrl
              )
                mediaType = "document";
              else if (lastRenderable?.type === "gif" || lastRenderable?.gifUrl)
                mediaType = "gif";
              else if (
                lastRenderable?.type === "sticker" ||
                lastRenderable?.stickerUrl
              )
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
                  const member = conv.members?.find(
                    (m) => m.id === lastRenderable.from,
                  );
                  senderName = member?.name || lastRenderable.from;
                }
              } else if (lastRenderable?.from === "me") {
                senderName = undefined; // Don't show "You:" for DMs
              }

              // Determine read status
              let status:
                | "sending"
                | "sent"
                | "delivered"
                | "read"
                | "failed"
                | undefined;
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
        safeAreaBottom={safeAreaBottom}
        unreadChatsCount={totalUnread}
      />
    </div>
  );
};

export default ChatListScreen;
