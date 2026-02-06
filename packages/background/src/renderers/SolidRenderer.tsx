/**
 * Solid Background Renderer
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import type { ResolvedBackgroundConfig } from "../types.js";
import { FALLBACK_COLOR } from "../types.js";

interface SolidRendererProps {
    config: ResolvedBackgroundConfig;
}

export const SolidRenderer: React.FC<SolidRendererProps> = ({ config }) => {
    const style: React.CSSProperties = {
        backgroundColor: config.color || FALLBACK_COLOR,
        opacity: config.opacity ?? 1,
    };

    if (config.blur && config.blur > 0) {
        style.filter = `blur(${config.blur}px)`;
    }

    return <AbsoluteFill style={style} />;
};
