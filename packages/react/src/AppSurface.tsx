import React from "react";

export interface AppSurfaceProps {
  /** The logical width the app was designed for (e.g. 393 for iPhone 14/15/16 Pro) */
  designWidth: number;
  /** The actual physical width of the target device/container */
  targetWidth: number;
  /** The actual physical height of the target device/container */
  targetHeight: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  /** Optional background color for the container */
  backgroundColor?: string;
}

/**
 * AppSurface
 *
 * A container that automatically calculates and applies a scale transform
 * to map a "Logical Design Resolution" to a "Physical Target Resolution".
 *
 * This allows apps to be built using standard 1x CSS units (e.g. 16px font),
 * while rendering perfectly crisp on high-resolution devices (e.g. 1290px wide).
 */
export const AppSurface: React.FC<AppSurfaceProps> = ({
  designWidth,
  targetWidth,
  targetHeight,
  children,
  style,
  backgroundColor,
}) => {
  if (!Number.isFinite(designWidth) || designWidth <= 0) {
    throw new Error("APP_SURFACE_DESIGN_WIDTH_INVALID: designWidth must be positive.");
  }
  if (!Number.isFinite(targetWidth) || targetWidth <= 0) {
    throw new Error("APP_SURFACE_TARGET_WIDTH_INVALID: targetWidth must be positive.");
  }
  if (!Number.isFinite(targetHeight) || targetHeight <= 0) {
    throw new Error("APP_SURFACE_TARGET_HEIGHT_INVALID: targetHeight must be positive.");
  }

  // Calculate scale factor: Mapping physical pixels to logical points
  const scale = targetWidth / designWidth;

  return (
    <div
      style={{
        width: targetWidth,
        height: targetHeight,
        overflow: "hidden",
        position: "relative",
        contain: "strict",
        backgroundColor,
        ...style,
      }}
    >
      <div
        style={{
          width: designWidth,
          // We need the logical height to fill the physical height
          height: targetHeight / scale,
          minHeight: targetHeight / scale,
          transform: `scale3d(${scale}, ${scale}, 1)`,
          transformOrigin: "top left",
          backfaceVisibility: "hidden",
          willChange: "transform",
          contain: "layout paint",
          position: "absolute",
          top: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
};
