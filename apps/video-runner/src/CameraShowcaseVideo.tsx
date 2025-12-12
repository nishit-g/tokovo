import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { cameraShowcase } from "@tokovo/episodes";
import { replay, WorldState, TimelineEvent } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * CameraShowcaseVideo
 * Demonstrates the cinematic camera system:
 * - ZOOM with different easing functions
 * - PAN for smooth translation
 * - SHAKE with frequency and decay
 * - FOCUS on specific points
 * - RESET to return to default view
 * - Combo effects (zoom + shake)
 */
export const CameraShowcaseVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Episode data
    const episode = cameraShowcase as { initialWorld: WorldState; events: TimelineEvent[] };

    // Replay world state at current time
    const world = replay(episode.initialWorld, episode.events, t);

    // Calculate scale to fit device in composition
    const compositionWidth = 1080;
    const compositionHeight = 1920;
    const deviceWidth = iPhone16Profile.dimensions.width;
    const deviceHeight = iPhone16Profile.dimensions.height;

    const scaleX = compositionWidth / deviceWidth;
    const scaleY = compositionHeight / deviceHeight;
    const scale = Math.min(scaleX, scaleY);

    return (
        <AbsoluteFill style={{
            backgroundColor: "#0a0a1a",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center"
            }}>
                <TokovoRenderer
                    world={world}
                    t={t}
                    debug={false}
                />
            </div>
        </AbsoluteFill>
    );
};
