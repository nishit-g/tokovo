import {
  EpisodeComposition,
  type EpisodeCompositionRuntime,
} from "@tokovo/composition";
import {
  TOKOVO_IOS_UI_FONT_FAMILY,
  TOKOVO_MONO_UI_FONT_FAMILY,
} from "@tokovo/visual-system";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useDelayRender,
  useRemotionEnvironment,
} from "remotion";
import { ErrorBoundary } from "./ErrorBoundary";
import { useVideoRunnerRuntime } from "./RuntimeSharedContext";
import type { EpisodeRendererProps } from "./episode-renderer-contract";
import {
  getCachedEpisodeRenderData,
  getEpisodeRenderData,
  type EpisodeRenderData,
} from "./render-data";
import type { CinematicCameraDebugFrame } from "@tokovo/renderer";

const CAMERA_DEBUG_ENABLED = process.env.TOKOVO_CAMERA_DEBUG === "1";

export const EpisodeRenderer: React.FC<EpisodeRendererProps> = (props) => {
  const environment = useRemotionEnvironment();
  const renderer = <EpisodeRendererInner key={props.episodeId} {...props} />;
  return environment.isRendering ? (
    renderer
  ) : (
    <ErrorBoundary>{renderer}</ErrorBoundary>
  );
};

const EpisodeRendererInner: React.FC<EpisodeRendererProps> = ({
  episodeId,
  renderDataKey,
  renderData: renderDataProp,
  cameraPlanId,
  cameraProjectionMode,
  cameraRenderLayer = "final",
}) => {
  const runnerRuntime = useVideoRunnerRuntime();
  const environment = useRemotionEnvironment();
  const frame = useCurrentFrame();
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const loadingHandleRef = useRef<number | null>(null);
  const [renderData, setRenderData] = useState<EpisodeRenderData | null>(
    () => renderDataProp ?? getCachedEpisodeRenderData(renderDataKey),
  );
  const [renderDataError, setRenderDataError] = useState<Error | null>(null);
  const [cinematicDebugFrame, setCinematicDebugFrame] =
    useState<CinematicCameraDebugFrame | null>(null);
  const [showCameraPanel, setShowCameraPanel] = useState(false);

  const runtime = useMemo(
    (): EpisodeCompositionRuntime => ({
      pluginManager: runnerRuntime.pluginManager,
      rendererRegistries: runnerRuntime.rendererRegistries,
      engineRegistries: runnerRuntime.tokovoRegistries.engine,
    }),
    [runnerRuntime],
  );
  const debugFromUrl = useMemo(() => {
    if (typeof window === "undefined") return false;
    const value = new URLSearchParams(window.location.search)
      .get("cameraDebug")
      ?.toLowerCase();
    return value === "1" || value === "true" || value === "yes";
  }, []);
  const cameraDebugEnabled =
    !environment.isRendering && (CAMERA_DEBUG_ENABLED || debugFromUrl);

  useEffect(() => {
    setShowCameraPanel(cameraDebugEnabled);
  }, [cameraDebugEnabled]);

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
        cancelRender(
          error instanceof Error ? error : new Error(String(error)),
        );
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
    if (environment.isRendering) {
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
        if (cancelled) return;
        setRenderData(nextRenderData);
        setRenderDataError(null);
        continueRender(handle);
        loadingHandleRef.current = null;
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const nextError =
          error instanceof Error ? error : new Error(String(error));
        setRenderDataError(nextError);
        continueRender(handle);
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
    environment.isRendering,
    episodeId,
    renderDataKey,
    renderDataProp,
  ]);

  const onDebugFrame = useCallback((value: CinematicCameraDebugFrame) => {
    setCinematicDebugFrame(value);
  }, []);

  if (renderDataError) {
    return (
      <AbsoluteFill style={errorStyle}>
        <div style={errorMarkStyle}>!</div>
        <h1 style={{ color: "#ff6b6b", fontSize: 32, marginBottom: 16 }}>
          Episode Render Failed
        </h1>
        <div style={{ color: "#8892b0", fontSize: 18, marginBottom: 32 }}>
          Episode: <code>{episodeId}</code>
        </div>
        <div style={errorBoxStyle}>
          <code
            style={{
              color: "#ff6b6b",
              fontSize: 14,
              whiteSpace: "pre-wrap",
            }}
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
        <div style={{ ...loadingMarkStyle, opacity }} />
        <div style={{ fontSize: 20, color: "#8696a0", opacity }}>
          Preparing {episodeId}...
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <EpisodeComposition
        episodeId={episodeId}
        renderData={renderData}
        runtime={runtime}
        cameraPlanId={cameraPlanId}
        cameraProjectionMode={cameraProjectionMode}
        cameraRenderLayer={cameraRenderLayer}
        cameraDebugEnabled={cameraDebugEnabled}
        onCinematicCameraDebugFrame={
          cameraDebugEnabled ? onDebugFrame : undefined
        }
      />
      {cameraProjectionMode === "preview" &&
      cameraRenderLayer === "final" ? (
        <div style={previewOpticsStyle}>PREVIEW OPTICS</div>
      ) : null}
      {cameraDebugEnabled ? (
        <>
          <button
            onClick={() => setShowCameraPanel((value) => !value)}
            style={cameraPanelToggleStyle}
          >
            {showCameraPanel ? "Hide Camera Panel" : "Show Camera Panel"}
          </button>
          {showCameraPanel && cinematicDebugFrame ? (
            <CameraDebugPanel
              episodeId={episodeId}
              frame={cinematicDebugFrame}
            />
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};

function CameraDebugPanel({
  episodeId,
  frame,
}: {
  episodeId: string;
  frame: CinematicCameraDebugFrame;
}): JSX.Element {
  return (
    <div style={cameraPanelStyle}>
      <div style={cameraPanelTitleStyle}>Camera VNext Debug</div>
      <div>episode: {episodeId}</div>
      <div>frame: {frame.t}</div>
      <div>story: {frame.storySignature}</div>
      <div>stage: {frame.stageSignature}</div>
      {frame.outputs.map((output) => (
        <React.Fragment key={output.outputId}>
          <div>output: {output.outputId}</div>
          <div>plan: {output.trace.planId}</div>
          <div>shot: {output.trace.shotId ?? "default"}</div>
          <div>rig: {output.trace.rigId}</div>
          <div>
            passes: {output.trace.projectionPassKinds.join(", ") || "affine"}
          </div>
          <div>subjects: {output.trace.subjects.length}</div>
          <div>tracking: {output.trace.tracking.mode}</div>
          <div>
            pose: {output.trace.finalPose.centerX.toFixed(1)},{" "}
            {output.trace.finalPose.centerY.toFixed(1)} ×{" "}
            {output.trace.finalPose.scale.toFixed(3)}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

const errorStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 48,
  fontFamily: TOKOVO_IOS_UI_FONT_FAMILY,
};
const errorMarkStyle: React.CSSProperties = {
  width: 72,
  height: 72,
  marginBottom: 24,
  borderRadius: 24,
  border: "2px solid #ff6b6b",
  display: "grid",
  placeItems: "center",
  color: "#ff6b6b",
  fontSize: 42,
  fontWeight: 700,
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
  background: "#0b141a",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};
const loadingMarkStyle: React.CSSProperties = {
  width: 54,
  height: 54,
  marginBottom: 16,
  borderRadius: 18,
  border: "2px solid #8696a0",
};
const previewOpticsStyle: React.CSSProperties = {
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
};
const cameraPanelToggleStyle: React.CSSProperties = {
  position: "absolute",
  top: 12,
  left: 12,
  zIndex: 11_000,
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
  zIndex: 11_000,
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
