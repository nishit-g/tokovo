import React from "react";
import { WorldState } from "@tokovo/core";
import { Img } from "remotion";
import { spacing, typography } from "../theme.js";
import { TabNavigation } from "../TabNavigation.js";
import { PlusCircleIcon } from "../Icons.js";
import { resolveAvatarWithFallback } from "../../utils/avatar.js";
import { WhatsAppConversation, WhatsAppState } from "../../types/index.js";
import { useTheme } from "../../theme/ThemeContext.js";

export interface CommunitiesScreenProps {
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

export const CommunitiesScreen: React.FC<CommunitiesScreenProps> = ({
  world,
  safeAreaInsets,
  width: _width,
}) => {
  const theme = useTheme();
  const safeAreaTop = safeAreaInsets?.top ?? 47;
  const safeAreaBottom = safeAreaInsets?.bottom ?? 34;

  const appState = (world.appState?.["app_whatsapp"] || {}) as WhatsAppState;
  const conversations = Object.values(
    appState.conversations || {},
  ) as WhatsAppConversation[];
  const groupConversations = conversations.filter((conv) => conv.type === "group");

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.headerBackground,
        display: "flex",
        flexDirection: "column",
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div
        style={{
          paddingTop: safeAreaTop,
          paddingLeft: spacing.pagePaddingWide,
          paddingRight: spacing.pagePaddingX,
          height: spacing.navBarHeight + safeAreaTop,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `0.5px solid ${theme.colors.divider}`,
          backgroundColor: `${theme.colors.headerBackground}F2`,
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            ...typography.title,
            color: theme.colors.receivedBubbleText,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          Communities
        </div>
        <PlusCircleIcon color={theme.colors.accent} />
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          paddingBottom: spacing.tabBarHeight + safeAreaBottom,
        }}
      >
        <div
          style={{
            margin: `${spacing.sectionGap}px ${spacing.pagePaddingX}px`,
            padding: spacing.sectionGap,
            backgroundColor: theme.colors.background,
            borderRadius: 16,
            border: `1px solid ${theme.colors.divider}`,
            display: "flex",
            alignItems: "center",
            gap: spacing.contentMarginLeft,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: `${theme.colors.accent}14`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlusCircleIcon color={theme.colors.accent} />
          </div>
          <div>
            <div
              style={{
                ...typography.headline,
                color: theme.colors.receivedBubbleText,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              New community
            </div>
            <div
              style={{
                ...typography.body,
                color: theme.colors.timestamp,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              Create a space for multiple groups
            </div>
          </div>
        </div>

        <div
          style={{
            padding: `0 ${spacing.pagePaddingX}px 8px`,
            ...typography.caption,
            color: theme.colors.timestamp,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          Your communities
        </div>

        {groupConversations.map((conv) => {
          const subtitle =
            conv.description ||
            (conv.members && conv.members.length > 0
              ? `${conv.members
                  .map((m) => m.name)
                  .filter(Boolean)
                  .slice(0, 3)
                  .join(", ")}${conv.members.length > 3 ? "…" : ""}`
              : "Group chat");

          return (
            <div
              key={conv.id}
              style={{
                padding: `${spacing.sectionGap}px ${spacing.pagePaddingX}px`,
                backgroundColor: theme.colors.background,
                borderBottom: `0.5px solid ${theme.colors.divider}`,
                display: "flex",
                alignItems: "center",
                gap: spacing.contentMarginLeft,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: `${theme.colors.divider}66`,
                  flexShrink: 0,
                }}
              >
                <Img
                  src={resolveAvatarWithFallback(conv.avatar, conv.name || "Group")}
                  alt={conv.name || "Group"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    ...typography.headline,
                    color: theme.colors.receivedBubbleText,
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  {conv.name || "Community"}
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
            </div>
          );
        })}
      </div>

      <TabNavigation activeTab="communities" safeAreaBottom={safeAreaBottom} />
    </div>
  );
};

export default CommunitiesScreen;
