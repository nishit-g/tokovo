import React from "react";
import type { NotificationSurfaceProps } from "../NotificationSurface.js";
import { NotificationPainter, type NotificationPainterSpec } from "./NotificationPainter.js";

function ShadeGlyph({
  kind,
  size,
}: {
  kind: "internet" | "bluetooth" | "dnd" | "rotate";
  size: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (kind === "internet")
    return (
      <svg {...common}>
        <path d="M3.5 8.5a13 13 0 0 1 17 0M6.5 12a8.2 8.2 0 0 1 11 0M9.5 15.5a3.8 3.8 0 0 1 5 0" />
        <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  if (kind === "bluetooth")
    return (
      <svg {...common}>
        <path d="m8 7 8 10V7l-8 10M12 3v18" />
      </svg>
    );
  if (kind === "dnd")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M7.5 12h9" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M7 5.5A8 8 0 0 1 19.5 11M17 5v6h-6M17 18.5A8 8 0 0 1 4.5 13M7 19v-6h6" />
    </svg>
  );
}

const ANDROID_SPEC: NotificationPainterSpec = {
  id: "android-notification-shade@1",
  uppercaseAppName: false,
  titleWeight: 600,
  communicationIconScale: 1.48,
  stackedGroups: false,
  centerHeader: (projection, pointScale) => {
    const active = projection.theme.colors.action;
    const inactive = projection.theme.colors.cardSecondary;
    const toggle = (kind: "internet" | "bluetooth" | "dnd" | "rotate", enabled: boolean) => (
      <div
        style={{
          height: 40 * pointScale,
          borderRadius: 22 * pointScale,
          background: enabled ? active : inactive,
          color: enabled ? projection.theme.colors.card : projection.theme.colors.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ShadeGlyph kind={kind} size={19 * pointScale} />
      </div>
    );
    return (
      <header
        style={{
          color: projection.theme.colors.text,
          fontFamily: projection.theme.typography.fontFamily,
          marginBottom: 16 * pointScale,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            direction: "ltr",
          }}
        >
          <div
            style={{ fontSize: 38 * pointScale, fontWeight: 500, letterSpacing: -1.2 * pointScale }}
          >
            {projection.clockLabel}
          </div>
          <div
            style={{
              color: projection.theme.colors.secondaryText,
              fontSize: 13 * pointScale,
              fontWeight: 500,
            }}
          >
            {projection.dateLabel}
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8 * pointScale,
            marginTop: 14 * pointScale,
          }}
        >
          {toggle("internet", true)}
          {toggle("bluetooth", true)}
          {toggle("dnd", projection.deviceContext.dnd)}
          {toggle("rotate", false)}
        </div>
        <div
          style={{
            height: 26 * pointScale,
            marginTop: 12 * pointScale,
            padding: `0 ${10 * pointScale}px`,
            borderRadius: 14 * pointScale,
            background: inactive,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 14 * pointScale,
              height: 14 * pointScale,
              border: `${1.5 * pointScale}px solid currentColor`,
              borderRadius: "50%",
              position: "relative",
            }}
          />
          <div
            style={{
              height: 3 * pointScale,
              flex: 1,
              marginInline: 9 * pointScale,
              borderRadius: 2 * pointScale,
              background: projection.theme.colors.secondaryText,
              opacity: 0.45,
            }}
          >
            <div
              style={{ width: "62%", height: "100%", borderRadius: "inherit", background: active }}
            />
          </div>
        </div>
        <div style={{ marginTop: 18 * pointScale, fontSize: 20 * pointScale, fontWeight: 650 }}>
          {projection.strings.centerTitle}
        </div>
      </header>
    );
  },
};

export const AndroidNotificationPainter = React.memo(function AndroidNotificationPainter({
  projection,
  pointScale = 1,
}: NotificationSurfaceProps) {
  if (projection.platform !== "android") {
    throw new Error(
      "NOTIFICATION_PAINTER_PLATFORM_MISMATCH: Android painter received a non-Android projection.",
    );
  }
  return (
    <NotificationPainter projection={projection} pointScale={pointScale} spec={ANDROID_SPEC} />
  );
});
