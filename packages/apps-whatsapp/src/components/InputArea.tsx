import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Keyboard, Camera, Mic, Send } from "lucide-react";
import { useTheme } from "../theme/ThemeContext.js";
import { whatsappColors } from "./theme.js";

export const InputArea: React.FC<{
  text?: string;
  showCursor?: boolean;
  safeAreaBottom?: number;
}> = ({ text = "", showCursor = false, safeAreaBottom = 34 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();

  const hasContent = text.length > 0;
  const cursorVisible = Math.floor(frame / (fps * 0.5)) % 2 === 0;
  const paddingBottom = Math.max(safeAreaBottom, 20);

  return (
    <div
      data-anchor="input"
      style={{
        backgroundColor: theme.colors.inputBackground,
        borderTop: `1px solid ${theme.colors.divider}`,
        padding: `8px 14px ${paddingBottom}px 10px`,
        display: "flex",
        alignItems: "flex-end",
        gap: 12,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        minHeight: 50,
      }}
    >
      <div style={{ paddingBottom: 8, cursor: "pointer" }}>
        <Keyboard size={28} color={theme.colors.inputText} strokeWidth={1.5} />
      </div>

      <div
        data-anchor="typing"
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          borderRadius: 22,
          border: `1px solid ${theme.colors.divider}`,
          padding: "6px 4px 6px 12px",
          minHeight: 40,
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 3,
        }}
      >
        <div style={{ flex: 1, padding: "5px 0" }}>
          <span
            style={{
              fontSize: 16,
              fontFamily: theme.typography.fontFamily,
              color: hasContent
                ? theme.colors.inputText
                : theme.colors.inputPlaceholder,
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
                  backgroundColor: theme.colors.accent,
                  marginLeft: 1,
                  verticalAlign: "middle",
                }}
              />
            )}
            {!hasContent && !showCursor && "Message"}
          </span>
        </div>

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
              stroke={theme.colors.inputText}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <path
              d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
              stroke={theme.colors.inputText}
              strokeWidth={1.5}
            />
            <path
              d="M9 10L9.01 10"
              stroke={theme.colors.inputText}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <path
              d="M15 10L15.01 10"
              stroke={theme.colors.inputText}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {hasContent ? (
        <div style={{ paddingBottom: 6, cursor: "pointer" }}>
          <div
            style={{
              width: 34,
              height: 34,
              backgroundColor: theme.colors.accent,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 12px ${whatsappColors.primaryGlow}`,
            }}
          >
            <Send
              size={18}
              color={theme.colors.background}
              fill={theme.colors.background}
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
          <Camera size={26} color={theme.colors.inputText} strokeWidth={1.5} />
          <Mic size={24} color={theme.colors.inputText} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
};
