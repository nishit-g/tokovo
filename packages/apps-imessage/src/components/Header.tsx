import React from "react";
import { iOS_IMESSAGE_LIGHT, LAYOUT_CONSTANTS } from "../config";

interface HeaderProps {
  name: string;
  avatar?: string;
  isGroup?: boolean;
  participantCount?: number;
  theme?: typeof iOS_IMESSAGE_LIGHT;
  safeAreaTop?: number;
}

export const Header: React.FC<HeaderProps> = ({
  name,
  avatar,
  isGroup = false,
  participantCount,
  theme = iOS_IMESSAGE_LIGHT,
  safeAreaTop,
}) => {
  const { colors, typography } = theme;
  const topInset = safeAreaTop ?? LAYOUT_CONSTANTS.SAFE_AREA_TOP;
  const headerHeight = topInset + 44;

  return (
    <div
      style={{
        height: headerHeight,
        backgroundColor: colors.header.background,
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        padding: `${topInset}px ${LAYOUT_CONSTANTS.LIST_PADDING}px 0`,
        borderBottom: `1px solid ${colors.system.separator}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          color: colors.header.icons,
          marginRight: 12,
          fontFamily: typography.headerTitle.family,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        <span style={{ fontSize: 22, marginRight: 4 }}>‹</span>
        Messages
      </div>
      <div
        style={{
          width: LAYOUT_CONSTANTS.HEADER_AVATAR_SIZE,
          height: LAYOUT_CONSTANTS.HEADER_AVATAR_SIZE,
          borderRadius: "50%",
          backgroundColor: colors.bubble.received,
          overflow: "hidden",
          marginRight: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span
            style={{
              fontFamily: typography.headerTitle.family,
              fontSize: typography.headerTitle.size,
              fontWeight: 500,
              color: colors.system.timestamp,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: typography.headerTitle.family,
            fontSize: typography.headerTitle.size,
            fontWeight: typography.headerTitle.weight,
            color: colors.header.title,
          }}
        >
          {name}
        </div>
        {isGroup && participantCount ? (
          <div
            style={{
              fontFamily: typography.headerSubtitle.family,
              fontSize: typography.headerSubtitle.size,
              color: colors.header.subtitle,
            }}
          >
            {participantCount} people
          </div>
        ) : null}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <IconButton color={colors.header.icons}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
            <rect
              x="3"
              y="6"
              width="13"
              height="12"
              rx="3"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M16 9.5 L21 7.5 V16.5 L16 14.5 Z"
              fill="currentColor"
            />
          </svg>
        </IconButton>
        <IconButton color={colors.header.icons}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <line
              x1="12"
              y1="10"
              x2="12"
              y2="16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="12" cy="7" r="1.2" fill="currentColor" />
          </svg>
        </IconButton>
      </div>
    </div>
  );
};

const IconButton: React.FC<{ color: string; children: React.ReactNode }> = ({
  color,
  children,
}) => {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        border: `1.5px solid ${color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
      }}
    >
      {children}
    </div>
  );
};

export default Header;
