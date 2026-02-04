import React from "react";
import { useXTheme } from "./ThemeContext";

// =============================================================================
// X LOGO
// =============================================================================

export const XLogo: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// =============================================================================
// AVATAR
// =============================================================================

export const Avatar: React.FC<{
  size?: number;
  src?: string;
  ring?: boolean;
}> = ({ size = 40, src, ring }) => {
  const theme = useXTheme();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: src
          ? `url(${src}) center/cover`
          : "linear-gradient(135deg, #2F3336 0%, #1D1F23 100%)",
        border: ring ? `2px solid ${theme.colors.accent}` : "none",
        flexShrink: 0,
      }}
    />
  );
};

// =============================================================================
// VERIFIED BADGE
// =============================================================================

export const VerifiedBadge: React.FC<{
  variant?: "blue" | "gold" | "grey" | null;
  size?: number;
}> = ({ variant = "blue", size = 18 }) => {
  const fill =
    variant === "gold"
      ? "#D4AF37"
      : variant === "grey"
        ? "#829AAB"
        : "#1D9BF0";

  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path
        d="M20.396 11c-.036-.296-.13-.588-.29-.857a1.5 1.5 0 0 0-.505-.52l-.054-.033a1.52 1.52 0 0 1-.654-1.452l.007-.068c.04-.35-.004-.706-.13-1.037a1.92 1.92 0 0 0-.54-.794 1.53 1.53 0 0 1-.463-1.42l.016-.078a2.02 2.02 0 0 0-.497-1.692 2.02 2.02 0 0 0-1.693-.497l-.078.016a1.53 1.53 0 0 1-1.42-.463 1.92 1.92 0 0 0-.794-.54 2.02 2.02 0 0 0-1.037-.13l-.068.007a1.52 1.52 0 0 1-1.452-.654l-.033-.054a1.5 1.5 0 0 0-.52-.505 2.02 2.02 0 0 0-.857-.29A2.02 2.02 0 0 0 9.037.622a1.5 1.5 0 0 0-.52.505l-.033.054a1.52 1.52 0 0 1-1.452.654l-.068-.007a2.02 2.02 0 0 0-1.037.13 1.92 1.92 0 0 0-.794.54 1.53 1.53 0 0 1-1.42.463l-.078-.016a2.02 2.02 0 0 0-1.693.497 2.02 2.02 0 0 0-.497 1.693l.016.078a1.53 1.53 0 0 1-.463 1.42 1.92 1.92 0 0 0-.54.794 2.02 2.02 0 0 0-.13 1.037l.007.068a1.52 1.52 0 0 1-.654 1.452l-.054.033a1.5 1.5 0 0 0-.505.52 2.02 2.02 0 0 0-.29.857c-.022.284.012.572.1.848a1.5 1.5 0 0 0 .39.657l.04.04a1.52 1.52 0 0 1 .314 1.507l-.024.073a2.02 2.02 0 0 0 .153 1.634c.22.385.54.706.925.926a1.52 1.52 0 0 1 .8 1.42l-.007.063a2.02 2.02 0 0 0 .507 1.508 1.92 1.92 0 0 0 1.007.554l.067.01a1.52 1.52 0 0 1 1.203.915l.027.06c.172.356.433.664.76.896.33.235.716.388 1.12.443a1.52 1.52 0 0 1 1.49-.394l.06.018a2.02 2.02 0 0 0 1.16 0l.06-.018a1.52 1.52 0 0 1 1.49.394c.404-.055.79-.208 1.12-.443.327-.232.588-.54.76-.896l.027-.06a1.52 1.52 0 0 1 1.203-.915l.067-.01a1.92 1.92 0 0 0 1.007-.554 2.02 2.02 0 0 0 .507-1.508l-.007-.063a1.52 1.52 0 0 1 .8-1.42c.385-.22.706-.54.926-.926a2.02 2.02 0 0 0 .153-1.634l-.024-.073a1.52 1.52 0 0 1 .314-1.507l.04-.04c.168-.185.299-.4.39-.657.088-.276.122-.564.1-.848z"
        fill={fill}
      />
      <path d="M9.64 12.5l-2.14-2.14 1.06-1.06 1.08 1.08 3.54-3.54 1.06 1.06z" fill="#fff" />
    </svg>
  );
};

// =============================================================================
// X ICONS - Real X app icons
// =============================================================================

type IconName =
  | "home"
  | "homeFilled"
  | "search"
  | "searchFilled"
  | "bell"
  | "bellFilled"
  | "mail"
  | "mailFilled"
  | "reply"
  | "repost"
  | "like"
  | "likeFilled"
  | "view"
  | "bookmark"
  | "bookmarkFilled"
  | "share"
  | "more"
  | "back"
  | "compose"
  | "grok";

export const XIcon: React.FC<{
  name: IconName;
  size?: number;
  color?: string;
}> = ({ name, size = 20, color }) => {
  const theme = useXTheme();
  const c = color || theme.colors.textSecondary;

  const icons: Record<IconName, React.ReactNode> = {
    home: (
      <path
        d="M21.591 7.146L12.52 1.157a1 1 0 0 0-1.04 0l-9.071 5.99A1.5 1.5 0 0 0 2 8.267V21.5a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-6a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V8.267a1.5 1.5 0 0 0-.409-1.12z"
        fill="none"
        stroke={c}
        strokeWidth="2"
      />
    ),
    homeFilled: (
      <path
        d="M21.591 7.146L12.52 1.157a1 1 0 0 0-1.04 0l-9.071 5.99A1.5 1.5 0 0 0 2 8.267V21.5a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-6a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V8.267a1.5 1.5 0 0 0-.409-1.12z"
        fill={c}
      />
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" fill="none" stroke={c} strokeWidth="2" />
        <path d="M21 21l-4.35-4.35" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    searchFilled: (
      <>
        <circle cx="11" cy="11" r="7" fill="none" stroke={c} strokeWidth="3" />
        <path d="M21 21l-4.35-4.35" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
    bell: (
      <path
        d="M19.993 9.042C19.48 5.017 16.054 2 12 2s-7.48 3.017-7.993 7.042A8.5 8.5 0 0 1 2.25 14h.5l1.052 5.268A3.5 3.5 0 0 0 7.234 22h9.532a3.5 3.5 0 0 0 3.432-2.732L21.25 14h.5a8.5 8.5 0 0 1-1.757-4.958z"
        fill="none"
        stroke={c}
        strokeWidth="2"
      />
    ),
    bellFilled: (
      <path
        d="M19.993 9.042C19.48 5.017 16.054 2 12 2s-7.48 3.017-7.993 7.042A8.5 8.5 0 0 1 2.25 14h.5l1.052 5.268A3.5 3.5 0 0 0 7.234 22h9.532a3.5 3.5 0 0 0 3.432-2.732L21.25 14h.5a8.5 8.5 0 0 1-1.757-4.958z"
        fill={c}
      />
    ),
    mail: (
      <path
        d="M2 6.5V17a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6.5m-20 0A2 2 0 0 1 4 5h16a2 2 0 0 1 2 1.5m-20 0l10 6.5 10-6.5"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    mailFilled: (
      <path
        d="M2 6.5V17a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6.5m-20 0A2 2 0 0 1 4 5h16a2 2 0 0 1 2 1.5m-20 0l10 6.5 10-6.5"
        fill={c}
        stroke={c}
        strokeWidth="2"
      />
    ),
    reply: (
      <path
        d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69H9.76c-4.42 0-8.009-3.58-8.009-8.01z"
        fill="none"
        stroke={c}
        strokeWidth="1.75"
      />
    ),
    repost: (
      <path
        d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"
        fill={c}
      />
    ),
    like: (
      <path
        d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.527 5.44 7.305 5.5c-1.243.07-2.387.676-3.238 1.93-.855 1.26-1.078 2.91-.599 4.66.478 1.76 1.697 3.53 3.588 5.09 1.886 1.55 4.27 2.77 6.944 3.32 2.674-.55 5.058-1.77 6.944-3.32 1.891-1.56 3.11-3.33 3.588-5.09.479-1.75.256-3.4-.599-4.66-.851-1.254-1.995-1.86-3.238-1.93z"
        fill="none"
        stroke={c}
        strokeWidth="1.75"
      />
    ),
    likeFilled: (
      <path
        d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
        fill={c}
      />
    ),
    view: (
      <path
        d="M8.75 21V3h2v18h-2zM18.75 21V8.5h2V21h-2zM13.75 21v-6h2v6h-2zM3.75 21v-3h2v3h-2z"
        fill={c}
      />
    ),
    bookmark: (
      <path
        d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"
        fill="none"
        stroke={c}
        strokeWidth="1.75"
      />
    ),
    bookmarkFilled: (
      <path
        d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"
        fill={c}
      />
    ),
    share: (
      <path
        d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.4-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"
        fill={c}
      />
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1.5" fill={c} />
        <circle cx="12" cy="12" r="1.5" fill={c} />
        <circle cx="19" cy="12" r="1.5" fill={c} />
      </>
    ),
    back: (
      <path
        d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"
        fill={c}
      />
    ),
    compose: (
      <path
        d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79 10.147 23.17 6.359 23 3zm-7 8h-1.5v2H16c.63 2.06 1.692 3.4 3 3.85-.63-2.06-1.692-3.401-3-3.85zM11 5c1.13 0 2.25.08 3.328.23-.582.89-1.09 1.83-1.55 2.8-.85-.09-1.72-.14-2.608-.16L11 5zm3.64 6.54c-.51 1.39-.93 2.81-1.19 4.27L11 15.83V12c0-.2-.1-.35-.24-.45l3.88-.01z"
        fill={c}
      />
    ),
    grok: (
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {icons[name]}
    </svg>
  );
};

// =============================================================================
// ACTION BUTTON - Tweet action (reply, repost, like, etc)
// =============================================================================

export const ActionButton: React.FC<{
  icon: "reply" | "repost" | "like" | "view" | "bookmark" | "share";
  count?: number;
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, count, active, onClick }) => {
  const theme = useXTheme();

  const activeColors: Record<string, string> = {
    reply: theme.colors.accent,
    repost: theme.colors.repostActive,
    like: theme.colors.likeActive,
    view: theme.colors.accent,
    bookmark: theme.colors.bookmarkActive,
    share: theme.colors.accent,
  };

  const color = active ? activeColors[icon] : theme.colors.textSecondary;
  const iconName = active && (icon === "like" || icon === "bookmark")
    ? `${icon}Filled` as const
    : icon;

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        cursor: "pointer",
      }}
    >
      <XIcon name={iconName} size={18} color={color} />
      {count !== undefined && count > 0 && (
        <span style={{ fontSize: 13, color }}>{formatCount(count)}</span>
      )}
    </div>
  );
};

// =============================================================================
// FORMATTED TIMESTAMP
// =============================================================================

export const formatTimestamp = (value: number | Date): string => {
  const date = typeof value === "number"
    ? (value > 1_000_000_000_000 ? new Date(value) : new Date(value * 1000))
    : value;

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
};

// =============================================================================
// TAB BUTTON
// =============================================================================

export const TabButton: React.FC<{
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ label, active, onClick }) => {
  const theme = useXTheme();

  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: theme.spacing.tabBarHeight,
        cursor: "pointer",
        position: "relative",
      }}
    >
      <span
        style={{
          fontSize: 15,
          fontWeight: active ? 700 : 500,
          color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
        }}
      >
        {label}
      </span>
      {active && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: 56,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.accent,
          }}
        />
      )}
    </div>
  );
};
