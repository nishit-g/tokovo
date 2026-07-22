import React, { useMemo } from "react";
import { iPhone16Profile, iPhone16Constants } from "./profile.js";
import { getIOSChromeMetrics } from "../ios/chrome-metrics.js";

interface FrameProps {
  children: React.ReactNode;
  statusBar?: React.ReactNode;
  dynamicIsland?: React.ReactNode;
  homeIndicatorTheme?: "light" | "dark" | "hidden";
}

export const iPhone16Frame: React.FC<FrameProps> = ({
  children,
  statusBar,
  dynamicIsland,
  homeIndicatorTheme = "light",
}) => {
  const { width, height } = iPhone16Profile.dimensions;
  const C = iPhone16Constants;
  const metrics = getIOSChromeMetrics(iPhone16Profile);

  const containerStyle = useMemo(
    () => ({
      width,
      height,
      background: "linear-gradient(145deg, #303036 0%, #111114 28%, #050506 72%, #242429 100%)",
      borderRadius: C.CORNER_RADIUS,
      filter:
        "drop-shadow(0 2px 2px rgba(255, 255, 255, 0.14)) drop-shadow(0 24px 34px rgba(0, 0, 0, 0.58))",
      position: "relative" as const,
      overflow: "hidden" as const,
      display: "flex" as const,
      flexDirection: "column" as const,
    }),
    [width, height],
  );

  const physicalFrameStyle = useMemo(
    () => ({
      position: "absolute" as const,
      inset: 0,
      border: `${C.BEZEL_WIDTH}px solid #141417`,
      borderRadius: C.CORNER_RADIUS,
      boxShadow:
        "inset 0 0 0 2px rgba(255, 255, 255, 0.24), inset 0 0 0 7px rgba(0, 0, 0, 0.82), 0 0 0 2px rgba(118, 118, 130, 0.34)",
      boxSizing: "border-box" as const,
      pointerEvents: "none" as const,
      zIndex: 9998,
    }),
    [C.BEZEL_WIDTH, C.CORNER_RADIUS],
  );

  const glassApertureStyle = useMemo(
    () => ({
      position: "absolute" as const,
      inset: C.BEZEL_WIDTH,
      borderRadius: Math.max(0, C.CORNER_RADIUS - C.BEZEL_WIDTH),
      border: "2px solid rgba(255, 255, 255, 0.13)",
      boxShadow:
        "0 0 0 3px rgba(0, 0, 0, 0.92), inset 0 0 12px rgba(255, 255, 255, 0.045), inset 0 0 22px rgba(0, 0, 0, 0.2)",
      boxSizing: "border-box" as const,
      pointerEvents: "none" as const,
      zIndex: 9997,
    }),
    [C.BEZEL_WIDTH, C.CORNER_RADIUS],
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
      backgroundColor:
        homeIndicatorTheme === "dark" ? "rgba(255, 255, 255, 0.86)" : "rgba(0, 0, 0, 0.48)",
      borderRadius: metrics.homeIndicator.radius,
      zIndex: 9999,
      pointerEvents: "none" as const,
    }),
    [
      homeIndicatorTheme,
      metrics.homeIndicator.bottom,
      metrics.homeIndicator.width,
      metrics.homeIndicator.height,
      metrics.homeIndicator.radius,
    ],
  );

  return (
    <div style={containerStyle}>
      <div style={statusBarAreaStyle}>{statusBar}</div>
      {dynamicIsland ?? <div style={dynamicIslandStyle} />}
      <div style={screenStyle}>
        {children}
        {homeIndicatorTheme !== "hidden" ? <div style={homeIndicatorStyle} /> : null}
      </div>
      <div aria-hidden style={glassApertureStyle} />
      <div aria-hidden style={physicalFrameStyle} />
    </div>
  );
};
