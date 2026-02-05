import React from "react";
import { WorldState } from "@tokovo/core";
import { Img } from "remotion";
import { whatsappColors, spacing, typography } from "../theme";
import { TabNavigation } from "../TabNavigation";
import { CameraFillIcon, PlusCircleIcon } from "../Icons";
import { resolveAvatarWithFallback } from "../../utils/avatar";
import { WhatsAppConversation, WhatsAppState } from "../../types";
import { normalizeMessages } from "../../utils/messages";

export interface StatusScreenProps {
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

const StatusAvatar: React.FC<{
  name: string;
  avatar?: string;
  hasStatus?: boolean;
}> = ({ name, avatar, hasStatus = true }) => (
  <div
    style={{
      width: 56,
      height: 56,
      borderRadius: "50%",
      border: hasStatus ? `2px solid ${whatsappColors.primary}` : "none",
      padding: hasStatus ? 2 : 0,
      boxSizing: "border-box",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        overflow: "hidden",
        backgroundColor: whatsappColors.avatarPlaceholder,
      }}
    >
      <Img
        src={resolveAvatarWithFallback(avatar, name)}
        alt={name}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  </div>
);

export const StatusScreen: React.FC<StatusScreenProps> = ({
  world,
  safeAreaInsets,
  width,
}) => {
  const designWidth = 393;
  const targetWidth = width || 1179;
  const scale = targetWidth / designWidth;

  const physicalSafeTop = safeAreaInsets?.top ?? 177;
  const physicalSafeBottom = safeAreaInsets?.bottom ?? 102;

  const safeAreaTop = physicalSafeTop / scale;
  const safeAreaBottom = physicalSafeBottom / scale;

  const deviceId = Object.keys(world.devices || {})[0];
  const ownerName = world.devices?.[deviceId]?.ownerName || "You";

  const appState = (world.appState?.["app_whatsapp"] || {}) as WhatsAppState;
  const conversations = Object.values(
    appState.conversations || {},
  ) as WhatsAppConversation[];

  const filteredStatuses = conversations.filter((conv) => conv.hasStatus);
  const statusConversations =
    filteredStatuses.length > 0 ? filteredStatuses : conversations.slice(0, 3);

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
          Status
        </div>
        <div style={{ display: "flex", gap: spacing.headerActionGap }}>
          <CameraFillIcon color={whatsappColors.primary} />
          <PlusCircleIcon color={whatsappColors.primary} />
        </div>
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
            padding: `${spacing.sectionGap}px ${spacing.pagePaddingX}px`,
            backgroundColor: whatsappColors.bgPrimary,
            display: "flex",
            alignItems: "center",
            gap: spacing.contentMarginLeft,
            borderBottom: `0.5px solid ${whatsappColors.separator}`,
          }}
        >
          <StatusAvatar name={ownerName} hasStatus={false} />
          <div>
            <div style={{ ...typography.headline, color: whatsappColors.textPrimary }}>
              My Status
            </div>
            <div style={{ ...typography.body, color: whatsappColors.textSecondary }}>
              Tap to add status update
            </div>
          </div>
        </div>

        <div
          style={{
            padding: `${spacing.sectionGap}px ${spacing.pagePaddingX}px 8px`,
            ...typography.caption,
            color: whatsappColors.textSecondary,
          }}
        >
          Recent updates
        </div>

        {statusConversations.map((conv) => {
          const normalizedMessages = normalizeMessages(
            world,
            conv.id,
            (conv.messages || []) as unknown[],
            deviceId,
          );
          const lastMessage = normalizedMessages[normalizedMessages.length - 1];
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
              <StatusAvatar
                name={conv.name || "Unknown"}
                avatar={conv.avatar}
              />
              <div style={{ flex: 1 }}>
                <div style={{ ...typography.headline, color: whatsappColors.textPrimary }}>
                  {conv.name || "Unknown"}
                </div>
                <div style={{ ...typography.body, color: whatsappColors.textSecondary }}>
                  {lastMessage?.timestamp || "Today"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <TabNavigation
        activeTab="status"
        safeAreaBottom={safeAreaBottom}
      />
    </div>
  );
};

export default StatusScreen;
