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
  createScopedLogger,
  getAppStateForDevice,
  TokovoConfig,
  TokovoConfigType,
  type LayoutCacheStore,
} from "@tokovo/core";
import { PluginManagerClass } from "@tokovo/react";
import { AppSurface, TokovoProvider } from "@tokovo/react";
import {
  NotificationSurface,
  type PreparedNotificationProgram,
} from "@tokovo/device-notifications";
import { InputKeyboard, type PreparedInputProgram } from "@tokovo/device-keyboard";

import {
  projectDynamicIsland,
  SystemSurface,
  projectLockscreen,
  useDeviceRegistries,
} from "@tokovo/devices";
import { CallOverlay } from "./overlays/index.js";
import { DynamicIsland } from "./os/index.js";
import { useLayoutEngine } from "./engines/useLayoutEngine.js";
import { AppErrorBoundary } from "./ErrorBoundary.js";
import { RendererRegistryProvider, type RendererRegistries } from "./RegistryContext.js";
import { AppTransition, UnlockTransition } from "./AppTransition.js";

const log = createScopedLogger("renderer");

// =============================================================================
// TYPES
// =============================================================================

export interface TokovoRendererProps {
  world: WorldState;
  t: number;
  fps?: number;
  debug?: boolean;
  mode?: "preview" | "render";
  config?: TokovoConfigType;
  layoutCacheKey?: string;
  focusDeviceId?: string;
  pluginManager: PluginManagerClass;
  registries: RendererRegistries;
  inputProgram?: PreparedInputProgram;
  notificationProgram?: PreparedNotificationProgram;
}

function createLayoutCacheStore(scopeKey: string): LayoutCacheStore {
  const cache = new Map<string, unknown>();
  return {
    scopeKey,
    get<T>(key: string): T | undefined {
      return cache.get(key) as T | undefined;
    },
    set<T>(key: string, value: T): void {
      cache.set(key, value);
    },
    clear(): void {
      cache.clear();
    },
  };
}

// =============================================================================
// TOKOVO RENDERER
// =============================================================================

const TokovoRendererInner: React.FC<TokovoRendererProps> = ({
  world,
  t,
  fps = 30,
  debug,
  mode = "preview",
  config = TokovoConfig,
  layoutCacheKey,
  focusDeviceId,
  pluginManager,
  inputProgram,
  notificationProgram,
}) => {
  const pm = pluginManager;
  const deviceRegistries = useDeviceRegistries();
  const layoutCache = React.useMemo(
    () => createLayoutCacheStore(layoutCacheKey ?? "tokovo:layout-cache:default"),
    [layoutCacheKey],
  );
  // ==========================================================================
  // 1. LAYOUT ENGINE — Get layout blueprint
  // ==========================================================================
  const layoutOutput = useLayoutEngine({
    world,
    t,
    fps,
    focusDeviceId,
    mode,
    config,
    layoutCache,
    inputProgram,
    notificationProgram,
  });

  const {
    deviceId,
    device,
    appId,
    layout,
    profile,
    variant,
    inputProjection,
    notificationProjection,
    systemSurfaceProjection,
    appViewport,
    appDesignWidth,
    platformVisuals,
  } = layoutOutput;
  const renderWorld = world;

  const hasActiveCall = device.call && device.call.status !== "ended";
  const dynamicIslandProjection = React.useMemo(
    () =>
      profile.dynamicIsland && !hasActiveCall
        ? projectDynamicIsland({
            profile,
            dynamicIsland: device.dynamicIsland,
            screenRecording: device.screenRecording,
            currentFrame: t,
            fps,
            locale: device.os?.locale,
            appearance: device.os?.appearance,
            preferences: {
              textScale: device.os?.textScale,
              contrast: device.os?.contrast,
              motion: device.os?.motion,
              transparency: device.os?.transparency,
              materialPreference: device.os?.materialPreference,
              colorSeed: device.os?.colorSeed,
            },
          })
        : null,
    [device.dynamicIsland, device.os, device.screenRecording, fps, hasActiveCall, profile, t],
  );
  const hidesStatusBar = dynamicIslandProjection?.suppressesStatusBar === true;
  const keyboardHeightForLayout = inputProjection?.surface.viewportInset ?? 0;

  const transition = device.transition;

  const transitionProgress =
    transition && transition.durationFrames > 0
      ? Math.max(0, Math.min(1, (t - transition.startFrame) / transition.durationFrames))
      : undefined;

  const isUnlockTransitionActive =
    transition?.kind === "unlock" && transitionProgress !== undefined && transitionProgress < 1;

  const isAppTransitionActive =
    (transition?.kind === "openApp" || transition?.kind === "goHome") &&
    transitionProgress !== undefined &&
    transitionProgress < 1;

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

  const FrameComponent = deviceRegistries.frames.get(device.profileId);
  if (!FrameComponent) {
    throw new Error(`DEVICE_FRAME_MISSING: profile "${device.profileId}" has no registered frame.`);
  }

  const statusBarTheme = (() => {
    if (systemSurfaceProjection) return systemSurfaceProjection.theme.statusBarTheme;
    const fallbackTheme =
      device.appAppearance === "dark" || variant === "android" || device.isLocked
        ? "dark"
        : "light";
    if (!appId) return fallbackTheme;
    const state = getAppStateForDevice(renderWorld, appId, deviceId);
    if (!state || typeof state === "string") return fallbackTheme;
    const theme = (state as { statusBarTheme?: "light" | "dark" }).statusBarTheme;
    return theme === "dark" || theme === "light" ? theme : fallbackTheme;
  })();

  const StatusBarStrategy = deviceRegistries.statusBars.get(variant);
  if (profile.systemSurfaces && !StatusBarStrategy) {
    throw new Error(`STATUS_BAR_STRATEGY_MISSING: platform "${variant}" is not registered.`);
  }

  const deviceSurface = (
    <div
      style={{
        width: profile.dimensions.width,
        height: profile.dimensions.height,
        position: "relative",
      }}
    >
      <div style={{ width: "100%", height: "100%" }}>
        {/* Extract statusBarTheme from foreground app's state */}
        <FrameComponent
          variant={variant}
          homeIndicatorTheme={statusBarTheme}
          statusBar={
            StatusBarStrategy && !hidesStatusBar ? (
              <StatusBarStrategy
                os={device.os}
                theme={statusBarTheme}
                notificationIcons={notificationProjection?.statusBarIcons}
                deviceProfile={profile}
              />
            ) : null
          }
          dynamicIsland={
            profile.dynamicIsland && dynamicIslandProjection ? (
              <DynamicIsland
                deviceId={deviceId}
                device={device}
                deviceProfile={profile}
                world={renderWorld}
                t={t}
                projection={dynamicIslandProjection}
              />
            ) : null
          }
        >
          {/* ========================================================================= */}
          {/* LAYER 1: APP VIEW                                                        */}
          {/* ========================================================================= */}
          {(() => {
            let baseContent: React.ReactNode;

            // Active App (Unlocked)
            if (AppView && !device.isLocked) {
              if (!appId) {
                baseContent = <div style={{ flex: 1, backgroundColor: "black" }} />;
              } else {
                const isCanvasProfile =
                  typeof device.profileId === "string" && device.profileId.startsWith("canvas-");
                // Canvas devices should render 1:1 in video pixel coordinates.
                const designWidth = isCanvasProfile ? profile.display.width : appDesignWidth;
                if (designWidth === undefined) {
                  throw new Error(
                    `APP_DESIGN_WIDTH_MISSING: App "${appId}" must register assets.designWidth.`,
                  );
                }
                const scale = profile.display.width / designWidth;
                const logicalHeight = profile.display.height / scale;

                const appSurface = (
                  <AppSurface
                    designWidth={designWidth}
                    targetWidth={profile.display.width}
                    targetHeight={profile.display.height}
                    backgroundColor={undefined}
                  >
                    <TokovoProvider
                      world={renderWorld}
                      deviceId={deviceId}
                      appId={appId}
                      t={t}
                      fps={fps}
                      layout={layout}
                      platform={variant}
                      appViewport={appViewport}
                      platformVisuals={platformVisuals}
                      keyboardHeight={keyboardHeightForLayout / scale}
                      inputProgram={inputProgram}
                      inputProjection={inputProjection}
                    >
                      <AppView
                        world={renderWorld}
                        t={t}
                        layout={layout}
                        platform={variant}
                        deviceId={deviceId}
                        width={designWidth}
                        height={logicalHeight}
                        appViewport={appViewport}
                      />
                    </TokovoProvider>
                  </AppSurface>
                );
                baseContent =
                  mode === "render" ? (
                    appSurface
                  ) : (
                    <AppErrorBoundary appId={appId}>{appSurface}</AppErrorBoundary>
                  );
              }
            } else if (!device.isLocked && device.homeScreen) {
              // System: Home
              baseContent = systemSurfaceProjection ? (
                <SystemSurface projection={systemSurfaceProjection} />
              ) : (
                <div style={{ flex: 1, backgroundColor: "black" }} />
              );
            } else if (device.isLocked) {
              // System: Lockscreen
              baseContent = systemSurfaceProjection ? (
                <SystemSurface projection={systemSurfaceProjection} />
              ) : (
                <div style={{ flex: 1, backgroundColor: "black" }} />
              );
            } else {
              baseContent = <div style={{ flex: 1, backgroundColor: "black" }} />;
            }

            // Manual app transitions (open/goHome)
            if (isAppTransitionActive && transitionProgress !== undefined) {
              baseContent = (
                <AppTransition
                  platform={variant}
                  style={transition?.style ?? "platform-default"}
                  isOpening={transition?.kind === "openApp"}
                  isClosing={transition?.kind === "goHome"}
                  progress={transitionProgress}
                  originX={transition?.originX}
                  originY={transition?.originY}
                >
                  {baseContent}
                </AppTransition>
              );
            }

            // Auto unlock transition
            if (isUnlockTransitionActive && transitionProgress !== undefined) {
              baseContent = (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <SystemSurface
                    projection={projectLockscreen({
                      profile,
                      os: device.os,
                      homeWallpaper: device.homeScreen?.wallpaper,
                    })}
                  />
                  <div style={{ position: "absolute", inset: 0 }}>
                    <UnlockTransition platform={variant} progress={transitionProgress}>
                      {baseContent}
                    </UnlockTransition>
                  </div>
                </div>
              );
            }

            return baseContent;
          })()}

          {/* ========================================================================= */}
          {/* LAYER 2: SYSTEM OVERLAYS                                                  */}
          {/* ========================================================================= */}

          {!isUnlockTransitionActive && notificationProjection ? (
            <NotificationSurface
              projection={notificationProjection}
              pointScale={profile.pointScale}
            />
          ) : null}

          {device.call && hasActiveCall && (
            <CallOverlay
              call={device.call}
              currentTime={t}
              variant={variant}
              deviceProfile={profile}
            />
          )}

          {/* Keyboard - Device Level */}
          {inputProjection?.surface.visible && (
            <InputKeyboard projection={inputProjection} scale={profile.pointScale} />
          )}
        </FrameComponent>
      </div>
    </div>
  );
  return deviceSurface;
};

export const TokovoRenderer: React.FC<TokovoRendererProps> = (props) => {
  return (
    <RendererRegistryProvider registries={props.registries}>
      <TokovoRendererInner {...props} />
    </RendererRegistryProvider>
  );
};
