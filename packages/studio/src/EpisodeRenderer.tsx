import { useMemo } from "react";
import { runEpisode } from "@tokovo/core";
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
  const world = useMemo(() => {
    if (!episodeIR) return null;
    return runEpisode(episodeIR as any, frame, { mode: "preview" });
  }, [episodeIR, frame]);

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
      <TokovoRenderer world={world} t={frame} debug={false} />
    </div>
  );
}
