/**
 * LinkedIn UI Components
 * ======================
 * Core reusable components using token-based styling.
 */
import React from "react";
import { useLinkedInTheme } from "./ThemeContext.js";
import type { LIReactionType } from "../types/index.js";

// =============================================================================
// AVATAR
// =============================================================================
export interface LIAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  src?: string;
  name?: string;
  showOnline?: boolean;
}

export const LIAvatar: React.FC<LIAvatarProps> = ({
  size = "md",
  src,
  name,
  showOnline,
}) => {
  const theme = useLinkedInTheme();

  const sizeMap = {
    xs: theme.spacing.avatarXs,
    sm: theme.spacing.avatarSm,
    md: theme.spacing.avatarMd,
    lg: theme.spacing.avatarLg,
    xl: theme.spacing.avatarXl,
  };
  const px = typeof size === "number" ? size : sizeMap[size];

  // Generate initials from name
  const initials = name
    ? name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "";

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        style={{
          width: px,
          height: px,
          borderRadius: theme.radius.avatar,
          background: src
            ? `url(${src}) center/cover`
            : theme.colors.accentLight,
          border: `1px solid ${theme.colors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.colors.accent,
          fontSize: px * 0.4,
          fontWeight: 600,
        }}
      >
        {!src && initials}
      </div>
      {showOnline && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: px * 0.25,
            height: px * 0.25,
            borderRadius: theme.radius.pill,
            background: theme.colors.online,
            border: `2px solid ${theme.colors.surface}`,
          }}
        />
      )}
    </div>
  );
};

// =============================================================================
// ICONS
// =============================================================================
type IconName =
  | "home"
  | "home-fill"
  | "network"
  | "network-fill"
  | "briefcase"
  | "briefcase-fill"
  | "message"
  | "message-fill"
  | "bell"
  | "bell-fill"
  | "search"
  | "back"
  | "more"
  | "like"
  | "like-fill"
  | "comment"
  | "repost"
  | "send"
  | "close"
  | "photo"
  | "video"
  | "calendar";

export const LIIcon: React.FC<{
  name: IconName;
  size?: number;
  color?: string;
}> = ({ name, size = 24, color }) => {
  const theme = useLinkedInTheme();
  const c = color ?? theme.colors.textSecondary;

  const icons: Record<IconName, React.ReactNode> = {
    home: (
      <path
        d="M23 9v2h-2v7a3 3 0 01-3 3h-4v-6h-4v6H6a3 3 0 01-3-3v-7H1V9l11-7 11 7z"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ),
    "home-fill": (
      <path
        d="M23 9v2h-2v7a3 3 0 01-3 3h-4v-6h-4v6H6a3 3 0 01-3-3v-7H1V9l11-7 11 7z"
        fill={c}
      />
    ),
    network: (
      <>
        <circle cx="12" cy="7" r="3" fill="none" stroke={c} strokeWidth="2" />
        <circle cx="5" cy="19" r="3" fill="none" stroke={c} strokeWidth="2" />
        <circle cx="19" cy="19" r="3" fill="none" stroke={c} strokeWidth="2" />
        <path
          d="M12 10v4m-4 2l4-3 4 3"
          fill="none"
          stroke={c}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </>
    ),
    "network-fill": (
      <>
        <circle cx="12" cy="7" r="3" fill={c} />
        <circle cx="5" cy="19" r="3" fill={c} />
        <circle cx="19" cy="19" r="3" fill={c} />
        <path d="M12 10v4m-4 2l4-3 4 3" fill="none" stroke={c} strokeWidth="2" />
      </>
    ),
    briefcase: (
      <path
        d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ),
    "briefcase-fill": (
      <path
        d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
        fill={c}
      />
    ),
    message: (
      <path
        d="M7.5 21L4 17H4a3 3 0 01-3-3V6a3 3 0 013-3h14a3 3 0 013 3v8a3 3 0 01-3 3H11l-3.5 4z"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ),
    "message-fill": (
      <path
        d="M7.5 21L4 17H4a3 3 0 01-3-3V6a3 3 0 013-3h14a3 3 0 013 3v8a3 3 0 01-3 3H11l-3.5 4z"
        fill={c}
      />
    ),
    bell: (
      <path
        d="M18 15v-4a6 6 0 10-12 0v4l-2 2h16l-2-2zM13.73 21a2 2 0 01-3.46 0"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ),
    "bell-fill": (
      <>
        <path d="M18 15v-4a6 6 0 10-12 0v4l-2 2h16l-2-2z" fill={c} />
        <path
          d="M13.73 21a2 2 0 01-3.46 0"
          fill="none"
          stroke={c}
          strokeWidth="2"
        />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="7" fill="none" stroke={c} strokeWidth="2" />
        <path d="M21 21l-4.35-4.35" stroke={c} strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    back: (
      <path
        d="M15 19l-7-7 7-7"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="2" fill={c} />
        <circle cx="12" cy="12" r="2" fill={c} />
        <circle cx="19" cy="12" r="2" fill={c} />
      </>
    ),
    like: (
      <path
        d="M7 22V11M2 13v7a2 2 0 002 2h14a2 2 0 002-1.8l1-9A2 2 0 0019 9h-5V4a3 3 0 00-3-3l-4 9v12"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ),
    "like-fill": (
      <path
        d="M7 22V11M2 13v7a2 2 0 002 2h14a2 2 0 002-1.8l1-9A2 2 0 0019 9h-5V4a3 3 0 00-3-3l-4 9v12"
        fill={c}
      />
    ),
    comment: (
      <path
        d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ),
    repost: (
      <path
        d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    send: (
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ),
    close: (
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
    photo: (
      <>
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          fill="none"
          stroke={c}
          strokeWidth="2"
        />
        <circle cx="8.5" cy="8.5" r="1.5" fill={c} />
        <path d="M21 15l-5-5L5 21" fill="none" stroke={c} strokeWidth="2" />
      </>
    ),
    video: (
      <path
        d="M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ),
    calendar: (
      <>
        <rect
          x="3"
          y="4"
          width="18"
          height="18"
          rx="2"
          fill="none"
          stroke={c}
          strokeWidth="2"
        />
        <path d="M16 2v4M8 2v4M3 10h18" stroke={c} strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      {icons[name]}
    </svg>
  );
};

// =============================================================================
// REACTION EMOJIS
// =============================================================================
const REACTION_EMOJI: Record<LIReactionType, string> = {
  like: "👍",
  celebrate: "👏",
  support: "🙌",
  love: "❤️",
  insightful: "💡",
  curious: "🤔",
};

const REACTION_COLORS: Record<LIReactionType, string> = {
  like: "#378FE9",
  celebrate: "#6DAE4F",
  support: "#7B5782",
  love: "#DF704D",
  insightful: "#B28B28",
  curious: "#915DA3",
};

export const ReactionIcon: React.FC<{
  reaction: LIReactionType;
  size?: number;
  showBackground?: boolean;
}> = ({ reaction, size = 16, showBackground = true }) => {
  const bgColor = REACTION_COLORS[reaction];

  if (showBackground) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.6,
          lineHeight: 1,
        }}
      >
        {REACTION_EMOJI[reaction]}
      </div>
    );
  }

  return (
    <span style={{ fontSize: size, lineHeight: 1 }}>{REACTION_EMOJI[reaction]}</span>
  );
};

export const ReactionStack: React.FC<{
  reactions: LIReactionType[];
  size?: number;
}> = ({ reactions, size = 18 }) => {
  // Remove duplicates and limit to 3
  const unique = [...new Set(reactions)].slice(0, 3);

  return (
    <div style={{ display: "flex", marginLeft: -(size * 0.2) }}>
      {unique.map((r, i) => (
        <div
          key={r}
          style={{
            marginLeft: i === 0 ? 0 : -(size * 0.3),
            zIndex: unique.length - i,
            background: "white",
            borderRadius: "50%",
            border: "2px solid white",
          }}
        >
          <ReactionIcon reaction={r} size={size} />
        </div>
      ))}
    </div>
  );
};

// =============================================================================
// ACTION BAR
// =============================================================================
export interface ActionBarProps {
  likeCount?: number;
  commentCount?: number;
  repostCount?: number;
  isLiked?: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  likeCount = 0,
  commentCount = 0,
  repostCount = 0,
  isLiked = false,
}) => {
  const theme = useLinkedInTheme();

  const buttonStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    padding: `${theme.spacing.sm}px 0`,
    color: isLiked ? theme.colors.accent : theme.colors.textSecondary,
    fontSize: theme.typography.captionSemibold.fontSize,
    fontWeight: theme.typography.captionSemibold.fontWeight,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        borderTop: `1px solid ${theme.colors.border}`,
        padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      }}
    >
      <div style={buttonStyle}>
        <LIIcon
          name={isLiked ? "like-fill" : "like"}
          size={theme.spacing.actionIconSize}
          color={isLiked ? theme.colors.accent : theme.colors.textSecondary}
        />
        <span>Like</span>
        {likeCount > 0 ? <span>{likeCount}</span> : null}
      </div>
      <div style={{ ...buttonStyle, color: theme.colors.textSecondary }}>
        <LIIcon
          name="comment"
          size={theme.spacing.actionIconSize}
          color={theme.colors.textSecondary}
        />
        <span>Comment</span>
        {commentCount > 0 ? <span>{commentCount}</span> : null}
      </div>
      <div style={{ ...buttonStyle, color: theme.colors.textSecondary }}>
        <LIIcon
          name="repost"
          size={theme.spacing.actionIconSize}
          color={theme.colors.textSecondary}
        />
        <span>Repost</span>
        {repostCount > 0 ? <span>{repostCount}</span> : null}
      </div>
      <div style={{ ...buttonStyle, color: theme.colors.textSecondary }}>
        <LIIcon
          name="send"
          size={theme.spacing.actionIconSize}
          color={theme.colors.textSecondary}
        />
        <span>Send</span>
      </div>
    </div>
  );
};

// =============================================================================
// BOTTOM NAVIGATION
// =============================================================================
type NavTab = "home" | "network" | "post" | "notifications" | "jobs" | "messages";

export const BottomNav: React.FC<{
  active: NavTab;
}> = ({ active }) => {
  const theme = useLinkedInTheme();

  const tabs: { key: NavTab; icon: IconName; activeIcon: IconName; label: string }[] = [
    { key: "home", icon: "home", activeIcon: "home-fill", label: "Home" },
    { key: "network", icon: "network", activeIcon: "network-fill", label: "My Network" },
    { key: "post", icon: "briefcase", activeIcon: "briefcase-fill", label: "Post" },
    { key: "notifications", icon: "bell", activeIcon: "bell-fill", label: "Notifications" },
    { key: "jobs", icon: "briefcase", activeIcon: "briefcase-fill", label: "Jobs" },
  ];

  return (
    <div
      style={{
        height: theme.spacing.navHeight,
        background: theme.colors.surface,
        borderTop: `1px solid ${theme.colors.border}`,
        display: "flex",
        alignItems: "stretch",
      }}
    >
      {tabs.map(({ key, icon, activeIcon, label }) => {
        const isActive = active === key || (active === "messages" && key === "home");
        const color = isActive ? theme.colors.textPrimary : theme.colors.textSecondary;

        return (
          <div
            key={key}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.xs,
              color,
              position: "relative",
            }}
          >
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 24,
                  height: 2,
                  background: theme.colors.textPrimary,
                  borderRadius: theme.radius.pill,
                }}
              />
            )}
            <LIIcon
              name={isActive ? activeIcon : icon}
              size={20}
              color={color}
            />
            <span
              style={{
                fontSize: theme.typography.micro.fontSize,
                fontWeight: isActive ? 600 : theme.typography.micro.fontWeight,
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// =============================================================================
// HEADER
// =============================================================================
export interface HeaderProps {
  avatarSrc?: string;
  showSearch?: boolean;
  title?: string;
  showBack?: boolean;
}

// LinkedIn "in" logo
const LinkedInLogo: React.FC<{ size?: number; color?: string }> = ({
  size = 34,
  color = "#0A66C2",
}) => (
  <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
    <rect width="34" height="34" rx="4" fill={color} />
    <path
      d="M8 14h4v12H8V14zm2-6a2 2 0 110 4 2 2 0 010-4zm6 6h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6v7h-4v-6.2c0-1.5 0-3.4-2.1-3.4-2.1 0-2.4 1.6-2.4 3.3V26h-4V14z"
      fill="white"
    />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  avatarSrc,
  showSearch = true,
  title,
  showBack = false,
}) => {
  const theme = useLinkedInTheme();

  return (
    <div
      style={{
        height: theme.spacing.headerHeight,
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        display: "flex",
        alignItems: "center",
        padding: `0 ${theme.spacing.screenPadding}px`,
        gap: theme.spacing.md,
      }}
    >
      {showBack ? (
        <LIIcon name="back" size={24} color={theme.colors.textPrimary} />
      ) : (
        // LinkedIn logo on left
        <LinkedInLogo size={30} color={theme.colors.accent} />
      )}

      {title ? (
        <div
          style={{
            flex: 1,
            fontSize: theme.typography.title.fontSize,
            fontWeight: theme.typography.title.fontWeight,
            color: theme.colors.textPrimary,
          }}
        >
          {title}
        </div>
      ) : showSearch ? (
        <div
          style={{
            flex: 1,
            height: theme.spacing.buttonHeight,
            background: theme.colors.surfaceHover,
            borderRadius: theme.radius.sm,
            display: "flex",
            alignItems: "center",
            padding: `0 ${theme.spacing.sm}px`,
            gap: theme.spacing.sm,
            color: theme.colors.textSecondary,
            fontSize: theme.typography.body.fontSize,
          }}
        >
          <LIIcon name="search" size={16} color={theme.colors.textSecondary} />
          <span>Search</span>
        </div>
      ) : (
        <div style={{ flex: 1 }} />
      )}

      {/* Right side: Avatar + Message icon */}
      {!showBack && (
        <>
          <LIAvatar size="xs" src={avatarSrc} />
          <LIIcon name="message" size={24} color={theme.colors.textSecondary} />
        </>
      )}
      {showBack && <LIIcon name="more" size={24} color={theme.colors.textSecondary} />}
    </div>
  );
};

// =============================================================================
// BUTTON
// =============================================================================
export interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
}) => {
  const theme = useLinkedInTheme();

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    borderRadius: theme.radius.button,
    fontWeight: theme.typography.headline.fontWeight,
    fontSize: size === "sm" ? theme.typography.caption.fontSize : theme.typography.body.fontSize,
    padding:
      size === "sm"
        ? `${theme.spacing.xs}px ${theme.spacing.md}px`
        : `${theme.spacing.sm}px ${theme.spacing.lg}px`,
    cursor: "pointer",
    border: "none",
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      ...baseStyle,
      background: theme.colors.accent,
      color: theme.colors.textInverse,
    },
    secondary: {
      ...baseStyle,
      background: "transparent",
      color: theme.colors.accent,
      border: `1px solid ${theme.colors.accent}`,
    },
    ghost: {
      ...baseStyle,
      background: "transparent",
      color: theme.colors.textSecondary,
    },
  };

  return <div style={variants[variant]}>{children}</div>;
};

// =============================================================================
// LEGACY EXPORTS (for backwards compatibility)
// =============================================================================
export function reactionLabel(r: LIReactionType): string {
  switch (r) {
    case "celebrate":
      return "Celebrate";
    case "support":
      return "Support";
    case "love":
      return "Love";
    case "insightful":
      return "Insightful";
    case "curious":
      return "Curious";
    case "like":
    default:
      return "Like";
  }
}

export const ReactionChip = ReactionIcon;
export const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useLinkedInTheme();
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: theme.spacing.xs,
        padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
        borderRadius: theme.radius.pill,
        background: theme.colors.surfaceHover,
        color: theme.colors.textSecondary,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: theme.typography.captionSemibold.fontWeight,
      }}
    >
      {children}
    </span>
  );
};
