import React from "react";
import {
    WorldState,
    ViewLayoutMode,
    CameraTransform,
    DEFAULT_CAMERA_TRANSFORM,
    DeviceId,
    VideoConfig,
    DEFAULT_VIDEO_CONFIG,
} from "@tokovo/core";
import { TokovoRenderer } from "./TokovoRenderer";
import { AudioLayer } from "./AudioLayer";
import { getDeviceProfile } from "@tokovo/devices";

// Helper to get video config with defaults
const getVideoConfig = (world: WorldState): VideoConfig => ({
    ...DEFAULT_VIDEO_CONFIG,
    ...world.config,
    layout: {
        ...DEFAULT_VIDEO_CONFIG.layout,
        ...world.config?.layout,
    },
});

/**
 * MultiDeviceRenderer
 * 
 * Renders multiple devices based on the current ViewLayout mode.
 * Supports SINGLE, SPLIT_HORIZONTAL, SPLIT_VERTICAL, and PIP layouts.
 */
export const MultiDeviceRenderer: React.FC<{
    world: WorldState;
    t: number;
    debug?: boolean;
    compositionWidth?: number;
    compositionHeight?: number;
}> = ({ world, t, debug = false, compositionWidth = 1080, compositionHeight = 1920 }) => {
    const layout = world.camera?.layout;

    if (!layout) {
        // Fallback to single device if no layout
        return (
            <>
                <AudioLayer world={world} t={t} />
                <SingleDeviceLayout
                    world={world}
                    t={t}
                    debug={debug}
                    deviceId={Object.keys(world.devices)[0]}
                    width={compositionWidth}
                    height={compositionHeight}
                />
            </>
        );
    }

    switch (layout.mode) {
        case "SINGLE":
            return (
                <>
                    <AudioLayer world={world} t={t} />
                    <SingleDeviceLayout
                        world={world}
                        t={t}
                        debug={debug}
                        deviceId={layout.primaryDeviceId}
                        width={compositionWidth}
                        height={compositionHeight}
                    />
                </>
            );

        case "SPLIT_HORIZONTAL":
            return (
                <>
                    <AudioLayer world={world} t={t} />
                    <SplitHorizontalLayout
                        world={world}
                        t={t}
                        debug={debug}
                        primaryDeviceId={layout.primaryDeviceId}
                        secondaryDeviceId={layout.secondaryDeviceId}
                        width={compositionWidth}
                        height={compositionHeight}
                    />
                </>
            );

        case "SPLIT_VERTICAL":
            return (
                <>
                    <AudioLayer world={world} t={t} />
                    <SplitVerticalLayout
                        world={world}
                        t={t}
                        debug={debug}
                        primaryDeviceId={layout.primaryDeviceId}
                        secondaryDeviceId={layout.secondaryDeviceId}
                        width={compositionWidth}
                        height={compositionHeight}
                    />
                </>
            );

        case "PIP":
            return (
                <>
                    <AudioLayer world={world} t={t} />
                    <PIPLayout
                        world={world}
                        t={t}
                        debug={debug}
                        primaryDeviceId={layout.primaryDeviceId}
                        secondaryDeviceId={layout.secondaryDeviceId}
                        pipPosition={layout.pipPosition || "bottom-right"}
                        pipScale={layout.pipScale || 0.3}
                        width={compositionWidth}
                        height={compositionHeight}
                    />
                </>
            );

        default:
            return (
                <>
                    <AudioLayer world={world} t={t} />
                    <SingleDeviceLayout
                        world={world}
                        t={t}
                        debug={debug}
                        deviceId={layout.primaryDeviceId}
                        width={compositionWidth}
                        height={compositionHeight}
                    />
                </>
            );
    }
};

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================

interface LayoutProps {
    world: WorldState;
    t: number;
    debug?: boolean;
    width: number;
    height: number;
}

/**
 * SingleDeviceLayout - One device fills the entire frame
 */
const SingleDeviceLayout: React.FC<LayoutProps & { deviceId: string }> = ({
    world,
    t,
    debug,
    deviceId,
    width,
    height,
}) => {
    const device = world.devices[deviceId];
    if (!device) {
        return <div style={{ width, height, background: "#1a1a2e" }} />;
    }

    const profile = getDeviceProfile(device.profileId);
    const scaleX = width / profile.dimensions.width;
    const scaleY = height / profile.dimensions.height;
    const scale = Math.min(scaleX, scaleY);

    return (
        <div
            style={{
                width,
                height,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: getVideoConfig(world).backgroundColor,
                overflow: "hidden",
            }}
        >
            <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
                <TokovoRenderer world={world} t={t} debug={debug} focusDeviceId={deviceId} />
            </div>
        </div>
    );
};

/**
 * SplitHorizontalLayout - Two devices side by side
 * ┌─────────┬─────────┐
 * │  Left   │  Right  │
 * │  (50%)  │  (50%)  │
 * └─────────┴─────────┘
 */
const SplitHorizontalLayout: React.FC<
    LayoutProps & { primaryDeviceId: string; secondaryDeviceId?: string }
> = ({ world, t, debug, primaryDeviceId, secondaryDeviceId, width, height }) => {
    const halfWidth = width / 2;

    return (
        <div
            style={{
                width,
                height,
                display: "flex",
                flexDirection: "row",
                background: "#0a0a1a",
                overflow: "hidden",
            }}
        >
            {/* Left - Primary Device */}
            <DevicePane
                world={world}
                t={t}
                debug={debug}
                deviceId={primaryDeviceId}
                paneWidth={halfWidth}
                paneHeight={height}
            />

            {/* Divider */}
            <div style={{ width: getVideoConfig(world).layout?.splitLineWidth || 2, background: getVideoConfig(world).layout?.splitLineColor || "#333" }} />

            {/* Right - Secondary Device */}
            {secondaryDeviceId && (
                <DevicePane
                    world={world}
                    t={t}
                    debug={debug}
                    deviceId={secondaryDeviceId}
                    paneWidth={halfWidth - 2}
                    paneHeight={height}
                />
            )}
        </div>
    );
};

/**
 * SplitVerticalLayout - Two devices stacked top/bottom
 * ┌─────────────────┐
 * │      Top        │
 * │     (50%)       │
 * ├─────────────────┤
 * │     Bottom      │
 * │     (50%)       │
 * └─────────────────┘
 */
const SplitVerticalLayout: React.FC<
    LayoutProps & { primaryDeviceId: string; secondaryDeviceId?: string }
> = ({ world, t, debug, primaryDeviceId, secondaryDeviceId, width, height }) => {
    const halfHeight = height / 2;

    return (
        <div
            style={{
                width,
                height,
                display: "flex",
                flexDirection: "column",
                background: getVideoConfig(world).backgroundColor,
                overflow: "hidden",
            }}
        >
            {/* Top - Primary Device */}
            <DevicePane
                world={world}
                t={t}
                debug={debug}
                deviceId={primaryDeviceId}
                paneWidth={width}
                paneHeight={halfHeight}
            />

            {/* Divider */}
            <div style={{ height: getVideoConfig(world).layout?.splitLineWidth || 2, background: getVideoConfig(world).layout?.splitLineColor || "#333" }} />

            {/* Bottom - Secondary Device */}
            {secondaryDeviceId && (
                <DevicePane
                    world={world}
                    t={t}
                    debug={debug}
                    deviceId={secondaryDeviceId}
                    paneWidth={width}
                    paneHeight={halfHeight - 2}
                />
            )}
        </div>
    );
};

/**
 * PIPLayout - Picture in Picture (main device + small overlay)
 * ┌─────────────────┐
 * │           ┌───┐ │
 * │   Main    │PIP│ │
 * │           └───┘ │
 * │                 │
 * └─────────────────┘
 */
const PIPLayout: React.FC<
    LayoutProps & {
        primaryDeviceId: string;
        secondaryDeviceId?: string;
        pipPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
        pipScale: number;
    }
> = ({ world, t, debug, primaryDeviceId, secondaryDeviceId, pipPosition, pipScale, width, height }) => {
    // PIP window size
    const pipWidth = width * pipScale;
    const pipHeight = height * pipScale;
    const margin = 20;

    // Position based on pipPosition
    const pipStyle: React.CSSProperties = {
        position: "absolute",
        width: pipWidth,
        height: pipHeight,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        border: "2px solid rgba(255,255,255,0.1)",
    };

    switch (pipPosition) {
        case "top-left":
            pipStyle.top = margin;
            pipStyle.left = margin;
            break;
        case "top-right":
            pipStyle.top = margin;
            pipStyle.right = margin;
            break;
        case "bottom-left":
            pipStyle.bottom = margin;
            pipStyle.left = margin;
            break;
        case "bottom-right":
        default:
            pipStyle.bottom = margin;
            pipStyle.right = margin;
            break;
    }

    return (
        <div
            style={{
                width,
                height,
                position: "relative",
                background: getVideoConfig(world).backgroundColor,
                overflow: "hidden",
            }}
        >
            {/* Main device (full frame) */}
            <SingleDeviceLayout
                world={world}
                t={t}
                debug={debug}
                deviceId={primaryDeviceId}
                width={width}
                height={height}
            />

            {/* PIP overlay */}
            {secondaryDeviceId && (
                <div style={pipStyle}>
                    <DevicePaneFit
                        world={world}
                        t={t}
                        debug={false} // No debug overlay on PIP
                        deviceId={secondaryDeviceId}
                        paneWidth={pipWidth}
                        paneHeight={pipHeight}
                    />
                </div>
            )}
        </div>
    );
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

/**
 * DevicePane - Renders a device within a specific pane size
 * Used for split layouts
 */
const DevicePane: React.FC<{
    world: WorldState;
    t: number;
    debug?: boolean;
    deviceId: string;
    paneWidth: number;
    paneHeight: number;
}> = ({ world, t, debug, deviceId, paneWidth, paneHeight }) => {
    const device = world.devices[deviceId];
    if (!device) {
        return (
            <div
                style={{
                    width: paneWidth,
                    height: paneHeight,
                    background: "#1a1a2e",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#666",
                }}
            >
                Device not found
            </div>
        );
    }

    const profile = getDeviceProfile(device.profileId);
    const scaleX = paneWidth / profile.dimensions.width;
    const scaleY = paneHeight / profile.dimensions.height;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to add some padding

    // Create a world view focused on this specific device
    const deviceWorld: WorldState = {
        ...world,
        camera: {
            ...world.camera,
            activeDeviceId: deviceId,
            layout: { mode: "SINGLE", primaryDeviceId: deviceId },
        },
    };

    return (
        <div
            style={{
                width: paneWidth,
                height: paneHeight,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#0d0d1a",
                overflow: "hidden",
            }}
        >
            <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
                <TokovoRenderer world={deviceWorld} t={t} debug={debug} focusDeviceId={deviceId} />
            </div>
        </div>
    );
};

/**
 * DevicePaneFit - Renders a device to fit exactly within pane (for PIP)
 * Fills the entire pane without padding
 */
const DevicePaneFit: React.FC<{
    world: WorldState;
    t: number;
    debug?: boolean;
    deviceId: string;
    paneWidth: number;
    paneHeight: number;
}> = ({ world, t, debug, deviceId, paneWidth, paneHeight }) => {
    const device = world.devices[deviceId];
    if (!device) {
        return <div style={{ width: paneWidth, height: paneHeight, background: "#1a1a2e" }} />;
    }

    const profile = getDeviceProfile(device.profileId);
    const scaleX = paneWidth / profile.dimensions.width;
    const scaleY = paneHeight / profile.dimensions.height;
    const scale = Math.min(scaleX, scaleY);

    // Create a world view focused on this specific device
    const deviceWorld: WorldState = {
        ...world,
        camera: {
            ...world.camera,
            activeDeviceId: deviceId,
            layout: { mode: "SINGLE", primaryDeviceId: deviceId },
        },
    };

    return (
        <div
            style={{
                width: paneWidth,
                height: paneHeight,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#0d0d1a",
                overflow: "hidden",
            }}
        >
            <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
                <TokovoRenderer world={deviceWorld} t={t} debug={debug} focusDeviceId={deviceId} />
            </div>
        </div>
    );
};
