import React, { memo } from "react";
import { Img, staticFile } from "remotion";
import { resolveStaticAssetSrc } from "@tokovo/core";
import {
  MediaBubbleBase,
  TimestampRow,
  TimestampOverlay,
  formatDuration,
} from "./shared.js";
import { useTheme } from "../../theme/ThemeContext.js";
import type { DeliveryStage } from "../../utils/status.js";

export interface VideoMessageBubbleProps {
  thumbnailUrl: string;
  duration: number;
  caption?: string;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  isPlaying?: boolean;
  playProgress?: number;
  messageAt?: number;
  deliveredAt?: number;
  readAt?: number;
  status?: "sending" | "sent" | "delivered" | "read";
  starred?: boolean;
  platform?: string;
  deliveryStage?: DeliveryStage;
}

export const VideoMessageBubble = memo(function VideoMessageBubble({
  thumbnailUrl,
  duration,
  caption,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
  isPlaying = false,
  playProgress = 0,
  messageAt,
  deliveredAt,
  readAt,
  status,
  starred = false,
  deliveryStage,
}: VideoMessageBubbleProps) {
  const theme = useTheme();
  const resolvedThumbnailUrl = resolveStaticAssetSrc(thumbnailUrl, staticFile);

  return (
    <MediaBubbleBase
      isMe={isMe}
      senderName={senderName}
      timestamp={timestamp}
      read={read}
      messageAt={messageAt}
      deliveredAt={deliveredAt}
      readAt={readAt}
      status={status}
      starred={starred}
      overlayTimestamp={!caption}
      noPadding
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        <Img
          src={resolvedThumbnailUrl}
          pauseWhenLoading
          style={{
            width: "100%",
            height: "auto",
            maxHeight: 240,
            objectFit: "cover",
            display: "block",
            borderRadius: 8,
          }}
          alt=""
        />

        {!isPlaying && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 44,
              height: 44,
              backgroundColor: "rgba(0,0,0,0.55)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: 4,
            left: 4,
            display: "flex",
            alignItems: "center",
            gap: 3,
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "2px 4px",
            borderRadius: 4,
          }}
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.69l-8.14-5.17A.998.998 0 0 0 8 6.82z" />
          </svg>
          <span
            style={{
              fontSize: theme.typography.timestampFontSize,
              color: "#FFFFFF",
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {formatDuration(duration)}
          </span>
        </div>

        {!caption && (
          <TimestampOverlay
            timestamp={timestamp}
            isMe={isMe}
            read={read}
            starred={starred}
            messageAt={messageAt}
            deliveredAt={deliveredAt}
            readAt={readAt}
            status={status}
            deliveryStage={deliveryStage}
          />
        )}

        {isPlaying && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(playProgress / duration) * 100}%`,
                backgroundColor: theme.colors.accent,
              }}
            />
          </div>
        )}
      </div>

      {caption && (
        <div
          style={{
            padding: `${theme.spacing.messagePaddingVertical - 2}px ${theme.spacing.messagePaddingHorizontal}px`,
          }}
        >
          <span
            style={{
              fontSize: theme.typography.messageFontSize,
              lineHeight: 1.3,
              color: isMe
                ? theme.colors.sentBubbleText
                : theme.colors.receivedBubbleText,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {caption}
          </span>
          <TimestampRow
            timestamp={timestamp}
            isMe={isMe}
            read={read}
            starred={starred}
            messageAt={messageAt}
            deliveredAt={deliveredAt}
            readAt={readAt}
            status={status}
            deliveryStage={deliveryStage}
          />
        </div>
      )}
    </MediaBubbleBase>
  );
});
