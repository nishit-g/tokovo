import React, { memo } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { DoubleCheckIcon } from "./shared.js";
import { useTheme } from "../../theme/ThemeContext.js";
import { resolveDeliveryStage } from "../../utils/status.js";

export interface StickerMessageBubbleProps {
  stickerUrl: string;
  isMe: boolean;
  timestamp?: string;
  read?: boolean;
  messageAt?: number;
  deliveredAt?: number;
  readAt?: number;
  status?: "sending" | "sent" | "delivered" | "read";
}

export const StickerMessageBubble = memo(function StickerMessageBubble({
  stickerUrl,
  isMe,
  timestamp = "10:42",
  read = false,
  messageAt,
  deliveredAt,
  readAt,
  status,
}: StickerMessageBubbleProps) {
  const theme = useTheme();
  const currentFrame = useCurrentFrame();
  const resolvedStickerUrl = stickerUrl.startsWith("/")
    ? staticFile(stickerUrl)
    : stickerUrl;
  const deliveryStage =
    isMe
      ? resolveDeliveryStage(
        {
          from: "me",
          at: messageAt,
          deliveredAt,
          readAt,
          status,
        },
        currentFrame,
      )
      : undefined;

  return (
    <div style={{ position: "relative", width: 136, height: 136 }}>
      <Img
        src={resolvedStickerUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))",
        }}
        alt="Sticker"
      />
      <div
        style={{
          position: "absolute",
          bottom: 4,
          right: 4,
          display: "flex",
          alignItems: "center",
          gap: 3,
          backgroundColor: "rgba(0,0,0,0.3)",
          padding: "2px 4px",
          borderRadius: 4,
        }}
      >
        <span
          style={{
            fontSize: theme.typography.timestampFontSize,
            color: "#FFFFFF",
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {timestamp}
        </span>
        {isMe && (
          <DoubleCheckIcon
            stage={deliveryStage ?? (read ? "read" : "delivered")}
            light
          />
        )}
      </div>
    </div>
  );
});
