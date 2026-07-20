import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Camera, Mic, Paperclip, Plus, Send, Smile } from "lucide-react";
import {
  useTheme,
  useWhatsAppLocale,
  useWhatsAppPresentation,
} from "../experience/ExperienceContext.js";

export const InputArea: React.FC<{
  text?: string;
  showCursor?: boolean;
  safeAreaBottom?: number;
}> = ({ text = "", showCursor = false, safeAreaBottom = 34 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const { direction, t } = useWhatsAppLocale();
  const presentation = useWhatsAppPresentation();

  const hasContent = text.length > 0;
  const cursorVisible = Math.floor(frame / (fps * 0.5)) % 2 === 0;
  const paddingBottom = Math.max(safeAreaBottom, 20);

  return (
    <div
      data-anchor="input"
      role="group"
      aria-label={t("composer.placeholder")}
      dir={direction}
      style={{
        backgroundColor: theme.colors.inputBackground,
        borderTop: `1px solid ${theme.colors.divider}`,
        paddingBlock: `8px ${paddingBottom}px`,
        paddingInline: "10px 14px",
        display: "flex",
        alignItems: "flex-end",
        gap: 12,
        position: "absolute",
        bottom: 0,
        insetInline: 0,
        minHeight: 50,
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
          marginBottom: 8,
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
          <Plus
            size={20}
            color={theme.colors.inputText}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        ) : (
          <Smile
            size={25}
            color={theme.colors.inputText}
            strokeWidth={1.6}
            aria-hidden="true"
          />
        )}
      </button>

      <div
        data-anchor="typing"
        role="textbox"
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
                  marginInlineStart: 1,
                  verticalAlign: "middle",
                }}
              />
            )}
            {!hasContent && !showCursor && t("composer.placeholder")}
          </span>
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
          <Smile
            size={23}
            color={theme.colors.inputText}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
      </div>

      {hasContent ? (
        <button
          type="button"
          aria-label={t("action.send")}
          style={{
            padding: 0,
            paddingBottom: 6,
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
            gap: 16,
            paddingBottom: 8,
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
