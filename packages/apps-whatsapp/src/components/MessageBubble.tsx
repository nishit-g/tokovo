import { memo } from "react";
import { Check, CheckCheck } from "lucide-react";
import { MessageContent } from "./MessageContent.js";
import { MessageData } from "../types/index.js";
import { useTheme } from "../theme/ThemeContext.js";

export interface MessageBubbleProps {
  message: MessageData;
  isMe: boolean;
  isFirst: boolean;
  isLast: boolean;
  isGroupChat?: boolean;
  senderName?: string;
  senderColor?: string;
  showSenderName?: boolean;
  messageOrder?: number;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isMe,
  isFirst,
  isLast: _isLast,
  isGroupChat = false,
  senderName,
  senderColor,
  showSenderName = false,
  messageOrder,
}: MessageBubbleProps) {
  const theme = useTheme();

  const isSystem = message.type === "system" || message.type === "screenshot_alert";
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
  const reactionOffset = message.reactions && message.reactions.length > 0 ? 18 : 0;

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
        data-order={messageOrder}
        style={{
          alignSelf: isMe ? "flex-end" : "flex-start",
          maxWidth: "75%",
          marginBottom: 2 + reactionOffset,
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
              color: senderColor || theme.colors.accent,
              marginBottom: 2,
              marginLeft: 4,
              display: "block",
              fontFamily: theme.typography.fontFamily,
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
              stroke={theme.colors.timestamp}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 17 20 12 15 7" />
              <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
            </svg>
            <span
              style={{
                fontSize: theme.typography.timestampFontSize,
                fontStyle: "italic",
                color: theme.colors.timestamp,
              }}
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
                  background: theme.colors.background,
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
                  <span style={{ fontSize: 10, color: theme.colors.timestamp }}>
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
  const borderTopLeft = !isMe && isFirst ? 0 : theme.spacing.bubbleRadius;
  const borderTopRight = isMe && isFirst ? 0 : theme.spacing.bubbleRadius;

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
      data-order={messageOrder}
      style={{
        alignSelf: isMe ? "flex-end" : "flex-start",
        maxWidth: "75%",
        position: "relative",
        marginBottom: 2 + reactionOffset,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          backgroundColor: isMe
            ? theme.colors.sentBubble
            : theme.colors.receivedBubble,
          borderRadius: theme.spacing.bubbleRadius,
          borderTopLeftRadius: borderTopLeft,
          borderTopRightRadius: borderTopRight,
          padding: `${theme.spacing.messagePaddingVertical}px ${theme.spacing.messagePaddingHorizontal}px`,
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
              color: senderColor || theme.colors.accent, // Fallback color
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
              stroke={theme.colors.timestamp}
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
                fontSize: theme.typography.timestampFontSize,
                fontStyle: "italic",
                color: theme.colors.timestamp,
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
              borderLeft: `3px solid ${theme.colors.accent}`,
              borderRadius: theme.spacing.bubbleRadiusTail,
              padding: "4px 8px",
              marginBottom: 4,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                color: theme.colors.accent,
                fontWeight: 500,
                marginBottom: 2,
              }}
            >
              {message.replyTo.from || "You"}
            </div>
            <div
              style={{
                color: isMe
                  ? theme.colors.sentBubbleText
                  : theme.colors.receivedBubbleText,
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

        <div
          style={{
            color: isMe
              ? theme.colors.sentBubbleText
              : theme.colors.receivedBubbleText,
          }}
        >
          <MessageContent message={message} />
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
              fontSize: theme.typography.timestampFontSize,
              color: theme.colors.timestamp,
            }}
          >
            {message.timestamp || "10:00"}
          </span>
          {isMe &&
            (message.status === "read" ? (
              <CheckCheck size={14} color={theme.colors.checkmarkRead} />
            ) : (
              <Check size={14} color={theme.colors.checkmark} />
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
                background: theme.colors.background,
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
                <span style={{ fontSize: 10, color: theme.colors.timestamp }}>
                  {reaction.count}
                </span>
              )}
            </span>
          ))}
        </div>
      )}

      {showTail && (
        <svg
          width="8"
          height="13"
          viewBox="0 0 8 13"
          style={{
            position: "absolute",
            [isMe ? "right" : "left"]: -7,
            bottom: 0,
            fill: isMe ? theme.colors.sentBubble : theme.colors.receivedBubble,
            transform: isMe ? undefined : "scaleX(-1)",
          }}
        >
          <path d="M5.188 0H0v11.193c.498-.098.984-.236 1.453-.424a14.937 14.937 0 0 0 4.243-2.636c.634-.556 1.228-1.2 1.74-2.01.327-.519.613-1.1.684-1.732C8.298 2.66 6.953.404 5.188 0Z" />
        </svg>
      )}
    </div>
  );
});
