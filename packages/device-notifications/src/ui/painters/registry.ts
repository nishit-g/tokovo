import type React from "react";
import type { NotificationPlatform } from "../../contract/index.js";
import type { NotificationSurfaceProps } from "../NotificationSurface.js";
import { AndroidNotificationPainter } from "./AndroidNotificationPainter.js";
import { IOSNotificationPainter } from "./IOSNotificationPainter.js";

export type NotificationSurfacePainter = React.ComponentType<NotificationSurfaceProps>;

const painters = new Map<NotificationPlatform, NotificationSurfacePainter>([
  ["ios", IOSNotificationPainter],
  ["android", AndroidNotificationPainter],
]);

export function registerNotificationSurfacePainter(
  platform: NotificationPlatform,
  painter: NotificationSurfacePainter,
): void {
  if (painters.has(platform)) {
    throw new Error(`NOTIFICATION_PAINTER_COLLISION: ${platform} already has a painter.`);
  }
  painters.set(platform, painter);
}

export function requireNotificationSurfacePainter(
  platform: NotificationPlatform,
): NotificationSurfacePainter {
  const painter = painters.get(platform);
  if (!painter) throw new Error(`NOTIFICATION_PAINTER_MISSING: no painter for ${platform}.`);
  return painter;
}
