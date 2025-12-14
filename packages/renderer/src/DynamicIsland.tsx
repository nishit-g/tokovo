/**
 * DynamicIsland - iOS Dynamic Island Container
 * 
 * Renders the Dynamic Island UI element at the top of iPhone screens.
 * Queries WidgetRegistry for active widgets and renders the highest priority one.
 */

import React from "react";
import { WorldState, DeviceState, WidgetRegistry, PluginManager, WidgetProps } from "@tokovo/core";
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
const IdleDynamicIsland: React.FC<{ config: DynamicIslandConfig }> = ({ config }) => (
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
    // No Dynamic Island on this device?
    if (!deviceProfile.dynamicIsland) {
        console.log("[DynamicIsland] No dynamicIsland config on deviceProfile");
        return null;
    }

    const config = deviceProfile.dynamicIsland;
    const platform = deviceProfile.platform;

    // Get active background app IDs
    const activeAppIds = device.backgroundApps?.map(a => a.appId) || [];

    // Debug logging
    console.log("[DynamicIsland] platform:", platform, "activeAppIds:", activeAppIds);

    // Resolve which widget should render
    const resolved = WidgetRegistry.resolve("dynamicIsland", platform, activeAppIds);
    console.log("[DynamicIsland] resolved widget:", resolved);

    // If no widget, show idle state
    if (!resolved) {
        return <IdleDynamicIsland config={config} />;
    }

    // Find the background app state for this widget
    const backgroundApp = device.backgroundApps?.find(a => a.appId === resolved.appId);

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
        expansionMode: "compact", // Default to compact when active
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
