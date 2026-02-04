import React, { memo } from "react";
import { Img, staticFile } from "remotion";
import { DoubleCheckIcon } from "./shared";
import { FONT_FAMILY, TIMESTAMP_SIZE } from "./constants";

export interface StickerMessageBubbleProps {
  stickerUrl: string;
  isMe: boolean;
  timestamp?: string;
  read?: boolean;
}

export const StickerMessageBubble = memo(function StickerMessageBubble({
  stickerUrl,
  isMe,
  timestamp = "10:42",
  read = false,
}: StickerMessageBubbleProps) {
  const resolvedStickerUrl = stickerUrl.startsWith("/")
    ? staticFile(stickerUrl)
    : stickerUrl;
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
            fontSize: TIMESTAMP_SIZE,
            color: "#FFFFFF",
            fontFamily: FONT_FAMILY,
          }}
        >
          {timestamp}
        </span>
        {isMe && <DoubleCheckIcon read={read} light />}
      </div>
    </div>
  );
});
