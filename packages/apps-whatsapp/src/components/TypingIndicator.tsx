import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { useTheme } from "../theme/ThemeContext";

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
      {/* Tail SVG - Clean WhatsApp-style tail at bottom left */}
      <svg
        width="8"
        height="13"
        viewBox="0 0 8 13"
        style={{
          position: "absolute",
          left: -7,
          bottom: 0,
          fill: theme.colors.receivedBubble,
          transform: "scaleX(-1)",
        }}
      >
        <path d="M5.188 0H0v11.193c.498-.098.984-.236 1.453-.424a14.937 14.937 0 0 0 4.243-2.636c.634-.556 1.228-1.2 1.74-2.01.327-.519.613-1.1.684-1.732C8.298 2.66 6.953.404 5.188 0Z" />
      </svg>
    </div>
  );
};
