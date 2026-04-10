import React, { useMemo } from "react";
import { iPhone16Profile, iPhone16Constants } from "./profile.js";
import { getIOSChromeMetrics } from "../ios/chrome-metrics.js";

interface FrameProps {
  children: React.ReactNode;
  statusBar?: React.ReactNode;
}

export const iPhone16Frame: React.FC<FrameProps> = ({
  children,
  statusBar,
}) => {
  const { width, height } = iPhone16Profile.dimensions;
  const C = iPhone16Constants;
  const metrics = getIOSChromeMetrics(iPhone16Profile);

  const containerStyle = useMemo(
    () => ({
      width,
      height,
      backgroundColor: "black",
      borderRadius: C.CORNER_RADIUS,
      boxShadow: `0 0 0 ${C.BEZEL_WIDTH}px #3a3a3a, 0 0 0 ${C.BEZEL_WIDTH + 6}px #000`,
      position: "relative" as const,
      overflow: "hidden" as const,
      display: "flex" as const,
      flexDirection: "column" as const,
    }),
    [width, height],
  );

  const statusBarAreaStyle = useMemo(
    () => ({
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      height: metrics.statusBar.height,
      zIndex: 1000,
      pointerEvents: "none" as const,
      display: "flex" as const,
      justifyContent: "space-between" as const,
      padding: `${metrics.statusBar.paddingTop}px ${metrics.statusBar.paddingX}px 0 ${metrics.statusBar.paddingX}px`,
    }),
    [metrics.statusBar.height, metrics.statusBar.paddingTop, metrics.statusBar.paddingX],
  );

  const dynamicIslandStyle = useMemo(
    () => ({
      position: "absolute" as const,
      top: metrics.dynamicIsland?.topY ?? C.DYNAMIC_ISLAND_TOP,
      left: "50%",
      transform: "translateX(-50%)",
      width: metrics.dynamicIsland?.collapsedWidth ?? C.DYNAMIC_ISLAND_WIDTH,
      height: metrics.dynamicIsland?.collapsedHeight ?? C.DYNAMIC_ISLAND_HEIGHT,
      backgroundColor: "black",
      borderRadius: metrics.dynamicIsland?.cornerRadius ?? C.DYNAMIC_ISLAND_RADIUS,
      zIndex: 1001,
    }),
    [metrics.dynamicIsland],
  );

  const screenStyle = useMemo(
    () => ({
      flex: 1,
      backgroundColor: "white",
      display: "flex" as const,
      flexDirection: "column" as const,
      position: "relative" as const,
      overflow: "hidden" as const,
      borderRadius: C.CORNER_RADIUS,
      clipPath: `inset(0px round ${C.CORNER_RADIUS}px)`,
      transform: "translateZ(0)",
      willChange: "transform" as const,
    }),
    [],
  );

  const homeIndicatorStyle = useMemo(
    () => ({
      position: "absolute" as const,
      bottom: metrics.homeIndicator.bottom,
      left: "50%",
      transform: "translateX(-50%)",
      width: metrics.homeIndicator.width,
      height: metrics.homeIndicator.height,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: metrics.homeIndicator.radius,
      zIndex: 9999,
      pointerEvents: "none" as const,
    }),
    [metrics.homeIndicator.bottom, metrics.homeIndicator.width, metrics.homeIndicator.height, metrics.homeIndicator.radius],
  );

  return (
    <div style={containerStyle}>
      <div style={statusBarAreaStyle}>{statusBar}</div>
      <div style={dynamicIslandStyle} />
      <div style={screenStyle}>
        {children}
        <div style={homeIndicatorStyle} />
      </div>
    </div>
  );
};
