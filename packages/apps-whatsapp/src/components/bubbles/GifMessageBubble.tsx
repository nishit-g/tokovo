import React, { memo } from "react";
import { Img, staticFile } from "remotion";
import { MediaBubbleBase, TimestampOverlay } from "./shared.js";
import { useTheme } from "../../theme/ThemeContext.js";

export interface GifMessageBubbleProps {
  gifUrl: string;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  platform?: string;
}

export const GifMessageBubble = memo(function GifMessageBubble({
  gifUrl,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
}: GifMessageBubbleProps) {
  const theme = useTheme();
  const resolvedGifUrl = gifUrl.startsWith("/") ? staticFile(gifUrl) : gifUrl;

  return (
    <MediaBubbleBase
      isMe={isMe}
      senderName={senderName}
      timestamp={timestamp}
      read={read}
      overlayTimestamp
      noPadding
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        <Img
          src={resolvedGifUrl}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: 200,
            objectFit: "cover",
            display: "block",
            borderRadius: 8,
          }}
          alt=""
        />

        <div
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "1px 4px",
            borderRadius: 3,
          }}
        >
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: "#FFFFFF",
              fontFamily: theme.typography.fontFamily,
              letterSpacing: 0.3,
            }}
          >
            GIF
          </span>
        </div>

        <TimestampOverlay timestamp={timestamp} isMe={isMe} read={read} />
      </div>
    </MediaBubbleBase>
  );
});
