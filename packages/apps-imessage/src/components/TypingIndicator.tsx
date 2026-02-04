import React from "react";
import { iOS_IMESSAGE_LIGHT, LAYOUT_CONSTANTS } from "../config";

interface TypingIndicatorProps {
  theme?: typeof iOS_IMESSAGE_LIGHT;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  theme = iOS_IMESSAGE_LIGHT,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: LAYOUT_CONSTANTS.TYPING_DOT_GAP,
        padding: "6px 8px",
        borderRadius: 20,
        backgroundColor: theme.colors.bubble.received,
        alignSelf: "flex-start",
        marginBottom: LAYOUT_CONSTANTS.MESSAGE_GAP,
      }}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: LAYOUT_CONSTANTS.TYPING_DOT_SIZE,
            height: LAYOUT_CONSTANTS.TYPING_DOT_SIZE,
            borderRadius: LAYOUT_CONSTANTS.TYPING_DOT_SIZE / 2,
            backgroundColor: theme.colors.system.timestamp,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
};

export default TypingIndicator;
