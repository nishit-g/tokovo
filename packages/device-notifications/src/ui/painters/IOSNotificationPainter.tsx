import React from "react";
import type { NotificationSurfaceProps } from "../NotificationSurface.js";
import { NotificationPainter, type NotificationPainterSpec } from "./NotificationPainter.js";

const IOS_SPEC: NotificationPainterSpec = {
  id: "ios-notification-center@1",
  uppercaseAppName: true,
  titleWeight: 700,
  communicationIconScale: 1.42,
  stackedGroups: true,
  centerHeader: (projection, pointScale) => (
    <header
      style={{
        color: projection.theme.colors.text,
        fontFamily: projection.theme.typography.fontFamily,
        textAlign: "center",
        marginBottom: 18 * pointScale,
      }}
    >
      <div
        style={{
          color: projection.theme.colors.secondaryText,
          fontSize: 15 * pointScale,
          fontWeight: 600,
          letterSpacing: 0.1 * pointScale,
        }}
      >
        {projection.dateLabel}
      </div>
      <div
        style={{
          marginTop: -2 * pointScale,
          fontSize: 52 * pointScale,
          fontWeight: 500,
          letterSpacing: -2.2 * pointScale,
          lineHeight: 1.08,
        }}
      >
        {projection.clockLabel}
      </div>
      <div
        style={{
          marginTop: 16 * pointScale,
          textAlign: "start",
          fontSize: 24 * pointScale,
          fontWeight: 750,
        }}
      >
        {projection.strings.centerTitle}
      </div>
    </header>
  ),
};

export const IOSNotificationPainter = React.memo(function IOSNotificationPainter({
  projection,
  pointScale = 1,
}: NotificationSurfaceProps) {
  if (projection.platform !== "ios") {
    throw new Error(
      "NOTIFICATION_PAINTER_PLATFORM_MISMATCH: iOS painter received a non-iOS projection.",
    );
  }
  return <NotificationPainter projection={projection} pointScale={pointScale} spec={IOS_SPEC} />;
});
