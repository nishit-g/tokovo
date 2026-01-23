/**
 * WhatsApp Message Bubble Component
 *
 * Authentic iOS WhatsApp message styling with:
 * - Timestamps and read receipts
 * - Reply/Quote UI for quoted messages
 * - Reactions (tapbacks) display
 */

import React from "react";
import { ChatMessageLayout } from "@tokovo/core";
import { Check, CheckCheck, Clock } from "lucide-react";
import { ReplyQuote, ReplyToData } from "./ReplyQuote";
import { ReactionsBar, Reaction } from "./Reactions";
import { LAYOUT_CONSTANTS } from "../config/layout-config";

// =============================================================================
// TYPES
// =============================================================================

export interface MessageData {
  id: string;
  from: string;
  text?: string;
  timestamp?: string;
  read?: boolean;
  status?: "sent" | "delivered" | "read" | "pending";
  type?: "text" | "image" | "voice" | "system" | "video" | "gif";
  replyTo?: ReplyToData;
  reactions?: Reaction[];
}

export interface MessageBubbleProps {
  msg: MessageData;
  layout: ChatMessageLayout;
}

// =============================================================================
// STATUS ICON HELPER
// =============================================================================

const StatusIcon = ({
  status,
  read,
  isMe,
}: {
  status?: string;
  read?: boolean;
  isMe: boolean;
}) => {
  if (!isMe) return null;

  // Legacy support for 'read' boolean
  const effectiveStatus = status || (read ? "read" : "delivered");

  const iconProps = { size: 16, strokeWidth: 2 };

  switch (effectiveStatus) {
    case "pending":
      return <Clock {...iconProps} color="var(--wa-text-secondary)" />;
    case "sent":
      return <Check {...iconProps} color="var(--wa-text-secondary)" />;
    case "delivered":
      return <CheckCheck {...iconProps} color="var(--wa-text-secondary)" />;
    case "read":
      return <CheckCheck {...iconProps} color="var(--wa-color-primary)" />;
    default:
      return null;
  }
};

// =============================================================================
// MESSAGE BUBBLE
// =============================================================================

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  layout,
}) => {
  const isMe = msg.from === "me";
  const { opacity, translateX, translateY, rect } = layout;

  if (!rect) return null;

  const hasReactions = msg.reactions && msg.reactions.length > 0;

  // Border Radius Logic
  // iOS bubbles have large radius (18px) usually.
  // Tails are handled by reducing ONE corner to a small radius (e.g. 6px) OR using a specialized SVG tail.
  // For CSS-only approach:
  // Me: TopRight is small (6px), rest are large (18px).
  // Other: TopLeft is small (6px), rest are large (18px).
  // Note: In real WhatsApp, the tail is distinct from the corner, but this approximation is standard for web.

  const radiusL = "var(--wa-corner-radius-l)"; // 18px
  const radiusS = "var(--wa-corner-radius-s)"; // 6px

  const borderRadius = isMe
    ? `${radiusL} ${radiusS} ${radiusL} ${radiusL}`
    : `${radiusS} ${radiusL} ${radiusL} ${radiusL}`;

  return (
    <div
      // Anchor ID for Camera System
      data-anchor-id={msg.id}
      style={{
        position: "absolute",
        top: rect.y,
        left: rect.x,
        width: rect.width,
        opacity,
        transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
        zIndex: 1,
      }}
    >
      {/* Main Bubble Container */}
      <div
        className={hasReactions ? "wa-bubble-has-reactions" : ""}
        style={{
          position: "relative",
          backgroundColor: isMe
            ? "var(--wa-bubble-out-bg)"
            : "var(--wa-bubble-in-bg)",
          padding: `${LAYOUT_CONSTANTS.BUBBLE_PADDING_V}px ${LAYOUT_CONSTANTS.BUBBLE_PADDING_H}px`,
          borderRadius: borderRadius,
          boxShadow: "var(--wa-shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: hasReactions ? 24 : 0,
          // If no reactions, we still need to respect layout height, which includes margin if calculated
        }}
      >
        {/* Reply/Quote */}
        {msg.replyTo && <ReplyQuote replyTo={msg.replyTo} isMyMessage={isMe} />}

        {/* Message Text */}
        <span
          style={{
            fontSize: LAYOUT_CONSTANTS.FONT_SIZE,
            lineHeight: `${LAYOUT_CONSTANTS.LINE_HEIGHT}px`,
            color: "var(--wa-text-primary)",
            fontFamily:
              "var(--wa-font-family, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif)",
            wordWrap: "break-word",
            whiteSpace: "pre-wrap", // Preserve formatting
          }}
        >
          {msg.text}
        </span>

        {/* Footer: Time + Status */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 6,
            marginTop: 4, // Slight separation from text
            height: LAYOUT_CONSTANTS.TIMESTAMP_HEIGHT - 10, // Adjust for visual alignment
          }}
        >
          <span
            style={{
              fontSize: 33, // 11px visual
              color: isMe
                ? "var(--wa-bubble-time)"
                : "var(--wa-text-secondary)",
              fontFamily: "var(--wa-font-family)",
              marginBottom: 1, // Visual tweak
            }}
          >
            {msg.timestamp || "10:42"}
          </span>

          <StatusIcon status={msg.status} read={msg.read} isMe={isMe} />
        </div>
      </div>

      {/* Reactions Bar */}
      {hasReactions && (
        <ReactionsBar reactions={msg.reactions!} isMyMessage={isMe} />
      )}
    </div>
  );
};
