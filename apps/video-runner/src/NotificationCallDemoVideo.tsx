import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { notificationCallDemo } from "@tokovo/episodes";
import { replay, WorldState, TimelineEvent } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * NotificationCallDemoVideo
 * Demonstrates all notification and call features:
 * - Lockscreen notifications
 * - Heads-up notifications  
 * - Incoming voice call
 * - Active call with timer
 * - FaceTime call
 */
export const NotificationCallDemoVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame; // Using frame as time unit

    // Episode data
    const episode = notificationCallDemo as { initialWorld: WorldState; events: TimelineEvent[] };

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
                    notificationConfig={{
                        headsUpDuration: 150, // 5 seconds
                        showHeadsUpWhenAppOpen: true
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};
