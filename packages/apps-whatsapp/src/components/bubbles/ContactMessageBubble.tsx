import React, { memo } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { MediaBubbleBase, DoubleCheckIcon } from "./shared.js";
import { useTheme } from "../../theme/ThemeContext.js";
import { resolveDeliveryStage } from "../../utils/status.js";

export interface ContactMessageBubbleProps {
  contactName: string;
  contactPhone?: string;
  contactAvatarUrl?: string;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  messageAt?: number;
  deliveredAt?: number;
  readAt?: number;
  status?: "sending" | "sent" | "delivered" | "read";
  starred?: boolean;
  platform?: string;
}

export const ContactMessageBubble = memo(function ContactMessageBubble({
  contactName,
  contactPhone,
  contactAvatarUrl,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
  messageAt,
  deliveredAt,
  readAt,
  status,
  starred = false,
}: ContactMessageBubbleProps) {
  const theme = useTheme();
  const currentFrame = useCurrentFrame();
  const paddingH = theme.spacing.messagePaddingHorizontal - 4;
  const deliveryStage =
    isMe
      ? resolveDeliveryStage(
        {
          from: "me",
          at: messageAt,
          deliveredAt,
          readAt,
          status,
        },
        currentFrame,
      )
      : undefined;

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
      overlayTimestamp
      noPadding
      minWidth={200}
      maxWidth={280}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: paddingH,
        }}
      >
        {contactAvatarUrl ? (
          <Img
            src={
              contactAvatarUrl.startsWith("/")
                ? staticFile(contactAvatarUrl)
                : contactAvatarUrl
            }
            alt=""
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: theme.colors.divider,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={theme.colors.timestamp}
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: theme.typography.messageFontSize,
              fontWeight: 500,
              color: isMe
                ? theme.colors.sentBubbleText
                : theme.colors.receivedBubbleText,
              fontFamily: theme.typography.fontFamily,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {contactName}
          </div>
          {contactPhone && (
            <div
              style={{
                fontSize: 13,
                color: theme.colors.timestamp,
                fontFamily: theme.typography.fontFamily,
                marginTop: 2,
              }}
            >
              {contactPhone}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          borderTop: `1px solid rgba(0,0,0,0.06)`,
          padding: `${theme.spacing.messagePaddingVertical - 2}px ${paddingH}px`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: theme.colors.accent,
            fontWeight: 500,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          Message
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
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
      </div>
    </MediaBubbleBase>
  );
});
