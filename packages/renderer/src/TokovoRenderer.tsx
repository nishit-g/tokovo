import React from "react";
import { WorldState } from "@tokovo/core";
import { DeviceFrame } from "./DeviceFrame";
import { AppRegistry } from "./registry";
import { computeLayout } from "./LayoutEngine";
import { NotificationOverlay } from "./NotificationOverlay";
import { VisualDebugger } from "./VisualDebugger";
import { Audio, staticFile } from "remotion";

export const TokovoRenderer: React.FC<{ world: WorldState; t: number; debug?: boolean }> = ({ world, t, debug }) => {
    // 1. Determine active device & app
    // For MVP, we assume single device "alice_phone" or "bob_phone"
    const deviceId = Object.keys(world.devices)[0];
    const device = world.devices[deviceId];
    const appId = device?.foregroundAppId;

    // 2. Compute Layout
    const layout = computeLayout(world, t);

    // 3. Select App View
    let AppView = null;
    if (appId && AppRegistry.views[appId]) {
        AppView = AppRegistry.views[appId];
    }

    // 4. Determine Device Variant (simple heuristic for now)
    const isPixel = device.profileId.includes("pixel");
    const variant = isPixel ? "android" : "ios";

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            {/* Audio Layer - Placeholder logic. 
                In a real implementation, we'd map audio events to <Audio /> components with startFrom/endAt 
                or use an AudioContext manager. For now, we assume a simple sound effect if triggered.
            */}
            {/* <Audio src={staticFile("assets/sounds/typing.mp3")} /> */}

            <DeviceFrame profileId={device.profileId} variant={variant}>
                {AppView ? (
                    <AppView world={world} t={t} layout={layout} />
                ) : (
                    <div style={{ flex: 1, backgroundColor: "black" }} /> // Lock screen / Home
                )}

                {/* Overlays */}
                <NotificationOverlay notifications={device?.notifications} variant={variant} />
            </DeviceFrame>

            {debug && <VisualDebugger world={world} t={t} />}
        </div>
    );
};
