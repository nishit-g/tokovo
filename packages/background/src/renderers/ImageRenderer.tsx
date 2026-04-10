/**
 * Image Background Renderer
 */

import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { resolveStaticAssetSrc } from "@tokovo/core";
import type { ResolvedBackgroundConfig } from "../types.js";

interface ImageRendererProps {
    config: ResolvedBackgroundConfig;
}

export const ImageRenderer: React.FC<ImageRendererProps> = ({ config }) => {
    if (!config.src) {
        console.warn("[ImageRenderer] No src provided");
        return null;
    }

    // Resolve path - if it starts with / assume it's a static file
    const imageSrc = resolveStaticAssetSrc(config.src, staticFile);

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

    const imgStyle: React.CSSProperties = {
        width: "100%",
        height: "100%",
        objectFit: getObjectFit(),
        objectPosition: "center",
    };

    // Scale if specified
    if (config.scale && config.scale !== 1) {
        imgStyle.transform = `scale(${config.scale})`;
    }

    return (
        <AbsoluteFill style={containerStyle}>
            <Img
                src={imageSrc}
                style={imgStyle}
                pauseWhenLoading
            />
        </AbsoluteFill>
    );
};
