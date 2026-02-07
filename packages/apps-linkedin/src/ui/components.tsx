import React from "react";
import { useLinkedInTheme } from "./ThemeContext.js";
import type { LIReactionType } from "../types/index.js";

export const LIAvatar: React.FC<{ size?: number; src?: string }> = ({ size = 40, src }) => {
  const theme = useLinkedInTheme();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: src
          ? `url(${src}) center/cover`
          : theme.mode === "dark"
            ? "linear-gradient(135deg, #1F2937 0%, #0B1117 100%)"
            : "linear-gradient(135deg, #D8EAFE 0%, #F3F2EF 100%)",
        border: `1px solid ${theme.colors.border}`,
        flexShrink: 0,
      }}
    />
  );
};

export const LIIcon: React.FC<{ name: "home" | "network" | "post" | "bell" | "messages" | "search" | "back"; size?: number; color?: string }> = ({
  name,
  size = 20,
  color,
}) => {
  const theme = useLinkedInTheme();
  const c = color ?? theme.colors.textSecondary;

  const paths: Record<string, React.ReactNode> = {
    home: <path d="M10.5 2l8.5 7.2V21a1 1 0 0 1-1 1h-5v-7h-5v7H3a1 1 0 0 1-1-1V9.2L10.5 2z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" />,
    network: <path d="M8 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3zM2.5 21c.6-3.2 3.1-5 5.5-5s4.9 1.8 5.5 5m0 0c.6-3.2 3.1-5 5.5-5s4.9 1.8 5.5 5" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" />,
    post: <path d="M4 20h16M6 16l10-10 2 2-10 10H6v-2z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" />,
    bell: <path d="M18 16H6l1-2v-4a5 5 0 0 1 10 0v4l1 2zM10 18a2 2 0 0 0 4 0" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" />,
    messages: <path d="M4 5h16v11H7l-3 3V5z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" />,
    search: <><circle cx="11" cy="11" r="6.5" fill="none" stroke={c} strokeWidth="2" /><path d="M20 20l-4-4" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" /></>,
    back: <path d="M14 6l-6 6 6 6" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      {paths[name]}
    </svg>
  );
};

export const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useLinkedInTheme();
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        background: theme.colors.pill,
        color: theme.colors.textPrimary,
        border: `1px solid ${theme.colors.border}`,
        fontSize: theme.typography.micro.fontSize,
        fontWeight: theme.typography.micro.fontWeight,
        letterSpacing: theme.typography.micro.letterSpacing as any,
      }}
    >
      {children}
    </span>
  );
};

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

export const ReactionChip: React.FC<{ reaction: LIReactionType; count?: number }> = ({ reaction, count = 0 }) => {
  const theme = useLinkedInTheme();
  const bg = theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(10,102,194,0.08)";
  const fg = theme.mode === "dark" ? theme.colors.textPrimary : theme.colors.accent;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        background: bg,
        border: `1px solid ${theme.colors.border}`,
        color: fg,
        fontSize: theme.typography.micro.fontSize,
        fontWeight: 600,
      }}
    >
      {reactionLabel(reaction)}
      <span style={{ color: theme.colors.textSecondary, fontWeight: 600 }}>{count}</span>
    </span>
  );
};

export const BottomNav: React.FC<{
  active: "feed" | "profile" | "notifications" | "messages";
}> = ({ active }) => {
  const theme = useLinkedInTheme();
  const item = (key: "feed" | "profile" | "notifications" | "messages") => {
    const on = active === key;
    const color = on ? theme.colors.accent : theme.colors.textSecondary;
    const label =
      key === "feed"
        ? "Home"
        : key === "profile"
          ? "My Network"
          : key === "notifications"
            ? "Notifications"
            : "Messages";
    const icon =
      key === "feed"
        ? "home"
        : key === "profile"
          ? "network"
          : key === "notifications"
            ? "bell"
            : "messages";
    return (
      <div
        key={key}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          color,
          fontSize: 11,
          fontWeight: on ? 800 : 600,
        }}
      >
        <LIIcon name={icon as any} size={20} color={color} />
        {label}
      </div>
    );
  };

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
      {item("feed")}
      {item("profile")}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          color: theme.colors.accent,
          fontSize: 11,
          fontWeight: 900,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: theme.colors.accent,
            display: "grid",
            placeItems: "center",
            boxShadow: theme.mode === "dark" ? "0 18px 40px rgba(59,130,246,0.35)" : "0 18px 40px rgba(10,102,194,0.25)",
          }}
        >
          <LIIcon name="post" size={18} color="#fff" />
        </div>
        Post
      </div>
      {item("notifications")}
      {item("messages")}
    </div>
  );
};
