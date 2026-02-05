/**
 * Gradient Background Renderer
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import type { ResolvedBackgroundConfig } from "../types";

interface GradientRendererProps {
    config: ResolvedBackgroundConfig;
}

export const GradientRenderer: React.FC<GradientRendererProps> = ({ config }) => {
    const style: React.CSSProperties = {
        background: config.gradient || "linear-gradient(180deg, #0a0a1a 0%, #1a1a2a 100%)",
        opacity: config.opacity ?? 1,
    };

    if (config.blur && config.blur > 0) {
        style.filter = `blur(${config.blur}px)`;
    }

    return <AbsoluteFill style={style} />;
};
