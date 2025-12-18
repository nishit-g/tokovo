/**
 * EpisodeRenderer - Universal Episode Rendering Component
 * 
 * This SINGLE component renders ALL episodes. No more individual video files.
 * 
 * Features:
 * - Receives episodeId via props
 * - Resolves episode from registry
 * - Handles preparation, rendering, errors
 * - Uses Remotion best practices (delayRender, etc.)
 * 
 * @see docs-v2/EPISODE-ARCH.md
 */

import React, { useMemo, useState, useEffect } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, delayRender, continueRender } from "remotion";
import { runEpisode, createEventIndex } from "@tokovo/core";
import { prepareTrackEpisode, type PreparedTrackEpisode } from "@tokovo/compiler";
import { TokovoRenderer, AudioLayer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import { WhatsAppPluginV2 } from "@tokovo/apps-whatsapp";
import { KeyboardPlugin } from "@tokovo/device-keyboard";
import { episodeRegistry, getFormat, type EpisodeDefinition } from "@tokovo/episodes";

// Import device reducers (side-effects)
import "@tokovo/devices";
import "@tokovo/device-keyboard";

// =============================================================================
// TYPES
// =============================================================================

export type EpisodeRendererProps = {
    episodeId: string;
};

// =============================================================================
// CALCULATE METADATA (for Remotion's calculateMetadata prop)
// =============================================================================

/**
 * Calculate metadata for dynamic composition configuration.
 * Used by Remotion's calculateMetadata prop.
 */
export async function calculateEpisodeMetadata({ props }: { props: EpisodeRendererProps }) {
    const episode = episodeRegistry.get(props.episodeId);
    if (!episode) {
        console.warn(`[calculateEpisodeMetadata] Episode not found: ${props.episodeId}`);
        return {};
    }

    const format = typeof episode.config.format === "string"
        ? getFormat(episode.config.format as any)
        : episode.config.format;

    return {
        durationInFrames: episode.config.durationInFrames,
        fps: format.fps,
        width: format.width,
        height: format.height,
    };
}

// =============================================================================
// PLUGIN RESOLVER
// =============================================================================

/**
 * Resolve plugins from app IDs.
 * TODO: Make this dynamic based on episode.config.apps
 */
function resolvePlugins(appIds: string[]) {
    const plugins: any[] = [];

    if (appIds.includes("app_whatsapp")) {
        plugins.push(WhatsAppPluginV2);
    }
    if (appIds.includes("keyboard")) {
        plugins.push(KeyboardPlugin);
    }
    // Add more plugin mappings as needed

    return plugins;
}

// =============================================================================
// EPISODE RENDERER COMPONENT
// =============================================================================

// Wrapper that forces remount when episodeId changes
export const EpisodeRenderer: React.FC<EpisodeRendererProps> = ({ episodeId }) => {
    // Get the active composition ID from Remotion
    const videoConfig = useVideoConfig();
    const activeCompositionId = (videoConfig as any).id;

    // DEBUG: Log the raw prop value
    console.log(`[EpisodeRenderer WRAPPER] episodeId="${episodeId}", activeComposition="${activeCompositionId}"`);

    // Only render if this composition is the active one
    // This prevents Remotion from rendering all compositions simultaneously
    if (activeCompositionId && activeCompositionId !== episodeId) {
        return null; // Not the active composition, skip rendering
    }

    // Key forces complete remount when episodeId changes
    return <EpisodeRendererInner key={episodeId} episodeId={episodeId} />;
};

// Inner component that does the actual rendering
const EpisodeRendererInner: React.FC<EpisodeRendererProps> = ({ episodeId }) => {
    const frame = useCurrentFrame();
    const [handle] = useState(() => delayRender(`Loading episode: ${episodeId}`));
    const [prepared, setPrepared] = useState<PreparedTrackEpisode | null>(null);
    const [episode, setEpisode] = useState<EpisodeDefinition | null>(null);
    const [error, setError] = useState<Error | null>(null);

    // === PREPARE EPISODE (runs once on mount) ===
    useEffect(() => {
        console.log(`[EpisodeRenderer] 🎬 MOUNTING: ${episodeId}`);
        try {
            const ep = episodeRegistry.get(episodeId);
            console.log(`[EpisodeRenderer] 📦 Got from registry:`, {
                episodeId,
                found: !!ep,
                foundId: ep?.meta?.id,
                title: ep?.meta?.title,
            });
            if (!ep) {
                throw new Error(`Episode not found: ${episodeId}`);
            }
            setEpisode(ep);

            console.log(`[EpisodeRenderer] Building episode: ${episodeId}`);
            const ir = ep.build();

            console.log(`[EpisodeRenderer] Preparing episode: ${episodeId}`);
            const plugins = resolvePlugins(ep.config.apps);
            const result = prepareTrackEpisode(ir, plugins);

            console.log(`[EpisodeRenderer] Episode ready: ${episodeId}`, {
                events: result.events.length,
                devices: Object.keys(result.initialWorld?.devices || {}).length,
            });

            setPrepared(result);
            continueRender(handle);
        } catch (e) {
            console.error(`[EpisodeRenderer] Failed to prepare: ${episodeId}`, e);
            setError(e as Error);
            continueRender(handle);
        }
    }, [episodeId, handle]);

    // === ALL HOOKS MUST BE CALLED BEFORE CONDITIONAL RETURNS ===
    // (React rules of hooks - hooks must be called unconditionally)

    // === RUN EPISODE AT CURRENT FRAME ===
    const world = useMemo(() => {
        if (!prepared) return null;
        return runEpisode(prepared as any, frame, { mode: "preview" });
    }, [prepared, frame]);

    // === CREATE EVENT INDEX ===
    const eventIndex = useMemo(() => {
        if (!prepared) return null;
        return createEventIndex(prepared.events as any);
    }, [prepared]);

    // === CALCULATE FORMAT AND SCALE ===
    const { format, scale } = useMemo(() => {
        if (!episode) {
            return { format: null, scale: 1 };
        }
        const fmt = typeof episode.config.format === "string"
            ? getFormat(episode.config.format as any)
            : episode.config.format;
        const s = Math.min(
            fmt.width / iPhone16Profile.dimensions.width,
            fmt.height / iPhone16Profile.dimensions.height
        );
        return { format: fmt, scale: s };
    }, [episode]);

    // === ERROR STATE ===
    if (error) {
        return (
            <AbsoluteFill style={errorStyle}>
                <div style={{ fontSize: 80, marginBottom: 24 }}>⚠️</div>
                <h1 style={{ color: "#FF6B6B", fontSize: 32, marginBottom: 16 }}>
                    Episode Failed to Load
                </h1>
                <div style={{ color: "#8892B0", fontSize: 18, marginBottom: 32 }}>
                    Episode: <code>{episodeId}</code>
                </div>
                <div style={errorBoxStyle}>
                    <code style={{ color: "#FF6B6B", fontSize: 14, whiteSpace: "pre-wrap" }}>
                        {error.message}
                    </code>
                </div>
                {error.stack && (
                    <details style={{ marginTop: 24, color: "#8892B0", maxWidth: 800 }}>
                        <summary style={{ cursor: "pointer" }}>Stack Trace</summary>
                        <pre style={{ fontSize: 10, overflow: "auto", maxHeight: 150 }}>
                            {error.stack}
                        </pre>
                    </details>
                )}
            </AbsoluteFill>
        );
    }

    // === LOADING STATE ===
    if (!prepared || !episode || !world || !eventIndex) {
        const opacity = 0.5 + 0.5 * Math.sin((frame * Math.PI) / 30);
        return (
            <AbsoluteFill style={loadingStyle}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
                <div style={{ fontSize: 20, color: "#8696A0", opacity }}>
                    Loading {episodeId}...
                </div>
            </AbsoluteFill>
        );
    }

    // === RENDER ===
    return (
        <AbsoluteFill style={{ backgroundColor: "#0a0a0f", justifyContent: "center", alignItems: "center" }}>
            <AudioLayer world={world} t={frame} />
            <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
                <TokovoRenderer
                    world={world}
                    t={frame}
                    debug={false}
                    eventIndex={eventIndex}
                    directorEnabled={true}
                    directorDebug={false}
                />
            </div>
            {/* DEBUG: Show which episode is actually rendering */}
            <div style={{
                position: "absolute",
                top: 10,
                left: 10,
                background: "rgba(0,0,0,0.7)",
                color: "#00ff00",
                padding: "4px 8px",
                borderRadius: 4,
                fontSize: 12,
                fontFamily: "monospace",
                zIndex: 9999,
            }}>
                📺 {episode?.meta?.id} | {episode?.meta?.title}
            </div>
        </AbsoluteFill>
    );
};


// =============================================================================
// STYLES
// =============================================================================

const errorStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    fontFamily: "SF Pro Display, -apple-system, sans-serif",
};

const errorBoxStyle: React.CSSProperties = {
    background: "rgba(255, 107, 107, 0.1)",
    border: "1px solid rgba(255, 107, 107, 0.3)",
    borderRadius: 12,
    padding: 24,
    maxWidth: 800,
    width: "100%",
};

const loadingStyle: React.CSSProperties = {
    background: "#0B141A",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
};

export default EpisodeRenderer;
