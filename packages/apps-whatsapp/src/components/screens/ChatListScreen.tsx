import React, { useState } from "react";
import { WorldState } from "@tokovo/core";
import { ArchiveIcon, ChevronRightIcon } from "../Icons.js";
import { ChatListHeader } from "../ChatListHeader.js";
import { TabNavigation } from "../TabNavigation.js";
import { ChatListItem } from "../ChatListItem.js";
import { whatsappColors, spacing, typography } from "../theme.js";
import { WhatsAppConversation, WhatsAppState } from "../../types/index.js";
import { normalizeMessages } from "../../utils/messages.js";

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

type FilterType = "all" | "unread" | "favorites" | "groups";

// =============================================================================
// ARCHIVED ROW COMPONENT
// =============================================================================

const ArchivedRow: React.FC<{ count: number }> = ({ count }) => (
  <div
    style={{
      display: "flex",
      height: spacing.chatListItemHeight,
      alignItems: "center",
      paddingLeft: spacing.avatarMarginLeft,
      paddingRight: spacing.contentMarginRight,
      cursor: "pointer",
      backgroundColor: whatsappColors.bgPrimary,
      borderBottom: `0.5px solid ${whatsappColors.separator}`,
    }}
  >
    {/* Archive Icon */}
    <div
      style={{
        width: spacing.avatarSize,
        display: "flex",
        justifyContent: "center",
        marginRight: spacing.contentMarginLeft,
      }}
    >
      <ArchiveIcon color={whatsappColors.textSecondary} size={20} />
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
          color: whatsappColors.textPrimary,
        }}
      >
        Archived
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {count > 0 && (
          <span
            style={{
              ...typography.body,
              color: whatsappColors.textSecondary,
            }}
          >
            {count}
          </span>
        )}
        <ChevronRightIcon color={whatsappColors.textSecondary} size={14} />
      </div>
    </div>
  </div>
);

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

const EmptyState: React.FC<{ filter: FilterType }> = ({ filter }) => {
  const getMessage = () => {
    switch (filter) {
      case "unread":
        return {
          emoji: "✅",
          title: "No unread chats",
          subtitle: "You're all caught up!",
        };
      case "favorites":
        return {
          emoji: "⭐",
          title: "No favorite chats",
          subtitle: "Pin your important chats to see them here",
        };
      case "groups":
        return {
          emoji: "👥",
          title: "No groups",
          subtitle: "Create or join a group to get started",
        };
      default:
        return {
          emoji: "💬",
          title: "No chats yet",
          subtitle: "Start a conversation!",
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
          color: whatsappColors.textPrimary,
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          ...typography.body,
          color: whatsappColors.textSecondary,
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
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const deviceId = Object.keys(world.devices || {})[0];

  // TokovoRenderer already provides safeAreaInsets in design coordinates.
  const safeAreaTop = safeAreaInsets?.top ?? 47;
  const safeAreaBottom = safeAreaInsets?.bottom ?? 34;

  // Extract app state and conversations
  const appState = (world.appState?.["app_whatsapp"] || {}) as WhatsAppState;
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
    return aName.localeCompare(bName);
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
        backgroundColor: whatsappColors.bgList,
        position: "relative",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header (Sticky) */}
      <ChatListHeader
        safeAreaTop={safeAreaTop}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showEditButton={false}
      />

      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          overflowX: "hidden",
          backgroundColor: whatsappColors.bgList,
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
          <div>
            {filteredConversations.map((conv, i) => {
              const normalizedMessages = normalizeMessages(
                world,
                conv.id,
                (conv.messages || []) as unknown[],
                deviceId,
              );

              const lastMsg =
                normalizedMessages.length > 0
                  ? normalizedMessages[normalizedMessages.length - 1]
                  : null;
              const lastRenderable =
                [...normalizedMessages]
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
              else if (lastRenderable?.type === "video" || lastRenderable?.videoUrl)
                mediaType = "video";
              else if (
                lastRenderable?.type === "voice" ||
                lastRenderable?.voiceUrl ||
                lastRenderable?.audioUrl
              )
                mediaType = "voice";
              else if (lastRenderable?.type === "document" || lastRenderable?.documentUrl)
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
                  senderName = "You";
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

              const groupSubtitle =
                conv.type === "group"
                  ? conv.description ||
                    (conv.members && conv.members.length > 0
                      ? `${conv.members
                          .map((m) => m.name)
                          .filter(Boolean)
                          .slice(0, 3)
                          .join(", ")}${conv.members.length > 3 ? "…" : ""}`
                      : undefined)
                  : undefined;

              // Determine read status
              let status: "sent" | "delivered" | "read" | undefined;
              if (lastRenderable?.from === "me") {
                if (lastRenderable.status === "read") status = "read";
                else if (lastRenderable.status === "delivered") status = "delivered";
                else if (lastRenderable.status === "sent") status = "sent";
                else if (lastRenderable.status === "sending") status = "sent";
                else if (lastRenderable.readAt) status = "read";
                else if (lastRenderable.deliveredAt) status = "delivered";
                else status = "sent";
              }

              // Check if someone is typing
              const isTyping =
                conv.typing &&
                Object.entries(conv.typing).some(
                  ([id, typing]) => typing && id !== "me",
                );

              const lastMessagePreview = (() => {
                if (!lastRenderable) return "No messages yet";
                if (lastRenderable.text) return lastRenderable.text;
                switch (lastRenderable.type) {
                  case "contact":
                    return "Contact card";
                  case "location":
                    return "Location";
                  case "system":
                    return lastRenderable.text ?? "System update";
                  case "call":
                    return lastRenderable.callType === "video"
                      ? "Video call"
                      : "Voice call";
                  case "call_missed":
                    return lastRenderable.callType === "video"
                      ? "Missed video call"
                      : "Missed voice call";
                  case "screenshot_alert":
                    return "Screenshot alert";
                  case "document":
                    return lastRenderable.fileName
                      ? `Document • ${lastRenderable.fileName}`
                      : "Document";
                  case "voice":
                    return "Voice message";
                  case "gif":
                    return "GIF";
                  case "sticker":
                    return "Sticker";
                  case "image":
                    return "Photo";
                  case "video":
                    return "Video";
                  default:
                    return "Media";
                }
              })();

              return (
                <ChatListItem
                  key={conv.id}
                  id={conv.id}
                  name={conv.name || "Unknown"}
                  avatarUrl={conv.avatar}
                  groupAvatars={
                    conv.type === "group"
                      ? conv.members
                          ?.map((m) => m.avatar)
                          .filter((avatar): avatar is string => Boolean(avatar))
                      : undefined
                  }
                  lastMessage={lastMessagePreview}
                  timestamp={lastRenderable?.timestamp || lastMsg?.timestamp || ""}
                  unreadCount={conv.unreadCount || 0}
                  status={status}
                  isGroup={conv.type === "group"}
                  isTyping={isTyping}
                  isLast={i === filteredConversations.length - 1}
                  isMuted={conv.isMuted}
                  isPinned={conv.isPinned}
                  hasStatus={conv.hasStatus}
                  mediaType={mediaType}
                  senderName={senderName}
                  subtitle={groupSubtitle}
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
