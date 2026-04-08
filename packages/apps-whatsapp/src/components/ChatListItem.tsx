import React, { memo } from "react";
import { Img, useCurrentFrame, interpolate } from "remotion";
import {
  DoubleCheckIcon,
  MutedIcon,
  PinIcon,
  LockIcon,
  SingleCheckIcon,
} from "./Icons.js";
import { spacing, typography } from "./theme.js";
import { resolveAvatarWithFallback } from "../utils/avatar.js";
import { useTheme } from "../theme/ThemeContext.js";

// =============================================================================
// TYPES
// =============================================================================

export interface ChatListItemProps {
  id: string;
  name: string;
  avatarUrl?: string;
  groupAvatars?: string[];
  lastMessage?: string;
  subtitle?: string;
  timestamp?: string;
  unreadCount?: number;
  status?: "sent" | "delivered" | "read";
  isGroup?: boolean;
  isTyping?: boolean;
  isLast?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
  hasStatus?: boolean;
  mediaType?:
  | "photo"
  | "video"
  | "voice"
  | "sticker"
  | "document"
  | "gif"
  | null;
  senderName?: string;
  typingText?: string;
  isLocked?: boolean;
  isVerifiedBusiness?: boolean;
  isChannel?: boolean;
  isFollowed?: boolean;
  channelUnreadCount?: number;
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

const TypingDots: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const cycleLength = 42;

  const dots = [0, 6, 12].map((delay, i) => {
    const adjustedFrame = (frame + delay) % cycleLength;
    const translateY = interpolate(
      adjustedFrame,
      [0, 12, 24, 42],
      [0, -4, 0, 0],
      { extrapolateRight: "clamp" },
    );
    const opacity = interpolate(
      adjustedFrame,
      [0, 12, 24, 42],
      [0.4, 1, 0.4, 0.4],
      { extrapolateRight: "clamp" },
    );

    return (
      <span
        key={i}
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          backgroundColor: color,
          display: "inline-block",
          transform: `translateY(${translateY}px)`,
          opacity,
        }}
      />
    );
  });

  return (
    <span
      style={{
        color,
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      {dots}
    </span>
  );
};

const StatusRing: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => {
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;

  return (
    <svg
      width={size}
      height={size}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: "rotate(-90deg)",
      }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circ * 0.15} ${circ * 0.05}`}
        strokeLinecap="round"
      />
    </svg>
  );
};

const getMediaPrefix = (mediaType: ChatListItemProps["mediaType"]): string => {
  switch (mediaType) {
    case "photo":
      return "📷 Photo";
    case "video":
      return "🎥 Video";
    case "voice":
      return "🎤 Voice message";
    case "sticker":
      return "🎭 Sticker";
    case "document":
      return "📄 Document";
    case "gif":
      return "GIF";
    default:
      return "";
  }
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ChatListItem = memo(function ChatListItem({
  name,
  avatarUrl,
  groupAvatars,
  lastMessage,
  subtitle,
  timestamp,
  unreadCount = 0,
  status,
  isTyping,
  isLast,
  isMuted,
  isPinned,
  hasStatus,
  mediaType,
  senderName,
  typingText,
  isLocked,
  isVerifiedBusiness,
  isChannel,
  isFollowed,
  channelUnreadCount = 0,
}: ChatListItemProps) {
  const theme = useTheme();
  const hasUnread = unreadCount > 0;
  const primaryText = theme.colors.receivedBubbleText;
  const secondaryText = theme.colors.timestamp;
  const tertiaryText = `${theme.colors.timestamp}B3`;
  const accent = theme.colors.accent;
  const background = theme.colors.background;
  const divider = theme.colors.divider;
  const avatarPlaceholder = `${theme.colors.divider}66`;
  const avatarBorder = theme.colors.background;

  const buildMessagePreview = (): React.ReactNode => {
    if (isChannel) {
      return <span style={{ color: secondaryText }}>{lastMessage}</span>;
    }

    if (isTyping) {
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <TypingDots color={accent} />
          <span
            style={{
              color: accent,
              fontWeight: 500,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {typingText || "typing…"}
          </span>
        </span>
      );
    }

    if (mediaType) {
      const prefix = getMediaPrefix(mediaType);
      if (prefix) {
        return (
          <span style={{ color: secondaryText }}>
            {senderName && (
              <span style={{ fontWeight: 500 }}>{senderName}: </span>
            )}
            {prefix}
          </span>
        );
      }
    }

    if (senderName) {
      return (
        <>
          <span style={{ fontWeight: 500, color: secondaryText }}>
            {senderName}:
          </span>{" "}
          <span>{lastMessage}</span>
        </>
      );
    }

    return lastMessage;
  };

  return (
    <div
      data-anchor={isChannel ? "channel_row" : "chat_row"}
      style={{
        display: "flex",
        backgroundColor: background,
        cursor: "pointer",
        height: spacing.chatListItemHeight,
        alignItems: "center",
      }}
    >
      {/* Avatar Container */}
      <div
        style={{
          width: spacing.avatarSize + spacing.avatarMarginLeft,
          height: spacing.chatListItemHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          paddingLeft: spacing.avatarMarginLeft,
          position: "relative",
        }}
      >
        {hasStatus && (
          <div
            style={{
              position: "absolute",
              left: spacing.avatarMarginLeft - 2,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <StatusRing size={spacing.avatarSize + 4} color={accent} />
          </div>
        )}

        {groupAvatars && groupAvatars.length > 0 ? (
          <div
            style={{
              width: spacing.avatarSize,
              height: spacing.avatarSize,
              borderRadius: spacing.avatarRadius,
              backgroundColor: avatarPlaceholder,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {groupAvatars.slice(0, 2).map((avatar, idx) => (
              <Img
                key={`${avatar}_${idx}`}
                src={resolveAvatarWithFallback(avatar, name)}
                alt={name}
                style={{
                  width: spacing.avatarSize * 0.7,
                  height: spacing.avatarSize * 0.7,
                  borderRadius: "50%",
                  objectFit: "cover",
                  position: "absolute",
                  top: idx === 0 ? 0 : spacing.avatarSize * 0.3,
                  left: idx === 0 ? 0 : spacing.avatarSize * 0.3,
                  border: `2px solid ${avatarBorder}`,
                  backgroundColor: avatarPlaceholder,
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              width: spacing.avatarSize,
              height: spacing.avatarSize,
              borderRadius: spacing.avatarRadius,
              backgroundColor: avatarPlaceholder,
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <Img
              src={resolveAvatarWithFallback(avatarUrl, name)}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {isChannel && channelUnreadCount > 0 && (
              <div
                style={{
                  position: "absolute",
                  right: 2,
                  top: 2,
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
                  border: `2px solid ${background}`,
                }}
              >
                {channelUnreadCount > 99 ? "99+" : channelUnreadCount}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
          paddingRight: spacing.contentMarginRight,
          paddingLeft: spacing.contentMarginLeft,
          borderBottom: isLast
            ? "none"
            : `0.5px solid ${divider}`,
          minWidth: 0,
        }}
      >
        {/* Top Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: subtitle ? 1 : 2,
          }}
        >
          <div
            style={{
              ...typography.headline,
              color: primaryText,
              fontFamily: theme.typography.fontFamily,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginRight: 8,
              flex: 1,
            }}
          >
            {name}
          </div>

          {isChannel && (
            <div
              style={{
                ...typography.caption,
                fontFamily: theme.typography.fontFamily,
                color: isFollowed ? primaryText : accent,
                fontWeight: 700,
                marginRight: 8,
                whiteSpace: "nowrap",
              }}
            >
              {isFollowed ? "Following" : "Follow"}
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
            {isMuted && (
              <MutedIcon size={14} color={secondaryText} />
            )}
            <span
              style={{
                ...typography.caption,
                fontFamily: theme.typography.fontFamily,
                color: hasUnread
                  ? accent
                  : secondaryText,
              }}
            >
              {timestamp}
            </span>
          </div>
        </div>

        {subtitle && (
          <div
            style={{
              ...typography.caption,
              color: tertiaryText,
              fontFamily: theme.typography.fontFamily,
              marginBottom: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Bottom Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              ...typography.body,
              color: hasUnread ? primaryText : secondaryText,
              fontFamily: theme.typography.fontFamily,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "flex",
              alignItems: "center",
              gap: 4,
              flex: 1,
              minWidth: 0,
            }}
          >
            {status && !hasUnread && !isTyping && (
              <span
                style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
              >
                {status === "sent" ? (
                  <SingleCheckIcon
                    size={16}
                    color={theme.colors.checkmark}
                  />
                ) : (
                  <DoubleCheckIcon read={status === "read"} size={16} />
                )}
              </span>
            )}
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {buildMessagePreview()}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            {isPinned && (
              <PinIcon size={14} color={secondaryText} />
            )}
            {isLocked && (
              <LockIcon size={13} color={secondaryText} />
            )}
            {isVerifiedBusiness && (
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  backgroundColor: theme.colors.link,
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✓
              </div>
            )}

            {hasUnread && (
              <div
                style={{
                  backgroundColor: isMuted
                    ? secondaryText
                    : theme.colors.unreadBadge,
                  color: theme.colors.unreadBadgeText,
                  borderRadius: spacing.badgeRadius,
                  minWidth: spacing.badgeMinWidth,
                  height: spacing.badgeHeight,
                  padding: `0 ${spacing.badgePadding}px`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...typography.badge,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ChatListItem;
