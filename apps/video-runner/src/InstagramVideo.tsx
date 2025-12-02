import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { replay, WorldState } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import { instagramEpisode } from "@tokovo/episodes";

// Ensure reducers are registered
import "@tokovo/devices";
import "@tokovo/apps-whatsapp";
import "@tokovo/apps-instagram";

export const InstagramVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // Calculate scale to fit device in composition with some padding
    const padding = 50;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

    const scaleX = availableWidth / iPhone16Profile.dimensions.width;
    const scaleY = availableHeight / iPhone16Profile.dimensions.height;
    const scale = Math.min(scaleX, scaleY);

    // Calculate time t
    const t = frame;

    // Replay
    // Note: We cast to any because the JSON types might be slightly loose compared to strict TS types
    const world = replay(instagramEpisode.initialState as unknown as WorldState, instagramEpisode.timeline as any, t);

    return (
        <div style={{ width: "100%", height: "100%", backgroundColor: "#111", position: "relative" }}>
            <div style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) scale(${scale})`,
                width: iPhone16Profile.dimensions.width,
                height: iPhone16Profile.dimensions.height
            }}>
                <TokovoRenderer world={world} t={t} debug={true} />
            </div>
        </div>
    );
};
