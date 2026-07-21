import React from "react";
import type { LockscreenProjection } from "../contract.js";
import { SystemWallpaper } from "./Wallpaper.js";

const FlashlightIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M8 3h8l-1.2 6.1a4 4 0 0 1-1.1 2L13 12v8.5a1 1 0 0 1-2 0V12l-.7-.9a4 4 0 0 1-1.1-2L8 3Z" fill={color} />
    <path d="M9 6h6" stroke={color === "#FFFFFF" ? "#111" : "white"} strokeWidth="1.4" opacity=".34" />
  </svg>
);

const CameraIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7.5 7 9 4.8h6L16.5 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2.5Z" fill={color} />
    <circle cx="12" cy="13" r="3.5" fill={color === "#FFFFFF" ? "#222" : "white"} opacity=".72" />
  </svg>
);

const LockIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="6" y="10" width="12" height="10" rx="3" fill={color} />
    <path d="M9 10V7a3 3 0 0 1 6 0v3" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
  </svg>
);

const Control: React.FC<{
  label: string;
  kind: "flashlight" | "camera";
  projection: LockscreenProjection;
}> = ({ label, kind, projection }) => {
  const { theme } = projection;
  const lock = theme.geometry.lock;
  return (
    <div
      role="img"
      aria-label={label}
      style={{
        width: lock.controlSize,
        height: lock.controlSize,
        borderRadius: "50%",
        background: theme.colors.chrome,
        border: `1px solid ${theme.colors.chromeBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 3px 10px rgba(0, 0, 0, 0.18)",
      }}
    >
      {kind === "flashlight"
        ? <FlashlightIcon color={theme.colors.primaryText} size={lock.controlIconSize} />
        : <CameraIcon color={theme.colors.primaryText} size={lock.controlIconSize} />}
    </div>
  );
};

export const LockscreenSurface: React.FC<{ projection: LockscreenProjection }> = ({ projection }) => {
  const { theme } = projection;
  const lock = theme.geometry.lock;
  const android = theme.platform === "android";
  const inlineStart = theme.geometry.pointScale * 26;

  return (
    <div
      data-system-surface="lockscreen"
      data-theme={theme.id}
      dir={projection.direction}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        color: theme.colors.primaryText,
        fontFamily: theme.fontFamily,
      }}
    >
      <SystemWallpaper wallpaper={projection.wallpaper} />

      {android ? (
        <div
          aria-label={projection.strings.deviceLocked}
          style={{
            position: "absolute",
            top: theme.geometry.pointScale * 55,
            left: "50%",
            transform: "translateX(-50%)",
            width: theme.geometry.pointScale * 28,
            height: theme.geometry.pointScale * 28,
            borderRadius: "50%",
            background: theme.colors.chrome,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LockIcon color={theme.colors.primaryText} size={theme.geometry.pointScale * 14} />
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          top: lock.dateTop,
          left: android && projection.direction === "ltr" ? inlineStart : android ? undefined : 0,
          right: android && projection.direction === "rtl" ? inlineStart : android ? undefined : 0,
          textAlign: android ? "start" : "center",
          color: theme.colors.primaryText,
          fontSize: lock.dateSize,
          fontWeight: android ? 500 : 600,
          lineHeight: 1.15,
          letterSpacing: android ? 0 : -0.15 * theme.geometry.pointScale,
          textShadow: theme.appearance === "dark" ? "0 2px 12px rgba(0, 0, 0, 0.34)" : "0 1px 8px rgba(255, 255, 255, 0.5)",
          zIndex: 2,
        }}
      >
        {projection.strings.date}
      </div>

      {android ? (
        <div
          dir="ltr"
          data-system-region="lockscreen.clock"
          style={{
            position: "absolute",
            top: lock.clockTop,
            left: projection.direction === "ltr" ? inlineStart : undefined,
            right: projection.direction === "rtl" ? inlineStart : undefined,
            color: theme.colors.primaryText,
            fontSize: lock.androidClockSize,
            fontWeight: 400,
            lineHeight: 0.78,
            letterSpacing: -4 * theme.geometry.pointScale,
            fontVariantNumeric: "tabular-nums",
            textAlign: projection.direction === "rtl" ? "right" : "left",
            zIndex: 2,
          }}
        >
          <div>{projection.androidClockRows[0]}</div>
          <div>{projection.androidClockRows[1]}</div>
        </div>
      ) : (
        <div
          data-system-region="lockscreen.clock"
          style={{
            position: "absolute",
            top: lock.clockTop,
            left: 0,
            right: 0,
            textAlign: "center",
            color: theme.colors.primaryText,
            fontSize: lock.clockSize,
            fontWeight: 240,
            lineHeight: 0.93,
            letterSpacing: -3.1 * theme.geometry.pointScale,
            fontVariantNumeric: "tabular-nums",
            textShadow: theme.appearance === "dark" ? "0 3px 18px rgba(0, 0, 0, 0.32)" : "0 2px 10px rgba(255, 255, 255, 0.4)",
            zIndex: 2,
          }}
        >
          {projection.time}
        </div>
      )}

      <div
        data-system-region="lockscreen.controls"
        style={{
          position: "absolute",
          left: inlineStart,
          right: inlineStart,
          bottom: lock.controlsBottom,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 3,
        }}
      >
        <Control label={projection.strings.flashlight} kind="flashlight" projection={projection} />
        <Control label={projection.strings.camera} kind="camera" projection={projection} />
      </div>

      {android ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: theme.geometry.pointScale * 5,
            left: "50%",
            transform: "translateX(-50%)",
            width: theme.geometry.pointScale * 108,
            height: theme.geometry.pointScale * 4,
            borderRadius: 999,
            background: theme.colors.primaryText,
            opacity: 0.86,
            zIndex: 3,
          }}
        />
      ) : null}
    </div>
  );
};
