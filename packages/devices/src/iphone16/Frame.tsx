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
  const display = iPhone16Profile.display;
  const C = iPhone16Constants;
  const metrics = getIOSChromeMetrics(iPhone16Profile);

  const containerStyle = useMemo(
    () => ({
      width,
      height,
      background: "linear-gradient(145deg, #25252a 0%, #0b0b0d 30%, #050506 72%, #1b1b1f 100%)",
      borderRadius: C.BODY_CORNER_RADIUS,
      filter:
        "drop-shadow(0 1px 1px rgba(255, 255, 255, 0.08)) drop-shadow(0 24px 34px rgba(0, 0, 0, 0.58))",
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
      border: "1px solid rgba(7, 8, 10, 0.985)",
      borderRadius: C.BODY_CORNER_RADIUS,
      boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.88), inset 0 1px 0 rgba(255, 255, 255, 0.055)",
      boxSizing: "border-box" as const,
      pointerEvents: "none" as const,
      zIndex: 9998,
    }),
    [C.BODY_CORNER_RADIUS],
  );

  const displayStyle = useMemo(
    () => ({
      position: "absolute" as const,
      left: display.x,
      top: display.y,
      width: display.width,
      height: display.height,
      borderRadius: display.cornerRadius,
      backgroundColor: "#000",
      boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.96), inset 0 0 1px rgba(255, 255, 255, 0.025)",
      overflow: "hidden" as const,
      display: "flex" as const,
      flexDirection: "column" as const,
    }),
    [display],
  );

  const frontGlassStyle = useMemo(
    () => ({
      position: "absolute" as const,
      inset: 0,
      borderRadius: C.BODY_CORNER_RADIUS,
      background:
        "linear-gradient(145deg, rgba(255, 255, 255, 0.018) 0%, rgba(255, 255, 255, 0) 24%, rgba(255, 255, 255, 0) 76%, rgba(255, 255, 255, 0.008) 100%)",
      boxShadow:
        "inset 0 1px 0 rgba(255, 255, 255, 0.07), inset 1px 0 0 rgba(255, 255, 255, 0.02), inset -1px 0 0 rgba(0, 0, 0, 0.28), inset 0 -1px 0 rgba(0, 0, 0, 0.45)",
      pointerEvents: "none" as const,
      zIndex: 9997,
    }),
    [C.BODY_CORNER_RADIUS],
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
      <div style={displayStyle}>
        <div style={statusBarAreaStyle}>{statusBar}</div>
        {dynamicIsland ?? <div style={dynamicIslandStyle} />}
        <div style={screenStyle}>
          {children}
          {homeIndicatorTheme !== "hidden" ? <div style={homeIndicatorStyle} /> : null}
        </div>
      </div>
      <div aria-hidden style={frontGlassStyle} />
      <div aria-hidden style={physicalFrameStyle} />
    </div>
  );
};
