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
    PluginManagerClass,
    APP_IDS,
    NotificationScheduler,
    AppSurface
} from "@tokovo/core";
// import { DeviceFrame } from "./DeviceFrame"; // <-- Now using Registry
import { DeviceRegistry } from "@tokovo/devices";
import { AppRegistry } from "./registry";
import { NotificationOverlay } from "./overlays";
import { HeadsUpNotification } from "./os";
// import { CallOverlay } from "./CallOverlay"; // REMOVED: Now using PluginManager.getView(APP_IDS.PHONE)
import { LockscreenView, HomeScreenView } from "./screens";
import { VisualDebugger } from "./VisualDebugger";
import { DynamicIsland } from "./os";
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
    pluginManager?: PluginManagerClass;
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
    pluginManager,
}) => {
    // Resolve Plugin Manager (Injectable > Global Fallback)
    const pm = pluginManager || PluginManager;

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
    const AppView = appId ? pm.getView(appId) : null;

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

                        {/* ========================================================================= */}
                        {/* LAYER 1: APP VIEW (or CALL VIEW)                                          */}
                        {/* ========================================================================= */}
                        {(() => {
                            // A. Active Call takes precedence
                            if (hasActiveCall) {
                                const PhoneView = pm.getView(APP_IDS.PHONE);
                                if (PhoneView) {
                                    // Phone App handles its own scaling/surface if needed, or we wrap it?
                                    // Usually full-screen system apps define their own layout, but let's standardise.
                                    const meta = pm.get(APP_IDS.PHONE)?.metadata;
                                    const designWidth = meta?.designWidth || 393; // Default logical width

                                    return (
                                        <AppSurface
                                            designWidth={designWidth}
                                            targetWidth={profile.dimensions.width}
                                            targetHeight={profile.dimensions.height}
                                        >
                                            <PhoneView world={world} t={t} platform={variant} deviceId={deviceId} />
                                        </AppSurface>
                                    );
                                }
                                // Fallback removed (Plugin must exist)
                                return <div style={{ color: "white", padding: 50 }}>System Error: Phone App Missing</div>;
                            }

                            // B. Active App (Unlocked)
                            if (AppView && !device.isLocked) {
                                const meta = pm.get(appId!)?.metadata;
                                const designWidth = meta?.designWidth || 393;

                                // Calculate scale factor explicitly to normalize props
                                const scale = profile.dimensions.width / designWidth;

                                return (
                                    <AppSurface
                                        designWidth={designWidth}
                                        targetWidth={profile.dimensions.width}
                                        targetHeight={profile.dimensions.height}
                                        backgroundColor={meta?.themeColor} // Use brand color as splash/bg
                                    >
                                        <AppView
                                            world={world}
                                            t={t}
                                            // layout={layout} // Not in AppViewProps standard interface, but might be useful?
                                            // Ideally apps use hooks: useLayout()
                                            platform={variant}
                                            deviceId={deviceId}
                                            // Normalize Safe Area to Logical Units
                                            safeAreaInsets={{
                                                top: (profile.camera?.safeAreaTop || 0) / scale,
                                                bottom: (profile.camera?.safeAreaBottom || 0) / scale,
                                                left: 0,
                                                right: 0
                                            }}
                                        />
                                    </AppSurface>
                                );
                            }

                            // C. Valid System States (Lockscreen / Home)
                            if (!device.isLocked && device.homeScreen) {
                                return <HomeScreenView config={device.homeScreen} variant={variant} />;
                            }

                            if (device.isLocked) {
                                return (
                                    <LockscreenView
                                        notifications={device.os?.notifications || []}
                                        layout={layout}
                                        variant={variant}
                                    // TODO: Pass Metadata Registry for icon lookup? 
                                    // LockscreenView already uses it (Step 642).
                                    />
                                );
                            }

                            // D. Blank Screen
                            return <div style={{ flex: 1, backgroundColor: "black" }} />;
                        })()}


                        {/* ========================================================================= */}
                        {/* LAYER 2: SYSTEM OVERLAYS                                                  */}
                        {/* ========================================================================= */}

                        {/* Lockscreen Notification Overlay */}
                        <NotificationOverlay
                            notifications={device.os?.notifications || []}
                            variant={variant}
                            layout={layout}
                        />

                        {/* Heads-Up Notification (Toast) */}
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

                        {/* Dynamic Island (iOS) - Slot Based */}
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
