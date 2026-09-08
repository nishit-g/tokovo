import React from "react";
import { DraftText, type InputFieldState } from "@tokovo/react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Camera, Mic, Paperclip, Plus, Send, Smile } from "lucide-react";
import { getComposerExtraHeight } from "../config/layout-config.js";
import {
  useTheme,
  useWhatsAppLocale,
  useWhatsAppPresentation,
} from "../experience/ExperienceContext.js";

export const InputArea: React.FC<{
  text?: string;
  showCursor?: boolean;
  contentInsetBottom: number;
  inputDirection?: "ltr" | "rtl";
  inputLanguage?: string;
  viewportWidth?: number;
  selection?: InputFieldState["selection"];
  lastActivityFrame?: number;
}> = ({
  text = "",
  showCursor = false,
  contentInsetBottom,
  inputDirection,
  inputLanguage,
  viewportWidth = 440,
  selection,
  lastActivityFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const { direction, t } = useWhatsAppLocale();
  const presentation = useWhatsAppPresentation();

  const hasContent = text.length > 0;
  const keyboardAttached = contentInsetBottom === 0;
  const extraHeight = getComposerExtraHeight(text, viewportWidth);
  const paddingBottom = keyboardAttached ? 7 : Math.max(contentInsetBottom, 14);
  const controlBottomInset = keyboardAttached ? 3 : 8;

  return (
    <div
      data-cinematic-subject="input"
      role="group"
      aria-label={t("composer.placeholder")}
      dir={direction}
      style={{
        backgroundColor: theme.colors.inputBackground,
        borderTop: `1px solid ${theme.colors.divider}`,
        paddingBlock: `6px ${paddingBottom}px`,
        paddingInline: "9px 10px",
        display: "flex",
        alignItems: "flex-end",
        gap: 9,
        position: "absolute",
        bottom: 0,
        insetInline: 0,
        height: 60 + contentInsetBottom + extraHeight,
        boxSizing: "border-box",
      }}
    >
      <button
        type="button"
        aria-label={
          presentation.conversation.composerLeadingAction === "add"
            ? t("action.add")
            : t("action.emoji")
        }
        style={{
          width: 30,
          height: 30,
          marginBottom: controlBottomInset,
          borderRadius: "50%",
          border:
            presentation.conversation.composerLeadingAction === "add"
              ? `1.5px solid ${theme.colors.inputText}`
              : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          padding: 0,
          color: "inherit",
          background: "transparent",
          font: "inherit",
        }}
      >
        {presentation.conversation.composerLeadingAction === "add" ? (
          <Plus size={20} color={theme.colors.inputText} strokeWidth={1.8} aria-hidden="true" />
        ) : (
          <Smile size={25} color={theme.colors.inputText} strokeWidth={1.6} aria-hidden="true" />
        )}
      </button>

      <div
        data-cinematic-subject="typing"
        role="textbox"
        dir={inputDirection ?? direction}
        lang={inputLanguage}
        aria-label={t("composer.placeholder")}
        aria-multiline="true"
        aria-readonly="true"
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          borderRadius: 22,
          border: `1px solid ${theme.colors.divider}`,
          paddingBlock: 6,
          paddingInline: "12px 4px",
          height: 38 + extraHeight,
          minWidth: 0,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: keyboardAttached ? 1 : 3,
        }}
      >
        <div style={{ flex: 1, minWidth: 0, maxHeight: 80, overflow: "hidden" }}>
          <div
            dir={inputDirection ?? direction}
            lang={inputLanguage}
            style={{
              fontSize: 16,
              fontFamily: theme.typography.fontFamily,
              color: hasContent ? theme.colors.inputText : theme.colors.inputPlaceholder,
              lineHeight: "20px",
              display: "block",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            <DraftText text={text} selection={selection} focused={showCursor} frame={frame} fps={fps} lastActivityFrame={lastActivityFrame} accent={theme.colors.accent} lineHeight={20} locale={inputLanguage} placeholder={t("composer.placeholder")} />
          </div>
        </div>

        <div
          aria-hidden="true"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 30,
            width: 30,
            marginInlineEnd: 4,
          }}
        >
          <Smile size={23} color={theme.colors.inputText} strokeWidth={1.5} aria-hidden="true" />
        </div>
      </div>

      {hasContent ? (
        <button
          type="button"
          aria-label={t("action.send")}
          style={{
            padding: 0,
            paddingBottom: keyboardAttached ? 2 : 6,
            border: 0,
            color: "inherit",
            background: "transparent",
            cursor: "pointer",
            font: "inherit",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              backgroundColor: theme.colors.accent,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 2px 6px ${theme.colors.accent}38`,
            }}
          >
            <Send
              size={18}
              color={theme.colors.background}
              fill={theme.colors.background}
              aria-hidden="true"
              style={{ marginInlineStart: 2 }}
            />
          </div>
        </button>
      ) : (
        <div
          style={{
            display: "flex",
            gap: 14,
            paddingBottom: controlBottomInset,
            alignItems: "center",
          }}
        >
          {presentation.conversation.composerIdleActions.map((action) => {
            const label =
              action === "attachment"
                ? t("action.attachment")
                : action === "camera"
                  ? t("action.camera")
                  : t("action.voiceMessage");
            const icon =
              action === "attachment" ? (
                <Paperclip
                  size={23}
                  color={theme.colors.inputText}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              ) : action === "camera" ? (
                <Camera
                  size={25}
                  color={theme.colors.inputText}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              ) : (
                <Mic
                  size={23}
                  color={theme.colors.inputText}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              );
            return (
              <button
                key={action}
                type="button"
                aria-label={label}
                style={{
                  padding: 0,
                  border: 0,
                  color: "inherit",
                  background: "transparent",
                  font: "inherit",
                }}
              >
                {icon}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
