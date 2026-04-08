import React from "react";
import { WorldState } from "@tokovo/core";
import { Img } from "remotion";
import { spacing, typography } from "../theme.js";
import { PhoneCallIcon, VideoCallIcon } from "../Icons.js";
import { resolveAvatarWithFallback } from "../../utils/avatar.js";
import { WhatsAppConversation, WhatsAppState } from "../../types/index.js";
import { GroupInfoScreen } from "./GroupInfoScreen.js";
import { normalizeMessages } from "../../utils/messages.js";
import { useTheme } from "../../theme/ThemeContext.js";

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
  const theme = useTheme();
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

  if (!conversation) return null;

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
            backgroundColor: theme.colors.background,
            borderBottom: `0.5px solid ${theme.colors.divider}`,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: `${theme.colors.divider}66`,
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
            <div
              style={{
                ...typography.headline,
                fontSize: 20,
                color: theme.colors.receivedBubbleText,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {conversation.name || "Contact"}
            </div>
            <div
              style={{
                ...typography.body,
                color: theme.colors.timestamp,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              online
            </div>
          </div>
        </div>

        <div
          style={{
            padding: `${spacing.sectionGap}px ${spacing.pagePaddingX}px`,
            display: "flex",
            gap: spacing.contentMarginLeft,
            backgroundColor: theme.colors.background,
            borderBottom: `0.5px solid ${theme.colors.divider}`,
          }}
        >
          {[
            { label: "Call", Icon: PhoneCallIcon },
            { label: "Video", Icon: VideoCallIcon },
          ].map(({ label, Icon }) => (
            <div
              key={label}
              style={{
                flex: 1,
                backgroundColor: `${theme.colors.accent}10`,
                borderRadius: 14,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                justifyContent: "center",
                border: `1px solid ${theme.colors.divider}`,
              }}
            >
              <Icon color={theme.colors.accent} />
              <span
                style={{
                  ...typography.body,
                  color: theme.colors.receivedBubbleText,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: `${spacing.sectionGap}px ${spacing.pagePaddingX}px`,
            backgroundColor: theme.colors.background,
            borderBottom: `0.5px solid ${theme.colors.divider}`,
          }}
        >
          <div
            style={{
              ...typography.caption,
              color: theme.colors.timestamp,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            Media, links, and docs
          </div>
          <div
            style={{
              ...typography.headline,
              color: theme.colors.receivedBubbleText,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {mediaCount} items
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
