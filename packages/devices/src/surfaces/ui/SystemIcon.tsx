import React from "react";
import { DeterministicImage } from "@tokovo/react";
import type { AppIcon } from "@tokovo/core";
import type { SystemSurfaceTheme } from "../contract.js";

function isImageSource(value: string): boolean {
  return /^(?:https?:\/\/|\/|data:|r2:\/\/)/u.test(value);
}

function isEmoji(value: string): boolean {
  return /^\p{Extended_Pictographic}/u.test(value);
}

const BubbleGlyph: React.FC<{ phone?: boolean }> = ({ phone = false }) => (
  <svg width="64%" height="64%" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M12 28c0-11 9-19 20-19s20 8 20 19-9 19-20 19c-3.3 0-6.4-.7-9.2-2.1L13 50l2.7-9.3A18.6 18.6 0 0 1 12 28Z" fill="white" />
    {phone ? (
      <path d="M25 19c1.5-1 3.4-.5 4.2 1l2.1 4.2c.7 1.4.4 3-.8 4l-1.6 1.4c2.2 4.1 4.9 6.8 9 9l1.5-1.7a3.1 3.1 0 0 1 3.8-.7l4 2.2c1.6.8 2.1 2.8 1.1 4.3-1.4 2-3.8 3.5-6.4 3.5-11.8 0-24.1-12.3-24.1-24.1 0-2.7 1.3-5.1 3.4-6.5l3.8-2.6Z" fill="#20B85A" transform="scale(.75) translate(11 10)" />
    ) : null}
  </svg>
);

const CameraGlyph: React.FC = () => (
  <svg width="63%" height="63%" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <rect x="8" y="16" width="48" height="36" rx="9" stroke="white" strokeWidth="5" />
    <circle cx="32" cy="34" r="10" stroke="white" strokeWidth="5" />
    <path d="M22 16l4-6h12l4 6" stroke="white" strokeWidth="5" strokeLinejoin="round" />
  </svg>
);

const InstagramGlyph: React.FC = () => (
  <svg width="62%" height="62%" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <rect x="9" y="9" width="46" height="46" rx="14" stroke="white" strokeWidth="5" />
    <circle cx="32" cy="32" r="11" stroke="white" strokeWidth="5" />
    <circle cx="47" cy="18" r="3" fill="white" />
  </svg>
);

const GhostGlyph: React.FC = () => (
  <svg width="60%" height="60%" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M32 8c-10 0-16 8-16 18v9c0 4-4 7-8 8 2 4 6 5 10 4 2 5 7 8 14 8s12-3 14-8c4 1 8 0 10-4-4-1-8-4-8-8v-9C48 16 42 8 32 8Z" fill="white" stroke="#111" strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
);

function builtInIdentity(appId: string): { background: string; foreground: React.ReactNode } | null {
  switch (appId) {
    case "app_whatsapp":
      return { background: "#20B85A", foreground: <BubbleGlyph phone /> };
    case "app_imessage":
      return { background: "#34C759", foreground: <BubbleGlyph /> };
    case "app_instagram":
      return {
        background: "radial-gradient(circle at 70% 72%, #FFD36B 0 12%, transparent 34%), linear-gradient(145deg, #6D36C7 4%, #C72D8E 48%, #F36B36 82%)",
        foreground: <InstagramGlyph />,
      };
    case "app_x":
      return { background: "#050505", foreground: <span style={{ color: "white", fontSize: "58%", fontWeight: 500 }}>𝕏</span> };
    case "app_linkedin":
      return { background: "#0A66C2", foreground: <span style={{ color: "white", fontSize: "54%", fontWeight: 800 }}>in</span> };
    case "app_teams":
      return { background: "#6264A7", foreground: <span style={{ color: "white", fontSize: "58%", fontWeight: 800 }}>T</span> };
    case "app_snapchat":
      return { background: "#FFFC00", foreground: <GhostGlyph /> };
    case "app_camera":
      return { background: "linear-gradient(145deg, #74777D, #292B2F)", foreground: <CameraGlyph /> };
    default:
      return null;
  }
}

export const SystemAppIcon: React.FC<{
  app: AppIcon;
  size: number;
  radius: number;
  theme: SystemSurfaceTheme;
  showLabel?: boolean;
}> = ({ app, size, radius, theme, showLabel = true }) => {
  const identity = builtInIdentity(app.appId);
  const scale = size / theme.geometry.home.iconSize;
  const labelColor = theme.colors.primaryText;
  const labelShadow = theme.appearance === "light"
    ? "0 1px 5px rgba(255, 255, 255, 0.86)"
    : "0 1px 5px rgba(0, 0, 0, 0.72)";

  return (
    <div
      data-app-id={app.appId}
      style={{
        width: size,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: showLabel ? theme.geometry.home.labelGap : 0,
        minWidth: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: radius,
          overflow: "visible",
          flex: "0 0 auto",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: identity?.background ?? theme.colors.chromeStrong,
            boxShadow: theme.platform === "ios"
              ? "0 2px 5px rgba(0, 0, 0, 0.18), inset 0 0 0 1px rgba(255, 255, 255, 0.14)"
              : "0 2px 4px rgba(0, 0, 0, 0.2)",
            fontFamily: theme.fontFamily,
            fontSize: size,
          }}
        >
          {identity?.foreground ?? (isImageSource(app.icon) ? (
            <DeterministicImage
              src={app.icon}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : isEmoji(app.icon) ? (
            <span style={{ fontSize: size * 0.52, lineHeight: 1 }}>{app.icon}</span>
          ) : (
            <span style={{ color: theme.colors.primaryText, fontSize: size * 0.42, fontWeight: 750 }}>
              {(app.label.trim()[0] || "•").toUpperCase()}
            </span>
          ))}
        </div>

        {app.badge && app.badge > 0 ? (
          <div
            aria-label={`${app.badge} notifications`}
            style={{
              position: "absolute",
              top: -5 * scale,
              insetInlineEnd: -8 * scale,
              minWidth: 20 * scale,
              height: 20 * scale,
              padding: `0 ${5 * scale}px`,
              boxSizing: "border-box",
              borderRadius: 999,
              background: theme.colors.badge,
              color: theme.colors.badgeText,
              border: `${1.5 * scale}px solid ${theme.appearance === "light" ? "rgba(255,255,255,.9)" : "rgba(18,18,22,.9)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: theme.fontFamily,
              fontSize: 11 * scale,
              lineHeight: 1,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {app.badge > 99 ? "99+" : app.badge}
          </div>
        ) : null}
      </div>

      {showLabel ? (
        <span
          style={{
            width: size + theme.geometry.pointScale * 14,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center",
            color: labelColor,
            fontFamily: theme.fontFamily,
            fontSize: theme.geometry.home.labelSize,
            fontWeight: 500,
            lineHeight: 1.15,
            textShadow: labelShadow,
          }}
        >
          {app.label}
        </span>
      ) : null}
    </div>
  );
};
