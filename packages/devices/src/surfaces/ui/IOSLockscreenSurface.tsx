import React from "react";
import type { LockscreenProjection } from "../contract.js";
import { LockscreenControl, LockIcon } from "./LockscreenPrimitives.js";
import { SystemWallpaper } from "./Wallpaper.js";

export function IOSLockscreenSurface({ projection }: { projection: LockscreenProjection }) {
  if (projection.theme.platform !== "ios") {
    throw new Error("SYSTEM_SURFACE_PLATFORM_MISMATCH: iOS lock painter received Android data.");
  }
  const { theme, layout } = projection;
  const native = projection.notificationUX === "native";
  const lock = layout.lock;
  const inset = layout.pointScale * 26;
  const shadow =
    theme.appearance === "dark" ? "0 3px 18px rgba(0,0,0,.32)" : "0 2px 10px rgba(255,255,255,.4)";
  return (
    <div
      data-system-surface="lockscreen"
      data-system-painter="ios-lockscreen@1"
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
      <div
        aria-label={projection.authenticated ? undefined : projection.strings.deviceLocked}
        aria-hidden={projection.authenticated || undefined}
        data-authenticated={projection.authenticated || undefined}
        style={{
          position: "absolute",
          top: layout.pointScale * 57,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
        }}
      >
        <LockIcon color={theme.colors.primaryText} size={layout.pointScale * 17} unlocked={projection.authenticated} />
      </div>
      <div
        style={{
          position: "absolute",
          top: lock.dateTop,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: lock.dateSize,
          fontWeight: native ? 500 : 600,
          lineHeight: 1.15,
          letterSpacing: -0.15 * layout.pointScale,
          textShadow: shadow,
          zIndex: 2,
        }}
      >
        {projection.strings.date}
      </div>
      <div
        data-system-region="lockscreen.clock"
        style={{
          position: "absolute",
          top: lock.clockTop,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: lock.clockSize,
          fontWeight: native ? 600 : 240,
          lineHeight: 0.93,
          letterSpacing: -3.1 * layout.pointScale,
          fontVariantNumeric: "tabular-nums",
          textShadow: shadow,
          zIndex: 2,
        }}
      >
        {projection.time}
      </div>
      <div
        data-system-region="lockscreen.controls"
        style={{
          position: "absolute",
          left: inset,
          right: inset,
          bottom: lock.controlsBottom,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 3,
        }}
      >
        <LockscreenControl
          label={projection.strings.flashlight}
          kind="flashlight"
          projection={projection}
        />
        <LockscreenControl
          label={projection.strings.camera}
          kind="camera"
          projection={projection}
        />
      </div>
    </div>
  );
}
