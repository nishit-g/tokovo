/**
 * Bakchodi Bros Video - Two Indian Friends Being Idiots
 * 
 * ENTERPRISE PATTERN - using prepareTrackEpisode()
 * 
 * @see packages/episodes/src/v2/bakchodi-bros.episode.ts
 */

import React, { useMemo } from "react";
import { useCurrentFrame, AbsoluteFill } from "remotion";
import { runEpisode, createEventIndex, setCompiler } from "@tokovo/core";
import { compile } from "@tokovo/compiler";
import { prepareTrackEpisode } from "@tokovo/compiler";
import { TokovoRenderer, AudioLayer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import { WhatsAppPluginV2 } from "@tokovo/apps-whatsapp";

// Import the bakchodi episode
import { bakchodiEpisode, bakchodiMeta } from "@tokovo/episodes/src/v2/bakchodi-bros.episode";

// Import device reducers
import "@tokovo/devices";
import "@tokovo/device-keyboard";

// =============================================================================
// WIRE COMPILER FIRST
// =============================================================================
setCompiler(compile);

// =============================================================================
// CONFIG
// =============================================================================

export const bakchodiConfig = {
    id: bakchodiMeta.id,
    durationInFrames: bakchodiMeta.durationInFrames,
    fps: bakchodiMeta.fps,
    width: bakchodiMeta.width,
    height: bakchodiMeta.height,
};

// =============================================================================
// ENTERPRISE PIPELINE - Using prepareTrackEpisode()
// =============================================================================

// THE RIGHT WAY: prepareTrackEpisode converts TrackEpisodeIR to engine format
const prepared = prepareTrackEpisode(bakchodiEpisode, [WhatsAppPluginV2 as any]);

// Create event index for director
const eventIndex = createEventIndex(prepared.events as any);

console.log("[BakchodiBros] Episode prepared:", {
    id: prepared.id,
    runtimeEvents: prepared.events.length,
    devices: Object.keys(prepared.initialWorld.devices || {}).length,
    conversations: Object.keys((prepared.initialWorld as any).conversations || {}).length,
});

// =============================================================================
// VIDEO COMPONENT
// =============================================================================

export const BakchodiBrosVideo: React.FC = () => {
    const frame = useCurrentFrame();

    const world = useMemo(() => {
        return runEpisode(prepared as any, frame, { mode: "preview" });
    }, [frame]);

    const scale = Math.min(
        bakchodiConfig.width / iPhone16Profile.dimensions.width,
        bakchodiConfig.height / iPhone16Profile.dimensions.height
    );

    return (
        <AbsoluteFill style={{
            backgroundColor: "#0a0a0f",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <AudioLayer world={world} t={frame} />
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center"
            }}>
                <TokovoRenderer
                    world={world}
                    t={frame}
                    debug={true}
                    eventIndex={eventIndex}
                    directorEnabled={true}
                    directorDebug={false}
                />
            </div>
        </AbsoluteFill>
    );
};

export default BakchodiBrosVideo;
