/**
 * iMessage Typing Indicator Component
 *
 * Animated three-dot typing bubble
 */
import React from "react";
import { pulse, useFps, useTime } from "@tokovo/react";
import { useIMessageTheme } from "../ui/ThemeContext.js";
import { iMessageSpacing, iMessageAnimations } from "../config/tokens.js";
export const TypingIndicator: React.FC = () => {
  const theme = useIMessageTheme();
  const frame = useTime();
  const fps = useFps();

  return (
    <div
      style={{
        display: "flex",
        width: "fit-content",
        marginTop: iMessageSpacing.messageGapNormal,
        gap: iMessageSpacing.typingDotGap,
        padding: `${iMessageSpacing.typingBubblePaddingV}px ${iMessageSpacing.typingBubblePaddingH}px`,
        borderRadius: iMessageSpacing.bubbleRadius,
        backgroundColor: theme.colors.bubble.received,
        alignSelf: "flex-start",
        marginBottom: iMessageSpacing.messageGapNormal,
      }}
    >
      {[0, 1, 2].map((i) => {
        const progress = pulse(
          frame,
          fps,
          iMessageAnimations.typingDotDuration / 1000,
          (i * iMessageAnimations.typingDotDelay) / 1000,
        );
        return (
          <div
            key={i}
            style={{
              width: iMessageSpacing.typingDotSize,
              height: iMessageSpacing.typingDotSize,
              borderRadius: iMessageSpacing.typingDotSize / 2,
              backgroundColor: theme.colors.system.timestamp,
              opacity: 0.4 + progress * 0.6,
              transform: `scale(${0.9 + progress * 0.2})`,
            }}
          />
        );
      })}
    </div>
  );
};

export default TypingIndicator;
