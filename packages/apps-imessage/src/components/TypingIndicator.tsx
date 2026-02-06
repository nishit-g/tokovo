/**
 * iMessage Typing Indicator Component
 * 
 * Animated three-dot typing bubble
 */
import React from "react";
import { useIMessageTheme } from "../ui/ThemeContext.js";
import { iMessageSpacing, iMessageAnimations } from "../config/tokens.js";
import type { IMessageTheme } from "../config/imessage-theme.js";

interface TypingIndicatorProps {
  /** For backward compatibility - prefer using inside ThemeContext */
  theme?: IMessageTheme;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ theme: propTheme }) => {
  const contextTheme = useIMessageTheme();
  const theme = propTheme ?? contextTheme;

  return (
    <div
      style={{
        display: "flex",
        gap: iMessageSpacing.typingDotGap,
        padding: `${iMessageSpacing.typingBubblePaddingV}px ${iMessageSpacing.typingBubblePaddingH}px`,
        borderRadius: iMessageSpacing.bubbleRadius,
        backgroundColor: theme.colors.bubble.received,
        alignSelf: "flex-start",
        marginBottom: iMessageSpacing.messageGapNormal,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="imessage-typing-dot"
          style={{
            width: iMessageSpacing.typingDotSize,
            height: iMessageSpacing.typingDotSize,
            borderRadius: iMessageSpacing.typingDotSize / 2,
            backgroundColor: theme.colors.system.timestamp,
            animation: `imessage-typing-pulse ${iMessageAnimations.typingDotDuration}ms ease-in-out infinite`,
            animationDelay: `${i * iMessageAnimations.typingDotDelay}ms`,
          }}
        />
      ))}
    </div>
  );
};

export default TypingIndicator;
