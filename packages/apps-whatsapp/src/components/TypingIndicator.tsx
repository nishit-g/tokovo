import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { useTheme } from "../theme/ThemeContext.js";

export const TypingIndicator: React.FC = () => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cycleDuration = fps * 1.4;
  const cycleFrame = frame % cycleDuration;

  const getDotAnimation = (delaySeconds: number) => {
    const delayFrames = delaySeconds * fps;
    const adjustedFrame =
      (cycleFrame - delayFrames + cycleDuration) % cycleDuration;

    // Vertical bounce animation (translateY)
    // 0%, 60%, 100% = 0 (rest position)
    // 30% = -10px (bounce up)
    const translateY = interpolate(
      adjustedFrame,
      [0, cycleDuration * 0.3, cycleDuration * 0.6, cycleDuration],
      [0, -10, 0, 0],
      { extrapolateRight: "clamp" },
    );

    return { translateY };
  };

  const dot1 = getDotAnimation(0);
  const dot2 = getDotAnimation(0.2);
  const dot3 = getDotAnimation(0.4);

  const baseDotStyle = {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: theme.colors.timestamp,
    margin: "0 1.5px",
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "10px 18px",
        backgroundColor: theme.colors.receivedBubble,
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
            transform: `translateY(${dot1.translateY}px)`,
          }}
        />
        <div
          style={{
            ...baseDotStyle,
            transform: `translateY(${dot2.translateY}px)`,
          }}
        />
        <div
          style={{
            ...baseDotStyle,
            transform: `translateY(${dot3.translateY}px)`,
          }}
        />
      </div>
      {/* Tail SVG - WhatsApp-style tail at bottom left */}
      <svg
        width="10"
        height="14"
        viewBox="0 0 10 14"
        style={{
          position: "absolute",
          left: -8,
          bottom: 0,
          fill: theme.colors.receivedBubble,
          transform: "scaleX(-1)",
        }}
      >
        <path d="M6.5 0H0v12c.6-.1 1.2-.3 1.7-.5 1.6-.7 3-1.8 4.1-3.2.5-.6.9-1.3 1.1-2.1C7.5 4.5 7.6 2.5 6.5 0Z" />
      </svg>
    </div>
  );
};
