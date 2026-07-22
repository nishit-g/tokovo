import React from "react";
import type { NotificationDeviceProjection } from "../contract/index.js";
import { requireNotificationSurfacePainter } from "./painters/registry.js";

export interface NotificationSurfaceProps {
  projection: NotificationDeviceProjection;
  pointScale?: number;
}

export const NotificationSurface = React.memo(function NotificationSurface(
  props: NotificationSurfaceProps,
) {
  const Painter = requireNotificationSurfacePainter(props.projection.platform);
  return <Painter {...props} />;
});
