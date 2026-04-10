import React, { memo } from "react";
import { Img, staticFile } from "remotion";
import { resolveStaticAssetSrc } from "@tokovo/core";
import { MediaBubbleBase, TimestampRow, TimestampOverlay } from "./shared.js";
import { useTheme } from "../../theme/ThemeContext.js";
import type { DeliveryStage } from "../../utils/status.js";

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
  messageAt?: number;
  deliveredAt?: number;
  readAt?: number;
  status?: "sending" | "sent" | "delivered" | "read";
  starred?: boolean;
  deliveryStage?: DeliveryStage;
}

/** Draws a stylized static map grid when no thumbnail is provided. */
const StaticMapPlaceholder: React.FC<{ accent: string }> = ({ accent }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      backgroundColor: "#E8EDE8",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Grid lines to mimic streets */}
    <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
      <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#D4DDD4" strokeWidth="3" />
      <line x1="0" y1="55%" x2="100%" y2="55%" stroke="#D4DDD4" strokeWidth="2" />
      <line x1="0" y1="80%" x2="65%" y2="80%" stroke="#D4DDD4" strokeWidth="2" />
      <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#D4DDD4" strokeWidth="2" />
      <line x1="60%" y1="0" x2="60%" y2="70%" stroke="#D4DDD4" strokeWidth="3" />
      <line x1="80%" y1="35%" x2="80%" y2="100%" stroke="#D4DDD4" strokeWidth="2" />
      {/* Park area */}
      <rect x="62%" y="5%" width="16%" height="24%" rx="4" fill="#C8DCC8" opacity="0.7" />
      {/* Water area */}
      <path d="M82%,70% Q88%,60% 95%,65% L100%,65% L100%,100% L82%,100% Z" fill="#C8DAE8" opacity="0.5" />
    </svg>

    {/* Center pin */}
    <div
      style={{
        position: "absolute",
        top: "42%",
        left: "50%",
        transform: "translate(-50%, -100%)",
      }}
    >
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        {/* Pin shadow */}
        <ellipse cx="14" cy="34" rx="6" ry="2" fill="rgba(0,0,0,0.15)" />
        {/* Pin body */}
        <path
          d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z"
          fill={accent}
        />
        {/* Pin inner circle */}
        <circle cx="14" cy="13" r="5" fill="#FFFFFF" />
      </svg>
    </div>
  </div>
);

export const LocationMessageBubble = memo(function LocationMessageBubble({
  locationName,
  locationAddress,
  mapThumbnailUrl,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
  messageAt,
  deliveredAt,
  readAt,
  status,
  starred = false,
  deliveryStage,
}: LocationMessageBubbleProps) {
  const theme = useTheme();
  const resolvedMapThumbnailUrl = mapThumbnailUrl
    ? resolveStaticAssetSrc(mapThumbnailUrl, staticFile)
    : mapThumbnailUrl;
  const paddingH = theme.spacing.messagePaddingHorizontal - 4;
  const hasCaption = !!(locationName || locationAddress);

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
      noPadding
      overlayTimestamp={!hasCaption}
      minWidth={240}
      maxWidth={300}
    >
      <div
        style={{
          width: "100%",
          height: 150,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {resolvedMapThumbnailUrl ? (
          <>
            <Img
              src={resolvedMapThumbnailUrl}
              alt="Map"
              pauseWhenLoading
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            {/* Pin on top of real map */}
            <div
              style={{
                position: "absolute",
                top: "38%",
                left: "50%",
                transform: "translate(-50%, -100%)",
              }}
            >
              <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
                <ellipse cx="14" cy="34" rx="6" ry="2" fill="rgba(0,0,0,0.2)" />
                <path
                  d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z"
                  fill="#FF3B30"
                />
                <circle cx="14" cy="13" r="5" fill="#FFFFFF" />
              </svg>
            </div>
          </>
        ) : (
          <StaticMapPlaceholder accent={theme.colors.accent} />
        )}

        {!hasCaption && (
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
      </div>

      {hasCaption && (
        <div style={{ padding: paddingH }}>
          {locationName && (
            <div
              style={{
                fontSize: theme.typography.messageFontSize,
                fontWeight: 500,
                color: isMe
                  ? theme.colors.sentBubbleText
                  : theme.colors.receivedBubbleText,
                fontFamily: theme.typography.fontFamily,
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
                color: theme.colors.timestamp,
                fontFamily: theme.typography.fontFamily,
                marginBottom: 4,
              }}
            >
              {locationAddress}
            </div>
          )}
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
