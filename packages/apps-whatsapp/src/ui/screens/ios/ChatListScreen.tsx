import React from "react";
import { WorldState } from "@tokovo/core";
import { ArchiveIcon, ChevronRightIcon } from "../../../components/ios/Icons";
import { ChatListHeader } from "../../../components/ios/ChatListHeader";
import { TabNavigation } from "../../../components/ios/TabNavigation";
import { ChatListItem } from "../../../components/ios/ChatListItem";
import { whatsappColors, spacing } from "../../../components/ios/theme";
import { WhatsAppConversation, WhatsAppState } from "../../../types";

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

// =============================================================================
// ARCHIVED ROW COMPONENT
// =============================================================================

const ArchivedRow: React.FC<{ count: number }> = ({ count }) => (
  <div
    style={{
      display: "flex",
      height: 50,
      alignItems: "center",
      paddingLeft: spacing.avatarMarginLeft,
      paddingRight: spacing.contentMarginRight,
      cursor: "pointer",
      backgroundColor: whatsappColors.bgPrimary,
    }}
  >
    {/* Archive Icon */}
    <div
      style={{
        width: 28,
        display: "flex",
        justifyContent: "center",
        marginRight: spacing.contentMarginLeft + 4,
      }}
    >
      <ArchiveIcon color={whatsappColors.textSecondary} size={20} />
    </div>

    {/* Content */}
    <div
      style={{
        flex: 1,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `0.5px solid ${whatsappColors.separator}`,
      }}
    >
      <span
        style={{
          fontSize: 17,
          fontWeight: "400",
          color: whatsappColors.textPrimary,
        }}
      >
        Archived
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {count > 0 && (
          <span
            style={{
              fontSize: 15,
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
// MAIN COMPONENT
// =============================================================================

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  world,
  safeAreaInsets,
  width,
  height,
}) => {
  // Calculate safe areas with sensible defaults
  const designWidth = 393;
  const targetWidth = width || 1179;
  const scale = targetWidth / designWidth;

  const physicalSafeTop = safeAreaInsets?.top ?? 177;
  const physicalSafeBottom = safeAreaInsets?.bottom ?? 102;

  const safeAreaTop = physicalSafeTop / scale;
  const safeAreaBottom = physicalSafeBottom / scale;

  const appState = (world.appState?.["app_whatsapp"] || {}) as WhatsAppState;
  const conversations = (
    Object.values(appState.conversations || {}) as WhatsAppConversation[]
  ).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  // Calculate total unread for tab badge
  const totalUnread = conversations.reduce(
    (sum, conv) => sum + (conv.unreadCount || 0),
    0,
  );

  // Count archived (mock - would need archived flag in data)
  const archivedCount = 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: whatsappColors.bgPrimary,
        position: "relative",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      }}
    >
      {/* Header (Sticky) */}
      <ChatListHeader safeAreaTop={safeAreaTop} />

      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          paddingBottom: spacing.tabBarHeight + safeAreaBottom + 10,
          backgroundColor: whatsappColors.bgPrimary,
        }}
      >
        {/* Archived Row (only show if there are archived chats) */}
        {archivedCount > 0 && <ArchivedRow count={archivedCount} />}

        {/* Conversations List */}
        <div>
          {conversations.length > 0 ? (
            conversations.map((conv, i) => {
              // Get last message
              const rawMessages = conv.messages as any[];
              const lastMsg =
                rawMessages && rawMessages.length > 0
                  ? rawMessages[rawMessages.length - 1]
                  : null;

              // Determine media type
              let mediaType: "photo" | "video" | "voice" | "document" | null =
                null;
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
                    (m: any) => m.id === lastMsg.from,
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
                  isLast={i === conversations.length - 1}
                  isMuted={conv.isMuted}
                  isPinned={conv.isPinned}
                  hasStatus={conv.hasStatus}
                  mediaType={mediaType}
                  senderName={senderName}
                />
              );
            })
          ) : (
            // Empty State
            <div
              style={{
                padding: 60,
                textAlign: "center",
                color: whatsappColors.textSecondary,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <div style={{ fontSize: 17, fontWeight: "500" }}>
                No chats yet
              </div>
              <div style={{ fontSize: 14, marginTop: 8 }}>
                Start a conversation!
              </div>
            </div>
          )}
        </div>
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
