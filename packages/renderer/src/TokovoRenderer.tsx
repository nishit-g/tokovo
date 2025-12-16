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
} from "@tokovo/core";
import { DeviceFrame } from "./DeviceFrame";
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
    // ==========================================================================
    // 3. HELPER: Find active heads-up notification
    // ==========================================================================
    // ==========================================================================
    // 3. HELPER: Find active heads-up notification (Smart Queuing)
    // ==========================================================================
    const activeHeadsUp = React.useMemo(() => {
        // Safe access to notifications from OS
        const notifications = device.os?.notifications || [];

        if (notifications.length === 0 || device.isLocked) return null;
        if (!showHeadsUpWhenAppOpen && appId) return null;

        // Filter relevant notifications
        const candidates = notifications.filter(n => {
            const mode = n.mode || "both";
            if (mode === "lockscreen") return false;
            // Ignore dismissed purely by manual interactions (we handle auto-dismiss timing here)
            if (n.state === "dismissed" && n.dismissedAtFrame) return false;
            return true;
        });

        if (candidates.length === 0) return null;

        // SMART QUEUE ALGORITHM
        // Serialize the timeline so notifications allow each other to finish.
        // Even if scheduled 10ms apart, they will play sequentially.

        const MIN_DURATION = 90; // Minimum 3 seconds visibility
        const GAP = 10; // Gap between notifications

        let lastEndTime = 0;
        let active: NotificationInstance | null = null;

        // Sort by creation time to establish order
        const sorted = [...candidates].sort((a, b) => a.createdAtFrame - b.createdAtFrame);

        for (const n of sorted) {
            // The earliest this notification can show is its creation time.
            // But if the previous one is still showing, we must wait.
            // effectiveStart = max(created, lastEndTime + GAP)
            const effectiveStart = Math.max(n.createdAtFrame, lastEndTime > 0 ? lastEndTime + GAP : 0);

            // Effective Duration (fallback to config default if not set)
            const duration = headsUpDuration;
            const effectiveEnd = effectiveStart + duration;

            // Update lastEndTime for the next iteration
            lastEndTime = effectiveEnd;

            // Check if current time `t` falls within this window
            if (t >= effectiveStart && t < effectiveEnd) {
                active = n;
                // Important: We artificially adjust the 'shownAtFrame' property 
                // for the *Component* so it animates correctly relative to its *effective* start.
                // We clone to avoid mutating the Redux state directly in render.
                active = { ...n, shownAtFrame: effectiveStart };
                break;
            }
        }

        return active;

    }, [device.os?.notifications, device.isLocked, showHeadsUpWhenAppOpen, appId, headsUpDuration, t]);

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
    return (
        <div style={{
            width: profile.dimensions.width,
            height: profile.dimensions.height,
            position: "relative",
            // overflow: "hidden", // ALLOW BEZEL SHADOW TO BE VISIBLE
        }}>
            {/* Camera wrapper — applies cinematic transforms */}
            <div style={cameraStyle}>
                {/* Device wrapper — applies layout transforms */}
                <div style={{ width: "100%", height: "100%", ...deviceStyle }}>
                    <DeviceFrame profileId={device.profileId} variant={variant} device={device}>
                        {/* Call View - Plugin-based (or fallback to CallOverlay) */}
                        {hasActiveCall && (() => {
                            const PhoneView = PluginManager.getView(APP_IDS.PHONE);
                            console.log('[TokovoRenderer] PhoneView lookup:', APP_IDS.PHONE, '→', PhoneView ? 'FOUND' : 'NOT FOUND');
                            if (PhoneView) {
                                return <PhoneView world={world} t={t} platform={variant} deviceId={deviceId} />;
                            }
                            // Fallback to built-in CallOverlay if no plugin registered
                            return (
                                <CallOverlay
                                    call={device.call!}
                                    currentTime={t}
                                    variant={variant}
                                />
                            );
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
                                density={profile.pixelDensity || 3} // Fallback to 3 if missing
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
