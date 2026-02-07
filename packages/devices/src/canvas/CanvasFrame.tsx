import React from "react";
import type { FrameProps } from "../registries/frame-registry.js";

/**
 * CanvasFrame
 *
 * Frameless device frame for full-canvas episodes (no phone chrome).
 * Intentionally ignores statusBar and other device UI elements.
 */
export const CanvasFrame: React.FC<FrameProps> = ({ children, className, style }) => {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: 0,
        backgroundColor: "transparent",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

