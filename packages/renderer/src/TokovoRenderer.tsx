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
  EventIndex,
  PluginManager,
  PluginManagerClass,
  createScopedLogger,
} from "@tokovo/core";
import { AppSurface, TokovoProvider } from "@tokovo/react";
import {
  NotificationScheduler,
  HeadsUpNotification,
  NotificationInstance,
} from "@tokovo/device-notifications";
import { FrameRegistry, StatusBar, iPhone16Frame } from "@tokovo/devices";
import { AppRegistry } from "@tokovo/core";
import { NotificationOverlay } from "./overlays";
import { LockscreenView, HomeScreenView } from "./screens";
import { VisualDebugger } from "./VisualDebugger";
import { DynamicIsland } from "./os";
import { useLayoutEngine } from "./engines/useLayoutEngine";
import { useCameraEngine } from "./engines/useCameraEngine";
import { AppErrorBoundary } from "./ErrorBoundary";

const log = createScopedLogger("renderer");

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

  const { headsUpDuration = 150, showHeadsUpWhenAppOpen = true } =
    notificationConfig;

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

  const { deviceId, device, appId, viewKind, layout, profile, variant } =
    layoutOutput;

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

  if (debug && t % 30 === 0) {
    log.debug(`Frame ${t}`, {
      totalNotifs: device.os?.notifications?.length,
      activeHeadsUp: activeHeadsUp ? activeHeadsUp.id : "none",
      isLocked: device.isLocked,
      appId,
    });
  }

  const hasActiveCall = device.call && device.call.status !== "ended";

  if (debug && device.call) {
    log.debug(`Frame ${t} CALL STATE`, { call: device.call });
  }
  if (debug && hasActiveCall) {
    log.debug("hasActiveCall = true, showing call UI");
  }

  // ==========================================================================
  // 4. SELECT APP VIEW
  // ==========================================================================
  const AppView = appId ? pm.getView(appId) : null;

  // 5. RENDER — Paint the blueprints
  // ==========================================================================

  // Resolve Device Frame from registry (with fallback to iPhone16)
  const FrameComponent = FrameRegistry.get(device.profileId) || iPhone16Frame;

  return (
    <div
      style={{
        width: profile.dimensions.width,
        height: profile.dimensions.height,
        position: "relative",
      }}
    >
      {/* Camera wrapper — applies cinematic transforms */}
      <div style={cameraStyle}>
        {/* Device wrapper — applies layout transforms */}
        <div style={{ width: "100%", height: "100%", ...deviceStyle }}>
          {/* Extract statusBarTheme from foreground app's state */}
          <FrameComponent
            statusBar={
              <StatusBar
                os={device.os}
                variant={variant}
                theme={(() => {
                  if (!appId) return "light";
                  const state = world.appState?.[appId];
                  if (!state || typeof state === "string") return "light";
                  const theme = (state as { statusBarTheme?: "light" | "dark" })
                    .statusBarTheme;
                  return theme === "dark" ? "dark" : "light";
                })()}
              />
            }
          >
            {/* ========================================================================= */}
            {/* LAYER 1: APP VIEW                                                        */}
            {/* ========================================================================= */}
            {(() => {
              // Active App (Unlocked)
              if (AppView && !device.isLocked) {
                const pluginAssets = pm.get(appId!)?.assets;
                const designWidth = pluginAssets?.designWidth || 393;

                const scale = profile.dimensions.width / designWidth;

                return (
                  <AppErrorBoundary appId={appId!}>
                    <AppSurface
                      designWidth={designWidth}
                      targetWidth={profile.dimensions.width}
                      targetHeight={profile.dimensions.height}
                      backgroundColor={undefined}
                    >
                      <TokovoProvider
                        world={world}
                        deviceId={deviceId}
                        appId={appId!}
                        t={t}
                        layout={layout}
                        platform={variant}
                        safeAreaInsets={{
                          top: (profile.camera?.safeAreaTop || 0) / scale,
                          bottom: (profile.camera?.safeAreaBottom || 0) / scale,
                          left: 0,
                          right: 0,
                        }}
                      >
                        <AppView
                          world={world}
                          t={t}
                          layout={layout}
                          platform={variant}
                          deviceId={deviceId}
                          safeAreaInsets={{
                            top: (profile.camera?.safeAreaTop || 0) / scale,
                            bottom:
                              (profile.camera?.safeAreaBottom || 0) / scale,
                            left: 0,
                            right: 0,
                          }}
                        />
                      </TokovoProvider>
                    </AppSurface>
                  </AppErrorBoundary>
                );
              }

              // C. Valid System States (Lockscreen / Home)
              if (!device.isLocked && device.homeScreen) {
                return (
                  <HomeScreenView
                    config={device.homeScreen}
                    variant={variant}
                  />
                );
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
            {/* Note: Dynamic Island notification rendering not implemented yet, 
                            so we always show HeadsUpNotification when there's an active heads-up */}
            {activeHeadsUp && !hasActiveCall && (
              <HeadsUpNotification
                key={activeHeadsUp.id}
                notification={activeHeadsUp}
                currentTime={t}
                variant={variant}
                autoDismissAfter={headsUpDuration}
                deviceWidth={profile.dimensions.width}
              />
            )}

            {/* Dynamic Island (iOS) - Slot Based */}
            {profile.dynamicIsland && !device.isLocked && !hasActiveCall && (
              <DynamicIsland
                device={device}
                deviceProfile={profile}
                world={world}
                t={t}
              />
            )}
          </FrameComponent>
        </div>
      </div>

      {debug && <VisualDebugger world={world} t={t} />}
    </div>
  );
};
