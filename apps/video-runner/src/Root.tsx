import React from "react";
import { Composition } from "remotion";
import { FullCinematicShowcaseVideo } from "./FullCinematicShowcaseVideo";
import { BreakupDramaDSLVideo } from "./BreakupDramaDSLVideo";
import { WhatsappMediaShowcaseVideo } from "./WhatsappMediaShowcaseVideo";
import { UltimateShowcaseVideo } from "./UltimateShowcaseVideo";
import { TwitterShowcaseVideo } from "./TwitterShowcaseVideo";
import { MultiAppShowcaseVideo } from "./MultiAppShowcaseVideo";
// LEGACY (V1 DSL - disabled)
// import { NotificationShowcaseVideo } from "./NotificationShowcaseVideo";
import { KeyboardTypingShowcase } from "./KeyboardTypingShowcase";
import { FullRealityShowcase } from "./FullRealityShowcase";
import { PhoneCallShowcase } from "./PhoneCallShowcase";
import { UltimateShowcase } from "./UltimateShowcase";
import { SemanticCameraShowcase } from "./SemanticCameraShowcase";
import { AutoDirectorShowcase } from "./AutoDirectorShowcase";
import { ManualCameraShowcase } from "./ManualCameraShowcase";
import { NotificationShowcase } from "./showcases/NotificationShowcase";
// import { BakchodiGangVideo } from "./BakchodiGangVideo";
import { GandhiTextingVideo } from "./GandhiTextingVideo";
// import { EnterpriseDemoVideo, enterpriseDemoConfig } from "./EnterpriseDemoVideo";
// import { UltimateCapabilitiesShowcase, ultimateShowcaseConfig } from "./UltimateCapabilitiesShowcase";
import { TrackDemoVideo, trackDemoConfig } from "./TrackDemoVideo";
import { BakchodiBrosVideo, bakchodiConfig } from "./BakchodiBrosVideo";
import { PluginManager, setCompiler } from "@tokovo/core";
import { WhatsApp } from "@tokovo/apps-whatsapp";
import { compile } from "@tokovo/compiler";

// =============================================================================
// ENTERPRISE INITIALIZATION
// =============================================================================

// Wire compiler for internal compilation in prepareEpisode()
setCompiler(compile);

// Register Plugins
PluginManager.register(WhatsApp);

export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* V2 Track Demo - shows new track-based DSL */}
            <Composition
                id={trackDemoConfig.id}
                component={TrackDemoVideo}
                durationInFrames={trackDemoConfig.durationInFrames}
                fps={trackDemoConfig.fps}
                width={trackDemoConfig.width}
                height={trackDemoConfig.height}
            />
            {/* Bakchodi Bros - Two Indian friends doing bakchodi */}
            <Composition
                id={bakchodiConfig.id}
                component={BakchodiBrosVideo}
                durationInFrames={bakchodiConfig.durationInFrames}
                fps={bakchodiConfig.fps}
                width={bakchodiConfig.width}
                height={bakchodiConfig.height}
            />
            {/* Ultimate Capabilities Showcase - V1 DSL disabled
            <Composition
                id={ultimateShowcaseConfig.id}
                component={UltimateCapabilitiesShowcase}
                durationInFrames={ultimateShowcaseConfig.durationInFrames}
                fps={ultimateShowcaseConfig.fps}
                width={ultimateShowcaseConfig.width}
                height={ultimateShowcaseConfig.height}
            />
            */}
            <Composition
                id="AutoDirectorShowcase"
                component={AutoDirectorShowcase}
                durationInFrames={450}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="NotificationShowcase2"
                component={NotificationShowcase}
                durationInFrames={950}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="ManualCameraShowcase"
                component={ManualCameraShowcase}
                durationInFrames={1400}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="SemanticCameraShowcase"
                component={SemanticCameraShowcase}
                durationInFrames={660}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="UltimateShowcase2"
                component={UltimateShowcase}
                durationInFrames={780}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="PhoneCallShowcase"
                component={PhoneCallShowcase}
                durationInFrames={390}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="FullRealityShowcase"
                component={FullRealityShowcase}
                durationInFrames={1200}
                fps={30}
                width={1080}
                height={1920}
            />
            {/* LEGACY (V1 DSL - disabled)
            <Composition
                id="NotificationShowcase"
                component={NotificationShowcaseVideo}
                durationInFrames={1200}
                fps={30}
                width={1080}
                height={1920}
            />
            */}
            <Composition
                id="FullCinematicShowcase"
                component={FullCinematicShowcaseVideo}
                durationInFrames={720}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="MultiAppShowcase"
                component={MultiAppShowcaseVideo}
                durationInFrames={900}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="TwitterShowcase"
                component={TwitterShowcaseVideo}
                durationInFrames={450}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="UltimateShowcase"
                component={UltimateShowcaseVideo}
                durationInFrames={750}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="WhatsappMediaShowcase"
                component={WhatsappMediaShowcaseVideo}
                durationInFrames={700}
                fps={30}
                width={1080}
                height={1920}
            />

            <Composition
                id="BreakupDramaDSL"
                component={BreakupDramaDSLVideo}
                durationInFrames={420}
                fps={30}
                width={1080}
                height={1920}
            />

            <Composition
                id="KeyboardTypingShowcase"
                component={KeyboardTypingShowcase}
                durationInFrames={600}
                fps={30}
                width={1080}
                height={1920}
            />
            {/* LEGACY (V1 DSL - disabled)
            <Composition
                id="BakchodiGang"
                component={BakchodiGangVideo}
                durationInFrames={1500}
                fps={30}
                width={1080}
                height={1920}
            />
            */}
            <Composition
                id="GandhiTexting"
                component={GandhiTextingVideo}
                durationInFrames={450}
                fps={30}
                width={1080}
                height={1920}
            />

            {/* === ENTERPRISE PIPELINE DEMO (Legacy V1 - disabled) ===
            <Composition
                {...enterpriseDemoConfig}
            />
            */}

            {/* ========================================================= */}
            {/* === AUTO-DISCOVERY COMPOSITIONS (V2 Architecture) ====== */}
            {/* ========================================================= */}
            <RegistryCompositions />
        </>
    );
};

// =============================================================================
// AUTO-DISCOVERY: Generates compositions from episode registry
// =============================================================================

import { Folder } from "remotion";
import { episodeRegistry, getFormat } from "@tokovo/episodes";
import { EpisodeRenderer, calculateEpisodeMetadata } from "./EpisodeRenderer";
import { z } from "zod";

// Import production episodes (side-effect: auto-registers)
import "@tokovo/episodes/src/production";

const RegistryCompositions: React.FC = () => {
    const productionEpisodes = episodeRegistry.filter({ category: "production" });
    const showcaseEpisodes = episodeRegistry.filter({ category: "showcase" });
    const testEpisodes = episodeRegistry.filter({ category: "test" });

    console.log("[Root] Auto-discovery found:", {
        production: productionEpisodes.length,
        showcase: showcaseEpisodes.length,
        test: testEpisodes.length,
    });

    const renderEpisode = (ep: any) => {
        const format = typeof ep.config.format === "string"
            ? getFormat(ep.config.format as any)
            : ep.config.format;

        return (
            <Composition
                key={ep.meta.id}
                id={ep.meta.id}
                component={EpisodeRenderer}
                durationInFrames={ep.config.durationInFrames}
                fps={format.fps}
                width={format.width}
                height={format.height}
                defaultProps={{ episodeId: ep.meta.id }}
                schema={z.object({ episodeId: z.string() })}
            />
        );
    };

    return (
        <>
            {productionEpisodes.length > 0 && (
                <Folder name="Production">
                    {productionEpisodes.map(renderEpisode)}
                </Folder>
            )}
            {showcaseEpisodes.length > 0 && (
                <Folder name="Showcases">
                    {showcaseEpisodes.map(renderEpisode)}
                </Folder>
            )}
            {testEpisodes.length > 0 && (
                <Folder name="Tests">
                    {testEpisodes.map(renderEpisode)}
                </Folder>
            )}
        </>
    );
};
