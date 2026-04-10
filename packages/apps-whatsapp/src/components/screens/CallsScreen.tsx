import React from "react";
import { WorldState } from "@tokovo/core";
import { Img } from "remotion";
import { spacing, typography } from "../theme.js";
import { TabNavigation } from "../TabNavigation.js";
import { PhoneCallIcon, VideoCallIcon } from "../Icons.js";
import { resolveAvatarWithFallback } from "../../utils/avatar.js";
import { WhatsAppConversation, WhatsAppState } from "../../types/index.js";
import { normalizeMessages } from "../../utils/messages.js";
import { useTheme } from "../../theme/ThemeContext.js";

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
  const theme = useTheme();
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
    const isVideo = lastCall?.callType === "video" || conv.type === "group";
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
  const favoriteEntries = callEntries.filter((entry) => !entry.missed).slice(0, 3);

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
          Calls
        </div>
        <VideoCallIcon color={theme.colors.accent} />
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          paddingBottom: spacing.tabBarHeight + safeAreaBottom,
          backgroundColor: theme.colors.background,
        }}
      >
        <div
          style={{
            margin: `${spacing.sectionGap}px ${spacing.pagePaddingX}px 10px`,
            padding: 16,
            borderRadius: 18,
            backgroundColor: theme.colors.background,
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
              borderRadius: 16,
              backgroundColor: `${theme.colors.accent}16`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PhoneCallIcon color={theme.colors.accent} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                ...typography.headline,
                color: theme.colors.receivedBubbleText,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              Create call link
            </div>
            <div
              style={{
                ...typography.body,
                color: theme.colors.timestamp,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              Share a link for your next WhatsApp call
            </div>
          </div>
        </div>

        {favoriteEntries.length > 0 ? (
          <>
            <div
              style={{
                padding: `0 ${spacing.pagePaddingX}px 8px`,
                ...typography.caption,
                color: theme.colors.timestamp,
                fontFamily: theme.typography.fontFamily,
                letterSpacing: 0.2,
              }}
            >
              Favorites
            </div>
            <div
              style={{
                padding: `0 ${spacing.pagePaddingX}px ${spacing.sectionGap}px`,
                display: "flex",
                gap: 14,
                overflowX: "auto",
              }}
            >
              {favoriteEntries.map((entry) => (
                <div
                  key={`fav-${entry.id}`}
                  style={{
                    minWidth: 96,
                    maxWidth: 96,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      overflow: "hidden",
                      backgroundColor: `${theme.colors.divider}66`,
                    }}
                  >
                    <Img
                      src={resolveAvatarWithFallback(entry.avatar, entry.name)}
                      alt={entry.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div
                    style={{
                      ...typography.caption,
                      color: theme.colors.receivedBubbleText,
                      textAlign: "center",
                      fontFamily: theme.typography.fontFamily,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                    }}
                  >
                    {entry.name}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        <div
          style={{
            padding: `0 ${spacing.pagePaddingX}px 8px`,
            ...typography.caption,
            color: theme.colors.timestamp,
            fontFamily: theme.typography.fontFamily,
            letterSpacing: 0.2,
          }}
        >
          Recent
        </div>

        {callEntries.map((entry) => (
          <div
            key={entry.id}
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
                width: 52,
                height: 52,
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: `${theme.colors.divider}66`,
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
                  color: entry.missed
                    ? "#FF3B30"
                    : theme.colors.receivedBubbleText,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                {entry.name}
              </div>
              <div
                style={{
                  ...typography.body,
                  color: theme.colors.timestamp,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                {(entry.missed ? "Missed" : entry.direction) ?? "Outgoing"} · {entry.time}
              </div>
            </div>

            <div>{entry.video ? <VideoCallIcon color={theme.colors.accent} /> : <PhoneCallIcon color={theme.colors.accent} />}</div>
          </div>
        ))}
      </div>

      <TabNavigation activeTab="calls" safeAreaBottom={safeAreaBottom} />
    </div>
  );
};

export default CallsScreen;
