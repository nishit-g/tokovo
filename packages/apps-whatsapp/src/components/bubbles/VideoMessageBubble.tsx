import React, { memo } from "react";
import { Platform } from "@tokovo/core";
import {
  MediaBubbleBase,
  TimestampRow,
  TimestampOverlay,
  formatDuration,
} from "./shared";
import {
  FONT_FAMILY,
  WA_GREEN,
  BUBBLE_PADDING,
  BUBBLE_PADDING_H,
  TIMESTAMP_SIZE,
  MESSAGE_TEXT_SIZE,
} from "./constants";

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
  platform?: Platform;
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
}: VideoMessageBubbleProps) {
  return (
    <MediaBubbleBase
      isMe={isMe}
      senderName={senderName}
      timestamp={timestamp}
      read={read}
      overlayTimestamp={!caption}
      noPadding
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img
          src={thumbnailUrl}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: 200,
            objectFit: "cover",
            display: "block",
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
              width: 40,
              height: 40,
              backgroundColor: "rgba(0,0,0,0.6)",
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
              fontSize: TIMESTAMP_SIZE,
              color: "#FFFFFF",
              fontFamily: FONT_FAMILY,
            }}
          >
            {formatDuration(duration)}
          </span>
        </div>

        {!caption && (
          <TimestampOverlay timestamp={timestamp} isMe={isMe} read={read} />
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
                backgroundColor: WA_GREEN,
              }}
            />
          </div>
        )}
      </div>

      {caption && (
        <div style={{ padding: `${BUBBLE_PADDING}px ${BUBBLE_PADDING_H}px` }}>
          <span
            style={{
              fontSize: MESSAGE_TEXT_SIZE,
              lineHeight: 1.3,
              color: "#000000",
              fontFamily: FONT_FAMILY,
            }}
          >
            {caption}
          </span>
          <TimestampRow timestamp={timestamp} isMe={isMe} read={read} />
        </div>
      )}
    </MediaBubbleBase>
  );
});
