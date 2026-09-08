import React from "react";
import { useTime, useFps, DraftText, type InputFieldState } from "@tokovo/react";
import { composerExtraHeight } from "../layout/message.js";
import { useIMessageTheme } from "../ui/ThemeContext.js";
import { iMessageSpacing as spacing } from "../config/tokens.js";

interface InputBarProps {
  draft?: string;
  contentInsetBottom: number;
  showCursor?: boolean;
  inputDirection?: "ltr" | "rtl";
  inputLanguage?: string;
  isSMS?: boolean;
  width?: number;
  selection?: InputFieldState["selection"];
  lastActivityFrame?: number;
}

export const InputBar: React.FC<InputBarProps> = ({
  draft = "",
  contentInsetBottom,
  showCursor = false,
  inputDirection,
  inputLanguage,
  isSMS = false,
  width = 440,
  selection,
  lastActivityFrame,
}) => {
  const { colors, typography } = useIMessageTheme();
  const hasDraft = draft.length > 0;
  const accent = isSMS ? colors.bubble.sms : colors.input.sendButton;
  const frame = useTime();
  const fps = useFps();
  const extra = composerExtraHeight(draft, width);
  return (
    <div
      data-cinematic-subject="imessage_composer"
      style={{
        height: spacing.inputHeight + contentInsetBottom + extra,
        boxSizing: "border-box",
        flexShrink: 0,
        padding: `${spacing.inputPaddingV}px ${spacing.inputPaddingH}px ${contentInsetBottom + spacing.inputPaddingV}px`,
        background: colors.input.background,
        display: "flex",
        alignItems: "center",
        gap: spacing.inputIconGap,
      }}
    >
      <button
        type="button"
        aria-label="Add attachment"
        style={{
          width: 32,
          height: 32,
          flexShrink: 0,
          border: 0,
          borderRadius: "50%",
          padding: 0,
          display: "grid",
          placeItems: "center",
          background: colors.bubble.received,
          color: colors.input.icons,
        }}
      >
        <svg
          width="23"
          height="23"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <div
        data-cinematic-subject="imessage_input"
        style={{
          flex: 1,
          minWidth: 0,
          height: spacing.inputFieldHeight + extra,
          boxSizing: "border-box",
          border: `1px solid ${colors.input.border}`,
          borderRadius: spacing.inputBorderRadius,
          background: colors.input.field,
          padding: "0 4px 0 12px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          role="textbox"
          aria-label={isSMS ? "Text Message" : "iMessage"}
          aria-readonly="true"
          dir={inputDirection}
          lang={inputLanguage}
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            whiteSpace: "pre",
            textAlign: "start",
            fontFamily: typography.input.family,
            fontSize: typography.input.size,
            lineHeight: "22px",
            color: hasDraft ? colors.bubble.otherText : colors.input.placeholder,
          }}
        >
          <DraftText text={draft} selection={selection} focused={showCursor} frame={frame} fps={fps} lastActivityFrame={lastActivityFrame} accent={accent} lineHeight={22} locale={inputLanguage} placeholder={isSMS ? "Text Message" : "iMessage"} />
        </div>
        <button
          type="button"
          aria-label={hasDraft ? "Send message" : "Record audio message"}
          style={{
            width: 26,
            height: 26,
            flexShrink: 0,
            padding: 0,
            border: 0,
            borderRadius: "50%",
            background: hasDraft ? accent : "transparent",
            color: hasDraft ? "#FFFFFF" : colors.input.icons,
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {hasDraft ? (
              <path d="M12 19V5m-6 6 6-6 6 6" />
            ) : (
              <>
                <rect x="9" y="3" width="6" height="12" rx="3" />
                <path d="M6 11v1a6 6 0 0 0 12 0v-1M12 18v3m-3 0h6" />
              </>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InputBar;
