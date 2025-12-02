import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { replay, WorldState } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import { exampleEpisode } from "@tokovo/episodes";

// Ensure reducers are registered
import "@tokovo/devices";
import "@tokovo/apps-whatsapp";

export const Video: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Calculate time t
    const t = frame; // Assuming 1 frame = 1 unit of time for simplicity, or t = frame / fps

    // Replay
    const world = replay(exampleEpisode.initialWorld as WorldState, exampleEpisode.events as any, t);

    return (
        <div style={{ flex: 1, backgroundColor: "white", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <TokovoRenderer world={world} deviceProfile={iPhone16Profile} />
        </div>
    );
};
