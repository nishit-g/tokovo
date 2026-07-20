import { Reply, X } from "lucide-react";
import {
  useTheme,
  useWhatsAppLocale,
} from "../../experience/ExperienceContext.js";
import type { ProjectedThreadMessage } from "../../thread/projector.js";

function fallbackPreview(
  message: ProjectedThreadMessage,
  t: ReturnType<typeof useWhatsAppLocale>["t"],
): string {
  if (message.text) return message.text;
  if (message.type === "image") return t("message.photo");
  if (message.type === "video") return t("message.video");
  if (message.type === "voice") return t("message.voice");
  if (message.type === "document") return t("message.document");
  if (message.type === "location") return t("message.location");
  return t("message.unavailable");
}

export function ReplyComposerBanner({
  message,
}: {
  message: ProjectedThreadMessage;
}) {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  const sender =
    message.from === "me"
      ? t("chat.you")
      : message.senderName ?? message.from;

  return (
    <div
      data-anchor="reply_composer"
      role="status"
      aria-label={t("composer.replyingTo", { name: sender })}
      style={{
        position: "absolute",
        left: 10,
        right: 10,
        bottom: theme.spacing.inputAreaHeight + 34,
        zIndex: 12,
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "8px 10px",
        borderInlineStart: `4px solid ${theme.colors.accent}`,
        borderRadius: 11,
        color: theme.colors.receivedBubbleText,
        backgroundColor: theme.colors.background,
        boxShadow: "0 4px 14px rgba(0,0,0,0.16)",
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <Reply size={17} color={theme.colors.accent} aria-hidden="true" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: theme.colors.accent, fontSize: 11, fontWeight: 700 }}>
          {t("composer.replyingTo", { name: sender })}
        </div>
        <div
          style={{
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: theme.colors.timestamp,
            fontSize: 12,
          }}
        >
          {fallbackPreview(message, t)}
        </div>
      </div>
      <button
        type="button"
        aria-label={t("action.dismiss")}
        style={{
          padding: 3,
          border: 0,
          color: "inherit",
          background: "transparent",
          font: "inherit",
        }}
      >
        <X size={17} color={theme.colors.timestamp} aria-hidden="true" />
      </button>
    </div>
  );
}
