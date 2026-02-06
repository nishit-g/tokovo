import React from "react";
import { WorldState } from "@tokovo/core";
import { Img } from "remotion";
import { whatsappColors, spacing, typography } from "../theme.js";
import { TabNavigation } from "../TabNavigation.js";
import { PlusCircleIcon } from "../Icons.js";
import { resolveAvatarWithFallback } from "../../utils/avatar.js";
import { WhatsAppConversation, WhatsAppState } from "../../types/index.js";

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
  // TokovoRenderer already provides safeAreaInsets in design coordinates.
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
        backgroundColor: whatsappColors.bgList,
        display: "flex",
        flexDirection: "column",
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
          borderBottom: `0.5px solid ${whatsappColors.separatorLight}`,
          backgroundColor: whatsappColors.surfaceGlass,
        }}
      >
        <div style={{ ...typography.title, color: whatsappColors.textPrimary }}>
          Communities
        </div>
        <PlusCircleIcon color={whatsappColors.primary} />
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
            backgroundColor: whatsappColors.bgPrimary,
            borderRadius: 16,
            border: `1px solid ${whatsappColors.separatorLight}`,
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
              backgroundColor: whatsappColors.bgSecondary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlusCircleIcon color={whatsappColors.primary} />
          </div>
          <div>
            <div style={{ ...typography.headline, color: whatsappColors.textPrimary }}>
              New community
            </div>
            <div style={{ ...typography.body, color: whatsappColors.textSecondary }}>
              Create a space for multiple groups
            </div>
          </div>
        </div>

        <div
          style={{
            padding: `0 ${spacing.pagePaddingX}px 8px`,
            ...typography.caption,
            color: whatsappColors.textSecondary,
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
                backgroundColor: whatsappColors.bgPrimary,
                borderBottom: `0.5px solid ${whatsappColors.separator}`,
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
                  backgroundColor: whatsappColors.avatarPlaceholder,
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
                <div style={{ ...typography.headline, color: whatsappColors.textPrimary }}>
                  {conv.name || "Community"}
                </div>
                <div style={{ ...typography.body, color: whatsappColors.textSecondary }}>
                  {subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <TabNavigation
        activeTab="communities"
        safeAreaBottom={safeAreaBottom}
      />
    </div>
  );
};

export default CommunitiesScreen;
