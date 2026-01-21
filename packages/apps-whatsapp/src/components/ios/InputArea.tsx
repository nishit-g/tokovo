import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Keyboard, Camera, Mic, Send } from "lucide-react";
import { getTheme } from "./theme";

// Logical height for Input Area
// ~48-50px for the input field itself
// Total bar height depending on content, usually ~60-80px + safe area

export const InputArea: React.FC<{
  text?: string;
  showCursor?: boolean;
  safeAreaBottom?: number;
}> = ({ text = "", showCursor = false, safeAreaBottom = 34 }) => {
  const theme = getTheme("ios");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hasContent = text.length > 0;
  const cursorVisible = Math.floor(frame / (fps * 0.5)) % 2 === 0;

  // Standard iOS bottom padding (home indicator) is 34px
  const paddingBottom = Math.max(safeAreaBottom, 20);

  return (
    <div
      data-anchor="input"
      style={{
        backgroundColor: theme.colors.headerBg, // Solid Beige to match Chat/Header
        borderTop: "none", // Seamless look
        padding: `6px 16px ${paddingBottom}px 10px`, // Tighter vertical padding
        display: "flex",
        alignItems: "flex-end", // Align to bottom for multiline growth
        gap: 12,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        minHeight: 50,
      }}
    >
      {/* Keyboard Icon (Black) - Bottom aligned */}
      <div style={{ paddingBottom: 8, cursor: "pointer" }}>
        <Keyboard size={28} color="#000000" strokeWidth={1.5} />
      </div>

      {/* Input Pill */}
      <div
        data-anchor="typing"
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF", // White Pill
          borderRadius: 24, // Fully rounded
          border: "1px solid rgba(0,0,0,0.05)",
          padding: "4px 4px 4px 12px", // Right padding is small to fit sticker
          minHeight: 38, // Slightly taller
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 3, // Lift slightly
        }}
      >
        <div style={{ flex: 1, padding: "5px 0" }}>
          <span
            style={{
              fontSize: 16,
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              color: hasContent ? "#000" : "#C7C7CC",
              lineHeight: "20px",
              display: "block",
            }}
          >
            {hasContent ? text : ""}
            {showCursor && cursorVisible && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 18,
                  backgroundColor: theme.colors.primary,
                  marginLeft: 1,
                  verticalAlign: "middle",
                }}
              />
            )}
            {!hasContent && !showCursor && "Message"}
          </span>
        </div>

        {/* Sticker Icon (Right Side inside Input) */}
        <div
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 30,
            width: 30,
            marginRight: 4,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 19L22 22"
              stroke="#000000"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <path
              d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
              stroke="#000000"
              strokeWidth={1.5}
            />
            <path
              d="M9 10L9.01 10"
              stroke="#000000"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <path
              d="M15 10L15.01 10"
              stroke="#000000"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Right Icons: Camera and Mic */}
      {hasContent ? (
        // Send button
        <div style={{ paddingBottom: 6, cursor: "pointer" }}>
          <div
            style={{
              width: 34,
              height: 34,
              backgroundColor: theme.colors.primary,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Send
              size={18}
              color="#FFF"
              fill="#FFF"
              style={{ marginLeft: 2 }}
            />
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            gap: 16,
            paddingBottom: 8,
            alignItems: "center",
          }}
        >
          {/* Camera */}
          <Camera size={26} color="#000000" strokeWidth={1.5} />
          {/* Mic */}
          <Mic size={24} color="#000000" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
};
