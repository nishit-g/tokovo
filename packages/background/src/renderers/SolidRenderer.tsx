/**
 * Solid Background Renderer
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import type { ResolvedBackgroundConfig } from "../types.js";

interface SolidRendererProps {
  config: ResolvedBackgroundConfig;
}

export const SolidRenderer: React.FC<SolidRendererProps> = ({ config }) => {
  if (!config.color) {
    throw new Error("BACKGROUND_SOLID_INVALID: solid backgrounds require a color.");
  }

  const style: React.CSSProperties = {
    backgroundColor: config.color,
    opacity: config.opacity ?? 1,
  };

  if (config.blur && config.blur > 0) {
    style.filter = `blur(${config.blur}px)`;
  }

  return <AbsoluteFill style={style} />;
};
