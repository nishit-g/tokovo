/**
 * TokovoRenderer
 *
 * Thin wiring layer that:
 * 1. Calls Layout Engine to get layout blueprint
 * 2. Calls Camera Engine to get camera transform
 * 3. Paints JSX based on blueprints
 *
 * No compute logic — just orchestration and rendering.
 */

import React from "react";
import {
    WorldState,
    Notification,
    EventIndex,
} from "@tokovo/core";
import { DeviceFrame } from "./DeviceFrame";
import { AppRegistry } from "./registry";
import { NotificationOverlay } from "./NotificationOverlay";
import { HeadsUpNotification } from "./HeadsUpNotification";
import { CallOverlay } from "./CallOverlay";
import { LockscreenView } from "./LockscreenView";
import { HomeScreenView } from "./HomeScreenView";
import { VisualDebugger } from "./VisualDebugger";
import { DynamicIsland } from "./DynamicIsland";
import { useLayoutEngine } from "./engines/useLayoutEngine";
import { useCameraEngine } from "./engines/useCameraEngine";
import { IOSKeyboard } from "@tokovo/devices";

// =============================================================================
// TYPES
// =============================================================================

interface NotificationConfig {
    headsUpDuration?: number;
    showHeadsUpWhenAppOpen?: boolean;
}

interface TokovoRendererProps {
    world: WorldState;
    t: number;
    debug?: boolean;
    notificationConfig?: NotificationConfig;
    focusDeviceId?: string;
    eventIndex?: EventIndex;
    directorEnabled?: boolean;
    directorDebug?: boolean;
}

// =============================================================================
// TOKOVO RENDERER
// =============================================================================

export const TokovoRenderer: React.FC<TokovoRendererProps> = ({
    world,
    t,
    debug,
    notificationConfig = {},
    focusDeviceId,
    eventIndex,
    directorEnabled = true,
    directorDebug = false,
}) => {
    const {
        headsUpDuration = 150,
        showHeadsUpWhenAppOpen = true,
    } = notificationConfig;

    // ==========================================================================
    // 1. LAYOUT ENGINE — Get layout blueprint
    // ==========================================================================
    const layoutOutput = useLayoutEngine({ world, t, focusDeviceId });

    // Handle error state (device not found)
    if (layoutOutput.isError) {
        return (
            <div style={{ width: 430, height: 932, backgroundColor: "#000" }}>
                <div style={{ color: "#666", padding: 20, fontSize: 14 }}>
                    Device not found
                </div>
            </div>
        );
    }

    const {
        deviceId,
        device,
        appId,
        viewKind,
        layout,
        profile,
        variant,
    } = layoutOutput;

    // ==========================================================================
    // 2. CAMERA ENGINE — Get camera transform
    // ==========================================================================
    const cameraOutput = useCameraEngine({
        world,
        t,
        layoutOutput,
        eventIndex,
        directorEnabled,
        directorDebug,
    });

    const { cameraStyle, deviceStyle } = cameraOutput;

    // ==========================================================================
    // 3. HELPER: Find active heads-up notification
    // ==========================================================================
    const getActiveHeadsUpNotification = (): Notification | null => {
        if (!device.notifications || device.isLocked) return null;
        if (!showHeadsUpWhenAppOpen && appId) return null;

        const headsUpNotifs = device.notifications.filter(n => {
            const mode = n.mode || "both";
            if (mode === "lockscreen") return false;
            if (n.dismissedAt !== undefined) return false;

            const timeSinceAppear = t - n.at;
            if (timeSinceAppear < 0) return false;
            if (timeSinceAppear > headsUpDuration + 30) return false;
            if (n.appId === appId) return false;

            return true;
        });

        return headsUpNotifs.length > 0 ? headsUpNotifs[headsUpNotifs.length - 1] : null;
    };

    const activeHeadsUp = getActiveHeadsUpNotification();
    const hasActiveCall = device.call && device.call.status !== "ended";

    // ==========================================================================
    // 4. SELECT APP VIEW
    // ==========================================================================
    let AppView = null;
    if (appId && AppRegistry.views[appId]) {
        AppView = AppRegistry.views[appId];
    }

    // ==========================================================================
    // 5. RENDER — Paint the blueprints
    // ==========================================================================
    return (
        <div style={{
            width: profile.dimensions.width,
            height: profile.dimensions.height,
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Camera wrapper — applies cinematic transforms */}
            <div style={cameraStyle}>
                {/* Device wrapper — applies layout transforms */}
                <div style={{ width: "100%", height: "100%", ...deviceStyle }}>
                    <DeviceFrame profileId={device.profileId} variant={variant}>
                        {/* Call Overlay (takes precedence) */}
                        {hasActiveCall && (
                            <CallOverlay
                                call={device.call!}
                                currentTime={t}
                                variant={variant}
                            />
                        )}

                        {/* App View / Lockscreen / Home Screen */}
                        {!hasActiveCall && AppView && !device.isLocked ? (
                            <AppView world={world} t={t} layout={layout} platform={variant} deviceId={deviceId} />
                        ) : !hasActiveCall && device.isLocked ? (
                            <LockscreenView
                                notifications={device.notifications}
                                layout={layout}
                                variant={variant}
                            />
                        ) : !hasActiveCall && device.homeScreen ? (
                            <HomeScreenView
                                config={device.homeScreen}
                                variant={variant}
                            />
                        ) : !hasActiveCall && (
                            <div style={{ flex: 1, backgroundColor: "black" }} />
                        )}

                        {/* Lockscreen Notification Overlay */}
                        <NotificationOverlay
                            notifications={device?.notifications}
                            variant={variant}
                            layout={layout}
                        />

                        {/* Heads-Up Notification */}
                        {activeHeadsUp && !hasActiveCall && !(profile.dynamicIsland && device.notificationCenter?.headsUp) && (
                            <HeadsUpNotification
                                notification={activeHeadsUp}
                                currentTime={t}
                                variant={variant}
                                autoDismissAfter={headsUpDuration}
                            />
                        )}

                        {/* Dynamic Island (iOS) */}
                        {!device.isLocked && !hasActiveCall && (
                            <DynamicIsland
                                device={device}
                                deviceProfile={profile}
                                world={world}
                                t={t}
                            />
                        )}

                        {/* Virtual Keyboard (when visible) */}
                        {device.keyboard?.visible && (
                            <IOSKeyboard
                                keyboard={device.keyboard}
                                variant={variant === "ios" ? "light" : "light"}
                                t={t}
                            />
                        )}
                    </DeviceFrame>
                </div>
            </div>

            {debug && <VisualDebugger world={world} t={t} />}
        </div>
    );
};
