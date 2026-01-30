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

import React, { useMemo, useState, useEffect } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  delayRender,
  continueRender,
  staticFile,
} from "remotion";
import { runEpisode, createEventIndex, PluginManager } from "@tokovo/core";
import {
  prepareTrackEpisode,
  type PreparedTrackEpisode,
} from "@tokovo/compiler";
import { TokovoRenderer, AudioLayer } from "@tokovo/renderer";
import {
  SimpleVoiceLayer,
  VoiceLayer,
  type VoiceManifest,
  type VoicePlayEvent,
  voiceScheduleToSoundCues,
} from "@tokovo/voice";
import type { VoiceConfig, VoiceScriptSegment } from "@tokovo/ir";
import { iPhone16Profile } from "@tokovo/devices";
import {
  episodeRegistry,
  getFormat,
  type EpisodeDefinition,
} from "@tokovo/episodes";
import { ErrorBoundary } from "./ErrorBoundary";

// =============================================================================
// TYPES
// =============================================================================

export type EpisodeRendererProps = {
  episodeId: string;
};

// =============================================================================
// CALCULATE METADATA (for Remotion's calculateMetadata prop)
// =============================================================================

/**
 * Calculate metadata for dynamic composition configuration.
 * Used by Remotion's calculateMetadata prop.
 */
export async function calculateEpisodeMetadata({
  props,
}: {
  props: EpisodeRendererProps;
}) {
  const episode = episodeRegistry.get(props.episodeId);
  if (!episode) {
    console.warn(
      `[calculateEpisodeMetadata] Episode not found: ${props.episodeId}`,
    );
    return {};
  }

  const format =
    typeof episode.config.format === "string"
      ? getFormat(episode.config.format as any)
      : episode.config.format;

  return {
    durationInFrames: episode.config.durationInFrames,
    fps: format.fps,
    width: format.width,
    height: format.height,
  };
}

// =============================================================================
// PLUGIN RESOLVER
// =============================================================================

function resolvePlugins(appIds: string[]) {
  return appIds
    .map((appId) => PluginManager.get(appId))
    .filter(
      (plugin): plugin is NonNullable<typeof plugin> => plugin !== undefined,
    );
}

// =============================================================================
// EPISODE RENDERER COMPONENT
// =============================================================================

// Wrapper that forces remount when episodeId changes
export const EpisodeRenderer: React.FC<EpisodeRendererProps> = ({
  episodeId,
}) => {
  const videoConfig = useVideoConfig();
  const activeCompositionId = (videoConfig as any).id;

  console.log(
    `[EpisodeRenderer WRAPPER] episodeId="${episodeId}", activeComposition="${activeCompositionId}"`,
  );

  if (activeCompositionId && activeCompositionId !== episodeId) {
    return null;
  }

  return (
    <ErrorBoundary>
      <EpisodeRendererInner key={episodeId} episodeId={episodeId} />
    </ErrorBoundary>
  );
};

// Inner component that does the actual rendering
const EpisodeRendererInner: React.FC<EpisodeRendererProps> = ({
  episodeId,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender(`Loading episode: ${episodeId}`));
  const [prepared, setPrepared] = useState<PreparedTrackEpisode | null>(null);
  const [episode, setEpisode] = useState<EpisodeDefinition | null>(null);
  const [voiceManifest, setVoiceManifest] = useState<VoiceManifest | null>(
    null,
  );
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // === PREPARE EPISODE (runs once on mount) ===
  useEffect(() => {
    console.log(`[EpisodeRenderer] 🎬 MOUNTING: ${episodeId}`);
    async function prepare() {
      try {
        const ep = episodeRegistry.get(episodeId);
        console.log(`[EpisodeRenderer] 📦 Got from registry:`, {
          episodeId,
          found: !!ep,
          foundId: ep?.meta?.id,
          title: ep?.meta?.title,
        });
        if (!ep) {
          throw new Error(`Episode not found: ${episodeId}`);
        }
        setEpisode(ep);

        console.log(`[EpisodeRenderer] Building episode: ${episodeId}`);
        const ir = ep.build();

        if (ir.voice) {
          setVoiceConfig(ir.voice);

          if (ir.voice.segments && ir.voice.segments.length > 0) {
            const embeddedManifest: VoiceManifest = {
              scriptId: episodeId,
              audioFile: ir.voice.audioPath,
              durationMs: ir.voice.durationMs || 0,
              generatedAt: new Date().toISOString(),
              provider: "embedded",
              model: "embedded",
              contentHash: "embedded",
              segments: ir.voice.segments.map((seg, index) => ({
                index,
                id: seg.id,
                speaker: seg.speaker,
                text: seg.text || "",
                startMs: seg.startMs,
                endMs: seg.endMs,
                durationMs: seg.durationMs ?? seg.endMs - seg.startMs,
              })),
            };
            setVoiceManifest(embeddedManifest);
            console.log(`[EpisodeRenderer] 🎤 Voice manifest embedded:`, {
              segments: embeddedManifest.segments.length,
              duration: embeddedManifest.durationMs,
            });
          } else if (ir.voice.manifestPath) {
            const manifestUrl = ir.voice.manifestPath.startsWith("/")
              ? staticFile(ir.voice.manifestPath)
              : ir.voice.manifestPath;
            const manifestResponse = await fetch(manifestUrl);
            if (!manifestResponse.ok) {
              throw new Error(
                `Voice manifest failed to load: ${ir.voice.manifestPath} (HTTP ${manifestResponse.status})`,
              );
            }
            const manifest = await manifestResponse.json();
            setVoiceManifest(manifest);
            console.log(`[EpisodeRenderer] 🎤 Voice manifest fetched:`, {
              segments: manifest.segments?.length,
              duration: manifest.totalDurationMs,
            });
          } else {
            throw new Error(
              `Voice config invalid: must have either embedded segments or manifestPath`,
            );
          }
        }

        console.log(`[EpisodeRenderer] Preparing episode: ${episodeId}`);
        const plugins = resolvePlugins(ep.config.apps);
        const result = prepareTrackEpisode(ir, plugins);

        console.log(`[EpisodeRenderer] Episode ready: ${episodeId}`, {
          events: result.events.length,
          devices: Object.keys(result.initialWorld?.devices || {}).length,
        });

        setPrepared(result);
        continueRender(handle);
      } catch (e) {
        console.error(`[EpisodeRenderer] Failed to prepare: ${episodeId}`, e);
        setError(e as Error);
        continueRender(handle);
      }
    }
    prepare();
  }, [episodeId, handle]);

  // === ALL HOOKS MUST BE CALLED BEFORE CONDITIONAL RETURNS ===
  // (React rules of hooks - hooks must be called unconditionally)

  // === RUN EPISODE AT CURRENT FRAME ===
  const world = useMemo(() => {
    if (!prepared) return null;
    return runEpisode(prepared as any, frame, { mode: "preview" });
  }, [prepared, frame]);

  // === CREATE EVENT INDEX ===
  const eventIndex = useMemo(() => {
    if (!prepared) return null;
    return createEventIndex(prepared.events as any);
  }, [prepared]);

  // === BUILD VOICE EVENTS FOR PER-SEGMENT CONTROL ===
  const voiceEvents = useMemo((): VoicePlayEvent[] => {
    if (!voiceConfig?.usePerSegmentControl) return [];
    const schedule = voiceConfig.segmentSchedule;
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
  }, [voiceConfig]);

  const voiceSoundCues = useMemo(() => {
    if (!voiceConfig?.segmentSchedule || !voiceConfig.segments) {
      return [];
    }
    return voiceScheduleToSoundCues(
      voiceConfig.segmentSchedule,
      voiceConfig.segments,
      { fps, audioPath: voiceConfig.audioPath },
    );
  }, [voiceConfig, fps]);

  const worldWithVoice = useMemo(() => {
    if (!world) return null;
    if (voiceSoundCues.length === 0) return world;
    const voiceCueRecord: Record<string, (typeof voiceSoundCues)[number]> = {};
    voiceSoundCues.forEach((cue, i) => {
      voiceCueRecord[`voice-${i}`] = cue;
    });
    return {
      ...world,
      audio: {
        ...world.audio,
        activeSounds: { ...world.audio.activeSounds, ...voiceCueRecord },
      },
    };
  }, [world, voiceSoundCues]);

  // === CALCULATE FORMAT AND SCALE ===
  const { format, scale } = useMemo(() => {
    if (!episode) {
      return { format: null, scale: 1 };
    }
    const fmt =
      typeof episode.config.format === "string"
        ? getFormat(episode.config.format as any)
        : episode.config.format;
    const s = Math.min(
      fmt.width / iPhone16Profile.dimensions.width,
      fmt.height / iPhone16Profile.dimensions.height,
    );
    return { format: fmt, scale: s };
  }, [episode]);

  // === ERROR STATE ===
  if (error) {
    return (
      <AbsoluteFill style={errorStyle}>
        <div style={{ fontSize: 80, marginBottom: 24 }}>⚠️</div>
        <h1 style={{ color: "#FF6B6B", fontSize: 32, marginBottom: 16 }}>
          Episode Failed to Load
        </h1>
        <div style={{ color: "#8892B0", fontSize: 18, marginBottom: 32 }}>
          Episode: <code>{episodeId}</code>
        </div>
        <div style={errorBoxStyle}>
          <code
            style={{ color: "#FF6B6B", fontSize: 14, whiteSpace: "pre-wrap" }}
          >
            {error.message}
          </code>
        </div>
        {error.stack && (
          <details style={{ marginTop: 24, color: "#8892B0", maxWidth: 800 }}>
            <summary style={{ cursor: "pointer" }}>Stack Trace</summary>
            <pre style={{ fontSize: 10, overflow: "auto", maxHeight: 150 }}>
              {error.stack}
            </pre>
          </details>
        )}
      </AbsoluteFill>
    );
  }

  // === LOADING STATE ===
  if (!prepared || !episode || !worldWithVoice || !eventIndex) {
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
      <AudioLayer world={worldWithVoice} t={frame} />
      {voiceManifest &&
        voiceConfig?.audioPath &&
        voiceSoundCues.length === 0 &&
        (voiceConfig.usePerSegmentControl && voiceEvents.length > 0 ? (
          <VoiceLayer
            manifest={voiceManifest}
            audioUrl={voiceConfig.audioPath}
            events={voiceEvents}
            volume={voiceConfig.volume ?? 1}
          />
        ) : (
          <SimpleVoiceLayer
            manifest={voiceManifest}
            audioUrl={voiceConfig.audioPath}
            startFrame={voiceConfig.startFrame ?? 0}
            volume={voiceConfig.volume ?? 1}
          />
        ))}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <TokovoRenderer
          world={worldWithVoice}
          t={frame}
          debug={false}
          eventIndex={eventIndex}
        />
      </div>
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

export default EpisodeRenderer;
