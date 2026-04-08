import React from "react";
import { WorldState } from "@tokovo/core";
import { Img } from "remotion";
import { spacing, typography } from "../theme.js";
import { TabNavigation } from "../TabNavigation.js";
import { CameraFillIcon, PlusCircleIcon, MutedIcon } from "../Icons.js";
import { resolveAvatarWithFallback } from "../../utils/avatar.js";
import { WhatsAppConversation, WhatsAppState } from "../../types/index.js";
import { normalizeMessages } from "../../utils/messages.js";
import { useTheme } from "../../theme/ThemeContext.js";

export interface UpdatesScreenProps {
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

export type StatusScreenProps = UpdatesScreenProps;

type ChannelCard = {
  id: string;
  name: string;
  avatar?: string;
  description: string;
  latestSnippet?: string;
  followersLabel: string;
  category?: string;
  isMuted?: boolean;
  verified?: boolean;
  isFollowed?: boolean;
  unreadCount?: number;
};

const StatusAvatar: React.FC<{
  name: string;
  avatar?: string;
  hasStatus?: boolean;
  size?: number;
}> = ({ name, avatar, hasStatus = true, size = 56 }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: hasStatus ? `2px solid ${theme.colors.accent}` : "none",
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
          backgroundColor: `${theme.colors.divider}66`,
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
};

const ChannelRow: React.FC<{ channel: ChannelCard }> = ({ channel }) => {
  const theme = useTheme();

  return (
    <div
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
          position: "relative",
          width: 56,
          height: 56,
          borderRadius: 18,
          overflow: "hidden",
          flexShrink: 0,
          backgroundColor: `${theme.colors.divider}66`,
        }}
      >
        <Img
          src={resolveAvatarWithFallback(channel.avatar, channel.name)}
          alt={channel.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {(channel.unreadCount ?? 0) > 0 ? (
          <div
            style={{
              position: "absolute",
              right: 4,
              top: 4,
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              borderRadius: 999,
              backgroundColor: theme.colors.unreadBadge,
              color: theme.colors.unreadBadgeText,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              border: `2px solid ${theme.colors.background}`,
              lineHeight: 1,
            }}
          >
            {channel.unreadCount}
          </div>
        ) : null}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 2,
          }}
        >
          <div
            style={{
              ...typography.headline,
              color: theme.colors.receivedBubbleText,
              fontFamily: theme.typography.fontFamily,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {channel.name}
          </div>
          {channel.verified ? (
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: theme.colors.accent,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              ✓
            </div>
          ) : null}
          {channel.isMuted ? <MutedIcon color={theme.colors.timestamp} size={14} /> : null}
        </div>
        <div
          style={{
            ...typography.body,
            color: theme.colors.receivedBubbleText,
            opacity: 0.82,
            fontFamily: theme.typography.fontFamily,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: 2,
          }}
        >
          {channel.description}
        </div>
        {channel.latestSnippet ? (
          <div
            style={{
              ...typography.caption,
              color: theme.colors.receivedBubbleText,
              opacity: 0.72,
              fontFamily: theme.typography.fontFamily,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: 3,
            }}
          >
            {channel.latestSnippet}
          </div>
        ) : null}
        <div
          style={{
            ...typography.caption,
            color: theme.colors.timestamp,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {channel.followersLabel}
          {channel.category ? ` • ${channel.category}` : ""}
        </div>
      </div>

      <div
        style={{
          padding: "8px 14px",
          borderRadius: 999,
          backgroundColor: channel.isFollowed
            ? `${theme.colors.divider}66`
            : `${theme.colors.accent}14`,
          color: channel.isFollowed ? theme.colors.receivedBubbleText : theme.colors.accent,
          ...typography.caption,
          fontFamily: theme.typography.fontFamily,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {channel.isFollowed ? "Following" : "Follow"}
      </div>
    </div>
  );
};

function getDefaultChannels(): ChannelCard[] {
  return [
    {
      id: "default-channel-1",
      name: "Daily Bakchodi",
      description: "Campus gossip, overreactions, and catastrophic confidence.",
      latestSnippet: "Tonight's agenda: make uncle think you own a startup.",
      followersLabel: "218K followers",
      category: "Comedy",
      verified: true,
      isFollowed: true,
      unreadCount: 3,
    },
    {
      id: "default-channel-2",
      name: "Delhi Food Radar",
      description: "Late-night finds, fake premium cafes, and elite chai intel.",
      latestSnippet: "New drop: cafes charging 320 for vibes and regret.",
      followersLabel: "81K followers",
      category: "Food",
      unreadCount: 1,
    },
    {
      id: "default-channel-3",
      name: "Cricket Mood Swings",
      description: "Three overs of form, three days of agenda.",
      latestSnippet: "Breaking: one innings has ended three careers on Twitter.",
      followersLabel: "430K followers",
      category: "Sports",
      verified: true,
      isFollowed: true,
    },
  ];
}

export const UpdatesScreen: React.FC<UpdatesScreenProps> = ({
  world,
  safeAreaInsets,
}) => {
  const theme = useTheme();
  const safeAreaTop = safeAreaInsets?.top ?? 47;
  const safeAreaBottom = safeAreaInsets?.bottom ?? 34;

  const deviceId = Object.keys(world.devices || {})[0];
  const ownerName = world.devices?.[deviceId]?.ownerName || "You";

  const appState = (world.appState?.["app_whatsapp"] || {}) as WhatsAppState;
  const conversations = Object.values(
    appState.conversations || {},
  ) as WhatsAppConversation[];

  const statusConversations = conversations
    .filter((conv) => conv.hasStatus)
    .sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));

  const channelConversations = conversations
    .filter((conv) => conv.isChannel || conv.isVerifiedBusiness)
    .map((conv): ChannelCard => ({
      id: conv.id,
      name: conv.name || "Channel",
      avatar: conv.avatar,
      description:
        conv.channelDescription ||
        conv.description ||
        conv.pinnedMessage?.text ||
        "Latest drops and updates.",
      latestSnippet:
        conv.channelLatestSnippet ||
        normalizeMessages(
          world,
          conv.id,
          (conv.messages || []) as unknown[],
          deviceId,
        ).slice(-1)[0]?.text,
      followersLabel: conv.channelFollowersLabel || "Growing fast",
      category: conv.channelCategory,
      isMuted: conv.isMuted,
      verified: conv.isVerifiedBusiness,
      isFollowed: conv.isFollowed ?? false,
      unreadCount: conv.channelUnreadCount ?? 0,
    }));

  const channels = channelConversations.length > 0
    ? channelConversations
    : getDefaultChannels();

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
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            ...typography.title,
            color: theme.colors.receivedBubbleText,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          Updates
        </div>
        <div style={{ display: "flex", gap: spacing.headerActionGap }}>
          <CameraFillIcon color={theme.colors.accent} />
          <PlusCircleIcon color={theme.colors.accent} />
        </div>
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
            padding: `${spacing.sectionGap}px ${spacing.pagePaddingX}px 10px`,
            ...typography.caption,
            color: theme.colors.timestamp,
            fontFamily: theme.typography.fontFamily,
            letterSpacing: 0.2,
          }}
        >
          Status
        </div>

        <div
          style={{
            padding: `0 ${spacing.pagePaddingX}px ${spacing.sectionGap}px`,
            display: "flex",
            gap: 14,
            overflowX: "auto",
          }}
        >
          <div
            style={{
              minWidth: 108,
              maxWidth: 108,
              padding: 12,
              borderRadius: 20,
              backgroundColor: theme.colors.headerBackground,
              border: `1px solid ${theme.colors.divider}`,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ position: "relative", width: "fit-content" }}>
              <StatusAvatar name={ownerName} hasStatus={false} size={62} />
              <div
                style={{
                  position: "absolute",
                  right: -2,
                  bottom: -2,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  backgroundColor: theme.colors.accent,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  border: `2px solid ${theme.colors.background}`,
                }}
              >
                +
              </div>
            </div>
            <div>
              <div
                style={{
                  ...typography.headline,
                  fontFamily: theme.typography.fontFamily,
                  color: theme.colors.receivedBubbleText,
                  marginBottom: 2,
                }}
              >
                My status
              </div>
              <div
                style={{
                  ...typography.caption,
                  fontFamily: theme.typography.fontFamily,
                  color: theme.colors.timestamp,
                }}
              >
                Add update
              </div>
            </div>
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
                  minWidth: 108,
                  maxWidth: 108,
                  padding: 12,
                  borderRadius: 20,
                  backgroundColor: theme.colors.headerBackground,
                  border: `1px solid ${theme.colors.divider}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <StatusAvatar name={conv.name || "Unknown"} avatar={conv.avatar} size={62} />
                <div>
                  <div
                    style={{
                      ...typography.headline,
                      fontFamily: theme.typography.fontFamily,
                      color: theme.colors.receivedBubbleText,
                      marginBottom: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {conv.name || "Unknown"}
                  </div>
                  <div
                    style={{
                      ...typography.caption,
                      fontFamily: theme.typography.fontFamily,
                      color: theme.colors.timestamp,
                    }}
                  >
                    {lastMessage?.timestamp || "Today"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            padding: `${spacing.sectionGap}px ${spacing.pagePaddingX}px 8px`,
            ...typography.caption,
            color: theme.colors.timestamp,
            fontFamily: theme.typography.fontFamily,
            letterSpacing: 0.2,
          }}
        >
          Channels
        </div>

        <div
          style={{
            margin: `0 ${spacing.pagePaddingX}px ${spacing.sectionGap}px`,
            padding: 16,
            borderRadius: 20,
            background:
              `linear-gradient(135deg, ${theme.colors.accent}14 0%, ${theme.colors.headerBackground} 100%)`,
            border: `1px solid ${theme.colors.divider}`,
          }}
        >
          <div
            style={{
              ...typography.headline,
              fontFamily: theme.typography.fontFamily,
              color: theme.colors.receivedBubbleText,
              marginBottom: 6,
            }}
          >
            Find channels worth stalking
          </div>
          <div
            style={{
              ...typography.body,
              fontFamily: theme.typography.fontFamily,
              color: theme.colors.timestamp,
            }}
          >
            Follow creators, brands, and local chaos without dumping it in your main chats.
          </div>
        </div>

        {channels.map((channel) => (
          <ChannelRow key={channel.id} channel={channel} />
        ))}
      </div>

      <TabNavigation activeTab="updates" safeAreaBottom={safeAreaBottom} />
    </div>
  );
};

export const StatusScreen = UpdatesScreen;

export default UpdatesScreen;
