import { memo } from "react";

import { useTheme } from "../experience/ExperienceContext.js";
import type {
  MessageRunPosition,
  ProjectedThreadMessage,
} from "../thread/projector.js";
import type { DeliveryStage } from "../utils/status.js";
import { MessageBody } from "./MessageBody.js";
import {
  BubbleSurface,
  ForwardedMetadata,
  MessageMetadata,
  MetadataSlot,
  ReactionCluster,
  bubbleRadii,
  type MessageChrome,
} from "./MessageBubblePrimitives.js";
import { ReplyQuote } from "./ReplyQuote.js";
import {
  getThemedMessageLayout,
  measureTextBlock,
} from "../config/layout-config.js";

interface MessageEnvelopeProps {
  message: ProjectedThreadMessage;
  isMe: boolean;
  position: MessageRunPosition;
  height: number;
  width: number;
  chrome: MessageChrome;
  fill: string;
  foreground: string;
  border: string;
  deliveryStage?: DeliveryStage;
  showSender: boolean;
  senderName?: string;
  senderColor?: string;
  hasCustomBubbleColor: boolean;
  longPressed: boolean;
  viewportWidth: number;
}

export const MessageEnvelope = memo(function MessageEnvelope({
  message,
  isMe,
  position,
  height,
  width,
  chrome,
  fill,
  foreground,
  border,
  deliveryStage,
  showSender,
  senderName,
  senderColor,
  hasCustomBubbleColor,
  longPressed,
  viewportWidth,
}: MessageEnvelopeProps) {
  const theme = useTheme();

  return (
    <>
      {!chrome.sticker && (
        <BubbleSurface
          width={width}
          height={height}
          position={position}
          isMe={isMe}
          fill={fill}
          border={border}
          radius={theme.spacing.bubbleRadius}
        />
      )}
      <div
        style={{
          ...bubbleRadii(position, isMe, theme.spacing.bubbleRadius),
          position: "relative",
          zIndex: 1,
          minWidth: chrome.sticker ? undefined : 76,
          maxWidth: "100%",
          height,
          boxSizing: "border-box",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          color: foreground,
          backgroundColor: "transparent",
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
                marginBottom: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: hasCustomBubbleColor
                  ? foreground
                  : senderColor || theme.colors.accent,
                fontSize: 12.5,
                lineHeight: "16px",
                fontWeight: 700,
                letterSpacing: -0.1,
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

        <div
          style={{
            position: "relative",
            minHeight: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <MessageBody
            message={message}
            isMe={isMe}
            textLines={
              message.type === "text"
                ? measureTextBlock(
                    message.text ?? "",
                    viewportWidth,
                    getThemedMessageLayout(theme),
                  ).textLines
                : undefined
            }
          />
          <MessageMetadata
            message={message}
            isMe={isMe}
            deliveryStage={deliveryStage}
            overlay={chrome.overlayFooter}
            colorOverride={hasCustomBubbleColor ? foreground : undefined}
          />
        </div>
      </div>

      <ReactionCluster message={message} isMe={isMe} />
    </>
  );
});
