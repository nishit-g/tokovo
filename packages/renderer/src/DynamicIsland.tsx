/**
 * DynamicIsland - iOS Dynamic Island Container
 * 
 * Renders the Dynamic Island UI element at the top of iPhone screens.
 * Priority: HeadsUp Notification > Active Widget > Idle
 */

import React from "react";
import { WorldState, DeviceState, WidgetRegistry, WidgetProps, NotificationAdapterRegistry, Notification } from "@tokovo/core";
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
 * Notification in Dynamic Island - expanded state
 */
const NotificationDynamicIsland: React.FC<{
    config: DynamicIslandConfig;
    notification: Notification;
}> = ({ config, notification }) => {
    const formatted = NotificationAdapterRegistry.format(notification);

    return (
        <div
            style={{
                position: "absolute",
                top: config.topY - 20,
                left: "50%",
                transform: "translateX(-50%)",
                width: config.expandedWidth,
                background: "#000000",
                borderRadius: config.cornerRadius,
                zIndex: 1001,
                padding: "24px 30px",
                display: "flex",
                alignItems: "center",
                gap: "24px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}
        >
            {/* App Icon */}
            <div
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    background: formatted.iconBackground || "#333",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                    flexShrink: 0,
                }}
            >
                {formatted.icon || "📱"}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        color: "#fff",
                        fontSize: 28,
                        fontWeight: 600,
                        marginBottom: 8,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {formatted.title}
                </div>
                <div
                    style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 24,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {formatted.body}
                </div>
            </div>

            {/* Preview image if present */}
            {formatted.preview?.kind === "image" && (
                <div
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 12,
                        background: "#333",
                        backgroundImage: `url(${formatted.preview.value})`,
                        backgroundSize: "cover",
                        flexShrink: 0,
                    }}
                />
            )}
        </div>
    );
};

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
        return null;
    }

    const config = deviceProfile.dynamicIsland;
    const platform = deviceProfile.platform;

    // Check for headsUp notification first (highest priority)
    const headsUpId = device.notificationCenter?.headsUp;
    if (headsUpId) {
        const notification = device.notificationCenter?.items.find(n => n.id === headsUpId);
        if (notification && notification.state === "headsUp") {
            return <NotificationDynamicIsland config={config} notification={notification} />;
        }
    }

    // Get active background app IDs
    const activeAppIds = device.backgroundApps?.map(a => a.appId) || [];

    // Resolve which widget should render
    const resolved = WidgetRegistry.resolve("dynamicIsland", platform, activeAppIds);

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

