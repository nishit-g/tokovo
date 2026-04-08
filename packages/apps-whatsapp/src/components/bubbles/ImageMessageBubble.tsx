import React, { memo } from "react";
import { Img, staticFile } from "remotion";
import { MediaBubbleBase, TimestampOverlay } from "./shared.js";
import { useTheme } from "../../theme/ThemeContext.js";

export interface ImageMessageBubbleProps {
  imageUrl: string;
  caption?: string;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  platform?: string;
}

export const ImageMessageBubble = memo(function ImageMessageBubble({
  imageUrl,
  caption,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
}: ImageMessageBubbleProps) {
  const theme = useTheme();
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
      overlayTimestamp
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: caption ? undefined : theme.spacing.bubbleRadius,
        }}
      >
        <Img
          src={resolvedImageUrl}
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

        {!caption && (
          <TimestampOverlay timestamp={timestamp} isMe={isMe} read={read} />
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
        </div>
      )}
    </MediaBubbleBase>
  );
});
