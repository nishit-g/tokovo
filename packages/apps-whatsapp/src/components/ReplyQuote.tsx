import React from "react";
import { DeterministicImage } from "@tokovo/react";
import { Camera, FileText, Mic, Video } from "lucide-react";
import type { ProjectedReply } from "../thread/projector.js";
import {
  useTheme,
  useWhatsAppLocale,
} from "../experience/ExperienceContext.js";

interface ReplyQuoteProps {
  replyTo: ProjectedReply;
  isMyMessage?: boolean;
}

export const ReplyQuote: React.FC<ReplyQuoteProps> = ({
  replyTo,
  isMyMessage = false,
}) => {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  const barColor =
    replyTo.from === "me" ? theme.colors.link : theme.colors.accent;
  const surface = isMyMessage
    ? theme.colors.replySurfaceSent
    : theme.colors.replySurfaceReceived;
  const secondaryText = isMyMessage
    ? `color-mix(in srgb, ${theme.colors.sentBubbleText} 70%, transparent)`
    : theme.colors.timestamp;

  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        backgroundColor: surface,
        borderRadius: Math.max(6, theme.spacing.bubbleRadius - 12),
        overflow: "hidden",
        marginBottom: 4,
      }}
    >
      <div
        style={{
          width: 4,
          backgroundColor: barColor,
          flexShrink: 0,
        }}
      />

      <div
        style={{
          flex: 1,
          padding: "5px 6px",
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              lineHeight: "15px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: 600,
              color: barColor,
              fontFamily: theme.typography.fontFamily,
              marginBottom: 2,
            }}
          >
            {replyTo.resolution === "missing"
              ? t("message.original")
              : replyTo.from === "me"
                ? t("chat.you")
                : (replyTo.from ?? t("composer.placeholder"))}
          </div>

          <div
            style={{
              fontSize: 13,
              lineHeight: "17px",
              color: secondaryText,
              fontFamily: theme.typography.fontFamily,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            {replyTo.type === "image" && (
              <>
                <Camera size={12} color={secondaryText} />
                <span>{t("message.photo")}</span>
              </>
            )}
            {replyTo.type === "video" && (
              <>
                <Video size={12} color={secondaryText} />
                <span>{t("message.video")}</span>
              </>
            )}
            {replyTo.type === "voice" && (
              <>
                <Mic size={12} color={secondaryText} />
                <span>{t("message.voice")}</span>
              </>
            )}
            {replyTo.resolution === "missing" && (
              <>
                <FileText size={12} color={secondaryText} />
                <span>{t("message.unavailable")}</span>
              </>
            )}
            {(!replyTo.type || replyTo.type === "text") && (
              replyTo.resolution !== "missing" && <span>{replyTo.text}</span>
            )}
          </div>
        </div>

        {replyTo.thumbnailUrl && (
          <div
            style={{
              position: "relative",
              width: 40,
              height: 40,
              borderRadius: 4,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <DeterministicImage
              src={replyTo.thumbnailUrl}
              alt={t("message.photo")}
              pauseWhenLoading
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplyQuote;
