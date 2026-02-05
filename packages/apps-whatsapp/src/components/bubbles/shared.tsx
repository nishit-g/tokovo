import React, { memo } from "react";
import {
  FONT_FAMILY,
  WA_TEAL,
  WA_READ_BLUE,
  WA_GRAY,
  WA_WHITE,
  BUBBLE_RADIUS,
  BUBBLE_TAIL_RADIUS,
  BUBBLE_PADDING_H,
  TIMESTAMP_SIZE,
  SENDER_NAME_SIZE,
  BUBBLE_MY_COLOR,
  BUBBLE_OTHER_COLOR,
  BUBBLE_SHADOW,
} from "./constants";

export interface MediaBubbleBaseProps {
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  showTimestampOverlay?: boolean;
  overlayTimestamp?: boolean;
  noPadding?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string | number;
  minWidth?: number;
  maxWidth?: number;
}

export const MediaBubbleBase = memo(function MediaBubbleBase({
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
  overlayTimestamp = false,
  noPadding = false,
  children,
  footer,
  width = "100%",
  minWidth,
  maxWidth,
}: MediaBubbleBaseProps) {
  return (
    <div
      style={{
        backgroundColor: isMe ? BUBBLE_MY_COLOR : BUBBLE_OTHER_COLOR,
        borderRadius: BUBBLE_RADIUS,
        borderTopLeftRadius: isMe ? BUBBLE_RADIUS : BUBBLE_TAIL_RADIUS,
        borderTopRightRadius: isMe ? BUBBLE_TAIL_RADIUS : BUBBLE_RADIUS,
        boxShadow: BUBBLE_SHADOW,
        overflow: "hidden",
        width,
        minWidth,
        maxWidth,
        padding: noPadding ? undefined : BUBBLE_PADDING_H,
      }}
    >
      {senderName && !isMe && (
        <div
          style={{
            padding: noPadding
              ? `${BUBBLE_PADDING_H}px ${BUBBLE_PADDING_H}px 2px`
              : "0 0 2px",
          }}
        >
          <span
            style={{
              fontSize: SENDER_NAME_SIZE,
              fontWeight: 600,
              color: WA_TEAL,
              fontFamily: FONT_FAMILY,
            }}
          >
            {senderName}
          </span>
        </div>
      )}

      {children}

      {!overlayTimestamp && (
        <TimestampRow timestamp={timestamp} isMe={isMe} read={read} />
      )}

      {footer}
    </div>
  );
});

export const TimestampRow = memo(function TimestampRow({
  timestamp,
  isMe,
  read,
}: {
  timestamp: string;
  isMe: boolean;
  read: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 3,
        marginTop: 2,
      }}
    >
      <span
        style={{
          fontSize: TIMESTAMP_SIZE,
          color: WA_GRAY,
          fontFamily: FONT_FAMILY,
        }}
      >
        {timestamp}
      </span>
      {isMe && <DoubleCheckIcon read={read} />}
    </div>
  );
});

export const TimestampOverlay = memo(function TimestampOverlay({
  timestamp,
  isMe,
  read,
}: {
  timestamp: string;
  isMe: boolean;
  read: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 4,
        right: 4,
        display: "flex",
        alignItems: "center",
        gap: 3,
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: "2px 4px",
        borderRadius: 4,
      }}
    >
      <span
        style={{
          fontSize: TIMESTAMP_SIZE,
          color: WA_WHITE,
          fontFamily: FONT_FAMILY,
        }}
      >
        {timestamp}
      </span>
      {isMe && <DoubleCheckIcon read={read} light />}
    </div>
  );
});

export const DoubleCheckIcon = memo(function DoubleCheckIcon({
  read = false,
  light = false,
}: {
  read?: boolean;
  light?: boolean;
}) {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
      <path
        d="M1 5L4 8L10 2"
        stroke={read ? WA_READ_BLUE : light ? WA_WHITE : WA_GRAY}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 5L8 8L14 2"
        stroke={read ? WA_READ_BLUE : light ? WA_WHITE : WA_GRAY}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

export const formatDuration = (secs: number) => {
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  return `${mins}:${String(s).padStart(2, "0")}`;
};
