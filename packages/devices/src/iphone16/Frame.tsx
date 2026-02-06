import React, { useMemo } from "react";
import { iPhone16Profile, iPhone16Constants } from "./profile.js";

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
      height: C.STATUS_BAR_HEIGHT,
      zIndex: 1000,
      pointerEvents: "none" as const,
      display: "flex" as const,
      justifyContent: "space-between" as const,
      padding: `${C.STATUS_BAR_PADDING_TOP}px ${C.STATUS_BAR_PADDING_X}px 0 ${C.STATUS_BAR_PADDING_X}px`,
    }),
    [],
  );

  const dynamicIslandStyle = useMemo(
    () => ({
      position: "absolute" as const,
      top: C.DYNAMIC_ISLAND_TOP,
      left: "50%",
      transform: "translateX(-50%)",
      width: C.DYNAMIC_ISLAND_WIDTH,
      height: C.DYNAMIC_ISLAND_HEIGHT,
      backgroundColor: "black",
      borderRadius: C.DYNAMIC_ISLAND_RADIUS,
      zIndex: 1001,
    }),
    [],
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
      bottom: C.HOME_INDICATOR_BOTTOM,
      left: "50%",
      transform: "translateX(-50%)",
      width: C.HOME_INDICATOR_WIDTH,
      height: C.HOME_INDICATOR_HEIGHT,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: C.HOME_INDICATOR_RADIUS,
      zIndex: 9999,
      pointerEvents: "none" as const,
    }),
    [],
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
