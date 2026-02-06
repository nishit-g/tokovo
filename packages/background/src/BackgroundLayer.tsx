/**
 * BackgroundLayer Component
 * 
 * Main component that renders backgrounds based on configuration.
 * Routes to appropriate renderer based on background type.
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import type { BackgroundConfig, BackgroundPresetId } from "./types.js";
import { FALLBACK_COLOR } from "./types.js";
import { resolveBackground } from "./resolver.js";
import {
    SolidRenderer,
    GradientRenderer,
    ImageRenderer,
    VideoRenderer,
    ParticlesRenderer,
} from "./renderers/index.js";

// =============================================================================
// TYPES
// =============================================================================

export interface BackgroundLayerProps {
    /**
     * Background configuration.
     * Can be:
     * - BackgroundConfig object
     * - BackgroundPresetId string (e.g., "ambient-night")
     * - undefined (uses default dark background)
     */
    config?: BackgroundConfig | BackgroundPresetId | null;

    /**
     * Current frame (for animated backgrounds like particles)
     */
    frame?: number;

    /**
     * Frames per second (for animated backgrounds)
     */
    fps?: number;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
    config,
    frame = 0,
    fps = 30,
}) => {
    // Resolve config (expand presets, apply defaults, validate)
    const resolved = resolveBackground(config);

    // Route to appropriate renderer
    switch (resolved.type) {
        case "solid":
            return <SolidRenderer config={resolved} />;

        case "gradient":
            return <GradientRenderer config={resolved} />;

        case "image":
            return <ImageRenderer config={resolved} />;

        case "video":
            return <VideoRenderer config={resolved} />;

        case "particles":
        case "ambient":
            return <ParticlesRenderer config={resolved} frame={frame} fps={fps} />;

        default:
            // Fallback for unknown types
            console.warn(`[BackgroundLayer] Unknown type: ${resolved.type}, using solid fallback`);
            return (
                <AbsoluteFill style={{ backgroundColor: FALLBACK_COLOR }} />
            );
    }
};

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

/**
 * Create a BackgroundLayer with a preset
 */
export const PresetBackground: React.FC<{
    preset: BackgroundPresetId;
    frame?: number;
    fps?: number;
}> = ({ preset, frame, fps }) => (
    <BackgroundLayer config={preset} frame={frame} fps={fps} />
);

/**
 * Create an image background
 */
export const ImageBackground: React.FC<{
    src: string;
    opacity?: number;
    blur?: number;
    frame?: number;
    fps?: number;
}> = ({ src, opacity, blur, frame, fps }) => (
    <BackgroundLayer
        config={{ type: "image", src, opacity, blur }}
        frame={frame}
        fps={fps}
    />
);

/**
 * Create a video background
 */
export const VideoBackground: React.FC<{
    src: string;
    opacity?: number;
    blur?: number;
    frame?: number;
    fps?: number;
}> = ({ src, opacity, blur, frame, fps }) => (
    <BackgroundLayer
        config={{ type: "video", src, opacity, blur }}
        frame={frame}
        fps={fps}
    />
);
