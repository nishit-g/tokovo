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
} from "@tokovo/core";
import { PluginManagerClass } from "@tokovo/react";
import { AppSurface, TokovoProvider } from "@tokovo/react";
import {
  createSelectors,
  NotificationBanner,
  getNotificationTokens,
} from "@tokovo/device-notifications";
import type { StackedNotificationInfo } from "@tokovo/device-notifications";
import {
  Keyboard,
  getKeyboardHeight,
} from "@tokovo/device-keyboard";

import { useDeviceRegistries } from "@tokovo/devices";
import { NotificationOverlay } from "./overlays/index.js";
import { LockscreenView, HomeScreenView } from "./screens/index.js";
import { VisualDebugger } from "./VisualDebugger.js";
import { DynamicIsland } from "./os/index.js";
import { useLayoutEngine } from "./engines/useLayoutEngine.js";
import { useCameraEngine } from "./engines/useCameraEngine.js";
import type { CameraEngineOutput } from "./engines/useCameraEngine.js";
import { AppErrorBoundary } from "./ErrorBoundary.js";
import { RendererRegistryProvider, type RendererRegistries } from "./RegistryContext.js";
import { AppTransition, UnlockTransition } from "./AppTransition.js";
import { computeLockscreenLayout } from "./layout/strategies/lockscreen.js";

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
  fps?: number;
  debug?: boolean;
  mode?: "preview" | "render";
  config?: TokovoConfigType;
  layoutCacheKey?: string;
  notificationConfig?: NotificationConfig;
  focusDeviceId?: string;
  eventIndex?: EventIndex;
  pluginManager: PluginManagerClass;
  registries: RendererRegistries;
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
  notificationConfig = {},
  focusDeviceId,
  eventIndex,
  pluginManager,
  disableCamera = false,
  onCameraDebugFrame,
  cameraDebugShowAllAnchors,
}) => {
  const pm = pluginManager;
  const deviceRegistries = useDeviceRegistries();
  const layoutCache = React.useMemo(
    () =>
      createLayoutCacheStore(
        layoutCacheKey ?? "tokovo:layout-cache:default",
      ),
    [layoutCacheKey],
  );

  void notificationConfig;

  // ==========================================================================
  // 1. LAYOUT ENGINE — Get layout blueprint
  // ==========================================================================
  const layoutOutput = useLayoutEngine({
    world,
    t,
    focusDeviceId,
    mode,
    config,
    layoutCache,
  });

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

  const { deviceId, device, appId, layout, profile, variant } = layoutOutput;

  // ==========================================================================
  // 2. CAMERA ENGINE — Get camera transform
  // ==========================================================================
  const cameraOutput = useCameraEngine({
    world,
    t,
    layoutOutput,
    eventIndex,
    disabled: disableCamera,
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

  // ==========================================================================
  // 3. HELPER: Find active heads-up notification
  // ==========================================================================
  // ==========================================================================
  // 3. LOGIC: NOTIFICATION SCHEDULER (Moved to Core)
  // ==========================================================================
  const notificationTokens = React.useMemo(() => {
    const platform = profile.platform === "android" ? "android" : "ios";
    return getNotificationTokens(platform, "light");
  }, [profile.platform]);

  const notificationSelectors = React.useMemo(
    () => createSelectors(notificationTokens),
    [notificationTokens],
  );

  const stackedNotifications = React.useMemo(() => {
    return notificationSelectors.getStackedBannerNotifications(device, t, fps);
  }, [device, t, fps, notificationSelectors]);

  const activeHeadsUp =
    stackedNotifications.length > 0 ? stackedNotifications[0] : null;

  if (debug && t % 30 === 0) {
    log.debug(`Frame ${t}`, {
      totalNotifs: device.notifications?.length ?? 0,
      visibleBannerCount: stackedNotifications.length,
      activeHeadsUp: activeHeadsUp ? activeHeadsUp.notification.id : "none",
      isLocked: device.isLocked,
      appId,
    });
  }

  const hasActiveCall = device.call && device.call.status !== "ended";

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
      ? Math.max(
          0,
          Math.min(
            1,
            (t - transition.startFrame) / transition.durationFrames,
          ),
        )
      : undefined;

  const isUnlockTransitionActive =
    transition?.kind === "unlock" &&
    transitionProgress !== undefined &&
    transitionProgress < 1;

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
    deviceRegistries.frames.getWithFallback(device.profileId, "iphone16") ??
    FallbackFrame;

  const statusBarTheme = (() => {
    const fallbackTheme = variant === "android" ? "dark" : "light";
    if (!appId) return fallbackTheme;
    const state = world.appState?.[appId];
    if (!state || typeof state === "string") return fallbackTheme;
    const theme = (state as { statusBarTheme?: "light" | "dark" })
      .statusBarTheme;
    return theme === "dark" ? "dark" : "light";
  })();

  const StatusBarStrategy =
    deviceRegistries.statusBars.getWithFallback(variant, "ios");

  const lockscreenLayoutForUnlock = React.useMemo(() => {
    if (!isUnlockTransitionActive) return undefined;
    return computeLockscreenLayout({
      world,
      t,
      activeDeviceId: deviceId,
      activeAppId: "lockscreen",
      viewKind: "LOCKSCREEN",
      viewportWidth: profile.dimensions.width,
      viewportHeight: profile.dimensions.height,
      safeAreaInsets: {
        top: profile.camera?.safeAreaTop ?? 0,
        bottom: profile.camera?.safeAreaBottom ?? 0,
        left: 0,
        right: 0,
      },
      config: config as unknown as Partial<import("@tokovo/core").LayoutConfig>,
    } as unknown as import("@tokovo/core").LayoutContext);
  }, [isUnlockTransitionActive, world, t, deviceId, profile, config]);

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
            statusBar={
              StatusBarStrategy ? (
                <StatusBarStrategy
                  os={device.os}
                  theme={statusBarTheme}
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
                    typeof device.profileId === "string" &&
                    device.profileId.startsWith("canvas-");
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
                          world={world}
                          deviceId={deviceId}
                          appId={appId}
                          t={t}
                          layout={layout}
                          platform={variant}
                          safeAreaInsets={{
                            top: (profile.camera?.safeAreaTop || 0) / scale,
                            bottom: (profile.camera?.safeAreaBottom || 0) / scale,
                            left: 0,
                            right: 0,
                          }}
                          keyboardHeight={
                            device.keyboard?.visible ? getKeyboardHeight(3) / scale : 0
                          }
                        >
                          <AppView
                            world={world}
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
                baseContent = (
                  <HomeScreenView config={device.homeScreen} variant={variant} />
                );
              } else if (device.isLocked) {
                // System: Lockscreen
                baseContent = (
                  <LockscreenView
                    notifications={device.notifications || []}
                    layout={layout}
                    variant={variant}
                    timestampMs={device.os?.clock}
                  />
                );
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
                    <LockscreenView
                      notifications={device.notifications || []}
                      layout={lockscreenLayoutForUnlock}
                      variant={variant}
                      timestampMs={device.os?.clock}
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

            {/* Lockscreen Notification Overlay */}
            {!device.isLocked && !isUnlockTransitionActive && (
              <NotificationOverlay
                notifications={device.notifications || []}
                variant={variant}
                layout={layout}
              />
            )}

            {/* Heads-Up Notifications (Stacked) */}
            {!hasActiveCall &&
              stackedNotifications.length > 0 &&
              (() => {
                const bannerScale = profile.dimensions.width / 393;
                return stackedNotifications.map(
                  (info: StackedNotificationInfo) => (
                    <NotificationBanner
                      key={info.notification.id}
                      notification={info.notification}
                      animationState={info.animationState}
                      animationProgress={info.animationProgress}
                      tokens={notificationTokens}
                      scale={bannerScale}
                      currentFrame={t}
                      fps={fps}
                      stackIndex={info.stackIndex}
                      stackOffset={info.stackOffset}
                      stackIndexChangedAtFrame={info.stackIndexChangedAtFrame}
                      previousStackOffset={info.previousStackOffset}
                    />
                  ),
                );
              })()}

            {/* Dynamic Island (iOS) - Slot Based */}
            {profile.dynamicIsland && !device.isLocked && !hasActiveCall && (
              <DynamicIsland
                device={device}
                deviceProfile={profile}
                world={world}
                t={t}
              />
            )}

            {/* Keyboard - Device Level */}
            {device.keyboard?.visible && (
              <Keyboard
                state={
                  device.keyboard as unknown as import("@tokovo/device-keyboard").KeyboardState
                }
                currentFrame={t}
                fps={fps}
                scale={3}
              />
            )}
          </FrameComponent>
        </div>
      </div>

      {debug && (
        <VisualDebugger
          world={world}
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
