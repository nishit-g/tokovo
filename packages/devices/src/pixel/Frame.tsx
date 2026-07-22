import React from "react";
import { PixelProfile } from "./profile.js";

export const PixelFrame: React.FC<{ children: React.ReactNode; statusBar?: React.ReactNode }> = ({
  children,
  statusBar,
}) => {
  const { width, height } = PixelProfile.dimensions;
  const display = PixelProfile.display;

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: "black",
        borderRadius: 78,
        boxShadow: "0 20px 34px rgba(0, 0, 0, 0.48)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: display.x,
          top: display.y,
          width: display.width,
          height: display.height,
          borderRadius: display.cornerRadius * 3,
          overflow: "hidden",
          backgroundColor: "#121212",
        }}
      >
        {/* Status Bar Area */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 100,
            zIndex: 1000,
            pointerEvents: "none",
            padding: "30px 40px 0 40px",
          }}
        >
          {statusBar}
        </div>

        {/* Camera Hole Punch */}
        <div
          style={{
            position: "absolute",
            top: 36, // 12 * 3
            left: "50%",
            transform: "translateX(-50%)",
            width: 36, // 12 * 3
            height: 36, // 12 * 3
            backgroundColor: "black",
            borderRadius: "50%",
            zIndex: 1001,
          }}
        />

        {/* Screen Content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#121212", // Dark mode default for Android
            display: "flex",
            flexDirection: "column",
            color: "white",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
