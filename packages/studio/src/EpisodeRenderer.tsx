import { useMemo } from "react";
import {
  replayIncremental,
  createKeyframedEventIndex,
  createStateCache,
  getConfig,
} from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import type { PreparedTrackEpisode } from "@tokovo/compiler";
import { pluginManager, rendererRegistries, tokovoRegistries } from "./runtime";

interface EpisodeRendererProps {
  episodeIR: PreparedTrackEpisode;
  frame?: number;
}

export function EpisodeRenderer({
  episodeIR,
  frame = 0,
}: EpisodeRendererProps) {
  const config = useMemo(() => getConfig(), []);
  const keyframedEventIndex = useMemo(() => {
    if (!episodeIR) return null;
    return (
      episodeIR.keyframedEventIndex ??
      createKeyframedEventIndex(
        episodeIR.events as any,
        config.rendering.cacheKeyframeInterval,
      )
    );
  }, [episodeIR, config.rendering.cacheKeyframeInterval]);
  const stateCache = useMemo(() => {
    if (!episodeIR) return null;
    return createStateCache(config.rendering.cacheKeyframeInterval);
  }, [episodeIR, config.rendering.cacheKeyframeInterval]);

  const world = useMemo(() => {
    if (!episodeIR || !keyframedEventIndex || !stateCache) return null;
    return replayIncremental(
      episodeIR.initialWorld,
      episodeIR.events,
      frame,
      {
        mode: "preview",
        fps: episodeIR.fps,
        registries: tokovoRegistries.engine,
        config,
      },
      keyframedEventIndex,
      stateCache,
    );
  }, [episodeIR, keyframedEventIndex, stateCache, frame, config]);

  if (!world) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#fff",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
      }}
    >
      <TokovoRenderer
        world={world}
        t={frame}
        fps={episodeIR.fps}
        debug={false}
        eventIndex={keyframedEventIndex ?? undefined}
        pluginManager={pluginManager}
        registries={rendererRegistries}
      />
    </div>
  );
}
