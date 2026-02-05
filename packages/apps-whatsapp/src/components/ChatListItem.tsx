import React, { memo } from "react";
import { Img, useCurrentFrame, interpolate } from "remotion";
import { DoubleCheckIcon, MutedIcon, PinIcon } from "./Icons";
import { whatsappColors, typography, spacing } from "./theme";
import { resolveAvatarWithFallback } from "../utils/avatar";

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
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

const TypingDots: React.FC = () => {
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
          backgroundColor: whatsappColors.primary,
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
        color: whatsappColors.primary,
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      {dots}
    </span>
  );
};

const StatusRing: React.FC<{ size: number }> = ({ size }) => {
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
        stroke={whatsappColors.primary}
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
}: ChatListItemProps) {
  const hasUnread = unreadCount > 0;

  const buildMessagePreview = (): React.ReactNode => {
    if (isTyping) {
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <TypingDots />
          <span style={{ color: whatsappColors.primary, fontWeight: 500 }}>
            typing…
          </span>
        </span>
      );
    }

    if (mediaType) {
      const prefix = getMediaPrefix(mediaType);
      if (prefix) {
        return (
          <span style={{ color: whatsappColors.textSecondary }}>
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
          <span
            style={{ fontWeight: 500, color: whatsappColors.textSecondary }}
          >
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
      style={{
        display: "flex",
        backgroundColor: whatsappColors.bgPrimary,
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
            <StatusRing size={spacing.avatarSize + 4} />
          </div>
        )}

        {groupAvatars && groupAvatars.length > 0 ? (
          <div
            style={{
              width: spacing.avatarSize,
              height: spacing.avatarSize,
              borderRadius: spacing.avatarRadius,
              backgroundColor: whatsappColors.avatarPlaceholder,
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
                  border: `2px solid ${whatsappColors.avatarBorder}`,
                  backgroundColor: whatsappColors.avatarPlaceholder,
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
              backgroundColor: whatsappColors.avatarPlaceholder,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Img
              src={resolveAvatarWithFallback(avatarUrl, name)}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
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
            : `0.5px solid ${whatsappColors.separator}`,
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
              color: whatsappColors.textPrimary,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginRight: 8,
              flex: 1,
            }}
          >
            {name}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
            {isMuted && (
              <MutedIcon size={14} color={whatsappColors.textSecondary} />
            )}
            <span
              style={{
                ...typography.caption,
                color: hasUnread
                  ? whatsappColors.primary
                  : whatsappColors.textSecondary,
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
              color: whatsappColors.textTertiary,
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
              color: hasUnread ? whatsappColors.textPrimary : whatsappColors.textSecondary,
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
                <DoubleCheckIcon read={status === "read"} size={16} />
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
              <PinIcon size={14} color={whatsappColors.textSecondary} />
            )}

            {hasUnread && (
              <div
                style={{
                  backgroundColor: isMuted
                    ? whatsappColors.textSecondary
                    : whatsappColors.primary,
                  color: whatsappColors.unreadBadgeText,
                  borderRadius: spacing.badgeRadius,
                  minWidth: spacing.badgeMinWidth,
                  height: spacing.badgeHeight,
                  padding: `0 ${spacing.badgePadding}px`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...typography.badge,
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
