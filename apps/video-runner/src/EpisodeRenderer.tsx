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
 * @see docs-v2/EPISODE-ARCH.md
 */

import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useDelayRender,
  useRemotionEnvironment,
  useVideoConfig,
} from "remotion";
import { BackgroundLayer } from "@tokovo/background";
import {
  replayIncremental,
  createKeyframedEventIndex,
  createStateCache,
  createConfig,
} from "@tokovo/core";
import {
  TokovoRenderer,
  AudioLayer,
  StoryOverlay,
  RendererRegistryProvider,
  type CameraDebugFrame,
} from "@tokovo/renderer";
import {
  SimpleVoiceLayer,
  VoiceLayer,
  type VoicePlayEvent,
  computeVoiceDuckingRanges,
} from "@tokovo/voice";
import { getDeviceProfile } from "@tokovo/devices";
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

const CAMERA_DEBUG_ENABLED = process.env.TOKOVO_CAMERA_DEBUG === "1";
const MAX_DEBUG_TRACE_FRAMES = 5000;

type CameraTraceStore = Map<number, CameraDebugFrame>;

// =============================================================================
// EPISODE RENDERER COMPONENT
// =============================================================================

// Wrapper that forces remount when episodeId changes
export const EpisodeRenderer: React.FC<EpisodeRendererProps> = ({
  episodeId,
  renderDataKey,
  renderData,
}) => {
  return (
    <ErrorBoundary>
      <EpisodeRendererInner
        key={episodeId}
        episodeId={episodeId}
        renderDataKey={renderDataKey}
        renderData={renderData}
      />
    </ErrorBoundary>
  );
};

// Inner component that does the actual rendering
const EpisodeRendererInner: React.FC<EpisodeRendererProps> = ({
  episodeId,
  renderDataKey,
  renderData: renderDataProp,
}) => {
  const { pluginManager, rendererRegistries, tokovoRegistries } =
    useVideoRunnerRuntime();
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = useRemotionEnvironment();
  const renderMode = env.isRendering ? "render" : "preview";
  const [renderData, setRenderData] = useState<EpisodeRenderData | null>(() =>
    renderDataProp ?? getCachedEpisodeRenderData(renderDataKey),
  );
  const [renderDataError, setRenderDataError] = useState<Error | null>(null);
  const loadingHandleRef = useRef<number | null>(null);
  const [cameraDebugFrame, setCameraDebugFrame] = useState<CameraDebugFrame | null>(null);
  const debugFromUrl = useMemo(() => {
    if (typeof window === "undefined") return false;
    const raw = new URLSearchParams(window.location.search).get("cameraDebug");
    if (!raw) return false;
    const value = raw.toLowerCase();
    return value === "1" || value === "true" || value === "yes";
  }, []);
  const cameraDebugEnabled =
    !env.isRendering && (CAMERA_DEBUG_ENABLED || debugFromUrl);
  const [showCameraPanel, setShowCameraPanel] = useState(cameraDebugEnabled);
  const [showAllAnchors, setShowAllAnchors] = useState(false);
  const [debugActionMessage, setDebugActionMessage] = useState<string>("");
  const traceRef = useRef<CameraTraceStore>(new Map());
  const [traceVersion, setTraceVersion] = useState(0);

  const config = useMemo(() => createConfig(), []);

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
        const nextError =
          error instanceof Error ? error : new Error(String(error));
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

  const handleCameraDebugFrame = useCallback((entry: CameraDebugFrame) => {
    setCameraDebugFrame(entry);
    const trace = traceRef.current;
    trace.set(entry.t, entry);
    if (trace.size > MAX_DEBUG_TRACE_FRAMES) {
      const oldestFrame = trace.keys().next().value;
      if (typeof oldestFrame === "number") {
        trace.delete(oldestFrame);
      }
    }
    setTraceVersion((v) => v + 1);
  }, []);

  const sortedTrace = useMemo(() => {
    return Array.from(traceRef.current.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, value]) => value);
  }, [traceVersion]);

  const timelineDurationInFrames = renderData?.durationInFrames ?? 1;

  const exportTraceJson = useCallback(() => {
    if (!cameraDebugFrame) return;
    const payload = {
      episodeId,
      exportedAt: new Date().toISOString(),
      traceFrames: sortedTrace,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${episodeId}.camera-trace.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDebugActionMessage("Trace JSON exported.");
  }, [cameraDebugFrame, episodeId, sortedTrace]);

  const copyReproPacket = useCallback(async () => {
    if (!cameraDebugFrame) return;
    const currentFrame = cameraDebugFrame.t;
    const packet = {
      episodeId,
      frame: currentFrame,
      url: window.location.href,
      debug: cameraDebugFrame,
      surroundingFrames: sortedTrace.filter(
        (f) => f.t >= currentFrame - 30 && f.t <= currentFrame + 30,
      ),
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(packet, null, 2));
      setDebugActionMessage("Repro packet copied to clipboard.");
    } catch {
      setDebugActionMessage("Clipboard blocked. Export trace JSON instead.");
    }
  }, [cameraDebugFrame, episodeId, sortedTrace]);

  // === CREATE EVENT INDEX + STATE CACHE ===
  const keyframedEventIndex = useMemo(() => {
    if (!renderData) return null;
    return createKeyframedEventIndex(
      renderData.prepared.events,
      renderData.prepared.keyframeInterval ??
        config.rendering.cacheKeyframeInterval,
    );
  }, [renderData, config.rendering.cacheKeyframeInterval]);

  const stateCache = useMemo(() => {
    if (!renderData) return null;
    return createStateCache(
      renderData.prepared.keyframeInterval ??
        config.rendering.cacheKeyframeInterval,
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
      backgroundConfig && typeof backgroundConfig === "object"
        ? backgroundConfig.type
        : null;
    return type === "particles" || type === "ambient";
  }, [renderData?.backgroundConfig]);

  // === CALCULATE FORMAT AND SCALE ===
  const fmt = useMemo((): { width: number; height: number; fps: number } => {
    if (!renderData) return { width: 1080, height: 1920, fps: 30 };
    return renderData.format;
  }, [renderData]);

  const { scale } = useMemo(() => {
    if (!renderData) return { scale: 1 };
    const deviceId =
      world?.camera?.activeDeviceId ||
      Object.keys(world?.devices ?? {})[0];
    const profileId =
      (deviceId && world?.devices?.[deviceId]?.profileId) ||
      "iphone16";
    const profile = getDeviceProfile(rendererRegistries.devices, profileId);
    // Scale device to fit in canvas with some margin for background visibility
    const fitScale = Math.min(
      fmt.width / profile.dimensions.width,
      fmt.height / profile.dimensions.height,
    );
    const isCanvas = profileId.startsWith("canvas-");
    // Canvas devices should fill the video. Phones keep a margin for background visibility.
    const s = isCanvas ? fitScale : fitScale * 0.85;
    return { scale: s };
  }, [renderData, fmt.height, fmt.width, world, rendererRegistries.devices]);

  // === LOADING STATE ===
  if (renderDataError) {
    return (
      <AbsoluteFill style={errorStyle}>
        <div style={{ fontSize: 80, marginBottom: 24 }}>⚠️</div>
        <h1 style={{ color: "#FF6B6B", fontSize: 32, marginBottom: 16 }}>
          Episode Render Failed
        </h1>
        <div style={{ color: "#8892B0", fontSize: 18, marginBottom: 32 }}>
          Episode: <code>{episodeId}</code>
        </div>
        <div style={errorBoxStyle}>
          <code
            style={{ color: "#FF6B6B", fontSize: 14, whiteSpace: "pre-wrap" }}
          >
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
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
        <div style={{ fontSize: 20, color: "#8696A0", opacity }}>
          Preparing {episodeId}...
        </div>
      </AbsoluteFill>
    );
  }

  if (!world || !keyframedEventIndex) {
    const opacity = 0.5 + 0.5 * Math.sin((frame * Math.PI) / 30);
    return (
      <AbsoluteFill style={loadingStyle}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
        <div style={{ fontSize: 20, color: "#8696A0", opacity }}>
          Loading {episodeId}...
        </div>
      </AbsoluteFill>
    );
  }

  const hasDevices = Object.keys(world.devices ?? {}).length > 0;

  // Log which audio path is being used (only on first few frames to avoid spam)
  // === RENDER ===
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0f",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* === BACKGROUND LAYER === */}
      <BackgroundLayer
        config={
          renderData.backgroundConfig as Parameters<
            typeof BackgroundLayer
          >[0]["config"] ?? "ambient-night"
        }
        frame={backgroundUsesTimeline ? frame : undefined}
        fps={backgroundUsesTimeline ? fps : undefined}
      />

      <RendererRegistryProvider registries={rendererRegistries}>
        <AudioLayer
          world={world}
          t={frame}
          musicDuckMultiplierOverride={musicDuckMultiplier}
        />
        {renderData.voiceManifest &&
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
        {hasDevices && (
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            <TokovoRenderer
              world={world}
              t={frame}
              fps={fps}
              debug={cameraDebugEnabled}
              mode={renderMode}
              config={config}
              layoutCacheKey={
                `${renderData.prepared.id}:${renderData.prepared.eventSignature ?? "unknown"}`
              }
              eventIndex={keyframedEventIndex}
              pluginManager={pluginManager}
              registries={rendererRegistries}
              onCameraDebugFrame={handleCameraDebugFrame}
              cameraDebugShowAllAnchors={showAllAnchors}
            />
          </div>
        )}
        <StoryOverlay
          world={world}
          t={frame}
          width={fmt.width}
          height={fmt.height}
        />
      </RendererRegistryProvider>
      {cameraDebugEnabled && (
        <>
          <button
            onClick={() => setShowCameraPanel((v) => !v)}
            style={cameraPanelToggleStyle}
          >
            {showCameraPanel ? "Hide Camera Panel" : "Show Camera Panel"}
          </button>
          {showCameraPanel && cameraDebugFrame && (
            <div style={cameraPanelStyle}>
              <div style={cameraPanelTitleStyle}>Camera Debug</div>
              <div style={cameraActionsRowStyle}>
                <button
                  onClick={() => setShowAllAnchors((v) => !v)}
                  style={cameraActionButtonStyle}
                >
                  {showAllAnchors ? "Hide All Anchors" : "Show All Anchors"}
                </button>
                <button onClick={exportTraceJson} style={cameraActionButtonStyle}>
                  Export Trace JSON
                </button>
                <button onClick={copyReproPacket} style={cameraActionButtonStyle}>
                  Copy Repro Packet
                </button>
              </div>
              {debugActionMessage && (
                <div style={cameraActionMessageStyle}>{debugActionMessage}</div>
              )}
              <div>episode: {episodeId}</div>
              <div>frame: {cameraDebugFrame.t}</div>
              <div>app: {cameraDebugFrame.appId ?? "-"}</div>
              <div>device: {cameraDebugFrame.deviceId}</div>
              <div>effect: {cameraDebugFrame.debugInfo?.activeEffectType ?? "-"}</div>
              <div>effectId: {cameraDebugFrame.debugInfo?.activeEffectId ?? "-"}</div>
              <div>target: {cameraDebugFrame.debugInfo?.requestedAnchor ?? "-"}</div>
              <div>resolved: {cameraDebugFrame.debugInfo?.resolvedAnchor ?? "-"}</div>
              <div>fallback: {cameraDebugFrame.debugInfo?.fallbackUsed ? "yes" : "no"}</div>
              <div>traceFrames: {sortedTrace.length}</div>
              {cameraDebugFrame.debugInfo?.warnings &&
                cameraDebugFrame.debugInfo.warnings.length > 0 && (
                  <div style={cameraWarningsRowStyle}>
                    {cameraDebugFrame.debugInfo.warnings.map((warning) => (
                      <span key={warning} style={cameraWarningPillStyle}>
                        {warning}
                      </span>
                    ))}
                  </div>
                )}
              <div>
                scale: {cameraDebugFrame.transform.scale.toFixed(3)}
              </div>
              <div>
                origin: {cameraDebugFrame.transform.originX.toFixed(3)},{" "}
                {cameraDebugFrame.transform.originY.toFixed(3)}
              </div>
              <div>
                translate: {cameraDebugFrame.transform.translateX.toFixed(2)},{" "}
                {cameraDebugFrame.transform.translateY.toFixed(2)}
              </div>
              <div>
                rotation: {cameraDebugFrame.transform.rotation.toFixed(2)}
              </div>
              <div>
                shake: {cameraDebugFrame.transform.shakeX.toFixed(2)},{" "}
                {cameraDebugFrame.transform.shakeY.toFixed(2)}
              </div>
              {cameraDebugFrame.debugInfo?.trackDiagnostics && (
                <>
                  <div>
                    deadZonePx: {cameraDebugFrame.debugInfo.trackDiagnostics.deadZonePx}
                  </div>
                  <div>
                    maxVelocityPxPerSec:{" "}
                    {cameraDebugFrame.debugInfo.trackDiagnostics.maxVelocityPxPerSec}
                  </div>
                  <div>
                    predictiveLookaheadFrames:{" "}
                    {
                      cameraDebugFrame.debugInfo.trackDiagnostics
                        .predictiveLookaheadFrames
                    }
                  </div>
                </>
              )}
              {cameraDebugFrame.debugInfo?.effectTimeline && (
                <div style={cameraTimelineWrapStyle}>
                  <div style={cameraTimelineHeaderStyle}>Effect Timeline</div>
                  <div style={cameraTimelineStyle}>
                    {cameraDebugFrame.debugInfo.effectTimeline.map((effect) => {
                      const left =
                        (effect.startFrame / timelineDurationInFrames) * 100;
                      const width = Math.max(
                        1,
                        ((effect.endFrame - effect.startFrame) /
                          timelineDurationInFrames) *
                          100,
                      );
                      const isActive =
                        cameraDebugFrame.t >= effect.startFrame &&
                        cameraDebugFrame.t < effect.endFrame;
                      return (
                        <div
                          key={effect.id}
                          style={{
                            ...cameraTimelineSegmentStyle,
                            left: `${left}%`,
                            width: `${width}%`,
                            background: isActive
                              ? "rgba(255, 189, 89, 0.95)"
                              : "rgba(98, 208, 255, 0.65)",
                          }}
                          title={`${effect.type} (${effect.startFrame}-${effect.endFrame})${effect.anchorId ? ` ${effect.anchorId}` : ""}`}
                        />
                      );
                    })}
                    <div
                      style={{
                        ...cameraTimelineCursorStyle,
                        left: `${(cameraDebugFrame.t / timelineDurationInFrames) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
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
  fontFamily: "SF Pro Display, -apple-system, sans-serif",
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
  fontFamily: "SF Mono, Menlo, Monaco, monospace",
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
  fontFamily: "SF Mono, Menlo, Monaco, monospace",
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

const cameraActionsRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
  marginBottom: 8,
};

const cameraActionButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(20,20,20,0.95)",
  color: "#fff",
  borderRadius: 6,
  padding: "4px 8px",
  fontFamily: "SF Mono, Menlo, Monaco, monospace",
  fontSize: 11,
  cursor: "pointer",
};

const cameraActionMessageStyle: React.CSSProperties = {
  color: "#9fd5ff",
  marginBottom: 8,
};

const cameraWarningsRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
  margin: "6px 0",
};

const cameraWarningPillStyle: React.CSSProperties = {
  background: "rgba(255, 104, 104, 0.95)",
  color: "#fff",
  borderRadius: 999,
  padding: "2px 8px",
  fontSize: 11,
};

const cameraTimelineWrapStyle: React.CSSProperties = {
  marginTop: 10,
};

const cameraTimelineHeaderStyle: React.CSSProperties = {
  color: "#fff",
  marginBottom: 4,
};

const cameraTimelineStyle: React.CSSProperties = {
  position: "relative",
  height: 28,
  borderRadius: 6,
  background: "rgba(255,255,255,0.12)",
  overflow: "hidden",
};

const cameraTimelineSegmentStyle: React.CSSProperties = {
  position: "absolute",
  top: 5,
  height: 18,
  borderRadius: 4,
};

const cameraTimelineCursorStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  bottom: 0,
  width: 2,
  background: "#ff2d2d",
};

export default EpisodeRenderer;
