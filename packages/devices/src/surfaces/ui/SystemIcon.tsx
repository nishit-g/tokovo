import React from "react";
import { DeterministicImage } from "@tokovo/react";
import type { AppIcon } from "@tokovo/core";
import type { SystemSurfaceLayout, SystemSurfaceTheme } from "../contract.js";

function isImageSource(value: string): boolean {
  return /^(?:https?:\/\/|\/|data:|r2:\/\/)/u.test(value);
}

const BubbleGlyph: React.FC<{ phone?: boolean }> = ({ phone = false }) => (
  <svg width="64%" height="64%" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path
      d="M12 28c0-11 9-19 20-19s20 8 20 19-9 19-20 19c-3.3 0-6.4-.7-9.2-2.1L13 50l2.7-9.3A18.6 18.6 0 0 1 12 28Z"
      fill="white"
    />
    {phone ? (
      <path
        d="M25 19c1.5-1 3.4-.5 4.2 1l2.1 4.2c.7 1.4.4 3-.8 4l-1.6 1.4c2.2 4.1 4.9 6.8 9 9l1.5-1.7a3.1 3.1 0 0 1 3.8-.7l4 2.2c1.6.8 2.1 2.8 1.1 4.3-1.4 2-3.8 3.5-6.4 3.5-11.8 0-24.1-12.3-24.1-24.1 0-2.7 1.3-5.1 3.4-6.5l3.8-2.6Z"
        fill="#20B85A"
        transform="scale(.75) translate(11 10)"
      />
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
    <path
      d="M32 8c-10 0-16 8-16 18v9c0 4-4 7-8 8 2 4 6 5 10 4 2 5 7 8 14 8s12-3 14-8c4 1 8 0 10-4-4-1-8-4-8-8v-9C48 16 42 8 32 8Z"
      fill="white"
      stroke="#111"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
  </svg>
);

const SystemGlyph: React.FC<{
  kind:
    | "phone"
    | "browser"
    | "calendar"
    | "photos"
    | "clock"
    | "maps"
    | "weather"
    | "notes"
    | "files"
    | "store"
    | "settings"
    | "mail"
    | "music";
}> = ({ kind }) => {
  if (kind === "phone") {
    return (
      <svg width="58%" height="58%" viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M18 10c3-2 6-1 8 2l5 10c1 3 1 5-2 7l-4 3c4 8 9 13 17 17l3-4c2-2 5-3 7-1l9 5c3 2 4 5 2 8-3 5-8 8-14 7C28 61 3 36 6 15c1-3 5-4 12-5Z"
          fill="white"
        />
      </svg>
    );
  }
  if (kind === "browser") {
    return (
      <svg width="70%" height="70%" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="27" fill="white" opacity=".95" />
        <path d="m38 16-9 12-5 19 12-11 5-20Z" fill="#147EFB" />
        <circle cx="32" cy="32" r="4" fill="#EF4444" />
      </svg>
    );
  }
  if (kind === "calendar") {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="13" fill="white" />
        <path d="M0 13h64v12H0z" fill="#FF3B30" />
        <text x="32" y="48" textAnchor="middle" fontSize="27" fontWeight="650" fill="#161618">
          21
        </text>
      </svg>
    );
  }
  if (kind === "photos") {
    return (
      <svg width="72%" height="72%" viewBox="0 0 64 64" aria-hidden="true">
        <g transform="translate(32 32)">
          {[
            "#FF3B30",
            "#FF9500",
            "#FFD60A",
            "#34C759",
            "#30B0C7",
            "#0A84FF",
            "#5E5CE6",
            "#AF52DE",
          ].map((color, index) => (
            <ellipse
              key={color}
              cx="0"
              cy="-14"
              rx="8"
              ry="16"
              fill={color}
              opacity=".9"
              transform={`rotate(${index * 45})`}
            />
          ))}
        </g>
        <circle cx="32" cy="32" r="7" fill="white" />
      </svg>
    );
  }
  if (kind === "clock") {
    return (
      <svg width="74%" height="74%" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="27" fill="#111" stroke="white" strokeWidth="3" />
        <path d="M32 17v16l11 6" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "maps") {
    return (
      <svg width="72%" height="72%" viewBox="0 0 64 64" aria-hidden="true">
        <path d="m7 13 16-6 18 6 16-6v44l-16 6-18-6-16 6Z" fill="white" />
        <path d="M23 7v44M41 13v44" stroke="#5ACB72" strokeWidth="8" />
        <path d="M5 38h54" stroke="#55A7FF" strokeWidth="7" />
        <path d="M44 19a8 8 0 1 0-16 0c0 7 8 15 8 15s8-8 8-15Z" fill="#FF3B30" />
      </svg>
    );
  }
  if (kind === "weather") {
    return (
      <svg width="70%" height="70%" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="24" cy="23" r="13" fill="#FFD60A" />
        <path d="M19 48h30a10 10 0 0 0 0-20 15 15 0 0 0-28 5h-2a8 8 0 0 0 0 15Z" fill="white" />
      </svg>
    );
  }
  if (kind === "notes") {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="13" fill="#FFFDF4" />
        <path d="M0 14h64v12H0z" fill="#FFD60A" />
        <path d="M12 35h40M12 44h34M12 53h28" stroke="#A8A6A0" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "files") {
    return (
      <svg width="66%" height="66%" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M7 17h21l5 6h24v27H7Z" fill="white" opacity=".96" />
        <path d="M7 17v-5h18l5 5" fill="none" stroke="white" strokeWidth="5" />
      </svg>
    );
  }
  if (kind === "store") {
    return (
      <svg width="66%" height="66%" viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M18 47 36 15M28 47h23M14 39h35"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === "settings") {
    return (
      <svg width="70%" height="70%" viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M28 5h8l2 8 7 3 7-4 6 6-4 7 3 7 8 2v8l-8 2-3 7 4 7-6 6-7-4-7 3-2 8h-8l-2-8-7-3-7 4-6-6 4-7-3-7-8-2v-8l8-2 3-7-4-7 6-6 7 4 7-3Z"
          fill="white"
          opacity=".9"
        />
        <circle cx="32" cy="38" r="9" fill="#74777D" />
      </svg>
    );
  }
  if (kind === "mail") {
    return (
      <svg width="68%" height="68%" viewBox="0 0 64 64" aria-hidden="true">
        <rect x="5" y="12" width="54" height="40" rx="7" fill="white" />
        <path d="m8 17 24 20 24-20" fill="none" stroke="#2F8CFF" strokeWidth="4" />
      </svg>
    );
  }
  return (
    <svg width="64%" height="64%" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M38 9v34a10 10 0 1 1-6-9V16l22-5v27a10 10 0 1 1-6-9V7Z" fill="white" />
    </svg>
  );
};

function builtInIdentity(
  appId: string,
): { background: string; foreground: React.ReactNode } | null {
  switch (appId) {
    case "app_whatsapp":
      return { background: "#20B85A", foreground: <BubbleGlyph phone /> };
    case "app_imessage":
      return { background: "#34C759", foreground: <BubbleGlyph /> };
    case "app_instagram":
      return {
        background:
          "radial-gradient(circle at 70% 72%, #FFD36B 0 12%, transparent 34%), linear-gradient(145deg, #6D36C7 4%, #C72D8E 48%, #F36B36 82%)",
        foreground: <InstagramGlyph />,
      };
    case "app_x":
      return {
        background: "#050505",
        foreground: <span style={{ color: "white", fontSize: "58%", fontWeight: 500 }}>𝕏</span>,
      };
    case "app_linkedin":
      return {
        background: "#0A66C2",
        foreground: <span style={{ color: "white", fontSize: "54%", fontWeight: 800 }}>in</span>,
      };
    case "app_teams":
      return {
        background: "#6264A7",
        foreground: <span style={{ color: "white", fontSize: "58%", fontWeight: 800 }}>T</span>,
      };
    case "app_snapchat":
      return { background: "#FFFC00", foreground: <GhostGlyph /> };
    case "app_camera":
      return {
        background: "linear-gradient(145deg, #74777D, #292B2F)",
        foreground: <CameraGlyph />,
      };
    case "system_phone":
      return {
        background: "linear-gradient(145deg,#5FE47A,#18AA4C)",
        foreground: <SystemGlyph kind="phone" />,
      };
    case "system_messages":
      return { background: "linear-gradient(145deg,#5FE47A,#18AA4C)", foreground: <BubbleGlyph /> };
    case "system_browser":
      return {
        background: "linear-gradient(145deg,#55B8FF,#0877EE)",
        foreground: <SystemGlyph kind="browser" />,
      };
    case "system_calendar":
      return { background: "#FFFFFF", foreground: <SystemGlyph kind="calendar" /> };
    case "system_photos":
      return { background: "#FFFFFF", foreground: <SystemGlyph kind="photos" /> };
    case "system_clock":
      return { background: "#111113", foreground: <SystemGlyph kind="clock" /> };
    case "system_maps":
      return { background: "#EAF7E9", foreground: <SystemGlyph kind="maps" /> };
    case "system_weather":
      return {
        background: "linear-gradient(#2189F7,#56C2FF)",
        foreground: <SystemGlyph kind="weather" />,
      };
    case "system_notes":
      return { background: "#FFFDF4", foreground: <SystemGlyph kind="notes" /> };
    case "system_files":
      return {
        background: "linear-gradient(#55B8FF,#176DE4)",
        foreground: <SystemGlyph kind="files" />,
      };
    case "system_store":
      return {
        background: "linear-gradient(#44B7FF,#0877EE)",
        foreground: <SystemGlyph kind="store" />,
      };
    case "system_settings":
      return {
        background: "linear-gradient(#AEB2B8,#686C72)",
        foreground: <SystemGlyph kind="settings" />,
      };
    case "system_mail":
      return {
        background: "linear-gradient(#54B8FF,#147EFB)",
        foreground: <SystemGlyph kind="mail" />,
      };
    case "system_music":
      return {
        background: "linear-gradient(145deg,#FF5B80,#F02D55)",
        foreground: <SystemGlyph kind="music" />,
      };
    default:
      return null;
  }
}

export const SystemAppIcon: React.FC<{
  app: AppIcon;
  size: number;
  radius: number;
  theme: SystemSurfaceTheme;
  layout: SystemSurfaceLayout;
  showLabel?: boolean;
}> = ({ app, size, radius, theme, layout, showLabel = true }) => {
  const identity = builtInIdentity(app.appId);
  const scale = size / layout.home.iconSize;
  const labelColor = theme.colors.primaryText;
  const labelShadow =
    theme.appearance === "light"
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
        gap: showLabel ? layout.home.labelGap : 0,
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
            boxShadow:
              theme.platform === "ios"
                ? "0 2px 5px rgba(0, 0, 0, 0.18), inset 0 0 0 1px rgba(255, 255, 255, 0.14)"
                : "0 2px 4px rgba(0, 0, 0, 0.2)",
            fontFamily: theme.fontFamily,
            fontSize: size,
          }}
        >
          {identity?.foreground ??
            (isImageSource(app.icon) ? (
              <DeterministicImage
                src={app.icon}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span
                style={{ color: theme.colors.primaryText, fontSize: size * 0.42, fontWeight: 750 }}
              >
                {(app.label.trim()[0] || "A").toUpperCase()}
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
            width: size + layout.pointScale * 14,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center",
            color: labelColor,
            fontFamily: theme.fontFamily,
            fontSize: layout.home.labelSize,
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
