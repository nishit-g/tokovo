import React from "react";
import { Camera, Mic, Video } from "lucide-react";
import type { WhatsAppMessageType } from "../types/index.js";
import { useTheme } from "../theme/ThemeContext.js";

export interface ReplyToData {
  messageId?: string;
  text?: string;
  from?: string;
  type?: WhatsAppMessageType;
  thumbnailUrl?: string;
}

interface ReplyQuoteProps {
  replyTo: ReplyToData;
  isMyMessage?: boolean;
  onClick?: () => void;
}

export const ReplyQuote: React.FC<ReplyQuoteProps> = ({
  replyTo,
  isMyMessage = false,
  onClick,
}) => {
  const theme = useTheme();
  const barColor =
    replyTo.from === "me" ? theme.colors.link : theme.colors.accent;
  const surface = isMyMessage
    ? "rgba(255,255,255,0.28)"
    : "rgba(0,0,0,0.04)";
  const secondaryText = isMyMessage
    ? `${theme.colors.sentBubbleText}B3`
    : theme.colors.timestamp;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        gap: 0,
        backgroundColor: surface,
        borderRadius: Math.max(6, theme.spacing.bubbleRadius - 12),
        overflow: "hidden",
        marginBottom: 4,
        cursor: onClick ? "pointer" : "default",
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
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: barColor,
              fontFamily: theme.typography.fontFamily,
              marginBottom: 2,
            }}
          >
            {replyTo.from === "me" ? "You" : replyTo.from}
          </div>

          <div
            style={{
              fontSize: 13,
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
                <span>Photo</span>
              </>
            )}
            {replyTo.type === "video" && (
              <>
                <Video size={12} color={secondaryText} />
                <span>Video</span>
              </>
            )}
            {replyTo.type === "voice" && (
              <>
                <Mic size={12} color={secondaryText} />
                <span>Voice message</span>
              </>
            )}
            {(!replyTo.type || replyTo.type === "text") && (
              <span>{replyTo.text}</span>
            )}
          </div>
        </div>

        {replyTo.thumbnailUrl && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 4,
              backgroundImage: `url(${replyTo.thumbnailUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              flexShrink: 0,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ReplyQuote;
