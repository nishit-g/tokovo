import React from "react";
import { WorldState } from "@tokovo/core";
import { DeviceFrame } from "./DeviceFrame";
import { AppRegistry } from "./registry";
import { computeLayout } from "./LayoutEngine";
import { NotificationOverlay } from "./NotificationOverlay";
import { VisualDebugger } from "./VisualDebugger";
import { Audio, staticFile } from "remotion";
import { ViewKind, LayoutContext } from "./types";
import { iPhone16Profile } from "@tokovo/devices";

export const TokovoRenderer: React.FC<{ world: WorldState; t: number; debug?: boolean }> = ({ world, t, debug }) => {
    // 1. Determine active device & app
    const deviceId = Object.keys(world.devices)[0];
    const device = world.devices[deviceId];
    const appId = device?.foregroundAppId;

    // 2. Determine ViewKind
    let viewKind: ViewKind = "TRANSITION";
    let activeConversationId: string | undefined;
    let activeStoryId: string | undefined;

    if (device.isLocked) {
        viewKind = "LOCKSCREEN";
    } else if (appId) {
        if (appId === "app_whatsapp") {
            viewKind = "CHAT";
            // Heuristic: active conversation is the one receiving events or just the first one
            // Ideally this should be in appState
            activeConversationId = Object.keys(world.conversations)[0];
        } else if (appId === "app_instagram") {
            const appState = world.appState?.["app_instagram"];
            const currentView = appState?.currentView || "feed";

            switch (currentView) {
                case "dm":
                    viewKind = "CHAT";
                    activeConversationId = Object.keys(world.conversations)[0]; // Simplified
                    break;
                case "stories":
                    viewKind = "STORY";
                    activeStoryId = appState?.stories?.activeStoryId;
                    break;
                case "feed":
                case "explore":
                case "profile":
                case "notifications":
                case "reels":
                case "post":
                    viewKind = "FEED"; // Most of these are feed-like lists
                    break;
                default:
                    viewKind = "FEED";
            }
        }
    }

    // 3. Compute Layout
    const layoutContext: LayoutContext = {
        world,
        t,
        activeDeviceId: deviceId,
        activeAppId: appId || "",
        viewKind,
        activeConversationId,
        activeStoryId,
        viewportWidth: iPhone16Profile.dimensions.width,
        viewportHeight: iPhone16Profile.dimensions.height
    };

    const layout = computeLayout(layoutContext);

    // 4. Select App View
    let AppView = null;
    if (appId && AppRegistry.views[appId]) {
        AppView = AppRegistry.views[appId];
    }

    // 5. Determine Device Variant
    const isPixel = device.profileId.includes("pixel");
    const variant = isPixel ? "android" : "ios";

    // 6. Apply Device Transforms (from TransitionLayoutState or default)
    let deviceStyle: React.CSSProperties = {
        transformOrigin: "center center",
        transition: "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)" // Smooth default transition
    };

    if (layout.kind === "TRANSITION") {
        const transLayout = layout as any; // Cast to TransitionLayoutState (or use type guard)
        // Note: We need to import TransitionLayoutState to cast properly, or just access props if we trust it.
        // Better to be safe.
        const { deviceScale, deviceTranslateX, deviceTranslateY, deviceRotation } = transLayout;

        deviceStyle.transform = `translate(${deviceTranslateX}px, ${deviceTranslateY}px) scale(${deviceScale}) rotate(${deviceRotation}deg)`;
    }

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <div style={{ width: "100%", height: "100%", ...deviceStyle }}>
                <DeviceFrame profileId={device.profileId} variant={variant}>
                    {AppView && !device.isLocked ? (
                        <AppView world={world} t={t} layout={layout} />
                    ) : (
                        <div style={{ flex: 1, backgroundColor: "black" }} /> // Lock screen / Home
                    )}

                    {/* Overlays */}
                    <NotificationOverlay notifications={device?.notifications} variant={variant} layout={layout} />
                </DeviceFrame>
            </div>

            {debug && <VisualDebugger world={world} t={t} />}
        </div>
    );
};
