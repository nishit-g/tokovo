import { memo, type CSSProperties, type ReactNode } from "react";
import { useCurrentFrame } from "remotion";

import {
  getMessageAccessibilityLabel,
  getReactionAccessibilityLabel,
} from "../accessibility/index.js";
import {
  useTheme,
  useWhatsAppLocale,
} from "../experience/ExperienceContext.js";
import { formatWhatsAppNumber } from "../localization/index.js";
import type {
  MessageRunPosition,
  ProjectedThreadMessage,
} from "../thread/projector.js";
import type { WhatsAppGestureState } from "../types/interactions.js";
import { resolveDeliveryStage, type DeliveryStage } from "../utils/status.js";
import { MessageBody } from "./MessageBody.js";
import { ReplyQuote } from "./ReplyQuote.js";
import { SystemEvent } from "./SystemEvent.js";
import {
  calculateBubbleWidth,
  calculateMessageHeight,
  DEFAULT_LAYOUT_CONFIG,
  type MessageForHeight,
  type MessageType,
} from "../config/layout-config.js";

export interface ChatMessageItemProps {
  message: ProjectedThreadMessage;
  isMe: boolean;
  position: MessageRunPosition;
  isGroupChat?: boolean;
  senderName?: string;
  senderColor?: string;
  showSenderName?: boolean;
  messageOrder?: number;
  gesture?: WhatsAppGestureState;
  viewportWidth: number;
  gapBefore?: number;
}

interface MessageChrome {
  edgeMedia: boolean;
  inlineFooter: boolean;
  overlayFooter: boolean;
  sticker: boolean;
}

function resolveMessageChrome(message: ProjectedThreadMessage): MessageChrome {
  const edgeMedia = ["image", "video", "gif", "location"].includes(
    message.type,
  );
  const overlayFooter =
    message.type === "sticker" ||
    message.type === "gif" ||
    ((message.type === "image" || message.type === "video") &&
      !message.caption) ||
    (message.type === "location" &&
      !message.locationName &&
      !message.locationAddress);
  return {
    edgeMedia,
    inlineFooter: message.type === "text" && !overlayFooter,
    overlayFooter,
    sticker: message.type === "sticker",
  };
}

function bubbleRadii(
  position: MessageRunPosition,
  isMe: boolean,
  radius: number,
): CSSProperties {
  const first = position === "single" || position === "start";
  const last = position === "single" || position === "end";
  const joined = Math.max(5, Math.round(radius * 0.34));
  const tail = Math.max(4, Math.round(radius * 0.28));

  return {
    borderTopLeftRadius:
      !isMe && first ? tail : !isMe && !first ? joined : radius,
    borderTopRightRadius:
      isMe && first ? tail : isMe && !first ? joined : radius,
    borderBottomLeftRadius: !isMe && !last ? joined : radius,
    borderBottomRightRadius: isMe && !last ? joined : radius,
  };
}

function DeliveryGlyph({
  stage,
  color,
}: {
  stage: DeliveryStage;
  color: string;
}) {
  if (stage === "sending") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <circle
          cx="6"
          cy="6"
          r="4.25"
          fill="none"
          stroke={color}
          strokeWidth="1"
        />
        <path
          d="M6 3.3v3l2 1.1"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (stage === "failed") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <circle
          cx="7"
          cy="7"
          r="5.25"
          fill="none"
          stroke={color}
          strokeWidth="1.35"
        />
        <path
          d="M7 3.8v4.1"
          stroke={color}
          strokeWidth="1.35"
          strokeLinecap="round"
        />
        <circle cx="7" cy="10.2" r=".75" fill={color} />
      </svg>
    );
  }

  return (
    <svg
      width={stage === "sent" ? 14 : 18}
      height="12"
      viewBox={stage === "sent" ? "0 0 14 12" : "0 0 18 12"}
      aria-hidden="true"
    >
      <path
        d="M1.4 6.2 4.7 9.3 11.8 2.2"
        fill="none"
        stroke={color}
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {stage !== "sent" && (
        <path
          d="M6.2 8.7 7.1 9.5 15.8 1.8"
          fill="none"
          stroke={color}
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function BubbleTail({ isMe, fill }: { isMe: boolean; fill: string }) {
  return (
    <svg
      width="10"
      height="13"
      viewBox="0 0 10 13"
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0.5,
        [isMe ? "right" : "left"]: -6,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 0,
        transform: isMe ? undefined : "scaleX(-1)",
        transformOrigin: "center",
        filter: "drop-shadow(0 1px 0.75px rgba(0,0,0,0.12))",
      }}
    >
      <path
        d="M0 .25h9.6C9.15 3.1 8.02 5.45 6.15 7.55 4.35 9.58 2.28 11.08.18 12.18 2.45 8.62 2.42 4.4 0 .25Z"
        fill={fill}
      />
    </svg>
  );
}

function ReplyAffordance({ progress }: { progress: number }) {
  const theme = useTheme();
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        insetInlineStart: -42,
        top: "50%",
        width: 30,
        height: 30,
        marginTop: -15,
        display: "grid",
        placeItems: "center",
        border: `0.5px solid ${theme.colors.divider}`,
        borderRadius: 15,
        color: theme.colors.accent,
        backgroundColor: theme.colors.background,
        boxShadow: theme.colors.reactionShadow,
        opacity: progress,
        transform: `scale(${0.78 + progress * 0.22})`,
      }}
    >
      <svg width="17" height="17" viewBox="0 0 20 20">
        <path
          d="M8.2 5.1 3.4 9.5l4.8 4.4M4 9.5h6.2c3.6 0 5.4 1.7 6.1 4.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

const ForwardedMetadata = memo(function ForwardedMetadata() {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginBottom: 4,
        color: theme.colors.timestamp,
        fontSize: theme.typography.timestampFontSize + 1,
        fontStyle: "italic",
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="m9.1 3.1 4 3.3-4 3.3V7.6c-3.2 0-5.2 1.1-6.4 3.3.35-3.8 2.45-5.7 6.4-5.7Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{t("message.forwarded")}</span>
    </div>
  );
});

const MessageMetadata = memo(function MessageMetadata({
  message,
  isMe,
  deliveryStage,
  overlay,
  inline,
}: {
  message: ProjectedThreadMessage;
  isMe: boolean;
  deliveryStage?: DeliveryStage;
  overlay: boolean;
  inline: boolean;
}) {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  const color = overlay ? "#FFFFFF" : theme.colors.timestamp;
  const hasMetadata = Boolean(
    message.timestamp || message.edited || message.starred || deliveryStage,
  );
  if (!hasMetadata) return null;
  const deliveryColor =
    deliveryStage === "failed"
      ? theme.colors.callCardMissed
      : overlay
        ? deliveryStage === "read"
          ? "#73D7FF"
          : "#FFFFFF"
        : deliveryStage === "read"
          ? theme.colors.checkmarkRead
          : theme.colors.checkmark;

  return (
    <div
      data-cinematic-subject="message-footer"
      aria-label={
        isMe && deliveryStage ? t(`a11y.delivery.${deliveryStage}`) : undefined
      }
      style={{
        position: overlay || inline ? "absolute" : "relative",
        insetInlineEnd: overlay ? 6 : inline ? 0 : undefined,
        bottom: overlay ? 6 : inline ? 0 : undefined,
        alignSelf: overlay || inline ? undefined : "flex-end",
        minHeight: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 3,
        marginTop: overlay ? undefined : 3,
        padding: overlay ? "2px 5px" : undefined,
        borderRadius: overlay ? 6 : undefined,
        color,
        backgroundColor: overlay ? theme.colors.mediaScrim : undefined,
        fontSize: theme.typography.timestampFontSize,
        lineHeight: "14px",
        fontFamily: theme.typography.fontFamily,
        whiteSpace: "nowrap",
      }}
    >
      {message.edited && <span>{t("message.edited")}</span>}
      {message.timestamp && <span>{message.timestamp}</span>}
      {message.starred && <span style={{ fontSize: 9 }}>★</span>}
      {isMe && deliveryStage && (
        <DeliveryGlyph stage={deliveryStage} color={deliveryColor} />
      )}
    </div>
  );
});

const ReactionCluster = memo(function ReactionCluster({
  message,
  isMe,
}: {
  message: ProjectedThreadMessage;
  isMe: boolean;
}) {
  const theme = useTheme();
  const { locale } = useWhatsAppLocale();
  if (!message.reactions?.length) return null;

  return (
    <div
      data-cinematic-subject="reactions"
      role="status"
      aria-label={getReactionAccessibilityLabel(message, locale)}
      style={{
        position: "absolute",
        right: isMe ? 7 : undefined,
        left: isMe ? undefined : 7,
        bottom: 0,
        minHeight: 24,
        display: "flex",
        alignItems: "center",
        gap: 3,
        padding: "2px 7px",
        border: `1px solid ${theme.colors.reactionBorder}`,
        borderRadius: 13,
        color: theme.colors.receivedBubbleText,
        backgroundColor: theme.colors.reactionSurface,
        boxShadow: theme.colors.reactionShadow,
        fontSize: 13,
        lineHeight: "17px",
        fontFamily: theme.typography.fontFamily,
        zIndex: 2,
      }}
    >
      {message.reactions.map((reaction) => (
        <span
          key={reaction.emoji}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            paddingInline: reaction.fromMe ? 3 : undefined,
            borderRadius: 8,
            backgroundColor: reaction.fromMe
              ? `${theme.colors.accent}18`
              : undefined,
          }}
        >
          <span>{reaction.emoji}</span>
          {reaction.count > 1 && (
            <span style={{ color: theme.colors.timestamp, fontSize: 10 }}>
              {formatWhatsAppNumber(locale, reaction.count)}
            </span>
          )}
        </span>
      ))}
    </div>
  );
});

function MetadataSlot({
  children,
  edgeMedia,
}: {
  children: ReactNode;
  edgeMedia: boolean;
}) {
  return (
    <div style={{ padding: edgeMedia ? "5px 7px 0" : undefined }}>
      {children}
    </div>
  );
}

export const ChatMessageItem = memo(function ChatMessageItem({
  message,
  isMe,
  position,
  isGroupChat = false,
  senderName,
  senderColor,
  showSenderName = false,
  messageOrder,
  gesture,
  viewportWidth,
  gapBefore = 0,
}: ChatMessageItemProps) {
  const theme = useTheme();
  const { direction, locale } = useWhatsAppLocale();
  const currentFrame = useCurrentFrame();

  const chrome = resolveMessageChrome(message);
  const geometryInput: MessageForHeight = {
    type: message.type as MessageType,
    text: message.text,
    caption: message.caption,
    systemType: message.systemType,
    pollQuestion: message.pollQuestion,
    pollOptionCount: message.options?.length,
    locationName: message.locationName,
    locationAddress: message.locationAddress,
    from: message.from,
    prevFrom: showSenderName ? "__run_break__" : message.from,
    isGroupChat,
    isForwarded: message.isForwarded,
    reactions: message.reactions,
    replyTo: message.replyTo,
    linkPreview: message.linkPreview,
  };
  const envelopeHeight = calculateMessageHeight(
    geometryInput,
    viewportWidth,
    DEFAULT_LAYOUT_CONFIG,
  );
  const bubbleWidth = calculateBubbleWidth(
    geometryInput,
    viewportWidth,
    DEFAULT_LAYOUT_CONFIG,
  );
  const reactionHeight = message.reactions?.length
    ? DEFAULT_LAYOUT_CONFIG.additions.reaction
    : 0;
  const bubbleHeight = Math.max(1, envelopeHeight - reactionHeight);

  if (message.type === "system" || message.type === "screenshot_alert") {
    return (
      <div
        data-cinematic-subject="message"
        data-message-id={message.id}
        data-layout-width={bubbleWidth}
        data-layout-height={envelopeHeight}
        role="listitem"
        style={{
          width: bubbleWidth,
          height: envelopeHeight,
          marginBlockStart: gapBefore,
          marginInline: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <SystemEvent message={message} order={messageOrder} />
      </div>
    );
  }

  const deliveryStage = resolveDeliveryStage(message, currentFrame);
  const first = position === "single" || position === "start";
  const showTail = first && !chrome.sticker;
  const showSender =
    showSenderName && isGroupChat && !isMe && Boolean(senderName);
  const activeGesture = gesture?.messageId === message.id ? gesture : undefined;
  const swipeProgress =
    activeGesture?.gesture === "swipe_reply"
      ? Math.max(0, Math.min(1, activeGesture.progress))
      : 0;
  const swipeSign = direction === "rtl" ? -1 : 1;
  const longPressed = activeGesture?.gesture === "long_press";
  const bubbleFill = isMe
    ? theme.colors.sentBubble
    : theme.colors.receivedBubble;
  const bubbleBorder = isMe
    ? theme.colors.sentBubbleBorder
    : theme.colors.receivedBubbleBorder;

  return (
    <div
      data-cinematic-subject="message"
      data-message-id={message.id}
      data-order={messageOrder}
      data-run-position={position}
      data-message-type={message.type}
      data-layout-width={bubbleWidth}
      data-layout-height={envelopeHeight}
      role="listitem"
      aria-label={getMessageAccessibilityLabel(message, isMe, locale)}
      dir={direction}
      style={{
        isolation: "isolate",
        position: "relative",
        width: bubbleWidth,
        height: envelopeHeight,
        marginLeft: isMe ? "auto" : 0,
        marginRight: isMe ? 0 : "auto",
        marginTop: gapBefore,
        transform: `translateX(${swipeProgress * 52 * swipeSign}px) scale(${longPressed ? 0.982 : 1})`,
        filter: longPressed ? "brightness(0.95) saturate(0.94)" : undefined,
        transformOrigin: isMe ? "right center" : "left center",
      }}
    >
      {swipeProgress > 0 && <ReplyAffordance progress={swipeProgress} />}

      <div
        style={{
          ...bubbleRadii(position, isMe, theme.spacing.bubbleRadius),
          position: "relative",
          zIndex: 1,
          minWidth: chrome.sticker ? undefined : 72,
          maxWidth: "100%",
          height: bubbleHeight,
          boxSizing: "border-box",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          color: isMe
            ? theme.colors.sentBubbleText
            : theme.colors.receivedBubbleText,
          backgroundColor: chrome.sticker ? "transparent" : bubbleFill,
          border: chrome.sticker ? undefined : `0.5px solid ${bubbleBorder}`,
          boxShadow: chrome.sticker ? undefined : theme.colors.bubbleShadow,
          padding: chrome.sticker
            ? 0
            : chrome.edgeMedia
              ? 3
              : `${theme.spacing.messagePaddingVertical}px ${theme.spacing.messagePaddingHorizontal}px`,
          outline: longPressed
            ? `2px solid ${theme.colors.accent}30`
            : undefined,
          outlineOffset: longPressed ? 2 : undefined,
        }}
      >
        {showSender && (
          <MetadataSlot edgeMedia={chrome.edgeMedia}>
            <div
              style={{
                marginBottom: 3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: senderColor || theme.colors.accent,
                fontSize: 13,
                fontWeight: 650,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {senderName}
            </div>
          </MetadataSlot>
        )}

        {message.isForwarded && (
          <MetadataSlot edgeMedia={chrome.edgeMedia}>
            <ForwardedMetadata />
          </MetadataSlot>
        )}

        {message.replyTo && (
          <div data-cinematic-subject="reply">
            <MetadataSlot edgeMedia={chrome.edgeMedia}>
              <ReplyQuote replyTo={message.replyTo} isMyMessage={isMe} />
            </MetadataSlot>
          </div>
        )}

        <div style={{ position: "relative" }}>
          <MessageBody
            message={message}
            isMe={isMe}
            footerReserveWidth={
              chrome.inlineFooter ? (isMe ? 78 : 54) : undefined
            }
          />
          <MessageMetadata
            message={message}
            isMe={isMe}
            deliveryStage={deliveryStage}
            overlay={chrome.overlayFooter}
            inline={chrome.inlineFooter}
          />
        </div>
      </div>

      {showTail && <BubbleTail isMe={isMe} fill={bubbleFill} />}
      <ReactionCluster message={message} isMe={isMe} />
    </div>
  );
});
