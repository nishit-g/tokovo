import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { getTheme } from "./theme";

export const TypingIndicator: React.FC = () => {
  const theme = getTheme("ios");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cycleDuration = fps * 1.4;
  const cycleFrame = frame % cycleDuration;

  const getDotAnimation = (delaySeconds: number) => {
    const delayFrames = delaySeconds * fps;
    const adjustedFrame =
      (cycleFrame - delayFrames + cycleDuration) % cycleDuration;

    const scale = interpolate(
      adjustedFrame,
      [0, cycleDuration * 0.4, cycleDuration * 0.8, cycleDuration],
      [0.6, 1.0, 0.6, 0.6],
      { extrapolateRight: "clamp" },
    );

    const opacity = interpolate(
      adjustedFrame,
      [0, cycleDuration * 0.4, cycleDuration * 0.8, cycleDuration],
      [0.4, 1.0, 0.4, 0.4],
      { extrapolateRight: "clamp" },
    );

    return { scale, opacity };
  };

  const dot1 = getDotAnimation(0);
  const dot2 = getDotAnimation(0.2);
  const dot3 = getDotAnimation(0.4);

  const baseDotStyle = {
    width: 7,
    height: 7,
    borderRadius: "50%",
    backgroundColor: "#B6B6BB",
    margin: "0 1.5px",
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "10px 18px",
        backgroundColor: theme.colors.bubbleOtherBg,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        width: "fit-content",
        boxShadow: "0 1px 1px rgba(0,0,0,0.05)",
        height: 36,
        marginLeft: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            ...baseDotStyle,
            transform: `scale(${dot1.scale})`,
            opacity: dot1.opacity,
          }}
        />
        <div
          style={{
            ...baseDotStyle,
            transform: `scale(${dot2.scale})`,
            opacity: dot2.opacity,
          }}
        />
        <div
          style={{
            ...baseDotStyle,
            transform: `scale(${dot3.scale})`,
            opacity: dot3.opacity,
          }}
        />
      </div>
      {/* Tail SVG - Authentic left-side tail */}
      <svg
        width="12"
        height="20"
        viewBox="0 0 12 20"
        style={{
          position: "absolute",
          left: -6,
          bottom: 0,
          fill: theme.colors.bubbleOtherBg,
          transform: "scaleX(-1)", // Flip for left side
          zIndex: -1,
        }}
      >
        <path d="M0 0 C0 0 5 0 8 5 C11 10 9 15 9 15 L0 15 Z" />
      </svg>
    </div>
  );
};
