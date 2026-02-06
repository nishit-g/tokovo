import React from "react";
import { LayoutState, LockscreenLayoutState, Notification } from "@tokovo/core";
import { useRendererRegistries } from "../RegistryContext.js";

/**
 * iOS "26" concept locksreen (Tokovo)
 *
 * Goals:
 * - Deterministic, readable, and cinematic at 1080x1920 renders
 * - Single source of truth: `device.notifications`
 * - High-fidelity glass + depth without external assets/fonts
 */

// APP_LOGOS Removed. Using AppMetadataRegistry.

interface LockscreenViewProps {
  notifications?: Notification[];
  layout?: LayoutState;
  variant?: "ios" | "android";
  time?: string;
  date?: string;
  timestampMs?: number;
}

export const LockscreenView: React.FC<LockscreenViewProps> = ({
  notifications = [],
  layout,
  variant = "ios",
  time,
  date,
  timestampMs,
}) => {
  const isAndroid = variant === "android";
  const lockscreenLayout =
    layout?.kind === "LOCKSCREEN" ? (layout as LockscreenLayoutState) : null;
  const clockMs = timestampMs ?? DEFAULT_CLOCK_MS;
  const displayTime = time ?? formatClockTime(clockMs);
  const displayDate = date ?? formatClockDate(clockMs);

  const activeNotifications = notifications.filter((n) => {
    if (n.dismissedAtFrame !== undefined) return false;
    const mode = n.mode || "both";
    return mode === "lockscreen" || mode === "both";
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: [
          "radial-gradient(1200px 900px at 20% 15%, rgba(120, 180, 255, 0.22) 0%, rgba(0,0,0,0) 55%)",
          "radial-gradient(1100px 800px at 85% 30%, rgba(255, 120, 200, 0.14) 0%, rgba(0,0,0,0) 60%)",
          "linear-gradient(180deg, #050507 0%, #121218 55%, #08080b 100%)",
        ].join(", "),
        display: "flex",
        flexDirection: "column",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* Subtle grain for depth (deterministic) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)",
          opacity: 0.08,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      >
      </div>

      {/* Time block */}
      <div style={{ marginTop: 168, textAlign: "center" }}>
        <div
          style={{
            fontSize: 208,
            fontWeight: 200,
            letterSpacing: -8,
            lineHeight: 0.92,
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 22px 70px rgba(0,0,0,0.55)",
          }}
        >
          {displayTime}
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 44,
            fontWeight: 600,
            opacity: 0.92,
            letterSpacing: -0.2,
            textShadow: "0 16px 50px rgba(0,0,0,0.45)",
          }}
        >
          {displayDate}
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Notifications stack */}
      {activeNotifications.length > 0 && (
        <div
          style={{
            paddingBottom: 250,
            paddingLeft: 42,
            paddingRight: 42,
          }}
        >
          {activeNotifications
            .slice(-4)
            .reverse()
            .map((notification, index) => {
              const nl = lockscreenLayout?.notificationLayouts.find(
                (l) => l.id === notification.id,
              );
              const opacity = nl?.opacity ?? 1;
              const translateY = nl?.translateY ?? 0;
              const stackOffset = index * 12;
              const stackScale = 1 - index * 0.018;

              return (
                <div
                  key={notification.id}
                  style={{
                    marginBottom: index === 0 ? 0 : -110,
                    opacity: opacity * (1 - index * 0.2),
                    transform: `translateY(${translateY + stackOffset}px) scale(${stackScale})`,
                    transformOrigin: "bottom center",
                    zIndex: 10 - index,
                    filter: index === 0 ? "none" : "saturate(0.92)",
                  }}
                >
                  <NotificationCard notification={notification} />
                </div>
              );
            })}

          {activeNotifications.length > 4 && (
            <div
              style={{
                textAlign: "center",
                marginTop: 26,
                fontSize: 30,
                opacity: 0.55,
                fontWeight: 600,
              }}
            >
              +{activeNotifications.length - 4} more
            </div>
          )}
        </div>
      )}

      {/* Bottom Buttons */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 270,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 60px",
        }}
      >
        {!isAndroid && (
          <>
            <LockscreenButton icon="flashlight" />
            <LockscreenButton icon="camera" />
          </>
        )}
      </div>

      {/* Home Indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 26,
          left: "50%",
          transform: "translateX(-50%)",
          width: 380,
          height: 12,
          backgroundColor: "rgba(255, 255, 255, 0.46)",
          borderRadius: 999,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      />
    </div>
  );
};

/**
 * Lockscreen control button
 */
const LockscreenButton: React.FC<{ icon: "flashlight" | "camera" }> = ({
  icon,
}) => (
  <div
    style={{
      width: 150,
      height: 150,
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.14)",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
      border: "1px solid rgba(255, 255, 255, 0.16)",
      boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {icon === "flashlight" ? (
      <svg width="54" height="54" viewBox="0 0 24 24" fill="white">
        <path d="M9 2h6v6l2 2v12H7V10l2-2V2zm2 2v4h2V4h-2zm-1 7.5v8h4v-8l-2-2-2 2z" />
      </svg>
    ) : (
      <svg width="54" height="54" viewBox="0 0 24 24" fill="white">
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="12" cy="12" r="4" fill="white" />
      </svg>
    )}
  </div>
);

/**
 * Notification Card with app icon
 */
const NotificationCard: React.FC<{
  notification: Notification; // Is actually NotificationInstance
}> = ({ notification }) => {
  const registries = useRendererRegistries();
  const ir = notification.ir;
  if (!ir) return null; // Safety check

  // Decoupled: Use Registry
  // Since this is a React component, we might need to handle the case where "icon" is a string or component.
  // Ideally we pass it as a prop or context, but for now we look it up.
  // Note: In strict React, side-effect imports inside render are bad, but this is a static registry.
  const meta = registries.plugins.metadata.get(ir.appId);

  const appIcon =
    typeof meta.icon === "string" ? (
      <div
        style={{
          width: 66,
          height: 66,
          borderRadius: 15,
          background: meta.themeColor || "#8E8E93",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
          color: "white",
        }}
      >
        {meta.icon}
      </div>
    ) : (
      // It's a React Node (SVG)
      meta.icon
    );

  const appName = meta.displayName || "APP";

  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.07) 100%)",
        backdropFilter: "blur(70px) saturate(1.25)",
        WebkitBackdropFilter: "blur(70px) saturate(1.25)",
        borderRadius: 50,
        padding: "32px 38px",
        color: "white",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 26px 90px rgba(0,0,0,0.55)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginBottom: 14,
        }}
      >
        {appIcon}
        <span
          style={{
            fontSize: 28,
            opacity: 0.66,
            fontWeight: 600,
            letterSpacing: 1.3,
          }}
        >
          {appName.toUpperCase()}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 26, opacity: 0.42 }}>
          now
        </span>
      </div>

      {/* Content */}
      <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 10 }}>
        {ir.title}
      </div>
      <div style={{ fontSize: 40, opacity: 0.92, lineHeight: 1.32 }}>
        {ir.body}
      </div>
    </div>
  );
};

/**
 * Format date
 */
const DEFAULT_CLOCK_MS = Date.parse("2024-01-01T09:41:00Z");

function formatClockTime(timestampMs: number): string {
  const date = new Date(timestampMs);
  const hour24 = date.getUTCHours();
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minutes = date.getUTCMinutes();
  return `${hour12}:${minutes.toString().padStart(2, "0")}`;
}

function formatClockDate(timestampMs: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const now = new Date(timestampMs);
  return `${days[now.getUTCDay()]}, ${months[now.getUTCMonth()]} ${now.getUTCDate()}`;
}
