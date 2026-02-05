import React from "react";
import type { IMessageMessage, IMessageTapbackType } from "../types";
import { iOS_IMESSAGE_LIGHT, LAYOUT_CONSTANTS } from "../config";
import { AudioMessage } from "./AudioMessage";
import { ContactCard } from "./ContactCard";
import { CalendarCard } from "./CalendarCard";
import { LinkPreviewCard } from "./LinkPreviewCard";

interface MessageBubbleProps {
  message: IMessageMessage;
  isSMS?: boolean;
  showTail?: boolean;
  showSenderLabel?: boolean;
  senderLabel?: string;
  showStatus?: boolean;
  replyPreview?: string;
  theme?: typeof iOS_IMESSAGE_LIGHT;
}

const TAPBACK_ICONS: Record<IMessageTapbackType, string> = {
  heart: "❤️",
  thumbsUp: "👍",
  thumbsDown: "👎",
  haha: "😂",
  exclamation: "‼️",
  questionMark: "❓",
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSMS = false,
  showTail = true,
  showSenderLabel = false,
  senderLabel,
  showStatus = false,
  replyPreview,
  theme = iOS_IMESSAGE_LIGHT,
}) => {
  const { fromMe, text, attachments, effect, kind, isSystem } = message;
  const tapbacks = message.tapbacks ?? [];
  const { colors, typography, bubble } = theme;

  if (isSystem) {
    return (
      <div
        style={{
          alignSelf: "center",
          backgroundColor: "rgba(0,0,0,0.06)",
          padding: "6px 12px",
          borderRadius: 24,
          marginBottom: LAYOUT_CONSTANTS.MESSAGE_GAP,
        }}
      >
        <span
          style={{
            fontFamily: typography.systemMessage.family,
            fontSize: typography.systemMessage.size,
            fontWeight: typography.systemMessage.weight,
            color: colors.system.timestamp,
          }}
        >
          {message.systemText || text}
        </span>
      </div>
    );
  }

  const bubbleColor = fromMe
    ? isSMS
      ? colors.bubble.sms
      : colors.bubble.iMessage
    : colors.bubble.received;

  const textColor = fromMe ? colors.bubble.myText : colors.bubble.otherText;

  const effectStyle = getEffectStyle(effect?.bubble);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: fromMe ? "flex-end" : "flex-start",
        position: "relative",
        ...effectStyle,
      }}
    >
      {showSenderLabel && senderLabel ? (
        <div
          style={{
            marginBottom: 2,
            fontFamily: typography.listSubtitle.family,
            fontSize: 12,
            color: colors.system.timestamp,
            marginLeft: fromMe ? 0 : 8,
          }}
        >
          {senderLabel}
        </div>
      ) : null}

      <div
        style={{
          position: "relative",
          maxWidth: `${bubble.maxWidth * 100}%`,
          display: "inline-flex",
          flexDirection: "column",
        }}
      >
        {replyPreview ? (
          <div
            style={{
              borderLeft: `2px solid ${fromMe ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.2)"}`,
              paddingLeft: 8,
              marginBottom: 4,
              fontFamily: typography.timestamp.family,
              fontSize: typography.timestamp.size,
              color: colors.system.timestamp,
            }}
          >
            Replying to: {replyPreview}
          </div>
        ) : null}

        {renderAttachments(attachments, bubble, bubbleColor, fromMe)}

        {(text || kind === "text") && (
          <div
            style={{
              backgroundColor: bubbleColor,
              borderRadius: bubble.borderRadius,
              padding: `${bubble.verticalPadding}px ${bubble.horizontalPadding}px`,
              position: "relative",
              display: "inline-block",
              maxWidth: "100%",
            }}
          >
            {showTail && (
              <BubbleTail
                fromMe={fromMe}
                color={bubbleColor}
                tailWidth={bubble.tailWidth}
                tailHeight={bubble.tailHeight}
              />
            )}
            <span
              style={{
                fontFamily: typography.message.family,
                fontSize: typography.message.size,
                fontWeight: typography.message.weight,
                lineHeight: `${typography.message.lineHeight}px`,
                color: textColor,
                wordBreak: "break-word",
              }}
            >
              {text}
            </span>
          </div>
        )}

        {tapbacks.length > 0 && (
          <TapbackRow tapbacks={tapbacks} fromMe={fromMe} theme={theme} />
        )}
      </div>

      {showStatus && message.status ? (
        <div
          style={{
            marginTop: 2,
            fontFamily: typography.timestamp.family,
            fontSize: typography.timestamp.size,
            color: colors.system.timestamp,
          }}
        >
          {message.status === "read"
            ? "Read"
            : message.status === "delivered"
              ? "Delivered"
              : message.status}
        </div>
      ) : null}
    </div>
  );
};

function renderAttachments(
  attachments: IMessageMessage["attachments"],
  bubble: typeof iOS_IMESSAGE_LIGHT.bubble,
  bubbleColor: string,
  fromMe: boolean = false,
) {
  if (!attachments || attachments.length === 0) return null;
  const primary = attachments[0];
  if (!primary) return null;

  if (primary.kind === "image" || primary.kind === "gif") {
    return (
      <div
        style={{
          borderRadius: bubble.borderRadius,
          overflow: "hidden",
          marginBottom: LAYOUT_CONSTANTS.BUBBLE_GAP,
          backgroundColor: bubbleColor,
          padding: 2,
        }}
      >
        <img
          src={primary.url}
          alt=""
          style={{
            width: "100%",
            display: "block",
            borderRadius: bubble.borderRadius - 2,
          }}
        />
      </div>
    );
  }

  if (primary.kind === "video") {
    return (
      <div
        style={{
          borderRadius: bubble.borderRadius,
          overflow: "hidden",
          marginBottom: LAYOUT_CONSTANTS.BUBBLE_GAP,
          backgroundColor: "#000000",
          color: "#ffffff",
          padding: 12,
          textAlign: "center",
        }}
      >
        Video
      </div>
    );
  }

  // Voice/Audio message with waveform
  if (primary.kind === "voice") {
    return (
      <div
        style={{
          backgroundColor: fromMe ? bubbleColor : "rgba(0,0,0,0.06)",
          borderRadius: bubble.borderRadius,
          marginBottom: LAYOUT_CONSTANTS.BUBBLE_GAP,
          overflow: "hidden",
        }}
      >
        <AudioMessage attachment={primary} fromMe={fromMe} />
      </div>
    );
  }

  if (primary.kind === "sticker") {
    return (
      <div
        style={{
          marginBottom: LAYOUT_CONSTANTS.BUBBLE_GAP,
        }}
      >
        <img src={primary.url} alt="sticker" style={{ width: 50 }} />
      </div>
    );
  }

  // Contact card with avatar and actions
  if (primary.kind === "contact") {
    return (
      <div style={{ marginBottom: LAYOUT_CONSTANTS.BUBBLE_GAP }}>
        <ContactCard contact={primary} fromMe={fromMe} />
      </div>
    );
  }

  // Calendar invite
  if (primary.kind === "calendar") {
    return (
      <div style={{ marginBottom: LAYOUT_CONSTANTS.BUBBLE_GAP }}>
        <CalendarCard event={primary} fromMe={fromMe} />
      </div>
    );
  }

  // Link preview
  if (primary.kind === "link") {
    return (
      <div style={{ marginBottom: LAYOUT_CONSTANTS.BUBBLE_GAP }}>
        <LinkPreviewCard preview={primary.preview} fromMe={fromMe} />
      </div>
    );
  }

  if (primary.kind === "location") {
    return (
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.08)",
          borderRadius: bubble.borderRadius,
          padding: 10,
          marginBottom: LAYOUT_CONSTANTS.BUBBLE_GAP,
        }}
      >
        Location: {primary.label ?? `${primary.latitude}, ${primary.longitude}`}
      </div>
    );
  }

  if (primary.kind === "payment") {
    return (
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.08)",
          borderRadius: bubble.borderRadius,
          padding: 10,
          marginBottom: LAYOUT_CONSTANTS.BUBBLE_GAP,
        }}
      >
        Payment: {primary.amount} {primary.currency ?? "USD"}
      </div>
    );
  }

  return null;
}

const BubbleTail: React.FC<{
  fromMe: boolean;
  color: string;
  tailWidth: number;
  tailHeight: number;
}> = ({ fromMe, color, tailWidth, tailHeight }) => {
  const tailPath = fromMe
    ? `M0,0 C${tailWidth},0 ${tailWidth},${tailHeight} 0,${tailHeight}`
    : `M${tailWidth},0 C0,0 0,${tailHeight} ${tailWidth},${tailHeight}`;
  return (
    <svg
      width={tailWidth}
      height={tailHeight}
      style={{
        position: "absolute",
        bottom: 0,
        [fromMe ? "right" : "left"]: -tailWidth + 4,
      }}
    >
      <path d={tailPath} fill={color} />
    </svg>
  );
};

const TapbackRow: React.FC<{
  tapbacks: IMessageMessage["tapbacks"];
  fromMe: boolean;
  theme: typeof iOS_IMESSAGE_LIGHT;
}> = ({ tapbacks, fromMe, theme }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        position: "absolute",
        bottom: -10,
        [fromMe ? "right" : "left"]: 4,
      }}
    >
      {tapbacks.map((tapback, i) => (
        <div
          key={`${tapback.type}-${i}`}
          style={{
            backgroundColor: theme.colors.bubble.received,
            borderRadius: LAYOUT_CONSTANTS.TAPBACK_SIZE / 2,
            width: LAYOUT_CONSTANTS.TAPBACK_SIZE,
            height: LAYOUT_CONSTANTS.TAPBACK_SIZE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: LAYOUT_CONSTANTS.TAPBACK_ICON_SIZE,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {TAPBACK_ICONS[tapback.type] ?? "•"}
        </div>
      ))}
    </div>
  );
};

function getEffectStyle(effect?: string) {
  switch (effect) {
    case "slam":
      return { animation: "imessage-slam 0.3s ease-out" } as const;
    case "loud":
      return { animation: "imessage-loud 0.5s ease-in-out" } as const;
    case "gentle":
      return { animation: "imessage-gentle 0.8s ease-in-out" } as const;
    case "ink":
      return { filter: "blur(8px)", transition: "filter 0.3s ease" } as const;
    default:
      return {} as const;
  }
}

export default MessageBubble;
