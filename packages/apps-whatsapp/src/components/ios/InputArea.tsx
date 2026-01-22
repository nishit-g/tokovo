import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Keyboard, Camera, Mic, Send } from "lucide-react";
import { UIThemeTokens } from "../../ui/ui-strategy";

const DEFAULT_INPUT_COLORS = {
  inputBg: "#F6F6F6",
  inputFieldBg: "#FFFFFF",
  inputText: "#000000",
  inputPlaceholder: "#C7C7CC",
  inputIcon: "#000000",
  inputButtonBg: "#007AFF",
  inputButtonIcon: "#FFFFFF",
  accentColor: "#007AFF",
};

export const InputArea: React.FC<{
  text?: string;
  showCursor?: boolean;
  safeAreaBottom?: number;
  tokens?: UIThemeTokens;
}> = ({ text = "", showCursor = false, safeAreaBottom = 34, tokens }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const inputBg = tokens?.inputBg || DEFAULT_INPUT_COLORS.inputBg;
  const inputFieldBg = tokens?.inputFieldBg || DEFAULT_INPUT_COLORS.inputFieldBg;
  const inputText = tokens?.inputText || DEFAULT_INPUT_COLORS.inputText;
  const inputPlaceholder = tokens?.inputPlaceholder || DEFAULT_INPUT_COLORS.inputPlaceholder;
  const inputIcon = tokens?.inputIcon || DEFAULT_INPUT_COLORS.inputIcon;
  const inputButtonBg = tokens?.inputButtonBg || DEFAULT_INPUT_COLORS.inputButtonBg;
  const inputButtonIcon = tokens?.inputButtonIcon || DEFAULT_INPUT_COLORS.inputButtonIcon;
  const accentColor = tokens?.accentColor || DEFAULT_INPUT_COLORS.accentColor;

  const hasContent = text.length > 0;
  const cursorVisible = Math.floor(frame / (fps * 0.5)) % 2 === 0;
  const paddingBottom = Math.max(safeAreaBottom, 20);

  return (
    <div
      data-anchor="input"
      style={{
        backgroundColor: inputBg,
        borderTop: "none",
        padding: `6px 16px ${paddingBottom}px 10px`,
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
        <Keyboard size={28} color={inputIcon} strokeWidth={1.5} />
      </div>

      <div
        data-anchor="typing"
        style={{
          flex: 1,
          backgroundColor: inputFieldBg,
          borderRadius: 24,
          border: tokens?.inputBorder ? `1px solid ${tokens.inputBorder}` : "1px solid rgba(0,0,0,0.05)",
          padding: "4px 4px 4px 12px",
          minHeight: 38,
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
              fontFamily: tokens?.fontFamily || "-apple-system, BlinkMacSystemFont, sans-serif",
              color: hasContent ? inputText : inputPlaceholder,
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
                  backgroundColor: accentColor,
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
              stroke={inputIcon}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <path
              d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
              stroke={inputIcon}
              strokeWidth={1.5}
            />
            <path
              d="M9 10L9.01 10"
              stroke={inputIcon}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <path
              d="M15 10L15.01 10"
              stroke={inputIcon}
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
              backgroundColor: inputButtonBg,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Send
              size={18}
              color={inputButtonIcon}
              fill={inputButtonIcon}
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
          <Camera size={26} color={inputIcon} strokeWidth={1.5} />
          <Mic size={24} color={inputIcon} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
};
