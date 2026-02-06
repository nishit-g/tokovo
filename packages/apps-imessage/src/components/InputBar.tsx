/**
 * iMessage Input Bar Component
 * 
 * iOS 17 style message input with apps button, camera, and send
 */
import React from "react";
import { useIMessageTheme } from "../ui/ThemeContext";
import { iMessageSpacing, iMessageTypography } from "../config/tokens";
import type { IMessageTheme } from "../config/imessage-theme";

interface InputBarProps {
  /** For backward compatibility - prefer using inside ThemeContext */
  theme?: IMessageTheme;
  draft?: string;
  safeAreaBottom?: number;
}

export const InputBar: React.FC<InputBarProps> = ({
  theme: propTheme,
  draft = "",
  safeAreaBottom,
}) => {
  const contextTheme = useIMessageTheme();
  const theme = propTheme ?? contextTheme;
  const { colors } = theme;
  const bottomInset = safeAreaBottom ?? iMessageSpacing.safeAreaBottom;

  const hasDraft = draft.length > 0;

  return (
    <div
      style={{
        height: iMessageSpacing.inputHeight + bottomInset,
        backgroundColor: colors.input.background,
        borderTop: `0.5px solid ${colors.system.separator}`,
        padding: `${iMessageSpacing.inputPaddingV}px ${iMessageSpacing.inputPaddingH}px ${bottomInset}px`,
        display: "flex",
        alignItems: "center",
        gap: iMessageSpacing.inputIconGap,
      }}
    >
      {/* Apps button (plus icon) */}
      <IconButton color={colors.header.icons}>
        <svg viewBox="0 0 24 24" width={iMessageSpacing.inputIconSize} height={iMessageSpacing.inputIconSize} fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </IconButton>

      {/* Text input field */}
      <div
        style={{
          flex: 1,
          height: iMessageSpacing.inputFieldHeight,
          borderRadius: iMessageSpacing.inputBorderRadius,
          backgroundColor: colors.input.field,
          border: `1px solid ${colors.input.border}`,
          padding: `0 ${iMessageSpacing.bubblePaddingH}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: iMessageTypography.fontFamily,
          fontSize: iMessageTypography.input.fontSize,
        }}
      >
        <span style={{ color: hasDraft ? colors.bubble.otherText : colors.input.placeholder }}>
          {draft || "iMessage"}
        </span>
        {/* Memoji/sticker icon */}
        {!hasDraft && (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" style={{ color: colors.input.icons }}>
            <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="9" cy="10" r="1.5" fill="currentColor" />
            <circle cx="15" cy="10" r="1.5" fill="currentColor" />
            <path d="M8 15 C10 17, 14 17, 16 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Send button or audio button */}
      {hasDraft ? (
        <SendButton color={colors.input.sendButton} />
      ) : (
        <IconButton color={colors.input.icons}>
          <svg viewBox="0 0 24 24" width={iMessageSpacing.inputIconSize} height={iMessageSpacing.inputIconSize} fill="none">
            <path
              d="M12 3 L12 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 21 C16 21, 19 18, 19 14 L19 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M12 21 C8 21, 5 18, 5 14 L5 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </IconButton>
      )}
    </div>
  );
};

const IconButton: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <div
    style={{
      width: 32,
      height: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color,
    }}
  >
    {children}
  </div>
);

const SendButton: React.FC<{ color: string }> = ({ color }) => (
  <div
    style={{
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
      <path d="M12 4 L12 20 M12 4 L6 10 M12 4 L18 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  </div>
);

export default InputBar;
