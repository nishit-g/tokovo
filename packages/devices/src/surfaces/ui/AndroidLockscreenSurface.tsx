import React from "react";
import { materialToPaintStyle } from "@tokovo/visual-system";
import type { LockscreenProjection } from "../contract.js";
import { LockscreenControl, LockIcon } from "./LockscreenPrimitives.js";
import { SystemWallpaper } from "./Wallpaper.js";

export function AndroidLockscreenSurface({ projection }: { projection: LockscreenProjection }) {
  if (projection.theme.platform !== "android") {
    throw new Error("SYSTEM_SURFACE_PLATFORM_MISMATCH: Android lock painter received iOS data.");
  }
  const { theme, layout } = projection;
  const lock = layout.lock;
  const inset = layout.pointScale * 26;
  return (
    <div
      data-system-surface="lockscreen"
      data-system-painter="android-lockscreen@1"
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
        aria-label={projection.strings.deviceLocked}
        style={{
          position: "absolute",
          top: layout.pointScale * 55,
          left: "50%",
          transform: "translateX(-50%)",
          width: layout.pointScale * 28,
          height: layout.pointScale * 28,
          borderRadius: "50%",
          ...materialToPaintStyle(theme.materials.chrome, layout.pointScale),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LockIcon color={theme.colors.primaryText} size={layout.pointScale * 14} />
      </div>
      <div
        style={{
          position: "absolute",
          top: lock.dateTop,
          insetInlineStart: inset,
          fontSize: lock.dateSize,
          fontWeight: 500,
          lineHeight: 1.15,
          textShadow: "0 2px 12px rgba(0,0,0,.34)",
          zIndex: 2,
        }}
      >
        {projection.strings.date}
      </div>
      <div
        dir="ltr"
        data-system-region="lockscreen.clock"
        style={{
          position: "absolute",
          top: lock.clockTop,
          insetInlineStart: inset,
          color: theme.colors.primaryText,
          fontSize: lock.androidClockSize,
          fontWeight: 400,
          lineHeight: 0.78,
          letterSpacing: -4 * layout.pointScale,
          fontVariantNumeric: "tabular-nums",
          textAlign: "start",
          zIndex: 2,
        }}
      >
        <div>{projection.androidClockRows[0]}</div>
        <div>{projection.androidClockRows[1]}</div>
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
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: layout.pointScale * 5,
          left: "50%",
          transform: "translateX(-50%)",
          width: layout.pointScale * 108,
          height: layout.pointScale * 4,
          borderRadius: 999,
          background: theme.colors.primaryText,
          opacity: 0.86,
          zIndex: 3,
        }}
      />
    </div>
  );
}
