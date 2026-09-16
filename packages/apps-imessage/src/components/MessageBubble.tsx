import React from "react";
import { AnimatedImage, OffthreadVideo, Sequence, staticFile } from "remotion";
import {
  easeOutCubic,
  ShapedText,
  frameProgress,
  useFps,
  useTime,
  DeterministicImage as Img,
} from "@tokovo/react";
import { resolveStaticAssetSrc } from "@tokovo/core";
import type { IMessageMessage, IMessageTapbackType } from "../types/index.js";
import { iOS_IMESSAGE_LIGHT, LAYOUT_CONSTANTS } from "../config/index.js";
import { AudioMessage } from "./AudioMessage.js";
import { ContactCard } from "./ContactCard.js";
import { CalendarCard } from "./CalendarCard.js";
import { LinkPreviewCard } from "./LinkPreviewCard.js";
import { deliveryStatus, type messageGeometry } from "../layout/message.js";

interface MessageBubbleProps {
  message: IMessageMessage;
  isSMS?: boolean;
  showTail?: boolean;
  showSenderLabel?: boolean;
  senderLabel?: string;
  showStatus?: boolean;
  replyPreview?: string;
  theme?: typeof iOS_IMESSAGE_LIGHT;
  geometry?: ReturnType<typeof messageGeometry>;
  replySender?: string;
  replyThumbnail?: string;
}

const TAPBACK_LABELS: Record<IMessageTapbackType, string> = {
  heart: "Loved",
  thumbsUp: "Liked",
  thumbsDown: "Disliked",
  haha: "Laughed",
  exclamation: "Emphasized",
  questionMark: "Questioned",
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
  geometry,
  replySender,
  replyThumbnail,
}) => {
  const { fromMe, text, attachments, effect, isSystem } = message;
  const tapbacks = message.tapbacks ?? [];
  const { colors, typography, bubble } = theme;
  const frame = useTime();
  const fps = useFps();
  const status = deliveryStatus(message, frame);

  if (isSystem || message.isUnsent) {
    return (
      <div
        style={{
          textAlign: "center",
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
          {message.isUnsent
            ? fromMe
              ? "You unsent a message"
              : `${message.senderName ?? "Someone"} unsent a message`
            : message.systemText || text}
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

  const effectStyle = getEffectStyle(effect?.bubble, frame, message.timestamp, fps);

  return (
    <div
      data-message-id={message.id}
      style={{
        fontFamily: typography.message.family,
        color: textColor,
        display: "flex",
        flexDirection: "column",
        alignItems: fromMe ? "flex-end" : "flex-start",
        position: "relative",
        width: geometry?.width,
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
          width: geometry ? "100%" : undefined,
          maxWidth: geometry ? "100%" : `${bubble.maxWidth * 100}%`,
          minWidth: 0,
          display: "inline-flex",
          flexDirection: "column",
        }}
      >
        {replyPreview ? (
          <div
            style={{
              borderInlineStart: `2px solid ${colors.header.icons}`,
              padding: "6px 10px",
              marginBottom: 6,
              marginInline: 8,
              borderRadius: 8,
              background: colors.bubble.received,
              fontFamily: typography.timestamp.family,
              fontSize: typography.timestamp.size,
              color: colors.bubble.otherText,
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              lineHeight: "14px",
              position: "relative",
              paddingRight: replyThumbnail ? 48 : 10,
            }}
          >
            <span style={{ display: "block", fontWeight: 600, marginBottom: 2 }}>
              {replySender ?? "Reply"}
            </span>
            <ShapedText text={geometry?.replyLines.join("\n") ?? replyPreview ?? ""} />
            {replyThumbnail && (
              <Img
                src={replyThumbnail}
                alt="Original photo"
                style={{
                  position: "absolute",
                  right: 6,
                  top: 6,
                  width: 32,
                  height: 32,
                  objectFit: "cover",
                  borderRadius: 5,
                }}
              />
            )}
          </div>
        ) : null}

        {attachments?.map((attachment, index) => (
          <div
            key={index}
            style={{
              marginBottom: geometry ? 8 : text || index < attachments.length - 1 ? 4 : 0,
              maxWidth: "100%",
              height: geometry?.attachmentHeights[index],
              overflow: geometry ? "hidden" : undefined,
              borderRadius: bubble.borderRadius,
            }}
          >
            {renderAttachment(attachment, bubble, bubbleColor, fromMe, message.timestamp)}
          </div>
        ))}
        {message.linkPreview && !attachments?.some((attachment) => attachment.kind === "link") && (
          <LinkPreviewCard preview={message.linkPreview} fromMe={fromMe} />
        )}

        {text && (
          <div
            style={{
              backgroundColor: bubbleColor,
              borderRadius: bubble.borderRadius,
              padding: `${bubble.verticalPadding}px ${bubble.horizontalPadding}px`,
              position: "relative",
              display: "inline-block",
              maxWidth: "100%",
              boxSizing: "border-box",
              lineHeight: `${typography.message.lineHeight}px`,
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
                whiteSpace: geometry ? "pre" : "pre-wrap",
                letterSpacing: -0.35,
              }}
            >
              <ShapedText text={geometry?.textLines.join("\n") ?? text ?? ""} />
            </span>
          </div>
        )}

        {tapbacks.length > 0 && <TapbackRow tapbacks={tapbacks} fromMe={fromMe} theme={theme} />}
      </div>

      {message.isEdited && (
        <div
          style={{
            marginTop: 3,
            fontFamily: typography.timestamp.family,
            fontSize: typography.timestamp.size,
            color: colors.header.icons,
          }}
        >
          Edited
        </div>
      )}
      {showStatus && status ? (
        <div
          style={{
            marginTop: 2,
            fontFamily: typography.timestamp.family,
            fontSize: typography.timestamp.size,
            color: colors.system.timestamp,
          }}
        >
          {status === "read"
            ? "Read"
            : status === "delivered"
              ? "Delivered"
              : status === "sending"
                ? "Sending…"
                : "Sent"}
        </div>
      ) : null}
    </div>
  );
};

function renderAttachment(
  primary: NonNullable<IMessageMessage["attachments"]>[number],
  bubble: typeof iOS_IMESSAGE_LIGHT.bubble,
  bubbleColor: string,
  fromMe: boolean = false,
  startFrame = 0,
) {
  if (primary.kind === "image" || primary.kind === "gif") {
    const MediaComponent = primary.kind === "gif" ? AnimatedImage : Img;
    return (
      <div
        style={{
          borderRadius: bubble.borderRadius,
          overflow: "hidden",
          marginBottom: LAYOUT_CONSTANTS.BUBBLE_GAP,
          backgroundColor: bubbleColor,
          width: 260,
          maxWidth: "100%",
        }}
      >
        <MediaComponent
          src={
            primary.kind === "gif"
              ? resolveStaticAssetSrc(primary.url, (path) => staticFile(path.replace(/^\//, "")))
              : primary.url
          }
          alt={primary.kind === "image" ? (primary.caption ?? "Photo") : "Animation"}
          style={{
            width: "100%",
            aspectRatio:
              primary.kind === "image"
                ? `${primary.width ?? 260} / ${primary.height ?? 180}`
                : "260 / 180",
            height: "auto",
            maxHeight: 320,
            objectFit: "cover",
            display: "block",
            borderRadius: bubble.borderRadius,
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
          width: 260,
          maxWidth: "100%",
          height: 180,
          position: "relative",
        }}
      >
        <Sequence from={startFrame} layout="none">
          <OffthreadVideo
            src={resolveStaticAssetSrc(primary.url, (path) => staticFile(path.replace(/^\//, "")))}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Sequence>
      </div>
    );
  }

  // Voice/Audio message with waveform
  if (primary.kind === "voice") {
    return (
      <div
        style={{
          backgroundColor: fromMe ? bubbleColor : undefined,
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
        <Img src={primary.url} alt="Sticker" style={{ width: 130, maxWidth: "100%" }} />
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
          backgroundColor: bubbleColor,
          borderRadius: bubble.borderRadius,
          padding: 16,
          width: 240,
          maxWidth: "100%",
          boxSizing: "border-box",
          overflowWrap: "anywhere",
          marginBottom: LAYOUT_CONSTANTS.BUBBLE_GAP,
        }}
      >
        <svg
          width="24"
          height="28"
          viewBox="0 0 24 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M12 26S3 17 3 11a9 9 0 0 1 18 0c0 6-9 15-9 15Z" />
          <circle cx="12" cy="11" r="3" />
        </svg>
        <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>
          {primary.label ?? "Shared location"}
        </div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
          {primary.latitude.toFixed(5)}, {primary.longitude.toFixed(5)}
        </div>
      </div>
    );
  }

  if (primary.kind === "payment") {
    return (
      <div
        style={{
          backgroundColor: bubbleColor,
          borderRadius: bubble.borderRadius,
          padding: 16,
          width: 240,
          maxWidth: "100%",
          boxSizing: "border-box",
          marginBottom: LAYOUT_CONSTANTS.BUBBLE_GAP,
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.8 }}>Payment</div>
        <div style={{ fontSize: 30, fontWeight: 600, marginTop: 4 }}>
          {primary.amount.toFixed(2)}{" "}
          <span style={{ fontSize: 13 }}>{primary.currency ?? "USD"}</span>
        </div>
        {primary.note && (
          <div style={{ fontSize: 13, marginTop: 8, overflowWrap: "anywhere" }}>{primary.note}</div>
        )}
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
  const tailPath = "M0 0 C0 10 3 16 12 18 C7 21 1 19 0 17 Z";
  return (
    <svg
      width={tailWidth}
      height={tailHeight}
      viewBox="0 0 12 20"
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: 0,
        [fromMe ? "right" : "left"]: -5,
        transform: fromMe ? undefined : "scaleX(-1)",
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
        top: -22,
        [fromMe ? "left" : "right"]: -6,
      }}
    >
      {tapbacks.slice(0, 4).map((tapback, i) => (
        <div
          key={`${tapback.type}-${i}`}
          aria-label={i === 3 && tapbacks.length > 4 ? `${tapbacks.length - 3} more reactions` : TAPBACK_LABELS[tapback.type]}
          style={{
            backgroundColor: theme.colors.bubble.received,
            borderRadius: LAYOUT_CONSTANTS.TAPBACK_SIZE / 2,
            width: LAYOUT_CONSTANTS.TAPBACK_SIZE,
            height: LAYOUT_CONSTANTS.TAPBACK_SIZE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: LAYOUT_CONSTANTS.TAPBACK_ICON_SIZE,
            fontWeight: 800,
            fontFamily: theme.typography.message.family,
            color: tapback.fromMe ? theme.colors.header.icons : theme.colors.bubble.otherText,
            boxShadow: `0 0 0 2px ${theme.colors.system.chatBackground}`,
          }}
        >
          {i === 3 && tapbacks.length > 4 ? <span style={{ fontSize: 10 }}>+{tapbacks.length - 3}</span> : <TapbackIcon type={tapback.type} />}
        </div>
      ))}
    </div>
  );
};

function TapbackIcon({ type }: { type: IMessageTapbackType }) {
  if (type === "haha")
    return (
      <span style={{ fontSize: 9, lineHeight: "8px", textAlign: "center" }}>
        HA
        <br />
        HA
      </span>
    );
  if (type === "exclamation" || type === "questionMark")
    return <span>{type === "exclamation" ? "!!" : "?"}</span>;
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ transform: type === "thumbsDown" ? "rotate(180deg)" : undefined }}
    >
      {type === "heart" ? (
        <path d="M12 21 3 12C-3 5 6-1 12 6 18-1 27 5 21 12Z" />
      ) : (
        <path d="M3 10h4v11H3Zm6 11V10l5-8c2 0 3 2 2 5l-1 3h5c2 0 2 2 2 3l-2 6c0 1-1 2-3 2Z" />
      )}
    </svg>
  );
}

function getEffectStyle(
  effect: string | undefined,
  frame: number,
  startFrame: number,
  fps: number,
): React.CSSProperties {
  switch (effect) {
    case "slam": {
      const progress = easeOutCubic(frameProgress(frame, startFrame, 0.3 * fps));
      const scale =
        progress < 0.8 ? 0.8 + (progress / 0.8) * 0.25 : 1.05 - ((progress - 0.8) / 0.2) * 0.05;
      return { transform: `scale(${scale})` };
    }
    case "loud": {
      const progress = frameProgress(frame, startFrame, 0.5 * fps);
      const scale = progress < 0.5 ? 0.9 + progress * 0.44 : 1.12 - (progress - 0.5) * 0.24;
      return { transform: `scale(${scale})` };
    }
    case "gentle": {
      const progress = easeOutCubic(frameProgress(frame, startFrame, 0.8 * fps));
      return {
        opacity: progress,
        transform: `scale(${0.98 + progress * 0.02})`,
      };
    }
    case "ink":
      return { filter: "blur(8px)" };
    default:
      return {};
  }
}

export default MessageBubble;
