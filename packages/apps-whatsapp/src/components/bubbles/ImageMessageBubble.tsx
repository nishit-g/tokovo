import React, { memo } from "react";
import { Img, staticFile } from "remotion";
import { Platform } from "@tokovo/core";
import { MediaBubbleBase, TimestampRow, TimestampOverlay } from "./shared";
import {
  FONT_FAMILY,
  BUBBLE_PADDING,
  BUBBLE_PADDING_H,
  MESSAGE_TEXT_SIZE,
} from "./constants";

export interface ImageMessageBubbleProps {
  imageUrl: string;
  caption?: string;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  platform?: Platform;
}

export const ImageMessageBubble = memo(function ImageMessageBubble({
  imageUrl,
  caption,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
}: ImageMessageBubbleProps) {
  const resolvedImageUrl = imageUrl.startsWith("/")
    ? staticFile(imageUrl)
    : imageUrl;
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
        <Img
          src={resolvedImageUrl}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: 200,
            objectFit: "cover",
            display: "block",
          }}
          alt=""
        />
        {!caption && (
          <TimestampOverlay timestamp={timestamp} isMe={isMe} read={read} />
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
