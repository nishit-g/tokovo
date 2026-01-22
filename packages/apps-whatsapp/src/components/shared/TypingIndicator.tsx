import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { useTheme } from "../../theme/ThemeContext";

interface TypingIndicatorProps {
  name?: string;
  style?: React.CSSProperties;
}

export const TypingIndicator = React.memo(function TypingIndicator({
  name,
  style,
}: TypingIndicatorProps): React.ReactElement {
  const theme = useTheme();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.systemMessageFontSize,
        color: theme.colors.typingIndicator,
        ...style,
      }}
    >
      {name && <span>{name}</span>}
      <div style={{ display: "flex", gap: 2 }}>
        <TypingDot delay={0} />
        <TypingDot delay={6} />
        <TypingDot delay={12} />
      </div>
    </div>
  );
});

interface TypingDotProps {
  delay: number;
}

function TypingDot({ delay }: TypingDotProps): React.ReactElement {
  const theme = useTheme();
  const frame = useCurrentFrame();

  const cycleLength = 42;
  const adjustedFrame = (frame + delay) % cycleLength;

  const translateY = interpolate(
    adjustedFrame,
    [0, 12, 24, 42],
    [0, -4, 0, 0],
    { extrapolateRight: "clamp" },
  );

  const opacity = interpolate(
    adjustedFrame,
    [0, 12, 24, 42],
    [0.4, 1, 0.4, 0.4],
    { extrapolateRight: "clamp" },
  );

  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        backgroundColor: theme.colors.typingIndicator,
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    />
  );
}
