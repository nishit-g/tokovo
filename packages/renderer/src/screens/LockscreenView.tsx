import React from "react";
import { LayoutState, LockscreenLayoutState, Notification } from "@tokovo/core";
import type { DeviceProfile } from "@tokovo/devices";
import { getIOSChromeMetrics } from "@tokovo/devices";
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
  deviceProfile?: DeviceProfile;
}

export const LockscreenView: React.FC<LockscreenViewProps> = ({
  notifications = [],
  layout,
  variant = "ios",
  time,
  date,
  timestampMs,
  deviceProfile,
}) => {
  const isAndroid = variant === "android";
  const iosMetrics =
    !isAndroid && deviceProfile ? getIOSChromeMetrics(deviceProfile) : null;
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
          "radial-gradient(1100px 820px at 50% -6%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 28%, rgba(0,0,0,0) 66%)",
          "radial-gradient(1200px 900px at 20% 15%, rgba(120, 180, 255, 0.22) 0%, rgba(0,0,0,0) 55%)",
          "radial-gradient(1100px 800px at 85% 30%, rgba(255, 120, 200, 0.14) 0%, rgba(0,0,0,0) 60%)",
          "linear-gradient(180deg, #040507 0%, #10131b 45%, #07090d 100%)",
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
      <div
        style={{
          marginTop: iosMetrics?.lockscreen.clockTop ?? 168,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: iosMetrics?.lockscreen.clockFontSize ?? 208,
            fontWeight: 200,
            letterSpacing: iosMetrics?.lockscreen.clockLetterSpacing ?? -8,
            lineHeight: 0.92,
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 18px 54px rgba(0,0,0,0.42)",
          }}
        >
          {displayTime}
        </div>
        <div
          style={{
            marginTop: iosMetrics?.lockscreen.dateMarginTop ?? 16,
            fontSize: iosMetrics?.lockscreen.dateFontSize ?? 44,
            fontWeight: 600,
            opacity: 0.92,
            letterSpacing: -0.2,
            textShadow: "0 10px 26px rgba(0,0,0,0.3)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: `${2.5 * (iosMetrics?.pointScale ?? 3)}px ${7 * (iosMetrics?.pointScale ?? 3)}px`,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px) saturate(150%)",
            WebkitBackdropFilter: "blur(20px) saturate(150%)",
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
            paddingBottom:
              iosMetrics?.lockscreen.notificationBottomPadding ?? 250,
            paddingLeft: iosMetrics?.lockscreen.notificationSideInset ?? 42,
            paddingRight: iosMetrics?.lockscreen.notificationSideInset ?? 42,
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
              const stackOffset =
                index * (iosMetrics?.lockscreen.notificationStackOffset ?? 12);
              const stackScale = 1 - index * 0.018;

              return (
                <div
                  key={notification.id}
                  style={{
                    marginBottom:
                      index === 0
                        ? 0
                        : -(iosMetrics?.lockscreen.notificationOverlap ?? 110),
                    opacity: opacity * (1 - index * 0.2),
                    transform: `translateY(${translateY + stackOffset}px) scale(${stackScale})`,
                    transformOrigin: "bottom center",
                    zIndex: 10 - index,
                    filter: index === 0 ? "none" : "saturate(0.92)",
                  }}
                >
                  <NotificationCard
                    notification={notification}
                    pointScale={iosMetrics?.pointScale ?? 3}
                  />
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
          height: iosMetrics?.lockscreen.bottomControlsHeight ?? 270,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: `0 ${iosMetrics?.lockscreen.bottomControlsPaddingX ?? 60}px`,
        }}
      >
        {!isAndroid && (
          <>
            <LockscreenButton
              icon="flashlight"
              size={iosMetrics?.lockscreen.bottomButtonSize}
              iconSize={iosMetrics?.lockscreen.bottomButtonIconSize}
            />
            <LockscreenButton
              icon="camera"
              size={iosMetrics?.lockscreen.bottomButtonSize}
              iconSize={iosMetrics?.lockscreen.bottomButtonIconSize}
            />
          </>
        )}
      </div>

      {/* Home Indicator */}
      <div
        style={{
          position: "absolute",
          bottom: iosMetrics?.homeIndicator.bottom ?? 26,
          left: "50%",
          transform: "translateX(-50%)",
          width: iosMetrics?.homeIndicator.width ?? 380,
          height: iosMetrics?.homeIndicator.height ?? 12,
          backgroundColor: "rgba(255, 255, 255, 0.46)",
          borderRadius: iosMetrics?.homeIndicator.radius ?? 999,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      />
    </div>
  );
};

/**
 * Lockscreen control button
 */
const LockscreenButton: React.FC<{
  icon: "flashlight" | "camera";
  size?: number;
  iconSize?: number;
}> = ({
  icon,
  size = 150,
  iconSize = 54,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.11) 100%)",
      backdropFilter: "blur(30px) saturate(160%)",
      WebkitBackdropFilter: "blur(30px) saturate(160%)",
      border: "1px solid rgba(255, 255, 255, 0.14)",
      boxShadow: "0 16px 44px rgba(0,0,0,0.42)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {icon === "flashlight" ? (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="white">
        <path d="M9 2h6v6l2 2v12H7V10l2-2V2zm2 2v4h2V4h-2zm-1 7.5v8h4v-8l-2-2-2 2z" />
      </svg>
    ) : (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="white">
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
  pointScale?: number;
}> = ({ notification, pointScale = 3 }) => {
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
          width: 22 * pointScale,
          height: 22 * pointScale,
          borderRadius: 5 * pointScale,
          background: meta.themeColor || "#8E8E93",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10 * pointScale,
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
          "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.09) 100%)",
        backdropFilter: "blur(54px) saturate(1.45)",
        WebkitBackdropFilter: "blur(54px) saturate(1.45)",
        borderRadius: 16 * pointScale,
        padding: `${10 * pointScale}px ${12.5 * pointScale}px`,
        color: "white",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 20px 72px rgba(0,0,0,0.42)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6 * pointScale,
          marginBottom: 4.5 * pointScale,
        }}
      >
        {appIcon}
        <span
          style={{
            fontSize: 9 * pointScale,
            opacity: 0.66,
            fontWeight: 600,
            letterSpacing: 0.4 * pointScale,
          }}
        >
          {appName.toUpperCase()}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 8.5 * pointScale,
            opacity: 0.42,
          }}
        >
          now
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          fontSize: 13.5 * pointScale,
          fontWeight: 700,
          marginBottom: 3.4 * pointScale,
          letterSpacing: -0.4,
        }}
      >
        {ir.title}
      </div>
      <div
        style={{
          fontSize: 12.4 * pointScale,
          opacity: 0.92,
          lineHeight: 1.3,
          letterSpacing: -0.22,
        }}
      >
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
