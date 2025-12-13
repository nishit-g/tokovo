import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { whatsappProductionDemo } from "@tokovo/episodes";
import { replay, WorldState, TimelineEvent, createEventIndex } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * WhatsappProductionDemoVideo
 * Showcases all new WhatsApp features:
 * - Image messages with captions
 * - Video messages with thumbnails
 * - GIF messages from Giphy
 * - Typing indicators (Remotion frame-based animation)
 * - Voice notes with waveforms
 * - Read receipts
 * 
 * DirectorLite enabled - camera will automatically react to events
 */
export const WhatsappProductionDemoVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Episode data - cast through unknown to handle JSON structure
    const episode = whatsappProductionDemo as unknown as {
        meta: { fps: number; durationInFrames: number };
        initialWorld: WorldState;
        events: TimelineEvent[]
    };

    // Create event index once for DirectorLite (memoized)
    const eventIndex = useMemo(
        () => createEventIndex(episode.events),
        [episode.events]
    );

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
                    eventIndex={eventIndex}
                    directorEnabled={true}
                    directorDebug={false}
                />
            </div>
        </AbsoluteFill>
    );
};
