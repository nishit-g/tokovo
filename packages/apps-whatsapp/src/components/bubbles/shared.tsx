import React, { memo } from "react";
import { useCurrentFrame } from "remotion";
import { useTheme } from "../../theme/ThemeContext.js";
import { type DeliveryStage, resolveDeliveryStage } from "../../utils/status.js";

export interface MediaBubbleBaseProps {
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  messageAt?: number;
  deliveredAt?: number;
  readAt?: number;
  status?: "sending" | "sent" | "delivered" | "read";
  starred?: boolean;
  showTimestampOverlay?: boolean;
  overlayTimestamp?: boolean;
  noPadding?: boolean;
  deliveryStage?: DeliveryStage;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string | number;
  minWidth?: number;
  maxWidth?: number;
}

interface MediaBubbleBaseInnerProps extends MediaBubbleBaseProps {
  resolvedDeliveryStage?: DeliveryStage;
}

const MediaBubbleBaseInner = memo(function MediaBubbleBaseInner({
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
  starred = false,
  overlayTimestamp = false,
  noPadding = false,
  children,
  footer,
  width = "100%",
  minWidth,
  maxWidth,
  resolvedDeliveryStage,
}: MediaBubbleBaseInnerProps) {
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
        <TimestampRow
          timestamp={timestamp}
          isMe={isMe}
          read={read}
          starred={starred}
          deliveryStage={resolvedDeliveryStage}
        />
      )}

      {footer}
    </div>
  );
});

const MediaBubbleBaseDynamic = memo(function MediaBubbleBaseDynamic(
  props: MediaBubbleBaseProps,
) {
  const currentFrame = useCurrentFrame();
  const resolvedDeliveryStage =
    props.deliveryStage ??
    resolveDeliveryStage(
      {
        from: "me",
        at: props.messageAt,
        deliveredAt: props.deliveredAt,
        readAt: props.readAt,
        status: props.status,
      },
      currentFrame,
    );

  return (
    <MediaBubbleBaseInner
      {...props}
      resolvedDeliveryStage={resolvedDeliveryStage}
    />
  );
});

export const MediaBubbleBase = memo(function MediaBubbleBase(
  props: MediaBubbleBaseProps,
) {
  if (props.deliveryStage !== undefined || props.overlayTimestamp || !props.isMe) {
    return (
      <MediaBubbleBaseInner
        {...props}
        resolvedDeliveryStage={props.deliveryStage}
      />
    );
  }

  return <MediaBubbleBaseDynamic {...props} />;
});

const TimestampRowStatic = memo(function TimestampRowStatic({
  timestamp,
  isMe,
  read,
  starred = false,
  deliveryStage,
}: {
  timestamp: string;
  isMe: boolean;
  read: boolean;
  starred?: boolean;
  deliveryStage?: DeliveryStage;
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
      {starred && (
        <span style={{ color: theme.colors.timestamp, fontSize: 10 }}>★</span>
      )}
      {isMe && (
        <DoubleCheckIcon
          stage={deliveryStage ?? (read ? "read" : "delivered")}
        />
      )}
    </div>
  );
});

const TimestampRowDynamic = memo(function TimestampRowDynamic(props: {
  timestamp: string;
  isMe: boolean;
  read: boolean;
  starred?: boolean;
  deliveryStage?: DeliveryStage;
  messageAt?: number;
  deliveredAt?: number;
  readAt?: number;
  status?: "sending" | "sent" | "delivered" | "read";
}) {
  const currentFrame = useCurrentFrame();
  const deliveryStage =
    props.deliveryStage ??
    (props.isMe
      ? resolveDeliveryStage(
        {
          from: "me",
          at: props.messageAt,
          deliveredAt: props.deliveredAt,
          readAt: props.readAt,
          status: props.status,
        },
        currentFrame,
      )
      : undefined);

  return <TimestampRowStatic {...props} deliveryStage={deliveryStage} />;
});

export const TimestampRow = memo(function TimestampRow(props: {
  timestamp: string;
  isMe: boolean;
  read: boolean;
  starred?: boolean;
  deliveryStage?: DeliveryStage;
  messageAt?: number;
  deliveredAt?: number;
  readAt?: number;
  status?: "sending" | "sent" | "delivered" | "read";
}) {
  if (props.deliveryStage !== undefined || !props.isMe) {
    return <TimestampRowStatic {...props} />;
  }

  return <TimestampRowDynamic {...props} />;
});

const TimestampOverlayStatic = memo(function TimestampOverlayStatic({
  timestamp,
  isMe,
  read,
  starred = false,
  deliveryStage,
}: {
  timestamp: string;
  isMe: boolean;
  read: boolean;
  starred?: boolean;
  deliveryStage?: DeliveryStage;
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
      {starred && <span style={{ color: "#FFFFFF", fontSize: 10 }}>★</span>}
      {isMe && (
        <DoubleCheckIcon
          stage={deliveryStage ?? (read ? "read" : "delivered")}
          light
        />
      )}
    </div>
  );
});

const TimestampOverlayDynamic = memo(function TimestampOverlayDynamic(props: {
  timestamp: string;
  isMe: boolean;
  read: boolean;
  starred?: boolean;
  deliveryStage?: DeliveryStage;
  messageAt?: number;
  deliveredAt?: number;
  readAt?: number;
  status?: "sending" | "sent" | "delivered" | "read";
}) {
  const currentFrame = useCurrentFrame();
  const deliveryStage =
    props.deliveryStage ??
    (props.isMe
      ? resolveDeliveryStage(
        {
          from: "me",
          at: props.messageAt,
          deliveredAt: props.deliveredAt,
          readAt: props.readAt,
          status: props.status,
        },
        currentFrame,
      )
      : undefined);

  return <TimestampOverlayStatic {...props} deliveryStage={deliveryStage} />;
});

export const TimestampOverlay = memo(function TimestampOverlay(props: {
  timestamp: string;
  isMe: boolean;
  read: boolean;
  starred?: boolean;
  deliveryStage?: DeliveryStage;
  messageAt?: number;
  deliveredAt?: number;
  readAt?: number;
  status?: "sending" | "sent" | "delivered" | "read";
}) {
  if (props.deliveryStage !== undefined || !props.isMe) {
    return <TimestampOverlayStatic {...props} />;
  }

  return <TimestampOverlayDynamic {...props} />;
});

export const DoubleCheckIcon = memo(function DoubleCheckIcon({
  read = false,
  stage,
  light = false,
}: {
  read?: boolean;
  stage?: "sent" | "delivered" | "read";
  light?: boolean;
}) {
  const theme = useTheme();
  const resolvedStage = stage ?? (read ? "read" : "delivered");
  const color = resolvedStage === "read"
    ? theme.colors.checkmarkRead
    : light
      ? "#FFFFFF"
      : theme.colors.timestamp;

  if (resolvedStage === "sent") {
    return (
      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
        <path
          d="M1 5L4 8L10 2"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

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
