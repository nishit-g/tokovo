import React, { memo } from "react";
import { Img, staticFile } from "remotion";
import { Platform } from "@tokovo/core";
import { MediaBubbleBase, DoubleCheckIcon } from "./shared.js";
import {
  FONT_FAMILY,
  WA_TEAL,
  WA_GRAY,
  WA_BLACK,
  BUBBLE_PADDING,
  BUBBLE_PADDING_H,
  TIMESTAMP_SIZE,
  MESSAGE_TEXT_SIZE,
} from "./constants.js";
import { whatsappColors } from "../theme.js";

export interface ContactMessageBubbleProps {
  contactName: string;
  contactPhone?: string;
  contactAvatarUrl?: string;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  platform?: Platform;
}

export const ContactMessageBubble = memo(function ContactMessageBubble({
  contactName,
  contactPhone,
  contactAvatarUrl,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
}: ContactMessageBubbleProps) {
  return (
    <MediaBubbleBase
      isMe={isMe}
      senderName={senderName}
      timestamp={timestamp}
      read={read}
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
          padding: BUBBLE_PADDING_H,
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
              backgroundColor: whatsappColors.bgSecondary,
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
              fill={whatsappColors.textSecondary}
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: MESSAGE_TEXT_SIZE,
              fontWeight: 500,
              color: WA_BLACK,
              fontFamily: FONT_FAMILY,
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
                color: WA_GRAY,
                fontFamily: FONT_FAMILY,
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
          borderTop: `1px solid ${whatsappColors.separatorLight}`,
          padding: `${BUBBLE_PADDING}px ${BUBBLE_PADDING_H}px`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: WA_TEAL,
            fontWeight: 500,
            fontFamily: FONT_FAMILY,
          }}
        >
          Message
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
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
      </div>
    </MediaBubbleBase>
  );
});
