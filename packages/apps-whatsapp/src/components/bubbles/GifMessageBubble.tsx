import React, { memo } from "react";
import { Platform } from "@tokovo/core";
import { MediaBubbleBase, TimestampOverlay } from "./shared";
import { FONT_FAMILY } from "./constants";

export interface GifMessageBubbleProps {
  gifUrl: string;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  platform?: Platform;
}

export const GifMessageBubble = memo(function GifMessageBubble({
  gifUrl,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
}: GifMessageBubbleProps) {
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
        <img
          src={gifUrl}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: 170,
            objectFit: "cover",
            display: "block",
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
              fontFamily: FONT_FAMILY,
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
