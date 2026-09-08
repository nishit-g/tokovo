import { BackgroundLayer } from "@tokovo/background";
import {
  createConfig,
  createKeyframedEventIndex,
  createStateCache,
  replayIncremental,
  resolveStaticAssetSrc,
} from "@tokovo/core";
import {
  AudioLayer,
  CinematicStageRenderer,
  RendererRegistryProvider,
  StoryOverlay,
  type CinematicTextureProjectionFrame,
} from "@tokovo/renderer";
import {
  computeVoiceDuckingRanges,
  SimpleVoiceLayer,
  VoiceLayer,
  type VoicePlayEvent,
} from "@tokovo/voice";
import { useCallback, useMemo } from "react";
import {
  AbsoluteFill,
  Artifact,
  staticFile,
  useCurrentFrame,
  useRemotionEnvironment,
  useVideoConfig,
} from "remotion";
import { useEpisodeAssetPrefetch } from "./asset-prefetch.js";
import { encodeCameraTextureProjectionCapture } from "./camera-texture-contract.js";
import type { EpisodeCompositionProps } from "./types.js";
import { computeVoiceDuckMultiplierAtFrame } from "./voice-ducking.js";

export function EpisodeComposition({
  episodeId,
  renderData,
  runtime,
  cameraPlanId,
  cameraProjectionMode,
  cameraRenderLayer = "final",
  cameraDebugEnabled = false,
  onCinematicCameraDebugFrame,
}: EpisodeCompositionProps): JSX.Element {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const environment = useRemotionEnvironment();
  const renderMode =
    cameraProjectionMode ??
    (environment.isRendering ? "render" : "preview");
  const config = useMemo(() => createConfig(), []);
  const voiceConfig = renderData.voiceConfig;
  const voiceAudioUrl = useMemo(
    () =>
      voiceConfig?.audioPath
        ? resolveStaticAssetSrc(voiceConfig.audioPath, staticFile)
        : null,
    [voiceConfig?.audioPath],
  );

  useEpisodeAssetPrefetch({
    assetRefs: renderData.prepared.assetRefs,
    frame,
    fps,
    disabled: environment.isRendering,
  });

  const keyframedEventIndex = useMemo(
    () =>
      createKeyframedEventIndex(
        renderData.prepared.events,
        renderData.prepared.keyframeInterval ??
          config.rendering.cacheKeyframeInterval,
      ),
    [
      config.rendering.cacheKeyframeInterval,
      renderData.prepared.events,
      renderData.prepared.keyframeInterval,
    ],
  );
  const stateCache = useMemo(
    () =>
      createStateCache(
        renderData.prepared.keyframeInterval ??
          config.rendering.cacheKeyframeInterval,
      ),
    [
      config.rendering.cacheKeyframeInterval,
      renderData.prepared.keyframeInterval,
      renderData.sourceSignature,
    ],
  );
  const world = useMemo(
    () =>
      replayIncremental(
        renderData.prepared.initialWorld,
        renderData.prepared.events,
        frame,
        {
          mode: renderMode,
          fps,
          registries: runtime.engineRegistries,
          config,
        },
        keyframedEventIndex,
        stateCache,
      ),
    [
      config,
      fps,
      frame,
      keyframedEventIndex,
      renderData.prepared.events,
      renderData.prepared.initialWorld,
      renderMode,
      runtime.engineRegistries,
      stateCache,
    ],
  );

  const voiceEvents = useMemo((): VoicePlayEvent[] => {
    if (!renderData.voiceConfig?.usePerSegmentControl) return [];
    return (renderData.voiceConfig.segmentSchedule ?? []).map((segment) => ({
      kind: "voice",
      type: "play",
      at: segment.at,
      payload: {
        segmentId: segment.segmentId,
        volume: segment.volume,
        speed: segment.speed,
      },
    }));
  }, [renderData.voiceConfig]);
  const voiceDuckingRanges = useMemo(() => {
    if (!renderData.voiceManifest || voiceEvents.length === 0) return [];
    return computeVoiceDuckingRanges(
      voiceEvents,
      renderData.voiceManifest,
      fps,
    )
      .map(({ startFrame, endFrame }) => ({ startFrame, endFrame }))
      .sort((left, right) => left.startFrame - right.startFrame);
  }, [fps, renderData.voiceManifest, voiceEvents]);
  const musicDuckMultiplier = useMemo(
    () => computeVoiceDuckMultiplierAtFrame(frame, voiceDuckingRanges),
    [frame, voiceDuckingRanges],
  );
  const backgroundUsesTimeline = useMemo(() => {
    const background = renderData.backgroundConfig;
    const type =
      background && typeof background === "object"
        ? background.type
        : null;
    return type === "particles" || type === "ambient";
  }, [renderData.backgroundConfig]);
  const format = useMemo(() => {
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

  const renderCameraTextureProjectionArtifact = useCallback(
    (entry: CinematicTextureProjectionFrame) => (
      <Artifact
        filename={`camera-projection-${entry.t.toString().padStart(6, "0")}.json`}
        content={encodeCameraTextureProjectionCapture({
          version: 5,
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
              travel:
                output.trace.travel.mode === "stabilized"
                  ? {
                      mode: "stabilized",
                      driftPx: output.trace.travel.driftPx,
                      maxDriftPx: output.trace.travel.maxDriftPx,
                    }
                  : { mode: "intentional" },
            },
          })),
        })}
      />
    ),
    [],
  );

  const cinematics = renderData.prepared.cinematics;
  if (!cinematics) {
    throw new Error(
      `CAM_VNEXT_REQUIRED: Episode "${episodeId}" did not compile a CameraPlan.`,
    );
  }
  const hasDevices = Object.keys(world.devices ?? {}).length > 0;
  const rendersUnderlay =
    cameraRenderLayer === "final" || cameraRenderLayer === "underlay";
  const rendersCamera =
    cameraRenderLayer === "final" ||
    cameraRenderLayer === "camera-plate" ||
    cameraRenderLayer === "camera-projection-data";
  const rendersForeground =
    cameraRenderLayer === "final" ||
    cameraRenderLayer === "foreground-plate";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: rendersUnderlay ? "#0a0a0f" : "transparent",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {rendersUnderlay ? (
        <BackgroundLayer
          config={
            (renderData.backgroundConfig as Parameters<
              typeof BackgroundLayer
            >[0]["config"]) ?? "studio-quiet-dark"
          }
          frame={backgroundUsesTimeline ? frame : undefined}
          fps={backgroundUsesTimeline ? fps : undefined}
        />
      ) : null}
      <RendererRegistryProvider registries={runtime.rendererRegistries}>
        {rendersUnderlay ? (
          <AudioLayer
            world={world}
            t={frame}
            musicDuckMultiplierOverride={musicDuckMultiplier}
            inputProgram={renderData.prepared.inputProgram}
            notificationProgram={renderData.prepared.notificationProgram}
          />
        ) : null}
        {rendersUnderlay &&
        renderData.voiceManifest &&
        voiceConfig &&
        voiceAudioUrl ? (
          voiceConfig.usePerSegmentControl &&
          voiceEvents.length > 0 ? (
            <VoiceLayer
              manifest={renderData.voiceManifest}
              audioUrl={voiceAudioUrl}
              events={voiceEvents}
              volume={voiceConfig.volume ?? 1}
            />
          ) : (
            <SimpleVoiceLayer
              manifest={renderData.voiceManifest}
              audioUrl={voiceAudioUrl}
              startFrame={voiceConfig.startFrame ?? 0}
              volume={voiceConfig.volume ?? 1}
            />
          )
        ) : null}
        {rendersCamera && hasDevices ? (
          <div
            style={{
              width: format.width,
              height: format.height,
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
              pluginManager={runtime.pluginManager}
              registries={runtime.rendererRegistries}
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
              onCinematicCameraDebugFrame={
                onCinematicCameraDebugFrame
              }
              renderCameraTextureProjectionArtifact={
                cameraRenderLayer === "camera-projection-data"
                  ? renderCameraTextureProjectionArtifact
                  : undefined
              }
            />
          </div>
        ) : null}
        {rendersForeground ? (
          <StoryOverlay
            world={world}
            t={frame}
            width={format.width}
            height={format.height}
          />
        ) : null}
      </RendererRegistryProvider>
    </AbsoluteFill>
  );
}
