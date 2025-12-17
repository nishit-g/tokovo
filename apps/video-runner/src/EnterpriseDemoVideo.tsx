/**
 * Enterprise Demo Video Component
 * 
 * Uses the NEW enterprise pipeline we built:
 * 1. DSL episode() → SceneIR
 * 2. compile() → TimelineOps (events)
 * 3. prepareEpisode() → CompiledEpisode
 * 4. runEpisode() → WorldState at frame
 * 
 * @see docs/FUCKING_MESS.md
 */

import React, { useMemo } from "react";
import { useCurrentFrame, AbsoluteFill } from "remotion";
import { compile } from "@tokovo/compiler";
import { prepareEpisode, runEpisode, createEventIndex } from "@tokovo/core";
import { TokovoRenderer, AudioLayer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import { WhatsAppPluginV2 } from "@tokovo/apps-whatsapp";
import { enterpriseDemo } from "@tokovo/episodes";

// Import device reducers
import "@tokovo/devices";
import "@tokovo/device-keyboard";

// =============================================================================
// COMPILE + PREPARE (Outside component - runs once at bundle time)
// =============================================================================

// Step 1: Compile DSL → TimelineOps
const { timeline } = compile(enterpriseDemo);
const events = timeline.ops;

// Step 2: Transform SceneIR devices to EpisodeInput format
const sceneIR = {
    id: enterpriseDemo.episodeId,
    fps: 30,
    durationInFrames: 600,
    devices: enterpriseDemo.devices.map((d: any) => ({
        id: d.deviceId,
        platform: d.platform as "ios" | "android",
        appId: d.appId,
        profileId: d.profileId,
        conversations: d.conversations?.map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type as "dm" | "group",
            avatar: c.avatar,
        })),
    })),
};

// Step 3: prepareEpisode() → CompiledEpisode (uses our enterprise types)
const compiledEpisode = prepareEpisode(
    {
        id: sceneIR.id,
        fps: sceneIR.fps,
        durationInFrames: sceneIR.durationInFrames,
        events: events as any,
        sceneIR,
        title: "Enterprise Demo - Dinner Date",
    },
    [WhatsAppPluginV2 as any],
    { mode: "preview", strict: false }
);

// Create event index for director (cast to any to avoid type mismatch with old TimelineEvent)
const eventIndex = createEventIndex(compiledEpisode.events as any);

console.log("[EnterpriseDemo] Using enterprise pipeline:", {
    id: compiledEpisode.id,
    eventsCount: compiledEpisode.events.length,
    fps: compiledEpisode.fps,
    hasInitialWorld: !!compiledEpisode.initialWorld,
    devices: Object.keys(compiledEpisode.initialWorld?.devices || {}),
    conversations: Object.keys(compiledEpisode.initialWorld?.conversations || {}),
    firstEvents: compiledEpisode.events.slice(0, 5),
});

console.log("[EnterpriseDemo] Full initialWorld:", compiledEpisode.initialWorld);

// =============================================================================
// VIDEO COMPONENT
// =============================================================================

export const EnterpriseDemoVideo: React.FC = () => {
    const frame = useCurrentFrame();

    // Step 4: runEpisode() → WorldState at frame (uses our enterprise function)
    const world = useMemo(() => {
        const w = runEpisode(compiledEpisode, frame, { mode: "preview" });
        if (frame === 0) {
            console.log("[EnterpriseDemo] World at frame 0:", w);
        }
        return w;
    }, [frame]);

    // Calculate scale to fit device
    const scale = Math.min(
        1080 / iPhone16Profile.dimensions.width,
        1920 / iPhone16Profile.dimensions.height
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
                    directorDebug={true}
                />
            </div>
        </AbsoluteFill>
    );
};

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================

export const enterpriseDemoConfig = {
    id: "EnterpriseDemo",
    component: EnterpriseDemoVideo,
    durationInFrames: compiledEpisode.durationInFrames,
    fps: compiledEpisode.fps,
    width: 1080,
    height: 1920,
};

export default EnterpriseDemoVideo;
