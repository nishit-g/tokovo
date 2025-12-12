import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { multiPovDemo } from "@tokovo/episodes";
import { replay, WorldState, TimelineEvent } from "@tokovo/core";
import { MultiDeviceRenderer } from "@tokovo/renderer";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * MultiPovDemoVideo
 * Demonstrates the multi-device POV system:
 * - Multiple phones (Alice and Bob)
 * - CUT between devices
 * - SPLIT_HORIZONTAL layout (side by side)
 * - SPLIT_VERTICAL layout (stacked)
 * - PIP layout (picture in picture)
 */
export const MultiPovDemoVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Episode data
    const episode = multiPovDemo as { initialWorld: WorldState; events: TimelineEvent[] };

    // Replay world state at current time
    const world = replay(episode.initialWorld, episode.events, t);

    return (
        <AbsoluteFill style={{
            backgroundColor: "#0a0a1a",
        }}>
            <MultiDeviceRenderer
                world={world}
                t={t}
                debug={false}
                compositionWidth={1080}
                compositionHeight={1920}
            />
        </AbsoluteFill>
    );
};
