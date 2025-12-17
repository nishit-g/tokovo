/**
 * Track Demo Video - V2 Track DSL Showcase
 * 
 * This component renders the v2 track-based DSL demo episode.
 * Uses the enterprise pipeline with proper track lowering.
 * 
 * @see packages/episodes/src/v2/track-demo.episode.ts
 * @see packages/compiler/src/lowering/track-lowering.ts
 */

import React, { useMemo } from "react";
import { useCurrentFrame, AbsoluteFill } from "remotion";
import { runEpisode, createEventIndex, setCompiler } from "@tokovo/core";
import { TokovoRenderer, AudioLayer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import { WhatsAppPluginV2 } from "@tokovo/apps-whatsapp";
import { compile } from "@tokovo/compiler";
import { lowerEpisode } from "@tokovo/compiler/src/lowering/track-lowering";

// Import the v2 demo episode
import { trackDemoV2 } from "@tokovo/episodes/src/v2/track-demo.episode";

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

export const trackDemoConfig = {
    id: "TrackDemoV2",
    durationInFrames: trackDemoV2.durationInFrames,
    fps: trackDemoV2.fps,
    width: 1080,
    height: 1920,
};

// =============================================================================
// LOWER TRACK EVENTS TO RUNTIME EVENTS
// =============================================================================

// Use the proper track-lowering to convert TrackEvent[] to RuntimeEvent[]
const runtimeEvents = lowerEpisode(trackDemoV2);

// Create initial world from device config
const initialWorld: any = {
    devices: Object.fromEntries(
        trackDemoV2.devices.map(d => [d.id, {
            id: d.id,
            profile: d.profile,
            app: d.app,
        }])
    ),
    conversations: Object.fromEntries(
        trackDemoV2.devices.flatMap(d => d.conversations || []).map(c => [c.id, {
            id: c.id,
            name: c.name,
            avatar: c.avatar,
            messages: [],
            typing: null,
            unreadCount: 0,
        }])
    ),
    os: trackDemoV2.devices[0]?.os || {
        time: new Date(),
        battery: 100,
        network: "5G" as const,
        dnd: false,
    },
    camera: {
        scale: 1,
        translateX: 0,
        translateY: 0,
        rotation: 0,
        originX: 0.5,
        originY: 0.5,
        activeEffects: [],
    },
    audio: {
        bgm: null,
        sounds: [],
        muted: false,
    },
};

// Create compiled episode with properly lowered events
const compiledEpisode = {
    id: trackDemoV2.id,
    fps: trackDemoV2.fps,
    durationInFrames: trackDemoV2.durationInFrames,
    events: runtimeEvents,
    initialWorld,
    plugins: [WhatsAppPluginV2 as any],
};

const eventIndex = createEventIndex(runtimeEvents as any);

console.log("[TrackDemoV2] Episode loaded:", {
    id: trackDemoV2.id,
    trackEvents: trackDemoV2.events.length,
    runtimeEvents: runtimeEvents.length,
    devices: trackDemoV2.devices.length,
    markers: trackDemoV2.markers.length,
    sections: trackDemoV2.sections.length,
    sampleEvents: runtimeEvents.slice(0, 3),
});

// =============================================================================
// VIDEO COMPONENT
// =============================================================================

export const TrackDemoVideo: React.FC = () => {
    const frame = useCurrentFrame();

    const world = useMemo(() => {
        return runEpisode(compiledEpisode as any, frame, { mode: "preview" });
    }, [frame]);

    const scale = Math.min(
        trackDemoConfig.width / iPhone16Profile.dimensions.width,
        trackDemoConfig.height / iPhone16Profile.dimensions.height
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

export default TrackDemoVideo;
