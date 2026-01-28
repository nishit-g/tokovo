import React, { useState } from "react";
import { WorldState } from "@tokovo/core";
import { ArchiveIcon, ChevronRightIcon } from "../Icons";
import { ChatListHeader } from "../ChatListHeader";
import { TabNavigation } from "../TabNavigation";
import { ChatListItem } from "../ChatListItem";
import { whatsappColors, spacing, typography } from "../theme";
import { WhatsAppConversation, WhatsAppState } from "../../types";

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
  width,
  height,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Calculate safe areas with sensible defaults
  const designWidth = 393;
  const targetWidth = width || 1179;
  const scale = targetWidth / designWidth;

  const physicalSafeTop = safeAreaInsets?.top ?? 177;
  const physicalSafeBottom = safeAreaInsets?.bottom ?? 102;

  const safeAreaTop = physicalSafeTop / scale;
  const safeAreaBottom = physicalSafeBottom / scale;

  // Extract app state and conversations
  const appState = (world.appState?.["app_whatsapp"] || {}) as WhatsAppState;
  const allConversations = (
    Object.values(appState.conversations || {}) as WhatsAppConversation[]
  ).sort((a, b) => {
    // Sort: Pinned first, then by last message time
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    // Compare timestamps if available
    const aLastMsg = a.messages?.[a.messages.length - 1];
    const bLastMsg = b.messages?.[b.messages.length - 1];
    const aTime = aLastMsg?.timestamp || "";
    const bTime = bLastMsg?.timestamp || "";

    return bTime.localeCompare(aTime);
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
        backgroundColor: whatsappColors.bgPrimary,
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
          backgroundColor: whatsappColors.bgPrimary,
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
              // Get last message
              const rawMessages = conv.messages || [];
              const lastMsg =
                rawMessages && rawMessages.length > 0
                  ? rawMessages[rawMessages.length - 1]
                  : null;

              // Determine media type
              let mediaType:
                | "photo"
                | "video"
                | "voice"
                | "document"
                | "gif"
                | "sticker"
                | null = null;
              if (lastMsg?.imageUrl) mediaType = "photo";
              else if (lastMsg?.videoUrl) mediaType = "video";
              else if (lastMsg?.voiceUrl || lastMsg?.audioUrl)
                mediaType = "voice";
              else if (lastMsg?.fileUrl) mediaType = "document";

              // Determine sender name for groups
              let senderName: string | undefined;
              if (conv.type === "group" && lastMsg) {
                if (lastMsg.from === "me") {
                  senderName = "You";
                } else if (lastMsg.senderName) {
                  senderName = lastMsg.senderName;
                } else if (lastMsg.from) {
                  // Try to get name from members
                  const member = conv.members?.find(
                    (m) => m.id === lastMsg.from,
                  );
                  senderName = member?.name || lastMsg.from;
                }
              } else if (lastMsg?.from === "me") {
                senderName = undefined; // Don't show "You:" for DMs
              }

              // Determine read status
              let status: "sent" | "delivered" | "read" | undefined;
              if (lastMsg?.from === "me") {
                if (lastMsg.readAt) status = "read";
                else if (lastMsg.deliveredAt) status = "delivered";
                else status = "sent";
              }

              // Check if someone is typing
              const isTyping =
                conv.typing && Object.values(conv.typing).some(Boolean);

              return (
                <ChatListItem
                  key={conv.id}
                  id={conv.id}
                  name={conv.name || "Unknown"}
                  avatarUrl={conv.avatar}
                  lastMessage={
                    lastMsg?.text ||
                    (mediaType ? undefined : lastMsg ? "Media" : "")
                  }
                  timestamp={lastMsg?.timestamp || ""}
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
