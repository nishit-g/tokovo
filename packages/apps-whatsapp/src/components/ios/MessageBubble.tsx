import React, { memo } from "react";
import { Check, CheckCheck } from "lucide-react";
import { MessageContent } from "./MessageContent";
import { MessageData } from "../../types";
import { UIThemeTokens } from "../../ui/ui-strategy";

const DEFAULT_BUBBLE_COLORS = {
  bubbleMyBg: "#DCF8C6",
  bubbleMyText: "#000000",
  bubbleOtherBg: "#FFFFFF",
  bubbleOtherText: "#000000",
  timestampColor: "#667781",
  accentColor: "#007AFF",
  backgroundColor: "#ECE5DD",
  secondaryColor: "#8E8E93",
};

interface MessageBubbleProps {
  message: MessageData;
  isMe: boolean;
  isFirst: boolean;
  isLast: boolean;
  isGroupChat?: boolean;
  senderName?: string;
  senderColor?: string;
  showSenderName?: boolean;
  tokens?: UIThemeTokens;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isMe,
  isFirst,
  isLast,
  isGroupChat = false,
  senderName,
  senderColor,
  showSenderName = false,
  tokens,
}: MessageBubbleProps) {
  const bubbleMyBg = tokens?.bubbleMyBg || DEFAULT_BUBBLE_COLORS.bubbleMyBg;
  const bubbleMyText =
    tokens?.bubbleMyText || DEFAULT_BUBBLE_COLORS.bubbleMyText;
  const bubbleOtherBg =
    tokens?.bubbleOtherBg || DEFAULT_BUBBLE_COLORS.bubbleOtherBg;
  const bubbleOtherText =
    tokens?.bubbleOtherText || DEFAULT_BUBBLE_COLORS.bubbleOtherText;
  const timestampColor =
    tokens?.timestampColor || DEFAULT_BUBBLE_COLORS.timestampColor;
  const accentColor = tokens?.accentColor || DEFAULT_BUBBLE_COLORS.accentColor;
  const backgroundColor =
    tokens?.backgroundColor || DEFAULT_BUBBLE_COLORS.backgroundColor;
  const secondaryColor =
    tokens?.secondaryColor || DEFAULT_BUBBLE_COLORS.secondaryColor;

  const isSystem = message.type === "system";
  const isSticker = message.type === "sticker";
  const isSelfContainedMedia = [
    "voice",
    "image",
    "video",
    "document",
    "contact",
    "location",
    "gif",
  ].includes(message.type);

  const shouldShowSender = showSenderName && isGroupChat && !isMe && senderName;

  if (isSystem) {
    // System messages render outside the bubble flow directly
    return <MessageContent message={message} />;
  }

  if (isSticker || isSelfContainedMedia) {
    return (
      <div
        data-anchor="message"
        data-message-id={message.id}
        style={{
          alignSelf: isMe ? "flex-end" : "flex-start",
          maxWidth: "75%",
          marginBottom: 2,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {shouldShowSender && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: senderColor || "#00A884",
              marginBottom: 2,
              marginLeft: 4,
              display: "block",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            }}
          >
            {senderName}
          </span>
        )}

        {message.isForwarded && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              marginBottom: 2,
              marginLeft: 4,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8e8e93"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 17 20 12 15 7" />
              <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
            </svg>
            <span
              style={{ fontSize: 11, fontStyle: "italic", color: "#8e8e93" }}
            >
              Forwarded
            </span>
          </div>
        )}

        <MessageContent
          message={message}
          isMe={isMe}
          timestamp={message.timestamp}
          read={message.status === "read"}
        />

        {message.reactions && message.reactions.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: -8,
              right: isMe ? 8 : undefined,
              left: isMe ? undefined : 8,
              display: "flex",
              gap: 2,
              zIndex: 1,
            }}
          >
            {message.reactions.map((reaction, idx) => (
              <span
                key={`${reaction.emoji}_${idx}`}
                style={{
                  background: backgroundColor,
                  borderRadius: 10,
                  padding: "2px 6px",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              >
                {reaction.emoji}
                {reaction.count > 1 && (
                  <span style={{ fontSize: 10, color: secondaryColor }}>
                    {reaction.count}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Only show tail for the FIRST message in a group (Visual Run)
  const showTail = isFirst;

  // Corner Radius Logic (Visual Run)
  // Top-Left: Sharp if Receiver & First
  // Top-Right: Sharp if Sender & First
  const borderTopLeft = !isMe && isFirst ? 0 : 16;
  const borderTopRight = isMe && isFirst ? 0 : 16;

  // Bottoms are rounded unless it's a middle/first message in a run, then we might want smaller radius?
  // standard WhatsApp iOS:
  // First: Rounded except corner
  // Middle: Rounded
  // Last: Rounded
  // Actually, usually in rapid succession they look 'stacked'.
  // For now keeping simple logic: 16px everywhere else.

  // ANCHOR DATA
  // We attach data-anchor="message" and data-message-id={id}
  // so the camera system can find this element.

  return (
    <div
      data-anchor="message"
      data-message-id={message.id}
      style={{
        alignSelf: isMe ? "flex-end" : "flex-start",
        maxWidth: "75%", // Standard width constraint
        position: "relative",
        // Visual Run Spacing:
        // If isLast (of group), we rely on parent margin.
        // Inside group, we use small margin.
        marginBottom: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          backgroundColor: isMe ? bubbleMyBg : bubbleOtherBg,
          borderRadius: 16,
          borderTopLeftRadius: borderTopLeft,
          borderTopRightRadius: borderTopRight,
          padding: "6px 7px 8px 9px",
          boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          minWidth: 80,
        }}
      >
        {/* Sender Name (Group Chats Only) */}
        {shouldShowSender && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: senderColor || "#00A884", // Fallback color
              marginBottom: 2,
              display: "block",
            }}
          >
            {senderName}
          </span>
        )}

        {/* Forwarded Label */}
        {message.isForwarded && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              marginBottom: 2,
              marginLeft: -1,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8e8e93"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: "block" }}
            >
              <polyline points="15 17 20 12 15 7" />
              <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
            </svg>
            <span
              style={{
                fontSize: 11,
                fontStyle: "italic",
                color: "#8e8e93",
              }}
            >
              Forwarded
            </span>
          </div>
        )}

        {/* Reply-To Preview */}
        {message.replyTo && (
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.06)",
              borderLeft: `3px solid ${accentColor}`,
              borderRadius: 4,
              padding: "4px 8px",
              marginBottom: 4,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                color: accentColor,
                fontWeight: 500,
                marginBottom: 2,
              }}
            >
              {message.replyTo.from || "You"}
            </div>
            <div
              style={{
                color: isMe ? bubbleMyText : bubbleOtherText,
                opacity: 0.7,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 200,
              }}
            >
              {message.replyTo.text || "📷 Photo"}
            </div>
          </div>
        )}

        <div style={{ color: isMe ? bubbleMyText : bubbleOtherText }}>
          <MessageContent message={message} tokens={tokens} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 4,
            marginTop: 2,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: timestampColor,
            }}
          >
            {message.timestamp || "10:00"}
          </span>
          {isMe &&
            (message.status === "read" ? (
              <CheckCheck size={14} color={accentColor} />
            ) : (
              <Check size={14} color={timestampColor} />
            ))}
        </div>
      </div>

      {/* Reactions - Floating pill at bottom-right like WhatsApp */}
      {message.reactions && message.reactions.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: -8,
            right: isMe ? 8 : undefined,
            left: isMe ? undefined : 8,
            display: "flex",
            gap: 2,
            zIndex: 1,
          }}
        >
          {message.reactions.map((reaction, idx) => (
            <span
              key={`${reaction.emoji}_${idx}`}
              style={{
                background: backgroundColor,
                borderRadius: 10,
                padding: "2px 6px",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 2,
                boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              {reaction.emoji}
              {reaction.count > 1 && (
                <span style={{ fontSize: 10, color: secondaryColor }}>
                  {reaction.count}
                </span>
              )}
            </span>
          ))}
        </div>
      )}

      {showTail && (
        <svg
          width="12"
          height="20"
          viewBox="0 0 12 20"
          style={{
            position: "absolute",
            [isMe ? "right" : "left"]: -6,
            top: 0,
            fill: isMe ? bubbleMyBg : bubbleOtherBg,
            transform: isMe ? "scaleX(1)" : "scaleX(-1)",
            zIndex: -1,
          }}
        >
          <path d="M0 0 C0 0 5 0 8 5 C11 10 9 15 9 15 L0 15 Z" />
        </svg>
      )}
    </div>
  );
});
