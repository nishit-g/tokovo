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
  createScopedLogger,
  TokovoConfig,
  TokovoConfigType,
  type LayoutCacheStore,
  type CameraTransform,
  projectWorldForDevice,
} from "@tokovo/core";
import { PluginManagerClass } from "@tokovo/react";
import { AppSurface, TokovoProvider } from "@tokovo/react";
import {
  NotificationSurface,
  type PreparedNotificationProgram,
} from "@tokovo/device-notifications";
import {
  InputKeyboard,
  type PreparedInputProgram,
} from "@tokovo/device-keyboard";

import {
  projectDynamicIsland,
  SystemSurface,
  projectLockscreen,
  useDeviceRegistries,
} from "@tokovo/devices";
import { CallOverlay } from "./overlays/index.js";
import { VisualDebugger } from "./VisualDebugger.js";
import { DynamicIsland } from "./os/index.js";
import { useLayoutEngine } from "./engines/useLayoutEngine.js";
import { useCameraEngine } from "./engines/useCameraEngine.js";
import type { CameraEngineOutput } from "./engines/useCameraEngine.js";
import { AppErrorBoundary } from "./ErrorBoundary.js";
import { RendererRegistryProvider, type RendererRegistries } from "./RegistryContext.js";
import { AppTransition, UnlockTransition } from "./AppTransition.js";

const log = createScopedLogger("renderer");

// =============================================================================
// TYPES
// =============================================================================

interface TokovoRendererProps {
  world: WorldState;
  t: number;
  fps?: number;
  debug?: boolean;
  mode?: "preview" | "render";
  config?: TokovoConfigType;
  layoutCacheKey?: string;
  focusDeviceId?: string;
  eventIndex?: EventIndex;
  pluginManager: PluginManagerClass;
  registries: RendererRegistries;
  inputProgram?: PreparedInputProgram;
  notificationProgram?: PreparedNotificationProgram;
  /**
   * In multi-device layouts, only the active device should apply camera transforms.
   * Non-active devices must render with an identity transform to avoid flakiness.
   */
  disableCamera?: boolean;
  onCameraDebugFrame?: (frame: CameraDebugFrame) => void;
  cameraDebugShowAllAnchors?: boolean;
}

export interface CameraDebugFrame {
  t: number;
  appId?: string;
  deviceId: string;
  transform: CameraTransform;
  debugInfo?: CameraEngineOutput["debugInfo"];
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
  eventIndex,
  pluginManager,
  inputProgram,
  notificationProgram,
  disableCamera = false,
  onCameraDebugFrame,
  cameraDebugShowAllAnchors,
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

  // Handle error state (device not found)
  if (layoutOutput.isError) {
    return (
      <div style={{ width: 430, height: 932, backgroundColor: "#000" }}>
        <div style={{ color: "#666", padding: 20, fontSize: 14 }}>Device not found</div>
      </div>
    );
  }

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
  } = layoutOutput;
  const renderWorld = React.useMemo(
    () => projectWorldForDevice(world, deviceId),
    [world, deviceId],
  );

  // ==========================================================================
  // 2. CAMERA ENGINE — Get camera transform
  // ==========================================================================
  const cameraOutput = useCameraEngine({
    world: renderWorld,
    t,
    fps,
    layoutOutput,
    eventIndex,
    disabled: disableCamera,
    debug,
  });

  const { cameraStyle, deviceStyle, transform, debugInfo } = cameraOutput;

  React.useEffect(() => {
    if (!debug || !onCameraDebugFrame) return;
    onCameraDebugFrame({
      t,
      appId: appId ?? undefined,
      deviceId,
      transform,
      debugInfo,
    });
  }, [debug, onCameraDebugFrame, t, appId, deviceId, transform, debugInfo]);

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
          })
        : null,
    [
      device.dynamicIsland,
      device.os?.appearance,
      device.os?.locale,
      device.screenRecording,
      fps,
      hasActiveCall,
      profile,
      t,
    ],
  );
  const hidesStatusBar = dynamicIslandProjection?.suppressesStatusBar === true;
  const keyboardHeightForLayout =
    inputProjection?.surface.viewportInset ?? 0;

  const transition = (device as unknown as { transition?: unknown }).transition as
    | {
        kind: "unlock" | "openApp" | "goHome";
        startFrame: number;
        durationFrames: number;
        style?: string;
        originX?: number;
        originY?: number;
      }
    | undefined;

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

  const FallbackFrame: React.FC<{
    statusBar?: React.ReactNode;
    children: React.ReactNode;
    variant?: string;
  }> = ({ statusBar, children: frameChildren }) => (
    <>
      {statusBar}
      {frameChildren}
    </>
  );

  // Resolve Device Frame from registry (with safe fallback)
  const FrameComponent =
    deviceRegistries.frames.getWithFallback(device.profileId, "iphone16") ?? FallbackFrame;

  const statusBarTheme = (() => {
    if (systemSurfaceProjection) return systemSurfaceProjection.theme.statusBarTheme;
    const fallbackTheme =
      device.appAppearance === "dark" ||
      variant === "android" ||
      device.isLocked
        ? "dark"
        : "light";
    if (!appId) return fallbackTheme;
    const state = renderWorld.appState?.[appId];
    if (!state || typeof state === "string") return fallbackTheme;
    const theme = (state as { statusBarTheme?: "light" | "dark" }).statusBarTheme;
    return theme === "dark" || theme === "light" ? theme : fallbackTheme;
  })();

  const StatusBarStrategy = deviceRegistries.statusBars.getWithFallback(variant, "ios");

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
                  const pluginAssets = pm.get(appId)?.assets;
                  const isCanvasProfile =
                    typeof device.profileId === "string" && device.profileId.startsWith("canvas-");
                  // Canvas devices should render 1:1 in video pixel coordinates.
                  const designWidth = isCanvasProfile
                    ? profile.dimensions.width
                    : pluginAssets?.designWidth || 393;
                  const scale = profile.dimensions.width / designWidth;

                  baseContent = (
                    <AppErrorBoundary appId={appId}>
                      <AppSurface
                        designWidth={designWidth}
                        targetWidth={profile.dimensions.width}
                        targetHeight={profile.dimensions.height}
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
                          safeAreaInsets={{
                            top: (profile.camera?.safeAreaTop || 0) / scale,
                            bottom: (profile.camera?.safeAreaBottom || 0) / scale,
                            left: 0,
                            right: 0,
                          }}
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
                            safeAreaInsets={{
                              top: (profile.camera?.safeAreaTop || 0) / scale,
                              bottom: (profile.camera?.safeAreaBottom || 0) / scale,
                              left: 0,
                              right: 0,
                            }}
                          />
                        </TokovoProvider>
                      </AppSurface>
                    </AppErrorBoundary>
                  );
                }
              } else if (!device.isLocked && device.homeScreen) {
                // System: Home
                baseContent = systemSurfaceProjection
                  ? <SystemSurface projection={systemSurfaceProjection} />
                  : <div style={{ flex: 1, backgroundColor: "black" }} />;
              } else if (device.isLocked) {
                // System: Lockscreen
                baseContent = systemSurfaceProjection
                  ? <SystemSurface projection={systemSurfaceProjection} />
                  : <div style={{ flex: 1, backgroundColor: "black" }} />;
              } else {
                baseContent = <div style={{ flex: 1, backgroundColor: "black" }} />;
              }

              // Manual app transitions (open/goHome)
              if (isAppTransitionActive && transitionProgress !== undefined) {
                baseContent = (
                  <AppTransition
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
                const phase = transitionProgress < 0.7 ? "face_id" : "unlocking";
                const p =
                  transitionProgress < 0.7
                    ? transitionProgress / 0.7
                    : (transitionProgress - 0.7) / 0.3;

                baseContent = (
                  <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    <SystemSurface
                      projection={projectLockscreen({
                        profile,
                        os: device.os,
                        fallbackWallpaper: device.homeScreen?.wallpaper,
                      })}
                    />
                    <div style={{ position: "absolute", inset: 0 }}>
                      <UnlockTransition phase={phase} progress={p}>
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
                pointScale={profile.pixelDensity || 1}
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
              <InputKeyboard
                projection={inputProjection}
                scale={profile.pixelDensity || 1}
              />
            )}
          </FrameComponent>

        </div>
      </div>

      {debug && (
        <VisualDebugger
          world={renderWorld}
          t={t}
          transform={transform}
          debugInfo={debugInfo}
          showAllAnchors={cameraDebugShowAllAnchors}
        />
      )}
    </div>
  );
};

export const TokovoRenderer: React.FC<TokovoRendererProps> = (props) => {
  return (
    <RendererRegistryProvider registries={props.registries}>
      <TokovoRendererInner {...props} />
    </RendererRegistryProvider>
  );
};
