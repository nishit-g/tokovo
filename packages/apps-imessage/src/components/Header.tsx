/**
 * iMessage Header Component
 * 
 * iOS 17 style navigation header with frosted glass effect
 */
import React from "react";
import { useIMessageTheme } from "../ui/ThemeContext";
import { iMessageSpacing, iMessageTypography } from "../config/tokens";
import type { IMessageTheme } from "../config/imessage-theme";

interface HeaderProps {
  name: string;
  avatar?: string;
  isGroup?: boolean;
  participantCount?: number;
  /** For backward compatibility - prefer using inside ThemeContext */
  theme?: IMessageTheme;
  safeAreaTop?: number;
}

export const Header: React.FC<HeaderProps> = ({
  name,
  avatar,
  isGroup = false,
  participantCount,
  theme: propTheme,
  safeAreaTop,
}) => {
  // Use hook theme if available, fall back to prop
  const contextTheme = useIMessageTheme();
  const theme = propTheme ?? contextTheme;

  const { colors } = theme;
  const topInset = safeAreaTop ?? iMessageSpacing.safeAreaTop;
  const headerHeight = topInset + 44; // 44pt is iOS standard nav height

  return (
    <div
      style={{
        height: headerHeight,
        backgroundColor: colors.header.background,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        padding: `${topInset}px ${iMessageSpacing.headerPaddingH}px 0`,
        borderBottom: `0.5px solid ${colors.system.separator}`,
      }}
    >
      {/* Back button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          color: colors.header.icons,
          marginRight: iMessageSpacing.headerAvatarGap,
          fontFamily: iMessageTypography.fontFamily,
          fontSize: iMessageTypography.headerTitle.fontSize,
          fontWeight: 400,
          cursor: "pointer",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: 4 }}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </div>

      {/* Avatar */}
      <div
        style={{
          width: iMessageSpacing.headerAvatarSize,
          height: iMessageSpacing.headerAvatarSize,
          borderRadius: "50%",
          backgroundColor: colors.bubble.received,
          overflow: "hidden",
          marginRight: iMessageSpacing.headerAvatarGap,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
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
              fontFamily: iMessageTypography.fontFamily,
              fontSize: iMessageTypography.headerTitle.fontSize,
              fontWeight: 500,
              color: colors.system.timestamp,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Title block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: iMessageTypography.fontFamily,
            fontSize: iMessageTypography.headerTitle.fontSize,
            fontWeight: iMessageTypography.headerTitle.fontWeight,
            color: colors.header.title,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </div>
        {isGroup && participantCount ? (
          <div
            style={{
              fontFamily: iMessageTypography.fontFamily,
              fontSize: iMessageTypography.headerSubtitle.fontSize,
              color: colors.header.subtitle,
            }}
          >
            {participantCount} people
          </div>
        ) : null}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: iMessageSpacing.headerAvatarGap }}>
        {/* Video call */}
        <IconButton color={colors.header.icons}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <rect
              x="2"
              y="6"
              width="14"
              height="12"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M16 9.5 L21 7 V17 L16 14.5 Z"
              fill="currentColor"
            />
          </svg>
        </IconButton>
        {/* Info */}
        <IconButton color={colors.header.icons}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <line
              x1="12"
              y1="11"
              x2="12"
              y2="16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="12" cy="8" r="1" fill="currentColor" />
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
        width: 32,
        height: 32,
        borderRadius: 16,
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
