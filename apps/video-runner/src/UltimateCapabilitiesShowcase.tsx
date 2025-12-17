/**
 * Ultimate Capabilities Showcase Video
 * 
 * ENTERPRISE PATTERN - as documented in docs-v2/:
 * 
 * 1. prepareEpisode(sceneIR, plugins) - accepts SceneIR directly, compiles internally
 * 2. runEpisode(compiled, frame) - gets WorldState at frame
 * 3. TokovoRenderer - renders the world
 * 
 * NO manual compile() call - prepareEpisode handles it via setCompiler()
 * 
 * @see docs-v2/01-ARCHITECTURE.md
 * @see packages/episodes/src/ultimate-capabilities-showcase.episode.ts
 */

import React, { useMemo } from "react";
import { useCurrentFrame, AbsoluteFill } from "remotion";
import { prepareEpisode, runEpisode, createEventIndex } from "@tokovo/core";
import { TokovoRenderer, AudioLayer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import { WhatsAppPluginV2 } from "@tokovo/apps-whatsapp";
import { ultimateShowcaseEpisode } from "@tokovo/episodes/src/ultimate-capabilities-showcase.episode";

// Import device reducers (needed for engine)
import "@tokovo/devices";
import "@tokovo/device-keyboard";

// =============================================================================
// CONFIG
// =============================================================================

export const ultimateShowcaseConfig = {
    id: "UltimateCapabilitiesShowcase",
    durationInFrames: 900, // 30 seconds at 30fps
    fps: 30,
    width: 1080,
    height: 1920
};

// =============================================================================
// ENTERPRISE PIPELINE (runs once at bundle time)
// =============================================================================

// THE ONLY WAY: prepareEpisode accepts SceneIR directly
// - setCompiler(compile) was called in Root.tsx
// - prepareEpisode detects it's an EpisodeDefinition (has episodeId)
// - Compiles internally, no manual compile() needed
const compiledEpisode = prepareEpisode(
    ultimateShowcaseEpisode,  // SceneIR from DSL - prepareEpisode compiles internally
    [WhatsAppPluginV2 as any],
    { mode: "preview", strict: false }
);

// Create event index for director
const eventIndex = createEventIndex(compiledEpisode.events as any);

console.log("[UltimateCapabilities] Enterprise pipeline result:", {
    id: compiledEpisode.id,
    eventsCount: compiledEpisode.events.length,
    fps: compiledEpisode.fps,
    devices: Object.keys(compiledEpisode.initialWorld?.devices || {}),
    conversations: Object.keys(compiledEpisode.initialWorld?.conversations || {}),
});

// =============================================================================
// VIDEO COMPONENT
// =============================================================================

export const UltimateCapabilitiesShowcase: React.FC = () => {
    const frame = useCurrentFrame();

    // runEpisode() - deterministically compute WorldState at frame
    const world = useMemo(() => {
        return runEpisode(compiledEpisode, frame, { mode: "preview" });
    }, [frame]);

    // Calculate scale to fit device in canvas
    const scale = Math.min(
        ultimateShowcaseConfig.width / iPhone16Profile.dimensions.width,
        ultimateShowcaseConfig.height / iPhone16Profile.dimensions.height
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

export default UltimateCapabilitiesShowcase;
