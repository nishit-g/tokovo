import React, { memo } from "react";
import { useTheme } from "../../theme/ThemeContext.js";

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
  const theme = useTheme();
  const paddingH = theme.spacing.messagePaddingHorizontal - 4;

  return (
    <div
      style={{
        backgroundColor: isMe
          ? theme.colors.sentBubble
          : theme.colors.receivedBubble,
        borderRadius: theme.spacing.bubbleRadius,
        borderTopLeftRadius: isMe
          ? theme.spacing.bubbleRadius
          : theme.spacing.bubbleRadiusTail,
        borderTopRightRadius: isMe
          ? theme.spacing.bubbleRadiusTail
          : theme.spacing.bubbleRadius,
        boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
        overflow: "hidden",
        width,
        minWidth,
        maxWidth,
        padding: noPadding ? undefined : paddingH,
      }}
    >
      {senderName && !isMe && (
        <div
          style={{
            padding: noPadding
              ? `${paddingH}px ${paddingH}px 2px`
              : "0 0 2px",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: theme.colors.accent,
              fontFamily: theme.typography.fontFamily,
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
  const theme = useTheme();
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
          fontSize: theme.typography.timestampFontSize,
          color: theme.colors.timestamp,
          fontFamily: theme.typography.fontFamily,
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
  const theme = useTheme();
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
          fontSize: theme.typography.timestampFontSize,
          color: "#FFFFFF",
          fontFamily: theme.typography.fontFamily,
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
  const theme = useTheme();
  const color = read
    ? theme.colors.checkmarkRead
    : light
      ? "#FFFFFF"
      : theme.colors.timestamp;

  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
      <path
        d="M1 5L4 8L10 2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 5L8 8L14 2"
        stroke={color}
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
