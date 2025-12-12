import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { homeScreenGroupDemo } from "@tokovo/episodes";
import { replay, WorldState, TimelineEvent } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * HomeScreenGroupDemoVideo
 * Demonstrates Home Screen and WhatsApp Group Chat features:
 * - Configurable home screen with app grid
 * - Dock with badges
 * - WhatsApp group chat with system messages
 * - Group member add/remove events
 */
export const HomeScreenGroupDemoVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Episode data
    const episode = homeScreenGroupDemo as { initialWorld: WorldState; events: TimelineEvent[] };

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
            backgroundColor: "#1a1a2e",
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
