import React from "react";
import {
  requireAppStateForDevice,
  type DeviceState,
  type WorldState,
} from "@tokovo/core";
import type { WidgetProps } from "@tokovo/react";
import {
  DynamicIslandSurface,
  type DeviceProfile,
  type DynamicIslandProjection,
} from "@tokovo/devices";
import { useRendererRegistries } from "../RegistryContext.js";

interface DynamicIslandProps {
  deviceId: string;
  device: DeviceState;
  deviceProfile: DeviceProfile;
  world: WorldState;
  t: number;
  projection: DynamicIslandProjection;
}

/**
 * Renderer integration for the device-owned Dynamic Island surface.
 *
 * Priority is deterministic: screen capture > explicit device activity >
 * plugin Live Activity > physical idle island.
 */
export const DynamicIsland = React.memo(function DynamicIsland({
  deviceId,
  device,
  deviceProfile,
  world,
  t,
  projection,
}: DynamicIslandProps) {
  const registries = useRendererRegistries();
  if (!deviceProfile.dynamicIsland) return null;

  const ownsSystemSurface =
    projection.phase !== "idle" || Boolean(projection.completionBanner);
  if (ownsSystemSurface) {
    return <DynamicIslandSurface projection={projection} />;
  }

  const activeAppIds = device.backgroundApps?.map((activity) => activity.appId) ?? [];
  const resolved = registries.plugins.widgets.resolve(
    "dynamicIsland",
    deviceProfile.platform,
    activeAppIds,
  );
  if (!resolved) {
    return <DynamicIslandSurface projection={projection} />;
  }

  const backgroundApp = device.backgroundApps?.find(
    (activity) => activity.appId === resolved.appId,
  );
  const widgetProps: WidgetProps = {
    appState: requireAppStateForDevice(world, resolved.appId, deviceId),
    backgroundApp,
    deviceProfile: { dynamicIsland: deviceProfile.dynamicIsland },
    currentFrame: t,
    expansionMode: "compact",
    platform: deviceProfile.platform,
  };
  const WidgetComponent = resolved.widget.component;

  return (
    <div
      style={{
        position: "absolute",
        top: deviceProfile.dynamicIsland.topY,
        left: "50%",
        transform: "translate3d(-50%,0,0)",
        zIndex: 1004,
        pointerEvents: "none",
      }}
    >
      <WidgetComponent {...widgetProps} />
    </div>
  );
});

export default DynamicIsland;
