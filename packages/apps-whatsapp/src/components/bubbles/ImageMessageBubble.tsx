import React, { memo } from "react";
import { Img, staticFile } from "remotion";
import { Platform } from "@tokovo/core";
import { MediaBubbleBase } from "./shared";
import {
  FONT_FAMILY,
  BUBBLE_PADDING,
  BUBBLE_PADDING_H,
  MESSAGE_TEXT_SIZE,
  WA_BLACK,
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
      </div>

      {caption && (
        <div style={{ padding: `${BUBBLE_PADDING}px ${BUBBLE_PADDING_H}px` }}>
          <span
            style={{
              fontSize: MESSAGE_TEXT_SIZE,
              lineHeight: 1.3,
              color: WA_BLACK,
              fontFamily: FONT_FAMILY,
            }}
          >
            {caption}
          </span>
        </div>
      )}
    </MediaBubbleBase>
  );
});
