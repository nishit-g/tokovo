import React from "react";
import { WorldState } from "@tokovo/core";
import { Img } from "remotion";
import { whatsappColors, spacing, typography } from "../theme";
import { PhoneCallIcon, VideoCallIcon } from "../Icons";
import { resolveAvatarWithFallback } from "../../utils/avatar";
import { WhatsAppConversation, WhatsAppState } from "../../types";
import { GroupInfoScreen } from "./GroupInfoScreen";
import { normalizeMessages } from "../../utils/messages";

export interface ProfileScreenProps {
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

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  world,
  safeAreaInsets,
  width: _width,
  height: _height,
}) => {
  // TokovoRenderer already provides safeAreaInsets in design coordinates.
  const safeAreaTop = safeAreaInsets?.top ?? 47;

  const appState = (world.appState?.["app_whatsapp"] || {}) as WhatsAppState;
  const conversations = (appState.conversations || {}) as Record<
    string,
    WhatsAppConversation
  >;
  const conversationId =
    appState.currentConversationId ||
    appState.conversationId ||
    Object.keys(conversations)[0];
  const conversation = conversationId ? conversations[conversationId] : undefined;

  if (!conversation) {
    return null;
  }

  if (conversation.type === "group") {
    return (
      <GroupInfoScreen
        world={world}
        conversationId={conversation.id}
        safeAreaInsets={safeAreaInsets}
        width={_width}
        height={_height}
      />
    );
  }

  const deviceId = Object.keys(world.devices || {})[0];
  const normalizedMessages = normalizeMessages(
    world,
    conversation.id,
    (conversation.messages || []) as unknown[],
    deviceId,
  );
  const mediaCount = normalizedMessages.filter((msg) =>
    ["image", "video", "gif"].includes(msg.type),
  ).length;

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
          alignItems: "center",
          borderBottom: `0.5px solid ${whatsappColors.separatorLight}`,
          backgroundColor: whatsappColors.surfaceGlass,
        }}
      >
        <div style={{ ...typography.title, color: whatsappColors.textPrimary }}>
          Contact Info
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div
          style={{
            padding: `${spacing.sectionGap}px ${spacing.pagePaddingX}px`,
            display: "flex",
            alignItems: "center",
            gap: spacing.contentMarginLeft,
            backgroundColor: whatsappColors.bgPrimary,
            borderBottom: `0.5px solid ${whatsappColors.separator}`,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: whatsappColors.avatarPlaceholder,
            }}
          >
            <Img
              src={resolveAvatarWithFallback(
                conversation.avatar,
                conversation.name || "Contact",
              )}
              alt={conversation.name || "Contact"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div>
            <div style={{ ...typography.headline, fontSize: 20 }}>
              {conversation.name || "Contact"}
            </div>
            <div style={{ ...typography.body, color: whatsappColors.textSecondary }}>
              online
            </div>
          </div>
        </div>

        <div
          style={{
            padding: `${spacing.sectionGap}px ${spacing.pagePaddingX}px`,
            display: "flex",
            gap: spacing.contentMarginLeft,
            backgroundColor: whatsappColors.bgPrimary,
            borderBottom: `0.5px solid ${whatsappColors.separator}`,
          }}
        >
          <div
            style={{
              flex: 1,
              backgroundColor: whatsappColors.bgSecondary,
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <PhoneCallIcon color={whatsappColors.primary} />
            <span style={{ ...typography.body, color: whatsappColors.textPrimary }}>
              Call
            </span>
          </div>
          <div
            style={{
              flex: 1,
              backgroundColor: whatsappColors.bgSecondary,
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <VideoCallIcon color={whatsappColors.primary} />
            <span style={{ ...typography.body, color: whatsappColors.textPrimary }}>
              Video
            </span>
          </div>
        </div>

        <div
          style={{
            padding: `${spacing.sectionGap}px ${spacing.pagePaddingX}px`,
            backgroundColor: whatsappColors.bgPrimary,
            borderBottom: `0.5px solid ${whatsappColors.separator}`,
          }}
        >
          <div style={{ ...typography.caption, color: whatsappColors.textSecondary }}>
            Media, links, and docs
          </div>
          <div style={{ ...typography.headline, color: whatsappColors.textPrimary }}>
            {mediaCount} items
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
