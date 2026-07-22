/**
 * EpisodeRenderer - Universal Episode Rendering Component
 *
 * This SINGLE component renders ALL episodes. No more individual video files.
 *
 * Features:
 * - Receives episodeId via props
 * - Resolves episode from registry
 * - Handles preparation, rendering, errors
 * - Uses Remotion best practices (delayRender, etc.)
 *
 * @see docs/architecture/episodes.md
 */

import React, { useMemo, useState, useRef, useCallback, useEffect } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useDelayRender,
  useRemotionEnvironment,
  useVideoConfig,
} from "remotion";
import { BackgroundLayer } from "@tokovo/background";
import { TOKOVO_IOS_UI_FONT_FAMILY, TOKOVO_MONO_UI_FONT_FAMILY } from "@tokovo/visual-system";
import {
  replayIncremental,
  createKeyframedEventIndex,
  createStateCache,
  createConfig,
} from "@tokovo/core";
import {
  CinematicStageRenderer,
  AudioLayer,
  StoryOverlay,
  RendererRegistryProvider,
  type CinematicCameraDebugFrame,
  type CinematicTextureProjectionFrame,
} from "@tokovo/renderer";
import {
  SimpleVoiceLayer,
  VoiceLayer,
  type VoicePlayEvent,
  computeVoiceDuckingRanges,
} from "@tokovo/voice";
import type { EpisodeRendererProps } from "./episode-renderer-contract";
import { ErrorBoundary } from "./ErrorBoundary";
import { useVideoRunnerRuntime } from "./RuntimeSharedContext";
import {
  getCachedEpisodeRenderData,
  getEpisodeRenderData,
  type EpisodeRenderData,
} from "./render-data";
import { computeVoiceDuckMultiplierAtFrame } from "./voice-ducking";
import { useEpisodeAssetPrefetch } from "./asset-prefetch";
import { encodeCameraTextureProjectionCapture } from "./camera-texture-contract";

const CAMERA_DEBUG_ENABLED = process.env.TOKOVO_CAMERA_DEBUG === "1";

// =============================================================================
// EPISODE RENDERER COMPONENT
// =============================================================================

// Wrapper that forces remount when episodeId changes
export const EpisodeRenderer: React.FC<EpisodeRendererProps> = ({
  episodeId,
  renderDataKey,
  renderData,
  cameraPlanId,
  cameraProjectionMode,
  cameraRenderLayer = "final",
}) => {
  const env = useRemotionEnvironment();
  const renderer = (
    <EpisodeRendererInner
      key={episodeId}
      episodeId={episodeId}
      renderDataKey={renderDataKey}
      renderData={renderData}
      cameraPlanId={cameraPlanId}
      cameraProjectionMode={cameraProjectionMode}
      cameraRenderLayer={cameraRenderLayer}
    />
  );
  return env.isRendering ? renderer : <ErrorBoundary>{renderer}</ErrorBoundary>;
};

// Inner component that does the actual rendering
const EpisodeRendererInner: React.FC<EpisodeRendererProps> = ({
  episodeId,
  renderDataKey,
  renderData: renderDataProp,
  cameraPlanId,
  cameraProjectionMode,
  cameraRenderLayer = "final",
}) => {
  const { pluginManager, rendererRegistries, tokovoRegistries } = useVideoRunnerRuntime();
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = useRemotionEnvironment();
  const renderMode = !env.isRendering || cameraProjectionMode === "preview" ? "preview" : "render";
  const [renderData, setRenderData] = useState<EpisodeRenderData | null>(
    () => renderDataProp ?? getCachedEpisodeRenderData(renderDataKey),
  );
  const [renderDataError, setRenderDataError] = useState<Error | null>(null);
  const loadingHandleRef = useRef<number | null>(null);
  const [cinematicDebugFrame, setCinematicDebugFrame] = useState<CinematicCameraDebugFrame | null>(
    null,
  );
  const debugFromUrl = useMemo(() => {
    if (typeof window === "undefined") return false;
    const raw = new URLSearchParams(window.location.search).get("cameraDebug");
    if (!raw) return false;
    const value = raw.toLowerCase();
    return value === "1" || value === "true" || value === "yes";
  }, []);
  const cameraDebugEnabled = !env.isRendering && (CAMERA_DEBUG_ENABLED || debugFromUrl);
  const [showCameraPanel, setShowCameraPanel] = useState(cameraDebugEnabled);

  const config = useMemo(() => createConfig(), []);

  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    const handle = delayRender(`load bundled fonts for ${episodeId}`);
    let settled = false;
    document.fonts.ready
      .then(() => {
        if (settled) return;
        settled = true;
        continueRender(handle);
      })
      .catch((error: unknown) => {
        if (settled) return;
        settled = true;
        cancelRender(error instanceof Error ? error : new Error(String(error)));
      });
    return () => {
      if (!settled) {
        settled = true;
        continueRender(handle);
      }
    };
  }, [cancelRender, continueRender, delayRender, episodeId]);

  useEffect(() => {
    if (renderDataProp) {
      setRenderData(renderDataProp);
      setRenderDataError(null);
      return;
    }

    const cached = getCachedEpisodeRenderData(renderDataKey);
    if (cached) {
      setRenderData(cached);
      setRenderDataError(null);
      return;
    }

    if (env.isRendering) {
      const error = new Error(
        `Missing prepared render data for episode ${episodeId}. Rendering must pass renderData from calculateMetadata().`,
      );
      setRenderDataError(error);
      cancelRender(error);
      return;
    }

    const handle = delayRender(`load render data for ${episodeId}`);
    loadingHandleRef.current = handle;
    let cancelled = false;

    getEpisodeRenderData(episodeId)
      .then((nextRenderData) => {
        if (cancelled) {
          return;
        }
        setRenderData(nextRenderData);
        setRenderDataError(null);
        continueRender(handle);
        loadingHandleRef.current = null;
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        const nextError = error instanceof Error ? error : new Error(String(error));
        setRenderDataError(nextError);
        if (env.isRendering) {
          cancelRender(nextError);
        } else {
          continueRender(handle);
        }
        loadingHandleRef.current = null;
      });

    return () => {
      cancelled = true;
      if (loadingHandleRef.current !== null) {
        continueRender(loadingHandleRef.current);
        loadingHandleRef.current = null;
      }
    };
  }, [
    cancelRender,
    continueRender,
    delayRender,
    env.isRendering,
    episodeId,
    renderDataKey,
    renderDataProp,
  ]);

  useEpisodeAssetPrefetch({
    assetRefs: renderData?.prepared.assetRefs ?? [],
    frame,
    fps,
    disabled: env.isRendering || !renderData,
  });

  const handleCameraTextureProjectionFrame = useCallback(
    (entry: CinematicTextureProjectionFrame) => {
      // eslint-disable-next-line no-console -- Browser-log IPC is Remotion's deterministic plate metadata channel.
      console.info(
        encodeCameraTextureProjectionCapture({
          version: 4,
          frame: entry.t,
          storySignature: entry.storySignature,
          stageSignature: entry.stageSignature,
          cameraSignature: entry.cameraSignature,
          planId: entry.planId,
          stage: entry.stage,
          outputs: entry.outputs.map((output) => ({
            outputId: output.outputId,
            sourceStageNodeId: output.sourceStageNodeId,
            zIndex: output.zIndex,
            viewport: output.pose.clipRect,
            viewMatrix: output.viewMatrix,
            opacity: output.pose.opacity,
            clipRadiusPx: output.clipRadiusPx,
            shadow: output.shadow,
            projectionPasses: output.projectionPasses,
            quality: {
              pose: {
                centerX: output.pose.centerX,
                centerY: output.pose.centerY,
                scale: output.pose.scale,
                rotationDeg: output.pose.rotationDeg,
              },
              subjectResolution: output.trace.subjectResolution,
              subjectFillRatio: output.trace.quality.subjectFillRatio,
              cropCompensation: output.trace.quality.cropCompensation,
              intentionalDiscontinuity:
                output.trace.transition?.durationFrames === 0 ||
                output.trace.transition?.whipActive === true,
            },
          })),
        }),
      );
    },
    [],
  );

  // === CREATE EVENT INDEX + STATE CACHE ===
  const keyframedEventIndex = useMemo(() => {
    if (!renderData) return null;
    return createKeyframedEventIndex(
      renderData.prepared.events,
      renderData.prepared.keyframeInterval ?? config.rendering.cacheKeyframeInterval,
    );
  }, [renderData, config.rendering.cacheKeyframeInterval]);

  const stateCache = useMemo(() => {
    if (!renderData) return null;
    return createStateCache(
      renderData.prepared.keyframeInterval ?? config.rendering.cacheKeyframeInterval,
    );
  }, [renderData, config.rendering.cacheKeyframeInterval]);

  // === RUN EPISODE AT CURRENT FRAME ===
  const world = useMemo(() => {
    if (!renderData || !keyframedEventIndex || !stateCache) return null;
    return replayIncremental(
      renderData.prepared.initialWorld,
      renderData.prepared.events,
      frame,
      {
        mode: renderMode,
        fps,
        registries: tokovoRegistries.engine,
        config,
      },
      keyframedEventIndex,
      stateCache,
    );
  }, [
    renderData,
    keyframedEventIndex,
    stateCache,
    frame,
    fps,
    config,
    renderMode,
    tokovoRegistries.engine,
  ]);

  // === BUILD VOICE EVENTS FOR PER-SEGMENT CONTROL ===
  const voiceEvents = useMemo((): VoicePlayEvent[] => {
    if (!renderData?.voiceConfig?.usePerSegmentControl) return [];
    const schedule = renderData.voiceConfig.segmentSchedule;
    if (!schedule) return [];

    return schedule.map((s) => ({
      kind: "voice" as const,
      type: "play" as const,
      at: s.at,
      payload: {
        segmentId: s.segmentId,
        volume: s.volume,
        speed: s.speed,
      },
    }));
  }, [renderData]);

  const voiceDuckingRanges = useMemo(() => {
    if (!renderData?.voiceManifest || voiceEvents.length === 0) {
      return [];
    }

    return computeVoiceDuckingRanges(voiceEvents, renderData.voiceManifest, fps)
      .map(({ startFrame, endFrame }) => ({ startFrame, endFrame }))
      .sort((a, b) => a.startFrame - b.startFrame);
  }, [renderData, voiceEvents, fps]);

  const musicDuckMultiplier = useMemo(() => {
    return computeVoiceDuckMultiplierAtFrame(frame, voiceDuckingRanges);
  }, [frame, voiceDuckingRanges]);

  const backgroundUsesTimeline = useMemo(() => {
    const backgroundConfig = renderData?.backgroundConfig;
    const type =
      backgroundConfig && typeof backgroundConfig === "object" ? backgroundConfig.type : null;
    return type === "particles" || type === "ambient";
  }, [renderData?.backgroundConfig]);

  // === CALCULATE FORMAT AND SCALE ===
  const fmt = useMemo((): { width: number; height: number; fps: number } => {
    if (!renderData) return { width: 1080, height: 1920, fps: 30 };
    if (cameraRenderLayer === "camera-projection-data") {
      return { width: 2, height: 2, fps: renderData.format.fps };
    }
    if (cameraRenderLayer === "camera-plate") {
      const stage = renderData.prepared.cinematics?.stageProgram.program;
      const root = stage?.nodes.find((node) => node.id === stage.rootNodeId);
      if (!root) {
        throw new Error(
          "CAM_TEXTURE_STAGE_ROOT_MISSING: Camera plate rendering requires a VNext stage root.",
        );
      }
      return {
        width: root.localBounds.width,
        height: root.localBounds.height,
        fps: renderData.format.fps,
      };
    }
    return renderData.format;
  }, [cameraRenderLayer, renderData]);

  // === LOADING STATE ===
  if (renderDataError) {
    return (
      <AbsoluteFill style={errorStyle}>
        <div
          style={{
            width: 72,
            height: 72,
            marginBottom: 24,
            borderRadius: 24,
            border: "2px solid #FF6B6B",
            display: "grid",
            placeItems: "center",
            color: "#FF6B6B",
            fontSize: 42,
            fontWeight: 700,
          }}
        >
          !
        </div>
        <h1 style={{ color: "#FF6B6B", fontSize: 32, marginBottom: 16 }}>Episode Render Failed</h1>
        <div style={{ color: "#8892B0", fontSize: 18, marginBottom: 32 }}>
          Episode: <code>{episodeId}</code>
        </div>
        <div style={errorBoxStyle}>
          <code style={{ color: "#FF6B6B", fontSize: 14, whiteSpace: "pre-wrap" }}>
            {renderDataError.message}
          </code>
        </div>
      </AbsoluteFill>
    );
  }

  if (!renderData) {
    const opacity = 0.5 + 0.5 * Math.sin((frame * Math.PI) / 30);
    return (
      <AbsoluteFill style={loadingStyle}>
        <div
          style={{
            width: 54,
            height: 54,
            marginBottom: 16,
            borderRadius: 18,
            border: "2px solid #8696A0",
            opacity,
          }}
        />
        <div style={{ fontSize: 20, color: "#8696A0", opacity }}>Preparing {episodeId}...</div>
      </AbsoluteFill>
    );
  }

  if (!world || !keyframedEventIndex) {
    const opacity = 0.5 + 0.5 * Math.sin((frame * Math.PI) / 30);
    return (
      <AbsoluteFill style={loadingStyle}>
        <div
          style={{
            width: 54,
            height: 54,
            marginBottom: 16,
            borderRadius: 18,
            border: "2px solid #8696A0",
            opacity,
          }}
        />
        <div style={{ fontSize: 20, color: "#8696A0", opacity }}>Loading {episodeId}...</div>
      </AbsoluteFill>
    );
  }

  const hasDevices = Object.keys(world.devices ?? {}).length > 0;
  const cinematics = renderData.prepared.cinematics;
  if (!cinematics) {
    throw new Error(`CAM_VNEXT_REQUIRED: Episode "${episodeId}" did not compile a CameraPlan.`);
  }
  const rendersUnderlay = cameraRenderLayer === "final" || cameraRenderLayer === "underlay";
  const rendersCamera =
    cameraRenderLayer === "final" ||
    cameraRenderLayer === "camera-plate" ||
    cameraRenderLayer === "camera-projection-data";
  const rendersForeground =
    cameraRenderLayer === "final" || cameraRenderLayer === "foreground-plate";

  // Log which audio path is being used (only on first few frames to avoid spam)
  // === RENDER ===
  return (
    <AbsoluteFill
      style={{
        backgroundColor: rendersUnderlay ? "#0a0a0f" : "transparent",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* === BACKGROUND LAYER === */}
      {rendersUnderlay && (
        <BackgroundLayer
          config={
            (renderData.backgroundConfig as Parameters<typeof BackgroundLayer>[0]["config"]) ??
            "studio-quiet-dark"
          }
          frame={backgroundUsesTimeline ? frame : undefined}
          fps={backgroundUsesTimeline ? fps : undefined}
        />
      )}

      <RendererRegistryProvider registries={rendererRegistries}>
        {rendersUnderlay && (
          <AudioLayer
            world={world}
            t={frame}
            musicDuckMultiplierOverride={musicDuckMultiplier}
            inputProgram={renderData.prepared.inputProgram}
            notificationProgram={renderData.prepared.notificationProgram}
          />
        )}
        {rendersUnderlay &&
          renderData.voiceManifest &&
          renderData.voiceConfig?.audioPath &&
          (renderData.voiceConfig.usePerSegmentControl && voiceEvents.length > 0 ? (
            <VoiceLayer
              manifest={renderData.voiceManifest}
              audioUrl={renderData.voiceConfig.audioPath}
              events={voiceEvents}
              volume={renderData.voiceConfig.volume ?? 1}
            />
          ) : (
            <SimpleVoiceLayer
              manifest={renderData.voiceManifest}
              audioUrl={renderData.voiceConfig.audioPath}
              startFrame={renderData.voiceConfig.startFrame ?? 0}
              volume={renderData.voiceConfig.volume ?? 1}
            />
          ))}
        {rendersCamera && hasDevices ? (
          <div
            style={{
              width: fmt.width,
              height: fmt.height,
              position: "relative",
            }}
          >
            <CinematicStageRenderer
              world={world}
              t={frame}
              fps={fps}
              debug={cameraDebugEnabled}
              mode={renderMode}
              config={config}
              layoutCacheKey={`${renderData.prepared.id}:${renderData.prepared.eventSignature ?? "unknown"}`}
              pluginManager={pluginManager}
              registries={rendererRegistries}
              inputProgram={renderData.prepared.inputProgram}
              notificationProgram={renderData.prepared.notificationProgram}
              cinematics={cinematics}
              cameraPlanId={cameraPlanId}
              cameraProjectionBackend={
                cameraRenderLayer === "camera-plate"
                  ? "texture-stage-plate"
                  : cameraRenderLayer === "camera-projection-data"
                    ? "texture-projection-data"
                    : "final"
              }
              onCinematicCameraDebugFrame={setCinematicDebugFrame}
              onCameraTextureProjectionFrame={
                cameraRenderLayer === "camera-plate" ||
                cameraRenderLayer === "camera-projection-data"
                  ? handleCameraTextureProjectionFrame
                  : undefined
              }
            />
          </div>
        ) : null}
        {rendersForeground && (
          <StoryOverlay world={world} t={frame} width={fmt.width} height={fmt.height} />
        )}
      </RendererRegistryProvider>
      {cameraProjectionMode === "preview" && cameraRenderLayer === "final" ? (
        <div
          data-projection-mode="preview"
          style={{
            position: "absolute",
            right: 18,
            bottom: 16,
            zIndex: 50_000,
            padding: "7px 10px",
            borderRadius: 8,
            background: "rgba(4, 6, 12, 0.72)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.9)",
            fontFamily: TOKOVO_MONO_UI_FONT_FAMILY,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.8,
            lineHeight: 1,
          }}
        >
          PREVIEW OPTICS
        </div>
      ) : null}
      {cameraDebugEnabled && (
        <>
          <button onClick={() => setShowCameraPanel((v) => !v)} style={cameraPanelToggleStyle}>
            {showCameraPanel ? "Hide Camera Panel" : "Show Camera Panel"}
          </button>
          {showCameraPanel && cinematicDebugFrame ? (
            <div style={cameraPanelStyle}>
              <div style={cameraPanelTitleStyle}>Camera VNext Debug</div>
              <div>episode: {episodeId}</div>
              <div>frame: {cinematicDebugFrame.t}</div>
              <div>story: {cinematicDebugFrame.storySignature}</div>
              <div>stage: {cinematicDebugFrame.stageSignature}</div>
              {cinematicDebugFrame.outputs.map((output) => (
                <React.Fragment key={output.outputId}>
                  <div>output: {output.outputId}</div>
                  <div>plan: {output.trace.planId}</div>
                  <div>shot: {output.trace.shotId ?? "default"}</div>
                  <div>rig: {output.trace.rigId}</div>
                  <div>passes: {output.trace.projectionPassKinds.join(", ") || "affine"}</div>
                  <div>subjects: {output.trace.subjects.length}</div>
                  <div>tracking: {output.trace.tracking.mode}</div>
                  <div>composition: {output.trace.constraints.compositionProfileId}</div>
                  <div>
                    editorial insets: {output.trace.constraints.editorialInsets.top}/
                    {output.trace.constraints.editorialInsets.right}/
                    {output.trace.constraints.editorialInsets.bottom}/
                    {output.trace.constraints.editorialInsets.left}
                  </div>
                  <div>
                    pose: {output.trace.finalPose.centerX.toFixed(1)},{" "}
                    {output.trace.finalPose.centerY.toFixed(1)} ×{" "}
                    {output.trace.finalPose.scale.toFixed(3)}
                  </div>
                  <div>trajectory: {output.trace.bakedTrajectory ? "baked" : "direct"}</div>
                </React.Fragment>
              ))}
            </div>
          ) : null}
        </>
      )}
    </AbsoluteFill>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const errorStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 48,
  fontFamily: TOKOVO_IOS_UI_FONT_FAMILY,
};

const errorBoxStyle: React.CSSProperties = {
  background: "rgba(255, 107, 107, 0.1)",
  border: "1px solid rgba(255, 107, 107, 0.3)",
  borderRadius: 12,
  padding: 24,
  maxWidth: 800,
  width: "100%",
};

const loadingStyle: React.CSSProperties = {
  background: "#0B141A",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const cameraPanelToggleStyle: React.CSSProperties = {
  position: "absolute",
  top: 12,
  left: 12,
  zIndex: 11000,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(0,0,0,0.78)",
  color: "#fff",
  borderRadius: 8,
  padding: "8px 10px",
  fontFamily: TOKOVO_MONO_UI_FONT_FAMILY,
  fontSize: 12,
  cursor: "pointer",
};

const cameraPanelStyle: React.CSSProperties = {
  position: "absolute",
  top: 52,
  left: 12,
  zIndex: 11000,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(0,0,0,0.84)",
  color: "#b6ffd0",
  borderRadius: 10,
  padding: 12,
  minWidth: 320,
  fontFamily: TOKOVO_MONO_UI_FONT_FAMILY,
  fontSize: 12,
  lineHeight: 1.45,
  pointerEvents: "auto",
  maxWidth: 420,
};

const cameraPanelTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#fff",
  marginBottom: 8,
};

export default EpisodeRenderer;
