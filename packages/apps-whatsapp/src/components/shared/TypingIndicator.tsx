import React from "react";
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
        <TypingDot delay={0.15} />
        <TypingDot delay={0.3} />
      </div>
    </div>
  );
});

interface TypingDotProps {
  delay: number;
}

function TypingDot({ delay }: TypingDotProps): React.ReactElement {
  const theme = useTheme();

  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        backgroundColor: theme.colors.typingIndicator,
        animation: `typingBounce 1.4s infinite ease-in-out both`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}
