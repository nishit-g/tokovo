import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export interface TypingIndicatorProps {
  isTyping: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isTyping,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!isTyping) return null;

  const cycleDuration = fps * 0.6;
  const cycleFrame = frame % cycleDuration;

  const getDotScale = (delaySeconds: number) => {
    const delayFrames = delaySeconds * fps;
    const adjustedFrame =
      (cycleFrame - delayFrames + cycleDuration) % cycleDuration;

    return interpolate(
      adjustedFrame,
      [0, cycleDuration * 0.5, cycleDuration],
      [0.6, 1.0, 0.6],
      { extrapolateRight: "clamp" },
    );
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        padding: "4px 8px",
      }}
    >
      <div
        style={{
          backgroundColor: "#202C33",
          borderRadius: 8,
          borderTopLeftRadius: 0,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#8696A0",
              transform: `scale(${getDotScale(i * 0.2)})`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TypingIndicator;
