import { memo } from "react";
import { useCurrentFrame } from "remotion";

import { getMessageAccessibilityLabel } from "../accessibility/index.js";
import {
  calculateBubbleWidth,
  inlineMetadataWidth,
  calculateMessageHeight,
  getThemedMessageLayout,
  DEFAULT_LAYOUT_CONFIG,
  type MessageForHeight,
  type MessageType,
} from "../config/layout-config.js";
import {
  useTheme,
  useWhatsAppLocale,
} from "../experience/ExperienceContext.js";
import type {
  MessageRunPosition,
  ProjectedThreadMessage,
} from "../thread/projector.js";
import type { WhatsAppGestureState } from "../types/interactions.js";
import { resolveDeliveryStage } from "../utils/status.js";
import { MessageEnvelope } from "./MessageEnvelope.js";
import {
  ReplyAffordance,
  resolveMessageChrome,
} from "./MessageBubblePrimitives.js";
import { SystemEvent } from "./SystemEvent.js";

export interface ChatMessageItemProps {
  message: ProjectedThreadMessage;
  isMe: boolean;
  position: MessageRunPosition;
  isGroupChat?: boolean;
  senderName?: string;
  senderColor?: string;
  bubbleColor?: string;
  bubbleTextColor?: string;
  showSenderName?: boolean;
  messageOrder?: number;
  gesture?: WhatsAppGestureState;
  viewportWidth: number;
  gapBefore?: number;
}

export const ChatMessageItem = memo(function ChatMessageItem({
  message,
  isMe,
  position,
  isGroupChat = false,
  senderName,
  senderColor,
  bubbleColor,
  bubbleTextColor,
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
  const layoutConfig = getThemedMessageLayout(theme);
  const geometryInput: MessageForHeight = {
    type: message.type as MessageType,
    text: message.text,
    caption: message.caption,
    timestamp: message.timestamp,
    edited: message.edited,
    starred: message.starred,
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
    layoutConfig,
  );
  const bubbleWidth = calculateBubbleWidth(
    geometryInput,
    viewportWidth,
    layoutConfig,
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
  const showSender =
    showSenderName && isGroupChat && !isMe && Boolean(senderName);
  const activeGesture = gesture?.messageId === message.id ? gesture : undefined;
  const swipeProgress =
    activeGesture?.gesture === "swipe_reply"
      ? Math.max(0, Math.min(1, activeGesture.progress))
      : 0;
  const swipeSign = direction === "rtl" ? -1 : 1;
  const longPressed = activeGesture?.gesture === "long_press";
  const bubbleFill =
    bubbleColor ??
    (isMe ? theme.colors.sentBubble : theme.colors.receivedBubble);
  const bubbleForeground =
    bubbleTextColor ??
    (isMe ? theme.colors.sentBubbleText : theme.colors.receivedBubbleText);
  const bubbleBorder = bubbleColor
    ? `color-mix(in srgb, ${bubbleForeground} 18%, transparent)`
    : isMe
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
        transform: `translateX(${swipeProgress * 52 * swipeSign}px) scale(${longPressed ? 1.015 : 1})`,
        opacity: gesture?.gesture === "long_press" && gesture.phase === "completed" && !longPressed ? 0.38 : 1,
        filter: longPressed ? "drop-shadow(0 3px 6px rgba(0,0,0,0.16))" : undefined,
        transformOrigin: isMe ? "right center" : "left center",
      }}
    >
      {swipeProgress > 0 && <ReplyAffordance progress={swipeProgress} />}

      <MessageEnvelope
        inlineMetadata={inlineMetadataWidth(geometryInput, viewportWidth, layoutConfig) !== undefined}
        viewportWidth={viewportWidth}
        message={message}
        isMe={isMe}
        position={position}
        height={bubbleHeight}
        width={bubbleWidth}
        chrome={chrome}
        fill={bubbleFill}
        foreground={bubbleForeground}
        border={bubbleBorder}
        deliveryStage={deliveryStage}
        showSender={showSender}
        senderName={senderName}
        senderColor={senderColor}
        hasCustomBubbleColor={Boolean(bubbleColor)}
        longPressed={Boolean(longPressed)}
      />
    </div>
  );
});
