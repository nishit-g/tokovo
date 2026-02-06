/**
 * Video Background Renderer
 */

import React from "react";
import { AbsoluteFill, Video, staticFile } from "remotion";
import type { ResolvedBackgroundConfig } from "../types.js";

interface VideoRendererProps {
    config: ResolvedBackgroundConfig;
}

export const VideoRenderer: React.FC<VideoRendererProps> = ({ config }) => {
    if (!config.src) {
        console.warn("[VideoRenderer] No src provided");
        return null;
    }

    // Resolve path - if it starts with / assume it's a static file
    const videoSrc = config.src.startsWith("/")
        ? staticFile(config.src)
        : config.src;

    const containerStyle: React.CSSProperties = {
        opacity: config.opacity ?? 1,
    };

    if (config.blur && config.blur > 0) {
        containerStyle.filter = `blur(${config.blur}px)`;
    }

    const getObjectFit = (): React.CSSProperties["objectFit"] => {
        switch (config.position) {
            case "contain":
                return "contain";
            case "fill":
                return "fill";
            case "center":
                return "none";
            case "cover":
            default:
                return "cover";
        }
    };

    const videoStyle: React.CSSProperties = {
        width: "100%",
        height: "100%",
        objectFit: getObjectFit(),
        objectPosition: "center",
    };

    // Scale if specified
    if (config.scale && config.scale !== 1) {
        videoStyle.transform = `scale(${config.scale})`;
    }

    return (
        <AbsoluteFill style={containerStyle}>
            <Video
                src={videoSrc}
                style={videoStyle}
                loop
                muted
            // startFrom and endAt can be added for more control
            />
        </AbsoluteFill>
    );
};
