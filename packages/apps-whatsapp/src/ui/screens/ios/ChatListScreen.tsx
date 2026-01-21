import React from "react";
import { WorldState } from "@tokovo/core";
import { ArchiveIcon } from "../../../components/ios/Icons";
import { ChatListHeader } from "../../../components/ios/ChatListHeader";
import { TabNavigation } from "../../../components/ios/TabNavigation";
import { ChatListItem } from "../../../components/ios/ChatListItem";
import { UI_CONSTANTS } from "../../../config/layout-config";
import { WhatsAppConversation } from "../../../types";

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

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  world,
  safeAreaInsets,
  width,
  height,
}) => {
  // 1. Calculate Safe Areas (Resolution Independence)
  // Receive logical dimensions from parent
  const designWidth = 393;
  const targetWidth = width || 1179;
  const scale = targetWidth / designWidth;

  const physicalSafeTop = safeAreaInsets?.top ?? 177;
  const physicalSafeBottom = safeAreaInsets?.bottom ?? 102;

  const safeAreaTop = physicalSafeTop / scale;
  const safeAreaBottom = physicalSafeBottom / scale;

  // 2. Data Preparation - Cast to WhatsApp conversation type
  const conversations = (
    Object.values(world.conversations || {}) as WhatsAppConversation[]
  ).sort((a, b) => {
    // Sort by last message timestamp (descending) mechanism to be added
    // Ideally we check a.lastMessageAt vs b.lastMessageAt or timestamps
    return 0;
    // TODO: Add proper sorting when timestamp logic is solidified in core/episodes
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#FFFFFF",
        position: "relative",
      }}
    >
      {/* Header (Sticky) */}
      <ChatListHeader safeAreaTop={safeAreaTop} />

      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          paddingBottom: 85 + safeAreaBottom,
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* Archived Row */}
        <div
          style={{
            display: "flex",
            height: 56, // Slightly shorter than chat row
            alignItems: "center",
            paddingLeft: 20,
            paddingRight: 16,
            cursor: "pointer",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 30, // Smaller visual weight
              display: "flex",
              justifyContent: "center",
              marginRight: 24, // Align with text start of chat items (which is 76 + ? actually chat item avatar is 60, left margin 20? No.
              // Chat Item: Left padding 0 (in container), Avatar 76 width centered.
              // So center of avatar is at 38px.
              // Archived text should probably align with Name?
              // Let's standard iOS: "Archived" appears on left?
              // Actually standard WhatsApp: "Archived" is a specific row.
              // Let's simpler: Icon + Text.
            }}
          >
            {/* No Icon for standard row, just text "Archived" and number on right? 
                           WhatsApp iOS 2024: Top row is "Archived" with an Archive Box icon on the very left (margin) or right?
                           Actually it's "Archived" text on left, number on right.
                           LET'S DO: Archive Icon (Grey) + "Archived" Text.
                        */}
            <ArchiveIcon color="#8E8E93" />
          </div>

          <div
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "0.5px solid #C6C6C8",
              fontSize: 17,
              fontWeight: "600",
              color: "#000",
              marginLeft: 12,
            }}
          >
            <span>Archived</span>
            <span
              style={{ color: "#8E8E93", fontWeight: "400", marginRight: 8 }}
            >
              1
            </span>
          </div>
        </div>

        {/* Conversations List */}
        <div style={{ paddingLeft: 16 }}>
          {" "}
          {/* Left padding for inset separators */}
          {conversations.length > 0 ? (
            conversations.map((conv, i) => {
              // Runtime cast to access standard or plugin-specific fields
              const rawMessages = conv.messages as any[];
              const lastMsg =
                rawMessages && rawMessages.length > 0
                  ? rawMessages[rawMessages.length - 1]
                  : null;

              return (
                <ChatListItem
                  key={conv.id}
                  id={conv.id}
                  name={conv.name || "Unknown"}
                  avatarUrl={conv.avatar}
                  lastMessage={
                    lastMsg?.text ||
                    (lastMsg?.imageUrl ? "Photo" : lastMsg ? "Media" : "")
                  }
                  timestamp={lastMsg?.timestamp || "Yesterday"}
                  unreadCount={conv.unreadCount || 0}
                  status={lastMsg?.from === "me" ? "read" : undefined} // Mock status logic
                  isTyping={
                    conv.typing && Object.values(conv.typing).some(Boolean)
                  }
                  // Is last item?
                  isLast={i === conversations.length - 1}
                />
              );
            })
          ) : (
            // Empty State
            <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation (Fixed Bottom) */}
      <TabNavigation activeTab="chats" safeAreaBottom={safeAreaBottom} />
    </div>
  );
};
