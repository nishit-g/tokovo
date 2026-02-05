import React, { memo } from "react";
import { Img, staticFile } from "remotion";
import { MediaBubbleBase, TimestampRow } from "./shared";
import {
  FONT_FAMILY,
  WA_TEAL,
  WA_GRAY,
  WA_BLACK,
  BUBBLE_PADDING_H,
  MESSAGE_TEXT_SIZE,
} from "./constants";
import { whatsappColors } from "../theme";

export interface LocationMessageBubbleProps {
  latitude: number;
  longitude: number;
  locationName?: string;
  locationAddress?: string;
  mapThumbnailUrl?: string;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
}

export const LocationMessageBubble = memo(function LocationMessageBubble({
  locationName,
  locationAddress,
  mapThumbnailUrl,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
}: LocationMessageBubbleProps) {
  const resolvedMapThumbnailUrl =
    mapThumbnailUrl && mapThumbnailUrl.startsWith("/")
      ? staticFile(mapThumbnailUrl)
      : mapThumbnailUrl;
  return (
    <MediaBubbleBase
      isMe={isMe}
      senderName={senderName}
      timestamp={timestamp}
      read={read}
      noPadding
      minWidth={240}
      maxWidth={300}
    >
      <div
        style={{
          width: "100%",
          height: 140,
          backgroundColor: whatsappColors.bgSecondary,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {mapThumbnailUrl ? (
          <Img
            src={resolvedMapThumbnailUrl || ""}
            alt="Map"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: whatsappColors.bgTertiary,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill={WA_TEAL}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -100%)",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill={whatsappColors.iosRed}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
      </div>

      <div style={{ padding: BUBBLE_PADDING_H }}>
        {locationName && (
          <div
            style={{
              fontSize: MESSAGE_TEXT_SIZE,
              fontWeight: 500,
              color: WA_BLACK,
              fontFamily: FONT_FAMILY,
              marginBottom: 2,
            }}
          >
            {locationName}
          </div>
        )}
        {locationAddress && (
          <div
            style={{
              fontSize: 13,
              color: WA_GRAY,
              fontFamily: FONT_FAMILY,
              marginBottom: 4,
            }}
          >
            {locationAddress}
          </div>
        )}
        <TimestampRow timestamp={timestamp} isMe={isMe} read={read} />
      </div>
    </MediaBubbleBase>
  );
});
