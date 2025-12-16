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
    NotificationInstance,
    EventIndex,
    PluginManager,
    APP_IDS,
    NotificationScheduler,
} from "@tokovo/core";
// import { DeviceFrame } from "./DeviceFrame"; // <-- Now using Registry
import { DeviceRegistry } from "@tokovo/devices";
import { AppRegistry } from "./registry";
import { NotificationOverlay } from "./NotificationOverlay";
import { HeadsUpNotification } from "./HeadsUpNotification";
import { CallOverlay } from "./CallOverlay";  // Fallback if no plugin registered
import { LockscreenView } from "./LockscreenView";
import { HomeScreenView } from "./HomeScreenView";
import { VisualDebugger } from "./VisualDebugger";
import { DynamicIsland } from "./DynamicIsland";
import { useLayoutEngine } from "./engines/useLayoutEngine";
import { useCameraEngine } from "./engines/useCameraEngine";
import { KeyboardSurface } from "@tokovo/device-keyboard";

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
    // ==========================================================================
    // 3. LOGIC: NOTIFICATION SCHEDULER (Moved to Core)
    // ==========================================================================
    const notificationState = React.useMemo(() => {
        return NotificationScheduler.schedule(device, t);
    }, [device, t]);

    const activeHeadsUp = notificationState.headsUp;

    // DEBUG: Notification State
    if (debug && t % 30 === 0) {
        console.log(`[TokovoRenderer] Frame ${t}:`, {
            totalNotifs: device.os?.notifications?.length,
            activeHeadsUp: activeHeadsUp ? activeHeadsUp.id : "none",
            isLocked: device.isLocked,
            appId
        });
    }

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

    // Resolve Device Shell
    const shell = DeviceRegistry.get(device.profileId) || DeviceRegistry.get("iphone16");
    if (!shell) return null; // Should not happen with fallback

    const { FrameComponent, StatusBarComponent } = shell;

    return (
        <div style={{
            width: profile.dimensions.width,
            height: profile.dimensions.height,
            position: "relative",
        }}>
            {/* Camera wrapper — applies cinematic transforms */}
            <div style={cameraStyle}>
                {/* Device wrapper — applies layout transforms */}
                <div style={{ width: "100%", height: "100%", ...deviceStyle }}>
                    <FrameComponent statusBar={<StatusBarComponent os={device.os} variant={variant} />}>

                        {/* Call View - Plugin-based */}
                        {hasActiveCall && (() => {
                            const PhoneView = PluginManager.getView(APP_IDS.PHONE);
                            if (PhoneView) {
                                return <PhoneView world={world} t={t} platform={variant} deviceId={deviceId} />;
                            }
                            return <CallOverlay call={device.call!} currentTime={t} variant={variant} />;
                        })()}

                        {/* App View / Lockscreen / Home Screen */}
                        {!hasActiveCall && AppView && !device.isLocked ? (
                            <AppView
                                world={world}
                                t={t}
                                layout={layout}
                                platform={variant}
                                deviceId={deviceId}
                                width={profile.dimensions.width}
                                height={profile.dimensions.height}
                                safeAreaInsets={{
                                    top: profile.camera?.safeAreaTop || 0,
                                    bottom: profile.camera?.safeAreaBottom || 0,
                                    left: 0,
                                    right: 0
                                }}
                            />
                        ) : !hasActiveCall && device.isLocked ? (
                            <LockscreenView
                                notifications={device.os?.notifications || []}
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
                            notifications={device.os?.notifications || []}
                            variant={variant}
                            layout={layout}
                        />

                        {/* Heads-Up Notification */}
                        {activeHeadsUp && !hasActiveCall && !(profile.dynamicIsland && device.notificationCenter?.headsUp) && (
                            <HeadsUpNotification
                                key={activeHeadsUp.id}
                                notification={activeHeadsUp}
                                currentTime={t}
                                variant={variant}
                                autoDismissAfter={headsUpDuration}
                                density={profile.pixelDensity || 3}
                            />
                        )}

                        {/* Dynamic Island (iOS) - Only if Shell supports it */}
                        {shell.hasDynamicIsland && !device.isLocked && !hasActiveCall && (
                            <DynamicIsland
                                device={device}
                                deviceProfile={profile}
                                world={world}
                                t={t}
                            />
                        )}

                        {/* Virtual Keyboard (Unified Surface) */}
                        {device.keyboard?.visible && (
                            <KeyboardSurface
                                keyboard={device.keyboard}
                                platform={variant}
                                variant={variant === "ios" ? "light" : "light"}
                                t={t}
                                width={profile.dimensions.width}
                            />
                        )}

                    </FrameComponent>
                </div>
            </div>

            {debug && <VisualDebugger world={world} t={t} />}
        </div>
    );
};
