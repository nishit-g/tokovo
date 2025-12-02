import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { replay, WorldState } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { PixelProfile } from "@tokovo/devices";
import { androidEpisode } from "@tokovo/episodes";

export const AndroidVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // Calculate scale to fit device in composition with some padding
    const padding = 50;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

    const scaleX = availableWidth / PixelProfile.dimensions.width;
    const scaleY = availableHeight / PixelProfile.dimensions.height;
    const scale = Math.min(scaleX, scaleY);

    // Calculate time t
    const t = frame;

    // Replay
    const world = replay(androidEpisode.initialWorld as WorldState, androidEpisode.events as any, t);

    return (
        <div style={{ width: "100%", height: "100%", backgroundColor: "white", position: "relative" }}>
            <div style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) scale(${scale})`,
                width: PixelProfile.dimensions.width,
                height: PixelProfile.dimensions.height
            }}>
                <TokovoRenderer world={world} deviceId="bob_phone" deviceProfile={PixelProfile} t={t} />
            </div>
        </div>
    );
};
