import React from "react";
import {
    WorldState,
    Notification,
    CameraTransform,
    DEFAULT_CAMERA_TRANSFORM,
    LAYOUT,
    EventIndex,
    getEventsInRange,
    deriveDirectorEffects,
    extractSignals,
    ChatLayoutState,
} from "@tokovo/core";
import { DeviceFrame } from "./DeviceFrame";
import { AppRegistry } from "./registry";
import { computeLayout } from "./layout";
import { NotificationOverlay } from "./NotificationOverlay";
import { HeadsUpNotification } from "./HeadsUpNotification";
import { CallOverlay } from "./CallOverlay";
import { LockscreenView } from "./LockscreenView";
import { HomeScreenView } from "./HomeScreenView";
import { VisualDebugger } from "./VisualDebugger";
import { DynamicIsland } from "./DynamicIsland";
import { Audio, staticFile } from "remotion";
import { ViewKind, LayoutContext } from "./layout/types";
import { iPhone16Profile, PixelProfile } from "@tokovo/devices";
import { createDirectorLayoutModel } from "./layout/director-adapter";
import { applyDirectorEffects, Viewport } from "./camera-composer";

/**
 * Configuration for heads-up notification behavior
 */
interface NotificationConfig {
    headsUpDuration?: number;       // frames before auto-dismiss (default: 150 = 5s at 30fps)
    showHeadsUpWhenAppOpen?: boolean; // show when app is open (default: true)
}

/**
 * TokovoRenderer
 * Main rendering component that orchestrates device frame, app views, and overlays
 */
export const TokovoRenderer: React.FC<{
    world: WorldState;
    t: number;
    debug?: boolean;
    notificationConfig?: NotificationConfig;
    focusDeviceId?: string;  // Which device to render (for multi-device POV)
    // DirectorLite integration
    eventIndex?: EventIndex;
    directorEnabled?: boolean;
    directorDebug?: boolean;
}> = ({
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
            showHeadsUpWhenAppOpen = true
        } = notificationConfig;

        // 1. Determine active device & app
        // Use focusDeviceId if provided, otherwise use camera.activeDeviceId, fallback to first device
        const deviceId = focusDeviceId || world.camera?.activeDeviceId || Object.keys(world.devices)[0];
        const device = world.devices[deviceId];

        if (!device) {
            console.warn(`[TokovoRenderer] Device not found: ${deviceId}`);
            return null;
        }

        const appId = device.foregroundAppId;

        // 2. Determine ViewKind
        let viewKind: ViewKind = "TRANSITION";
        let activeConversationId: string | undefined;
        let activeStoryId: string | undefined;

        if (device.isLocked) {
            viewKind = "LOCKSCREEN";
        } else if (appId) {
            if (appId === "app_whatsapp") {
                viewKind = "CHAT";
                activeConversationId = Object.keys(world.conversations)[0];
            } else if (appId === "app_instagram") {
                const appState = world.appState?.["app_instagram"];
                const currentView = appState?.currentView || "feed";

                switch (currentView) {
                    case "dm":
                        viewKind = "CHAT";
                        activeConversationId = Object.keys(world.conversations)[0];
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
                        viewKind = "FEED";
                        break;
                    default:
                        viewKind = "FEED";
                }
            }
        } else {
            // No app open, show home screen
            viewKind = "HOMESCREEN";
        }

        // 3. Compute Layout
        const profile = device.profileId === "pixel" ? PixelProfile : iPhone16Profile;

        // For chat views, reduce viewport height to account for header and input area
        // Use constants instead of magic numbers
        const effectiveViewportHeight = viewKind === "CHAT"
            ? profile.dimensions.height - LAYOUT.CHAT_HEADER_HEIGHT - LAYOUT.CHAT_INPUT_HEIGHT
            : profile.dimensions.height;

        const layoutContext: LayoutContext = {
            world,
            t,
            activeDeviceId: deviceId,
            activeAppId: appId || "",
            viewKind,
            activeConversationId,
            activeStoryId,
            viewportWidth: profile.dimensions.width,
            viewportHeight: effectiveViewportHeight
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

        // 6. Get Base Camera Transform (from timeline events)
        const baseCameraTransform: CameraTransform =
            (world.camera?.deviceTransforms?.[deviceId]) ||
            world.camera?.transform ||
            DEFAULT_CAMERA_TRANSFORM;

        // 6b. DirectorLite Integration
        let finalCameraTransform = baseCameraTransform;

        if (directorEnabled && eventIndex && viewKind === "CHAT" && layout.kind === "CHAT") {
            // Get manual camera effects (if any active, skip director)
            const manualCameraEffects = world.camera?.activeEffects || [];

            // Signal window: past 90 frames, future 15 frames
            const windowStart = Math.max(0, t - 90);
            const windowEnd = t + 15;
            const eventsInWindow = getEventsInRange(eventIndex, windowStart, windowEnd);

            // Extract signals scoped to this device/app
            const signals = extractSignals(eventsInWindow, deviceId, appId || "");

            // Create layout model from computed layout
            const chatLayout = layout as ChatLayoutState;
            const directorLayout = createDirectorLayoutModel(
                chatLayout,
                deviceId,
                appId || "",
                activeConversationId || "",
                profile.dimensions.width,  // viewportWidth
                effectiveViewportHeight
            );

            // Derive effects (PURE FUNCTION - no state)
            const { effects, debug: directorDebugOutput, skipped } = deriveDirectorEffects({
                t,
                signals,
                layoutModel: directorLayout,
                seed: 42, // Deterministic seed
                debug: directorDebug,
                manualCameraEffects,
            });

            // Log debug info if enabled
            if (directorDebug && directorDebugOutput) {
                console.log(`[DirectorLite] t=${t}`, directorDebugOutput);
            }

            // Apply director effects if not skipped and effects exist
            if (!skipped && effects.length > 0) {
                const viewport: Viewport = {
                    width: profile.dimensions.width,
                    height: profile.dimensions.height,
                    scrollY: chatLayout.scrollY,
                };
                finalCameraTransform = applyDirectorEffects(effects, viewport);
            }
        }

        // 7. Build camera transform style
        // The transform-origin uses the originX/originY from camera to zoom toward specific point
        // Origin is in 0-1 range where (0.5, 0.5) is center
        const cameraTransformString = `
        translate(${finalCameraTransform.translateX + finalCameraTransform.shakeX}px, ${finalCameraTransform.translateY + finalCameraTransform.shakeY}px)
        scale(${finalCameraTransform.scale})
        rotate(${finalCameraTransform.rotation}deg)
    `.replace(/\s+/g, ' ').trim();

        // Camera wrapper needs explicit dimensions for transform-origin to work correctly
        // Use device profile dimensions
        const cameraStyle: React.CSSProperties = {
            width: profile.dimensions.width,
            height: profile.dimensions.height,
            transformOrigin: `${finalCameraTransform.originX * 100}% ${finalCameraTransform.originY * 100}%`,
            transform: cameraTransformString,
            // No CSS transition - we handle all animation in JS for frame-perfect sync
            transition: 'none',
        };

        // 8. Device-specific transforms (legacy layout system)
        let deviceStyle: React.CSSProperties = {};

        if (layout.kind === "TRANSITION") {
            const transLayout = layout as any;
            const { deviceScale, deviceTranslateX, deviceTranslateY, deviceRotation } = transLayout;
            if (deviceScale !== 1 || deviceTranslateX !== 0 || deviceTranslateY !== 0 || deviceRotation !== 0) {
                deviceStyle = {
                    transformOrigin: "center center",
                    transform: `translate(${deviceTranslateX}px, ${deviceTranslateY}px) scale(${deviceScale}) rotate(${deviceRotation}deg)`,
                };
            }
        }

        // 9. Find active notifications for heads-up display
        const getActiveHeadsUpNotification = (): Notification | null => {
            if (!device.notifications || device.isLocked) return null;
            if (!showHeadsUpWhenAppOpen && appId) return null;

            // Find the most recent notification that should show as heads-up
            const headsUpNotifs = device.notifications.filter(n => {
                // Check mode
                const mode = n.mode || "both";
                if (mode === "lockscreen") return false;

                // Check if not dismissed and within display window
                if (n.dismissedAt !== undefined) return false;

                const timeSinceAppear = t - n.at;
                if (timeSinceAppear < 0) return false; // Not yet visible
                if (timeSinceAppear > headsUpDuration + 30) return false; // Past dismiss animation

                // Don't show notification from current app
                if (n.appId === appId) return false;

                return true;
            });

            // Return the most recent one
            return headsUpNotifs.length > 0 ? headsUpNotifs[headsUpNotifs.length - 1] : null;
        };

        const activeHeadsUp = getActiveHeadsUpNotification();

        // 10. Check for active call
        const hasActiveCall = device.call && device.call.status !== "ended";

        return (
            <div style={{
                width: profile.dimensions.width,
                height: profile.dimensions.height,
                position: "relative",
                overflow: "hidden"
            }}>
                {/* Camera wrapper - applies cinematic transforms */}
                <div style={cameraStyle}>
                    {/* Device wrapper - applies layout transforms */}
                    <div style={{ width: "100%", height: "100%", ...deviceStyle }}>
                        <DeviceFrame profileId={device.profileId} variant={variant}>
                            {/* Call Overlay (takes precedence over everything) */}
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

                            {/* Heads-Up Notification (when unlocked) */}
                            {activeHeadsUp && !hasActiveCall && (
                                <HeadsUpNotification
                                    notification={activeHeadsUp}
                                    currentTime={t}
                                    variant={variant}
                                    autoDismissAfter={headsUpDuration}
                                />
                            )}

                            {/* Dynamic Island (iOS) / Status Bar Widget (Android) */}
                            {!device.isLocked && !hasActiveCall && (
                                <DynamicIsland
                                    device={device}
                                    deviceProfile={profile}
                                    world={world}
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

