import React from "react";
import { getXTheme } from "../config/theme";

export const XLogo: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M4 4h4.2l4.2 6.3L17.5 4H20l-6.2 8.4L20.6 20h-4.2l-4.6-6.7L6.5 20H4l6.6-8.7L4 4Z"
      fill="currentColor"
    />
  </svg>
);

export const Avatar: React.FC<{ size?: number; ring?: boolean }> = ({ size = 36, ring }) => {
  const theme = getXTheme("dark");
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background:
          "radial-gradient(circle at 35% 30%, #1f2937, #0b0b0f 70%)",
        border: `1px solid ${theme.colors.borderStrong}`,
        boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
        outline: ring ? `2px solid ${theme.colors.accent}` : undefined,
        outlineOffset: ring ? 2 : undefined,
      }}
    />
  );
};

export const VerifiedBadge: React.FC<{ variant?: "blue" | "gold" | "grey" | null }> = ({
  variant = "blue",
}) => {
  const theme = getXTheme("dark");
  const fill =
    variant === "gold"
      ? "#D4AF37"
      : variant === "grey"
      ? "#9CA3AF"
      : theme.colors.accent;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 16,
        borderRadius: 999,
        border: `1.5px solid ${fill}`,
        boxShadow: `inset 0 0 0 1px ${theme.colors.background}`,
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          backgroundColor: fill,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ✓
      </span>
    </span>
  );
};

export const MetricPill: React.FC<{
  label: string;
  value: number;
  active?: boolean;
}> = ({ label, value, active }) => {
  const theme = getXTheme("dark");
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        border: `1px solid ${active ? theme.colors.accent : theme.colors.border}`,
        color: active ? theme.colors.accent : theme.colors.textMuted,
        fontSize: 11,
        letterSpacing: 0.2,
        backgroundColor: active ? theme.colors.accentSoft : "transparent",
      }}
    >
      {label}
      <strong style={{ fontSize: 12 }}>{value}</strong>
    </span>
  );
};

export const XIcon: React.FC<{
  name:
    | "home"
    | "search"
    | "bell"
    | "mail"
    | "compose"
    | "reply"
    | "repost"
    | "like"
    | "view"
    | "bookmark"
    | "share"
    | "analytics";
  size?: number;
  active?: boolean;
  accent?: boolean;
}> = ({ name, size = 20, active, accent }) => {
  const theme = getXTheme("dark");
  const stroke = accent
    ? theme.colors.accent
    : active
    ? theme.colors.textPrimary
    : theme.colors.textMuted;
  const common = {
    stroke,
    strokeWidth: 1.6,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<string, React.ReactNode> = {
    home: <path {...common} d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" />,
    search: (
      <>
        <circle {...common} cx="11" cy="11" r="6.5" />
        <path {...common} d="m16 16 4 4" />
      </>
    ),
    bell: (
      <path
        {...common}
        d="M12 4a4 4 0 0 0-4 4v3c0 .9-.4 1.7-1.1 2.2L5 15h14l-1.9-1.8c-.7-.5-1.1-1.3-1.1-2.2V8a4 4 0 0 0-4-4Z"
      />
    ),
    mail: <path {...common} d="M4 7h16v10H4z M4 7l8 6 8-6" />,
    compose: (
      <path
        {...common}
        d="M5 19h4l9-9-4-4-9 9v4Z M14 6l4 4"
      />
    ),
    reply: <path {...common} d="M9 6 4 10l5 4v-3h6a4 4 0 0 1 4 4v3" />,
    repost: <path {...common} d="M7 7h10l-2-2m2 2-2 2M17 17H7l2 2m-2-2 2-2" />,
    like: <path {...common} d="M12 20s-6-4.35-6-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.65-6 9-6 9Z" />,
    view: <path {...common} d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z M12 9a3 3 0 1 0 0 6" />,
    bookmark: <path {...common} d="M7 5h10v14l-5-3-5 3V5Z" />,
    share: <path {...common} d="M4 12v7h16v-7M12 16V4m0 0-4 4m4-4 4 4" />,
    analytics: <path {...common} d="M4 16h4v4H4z M10 10h4v10h-4z M16 6h4v14h-4z" />,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
};
