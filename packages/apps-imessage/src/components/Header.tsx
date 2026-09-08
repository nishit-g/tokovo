import React from "react";
import { useIMessageTheme } from "../ui/ThemeContext.js";
import { iMessageSpacing } from "../config/tokens.js";
import { ConversationAvatar } from "./ConversationAvatar.js";

interface HeaderProps {
  name: string;
  avatar?: string;
  isGroup?: boolean;
  participantCount?: number;
  contentInsetTop: number;
  compact?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  name,
  avatar,
  isGroup = false,
  participantCount,
  contentInsetTop,
  compact = false,
}) => {
  const { colors, typography } = useIMessageTheme();
  const buttonStyle: React.CSSProperties = {
    border: 0,
    padding: 0,
    background: "transparent",
    color: colors.header.icons,
    width: 44,
    height: 44,
    display: "grid",
    placeItems: "center",
  };
  return (
    <header
      data-cinematic-subject="imessage_chat_header"
      style={{
        height:
          contentInsetTop +
          (compact ? iMessageSpacing.detailHeaderHeight : iMessageSpacing.headerHeight),
        padding: `${contentInsetTop}px ${iMessageSpacing.headerPaddingH}px 0`,
        boxSizing: "border-box",
        flexShrink: 0,
        background: colors.header.background,
        borderBottom: `0.5px solid ${colors.system.separator}`,
        display: "grid",
        gridTemplateColumns: "44px minmax(0, 1fr) 44px",
        alignItems: "center",
      }}
    >
      <button type="button" aria-label="Back to messages" style={buttonStyle}>
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 4-8 8 8 8" />
        </svg>
      </button>
      <div
        aria-label={isGroup && participantCount ? `${name}, ${participantCount} people` : name}
        style={{
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        {!compact && (
          <ConversationAvatar
            name={name}
            src={avatar}
            size={iMessageSpacing.headerAvatarSize}
            isGroup={isGroup}
          />
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            maxWidth: "100%",
            color: colors.header.title,
            fontFamily: typography.headerTitle.family,
            fontSize: compact ? 17 : 13,
            fontWeight: compact ? 600 : 400,
            lineHeight: "18px",
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}
          </span>
          {!compact && (
            <svg
              width="9"
              height="12"
              viewBox="0 0 9 12"
              fill="none"
              stroke={colors.header.subtitle}
              strokeWidth="1.3"
              aria-hidden="true"
            >
              <path d="m2 2 4 4-4 4" />
            </svg>
          )}
        </div>
      </div>
      {!compact && (
        <button type="button" aria-label="FaceTime" style={buttonStyle}>
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="6" width="13" height="12" rx="3" />
            <path d="m15 10 6-3v10l-6-3Z" />
          </svg>
        </button>
      )}
    </header>
  );
};

export default Header;
