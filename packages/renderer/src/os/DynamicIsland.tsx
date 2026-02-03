/**
 * DynamicIsland - iOS Dynamic Island Container
 *
 * Renders the Dynamic Island UI element at the top of iPhone screens.
 * Priority: HeadsUp Notification > Active Widget > Idle
 */

import React from "react";
import { WorldState, DeviceState, WidgetProps } from "@tokovo/core";
import { useRendererRegistries } from "../RegistryContext";
import { DeviceProfile, DynamicIslandConfig } from "@tokovo/devices";

interface DynamicIslandProps {
  device: DeviceState;
  deviceProfile: DeviceProfile;
  world: WorldState;
  t: number;
}

/**
 * Idle Dynamic Island - Black pill when nothing is playing
 */
const IdleDynamicIsland: React.FC<{ config: DynamicIslandConfig }> = ({
  config,
}) => (
  <div
    style={{
      position: "absolute",
      top: config.topY,
      left: config.centerX - config.collapsedWidth / 2,
      width: config.collapsedWidth,
      height: config.collapsedHeight,
      background: "#000000",
      borderRadius: config.cornerRadius,
      zIndex: 1000,
    }}
  />
);

/**
 * DynamicIsland Container Component
 */
export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  device,
  deviceProfile,
  world,
  t,
}) => {
  const registries = useRendererRegistries();
  // No Dynamic Island on this device?
  if (!deviceProfile.dynamicIsland) {
    return null;
  }

  const config = deviceProfile.dynamicIsland;
  const platform = deviceProfile.platform;

  // Find the notification that should be displayed as headsUp at current frame
  // A notification is visible in headsUp if: t >= at AND t < (at + duration)
  // 4. CHECK NOTIFICATIONS
  // (Notifications are now handled exclusively by HeadsUpNotification.tsx)
  // Legacy logic removed.

  // Get active background app IDs
  const activeAppIds = device.backgroundApps?.map((a) => a.appId) || [];

  // Resolve which widget should render
  const resolved = registries.widgets.resolve(
    "dynamicIsland",
    platform,
    activeAppIds,
  );

  // If no widget, show idle state
  if (!resolved) {
    return <IdleDynamicIsland config={config} />;
  }

  // Find the background app state for this widget
  const backgroundApp = device.backgroundApps?.find(
    (a) => a.appId === resolved.appId,
  );

  // Get app state
  const appState = world.appState[resolved.appId] || {};

  // Build widget props
  const widgetProps: WidgetProps = {
    appState,
    backgroundApp,
    deviceProfile: {
      dynamicIsland: config,
    },
    currentFrame: t,
    expansionMode: "compact",
    platform,
  };

  // Get the widget component
  const WidgetComponent = resolved.widget.component;

  return (
    <div
      style={{
        position: "absolute",
        top: config.topY,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <WidgetComponent {...widgetProps} />
    </div>
  );
};

export default DynamicIsland;
