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
import { evaluateCameraOutput, type EvaluatedCameraOutput } from "@tokovo/camera";
import { selectPreparedCameraProgram, type PreparedCinematicPrograms } from "@tokovo/compiler";
import { evaluateStageFrame, type EvaluatedStageFrame } from "@tokovo/stage";
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
import { InputKeyboard, type PreparedInputProgram } from "@tokovo/device-keyboard";

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
import { CameraProjectionSurface, projectCinematicFrame } from "./camera/index.js";

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
  eventIndex?: EventIndex;
  pluginManager: PluginManagerClass;
  registries: RendererRegistries;
  inputProgram?: PreparedInputProgram;
  notificationProgram?: PreparedNotificationProgram;
  /** Camera-independent VNext stage plus selectable prepared camera plans. */
  cinematics?: PreparedCinematicPrograms;
  /** Selects cinematography without changing story replay or app state. */
  cameraPlanId?: string;
  /** Paints a camera-independent stage plate or projection-only metadata pass. */
  cameraProjectionBackend?: "final" | "texture-stage-plate" | "texture-projection-data";
  /**
   * In multi-device layouts, only the active device should apply camera transforms.
   * Non-active devices must render with an identity transform to avoid flakiness.
   */
  disableCamera?: boolean;
  onCameraDebugFrame?: (frame: CameraDebugFrame) => void;
  onCinematicCameraDebugFrame?: (frame: CinematicCameraDebugFrame) => void;
  onCameraTextureProjectionFrame?: (frame: CinematicTextureProjectionFrame) => void;
  cameraDebugShowAllAnchors?: boolean;
}

export interface CameraDebugFrame {
  t: number;
  appId?: string;
  deviceId: string;
  transform: CameraTransform;
  debugInfo?: CameraEngineOutput["debugInfo"];
}

export interface CinematicCameraDebugFrame {
  t: number;
  storySignature: string;
  stageSignature: string;
  outputs: readonly EvaluatedCameraOutput[];
}

export interface CinematicTextureProjectionFrame {
  t: number;
  storySignature: string;
  stageSignature: string;
  cameraSignature: string;
  planId: string;
  stage: { width: number; height: number };
  outputs: readonly EvaluatedCameraOutput[];
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
  registries,
  inputProgram,
  notificationProgram,
  cinematics,
  cameraPlanId,
  cameraProjectionBackend = "final",
  disableCamera = false,
  onCameraDebugFrame,
  onCinematicCameraDebugFrame,
  onCameraTextureProjectionFrame,
  cameraDebugShowAllAnchors,
}) => {
  const pm = pluginManager;
  const deviceRegistries = useDeviceRegistries();
  const layoutCache = React.useMemo(
    () => createLayoutCacheStore(layoutCacheKey ?? "tokovo:layout-cache:default"),
    [layoutCacheKey],
  );
  const cinematicStageDevice = cinematics?.stageProgram.program.nodes.find(
    (node) => node.source.kind === "device",
  );
  const cinematicDeviceId =
    cinematicStageDevice?.source.kind === "device"
      ? cinematicStageDevice.source.deviceId
      : undefined;

  // ==========================================================================
  // 1. LAYOUT ENGINE — Get layout blueprint
  // ==========================================================================
  const layoutOutput = useLayoutEngine({
    world,
    t,
    fps,
    focusDeviceId: focusDeviceId ?? cinematicDeviceId,
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
    disabled: disableCamera || Boolean(cinematics),
    debug,
  });

  const { cameraStyle, deviceStyle, transform, debugInfo } = cameraOutput;

  const cinematicFrame = React.useMemo<
    | {
        stage: EvaluatedStageFrame;
        outputs: readonly EvaluatedCameraOutput[];
      }
    | undefined
  >(() => {
    if (!cinematics) return undefined;
    const stage = evaluateStageFrame(cinematics.stageProgram, t);
    const subjectFrame = projectCinematicFrame({
      frame: t,
      world: renderWorld,
      layout: layoutOutput,
      stage,
      registry: registries.plugins.cinematicSubjects,
    });
    const program = selectPreparedCameraProgram(cinematics, cameraPlanId);
    return {
      stage,
      outputs: program.plan.outputs.map((output) =>
        evaluateCameraOutput(
          {
            program,
            outputId: output.id,
            frame: t,
            subjectFrame,
            mode,
          },
          registries.camera,
        ),
      ),
    };
  }, [cameraPlanId, cinematics, layoutOutput, mode, registries, renderWorld, t]);

  React.useEffect(() => {
    if (cinematics || !debug || !onCameraDebugFrame) return;
    onCameraDebugFrame({
      t,
      appId: appId ?? undefined,
      deviceId,
      transform,
      debugInfo,
    });
  }, [cinematics, debug, onCameraDebugFrame, t, appId, deviceId, transform, debugInfo]);

  React.useEffect(() => {
    if (!debug || !onCinematicCameraDebugFrame || !cinematicFrame || !cinematics) {
      return;
    }
    onCinematicCameraDebugFrame({
      t,
      storySignature: cinematics.storySignature,
      stageSignature: cinematics.stageSignature,
      outputs: cinematicFrame.outputs,
    });
  }, [cinematicFrame, cinematics, debug, onCinematicCameraDebugFrame, t]);

  React.useEffect(() => {
    if (
      (cameraProjectionBackend !== "texture-stage-plate" &&
        cameraProjectionBackend !== "texture-projection-data") ||
      !onCameraTextureProjectionFrame ||
      !cinematicFrame ||
      !cinematics
    ) {
      return;
    }
    const planId = cinematicFrame.outputs[0]?.trace.planId;
    if (!planId) return;
    const cameraSignature = cinematics.cameraSignatures[planId];
    if (!cameraSignature) {
      throw new Error(`Camera signature for plan "${planId}" is missing.`);
    }
    const stageRoot = cinematicFrame.stage.nodes.find(
      (node) => node.id === cinematicFrame.stage.rootNodeId,
    );
    if (!stageRoot) {
      throw new Error(`Camera VNext stage root "${cinematicFrame.stage.rootNodeId}" is missing.`);
    }
    onCameraTextureProjectionFrame({
      t,
      storySignature: cinematics.storySignature,
      stageSignature: cinematics.stageSignature,
      cameraSignature,
      planId,
      stage: {
        width: stageRoot.localBounds.width,
        height: stageRoot.localBounds.height,
      },
      outputs: cinematicFrame.outputs,
    });
  }, [cameraProjectionBackend, cinematicFrame, cinematics, onCameraTextureProjectionFrame, t]);

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
  const keyboardHeightForLayout = inputProjection?.surface.viewportInset ?? 0;

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

  if (cameraProjectionBackend === "texture-projection-data") {
    return null;
  }

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
      device.appAppearance === "dark" || variant === "android" || device.isLocked
        ? "dark"
        : "light";
    if (!appId) return fallbackTheme;
    const state = renderWorld.appState?.[appId];
    if (!state || typeof state === "string") return fallbackTheme;
    const theme = (state as { statusBarTheme?: "light" | "dark" }).statusBarTheme;
    return theme === "dark" || theme === "light" ? theme : fallbackTheme;
  })();

  const StatusBarStrategy = deviceRegistries.statusBars.getWithFallback(variant, "ios");

  const deviceSurface = (
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
                    ? profile.display.width
                    : pluginAssets?.designWidth || 393;
                  const scale = profile.display.width / designWidth;

                  baseContent = (
                    <AppErrorBoundary appId={appId}>
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
              <InputKeyboard projection={inputProjection} scale={profile.pixelDensity || 1} />
            )}
          </FrameComponent>
        </div>
      </div>

      {debug && !cinematics && (
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

  if (!cinematics || !cinematicFrame) {
    return deviceSurface;
  }

  const stageRoot = cinematicFrame.stage.nodes.find(
    (node) => node.id === cinematicFrame.stage.rootNodeId,
  );
  const deviceStageNode = cinematicFrame.stage.nodes.find(
    (node) => node.source.kind === "device" && node.source.deviceId === deviceId,
  );
  if (!stageRoot || !deviceStageNode) {
    throw new Error(`Camera VNext stage cannot paint device ${JSON.stringify(deviceId)}.`);
  }
  const stageWidth = stageRoot.localBounds.width;
  const stageHeight = stageRoot.localBounds.height;
  const matrix = deviceStageNode.worldTransform;
  const stageDevice = (
    <div
      style={{
        position: "absolute",
        left: deviceStageNode.localBounds.x,
        top: deviceStageNode.localBounds.y,
        width: deviceStageNode.localBounds.width,
        height: deviceStageNode.localBounds.height,
        transformOrigin: "0 0",
        transform: `matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, ${matrix.tx}, ${matrix.ty})`,
      }}
    >
      {deviceSurface}
    </div>
  );

  if (cameraProjectionBackend === "texture-stage-plate") {
    return (
      <div
        style={{
          width: stageWidth,
          height: stageHeight,
          position: "relative",
        }}
      >
        {stageDevice}
      </div>
    );
  }

  return (
    <div
      style={{
        width: stageWidth,
        height: stageHeight,
        position: "relative",
      }}
    >
      {[...cinematicFrame.outputs]
        .sort(
          (left, right) =>
            left.zIndex - right.zIndex || left.outputId.localeCompare(right.outputId),
        )
        .map((output) => (
          <CameraProjectionSurface
            key={output.outputId}
            id={`${output.trace.planId}-${output.outputId}`}
            output={output}
            stageWidth={stageWidth}
            stageHeight={stageHeight}
          >
            {stageDevice}
          </CameraProjectionSurface>
        ))}
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
