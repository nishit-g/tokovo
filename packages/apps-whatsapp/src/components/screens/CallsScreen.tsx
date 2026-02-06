import React from "react";
import { WorldState } from "@tokovo/core";
import { Img } from "remotion";
import { whatsappColors, spacing, typography } from "../theme.js";
import { TabNavigation } from "../TabNavigation.js";
import { PhoneCallIcon, VideoCallIcon } from "../Icons.js";
import { resolveAvatarWithFallback } from "../../utils/avatar.js";
import { WhatsAppConversation, WhatsAppState } from "../../types/index.js";
import { normalizeMessages } from "../../utils/messages.js";

export interface CallsScreenProps {
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

export const CallsScreen: React.FC<CallsScreenProps> = ({
  world,
  safeAreaInsets,
  width: _width,
}) => {
  // TokovoRenderer already provides safeAreaInsets in design coordinates.
  const safeAreaTop = safeAreaInsets?.top ?? 47;
  const safeAreaBottom = safeAreaInsets?.bottom ?? 34;

  const deviceId = Object.keys(world.devices || {})[0];

  const appState = (world.appState?.["app_whatsapp"] || {}) as WhatsAppState;
  const conversations = Object.values(
    appState.conversations || {},
  ) as WhatsAppConversation[];

  const callEntries = conversations.map((conv) => {
    const normalizedMessages = normalizeMessages(
      world,
      conv.id,
      (conv.messages || []) as unknown[],
      deviceId,
    );
    const lastMessage = normalizedMessages[normalizedMessages.length - 1];
    const lastCall = [...normalizedMessages]
      .reverse()
      .find((msg) => msg.type === "call" || msg.type === "call_missed");
    const isMissed =
      lastCall?.type === "call_missed" ||
      ((conv.unreadCount || 0) > 0 && lastMessage?.from !== "me");
    const isVideo =
      lastCall?.callType === "video" || conv.type === "group";
    const directionLabel =
      lastCall?.type === "call_missed"
        ? "Missed"
        : lastCall?.from === "me"
          ? "Outgoing"
          : "Incoming";
    return {
      id: conv.id,
      name: conv.name || "Unknown",
      avatar: conv.avatar,
      time: (lastCall ?? lastMessage)?.timestamp || "Today",
      missed: isMissed,
      video: isVideo,
      direction: directionLabel,
    };
  });

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
          Calls
        </div>
        <VideoCallIcon color={whatsappColors.primary} />
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          paddingBottom: spacing.tabBarHeight + safeAreaBottom,
        }}
      >
        {callEntries.map((entry) => (
          <div
            key={entry.id}
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
                width: 52,
                height: 52,
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: whatsappColors.avatarPlaceholder,
                flexShrink: 0,
              }}
            >
              <Img
                src={resolveAvatarWithFallback(entry.avatar, entry.name)}
                alt={entry.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  ...typography.headline,
                  color: entry.missed ? whatsappColors.iosRed : whatsappColors.textPrimary,
                }}
              >
                {entry.name}
              </div>
              <div style={{ ...typography.body, color: whatsappColors.textSecondary }}>
                {(entry.missed ? "Missed" : entry.direction) ?? "Outgoing"} · {entry.time}
              </div>
            </div>

            <div>
              {entry.video ? (
                <VideoCallIcon color={whatsappColors.primary} />
              ) : (
                <PhoneCallIcon color={whatsappColors.primary} />
              )}
            </div>
          </div>
        ))}
      </div>

      <TabNavigation
        activeTab="calls"
        safeAreaBottom={safeAreaBottom}
      />
    </div>
  );
};

export default CallsScreen;
