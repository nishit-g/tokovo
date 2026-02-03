import { useMemo } from "react";
import { replay, createEventIndex } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import type { PreparedTrackEpisode } from "@tokovo/compiler";

interface EpisodeRendererProps {
  episodeIR: PreparedTrackEpisode;
  frame?: number;
}

export function EpisodeRenderer({
  episodeIR,
  frame = 0,
}: EpisodeRendererProps) {
  const eventIndex = useMemo(() => {
    if (!episodeIR) return null;
    return createEventIndex(episodeIR.events as any);
  }, [episodeIR]);

  const world = useMemo(() => {
    if (!episodeIR || !eventIndex) return null;
    return replay(
      episodeIR.initialWorld,
      episodeIR.events,
      frame,
      { mode: "preview", fps: episodeIR.fps },
      eventIndex,
    );
  }, [episodeIR, eventIndex, frame]);

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
      />
    </div>
  );
}
