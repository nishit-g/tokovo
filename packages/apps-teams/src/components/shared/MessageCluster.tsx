import React from "react";
import {
  bubbleMetaStyle,
  bubbleSenderStyle,
  bubbleStyle,
  bubbleTextStyle,
  messageCardStyle,
  messageClusterWrapStyle,
  reactionBarStyle,
  reactionChipStyle,
  replyPreviewStyle,
} from "../../styles.js";
import { Avatar } from "./Avatar.js";
import { CheckIcon, DoubleCheckIcon } from "./Icons.js";

export const MessageCluster: React.FC<{
  senderName: string;
  text: string;
  timeLabel: string;
  isMine: boolean;
  showAvatar: boolean;
  presence?: string;
  replyPreview?: string;
  clusterPosition?: "single" | "start" | "middle" | "end";
  deliveryState?: "sending" | "sent" | "delivered" | "read";
  showReactionRail?: boolean;
}> = ({
  senderName,
  text,
  timeLabel,
  isMine,
  showAvatar,
  presence,
  replyPreview,
  clusterPosition = "single",
  deliveryState,
  showReactionRail = false,
}) => {
  const reactions = replyPreview
    ? [
        { emoji: "👍", count: 2, active: true },
        { emoji: "❤️", count: 1, active: false },
      ]
    : [{ emoji: "👏", count: 1, active: true }];

  return (
    <div style={messageClusterWrapStyle(isMine)}>
      <div style={messageCardStyle(isMine)}>
        {showAvatar ? (
          <Avatar name={senderName} size={28} presence={presence} tone={isMine ? "brand" : "neutral"} />
        ) : (
          <div style={{ width: 28 }} />
        )}
        <div style={bubbleStyle(isMine, clusterPosition)}>
          {!isMine ? <div style={bubbleSenderStyle(isMine)}>{senderName}</div> : null}
          {replyPreview ? (
            <div style={replyPreviewStyle(isMine)}>{replyPreview}</div>
          ) : null}
          <div style={bubbleTextStyle(isMine)}>{text}</div>
          <div
            style={{
              ...bubbleMetaStyle(isMine),
              display: "flex",
              justifyContent: isMine ? "flex-end" : "flex-start",
              gap: 6,
              alignItems: "center",
            }}
          >
            <span>{timeLabel}</span>
            {deliveryState === "read" ? <DoubleCheckIcon size={12} color="rgba(249,251,255,0.9)" /> : null}
            {deliveryState === "delivered" ? (
              <DoubleCheckIcon size={12} color={isMine ? "rgba(249,251,255,0.78)" : "var(--teams-text-muted)"} />
            ) : null}
            {deliveryState === "sent" ? (
              <CheckIcon size={12} color={isMine ? "rgba(249,251,255,0.78)" : "var(--teams-text-muted)"} />
            ) : null}
          </div>
        </div>
      </div>
      {showReactionRail ? (
        <div style={reactionBarStyle(isMine)}>
          {reactions.map((reaction) => (
            <div key={reaction.emoji} style={reactionChipStyle(reaction.active)}>
              <span>{reaction.emoji}</span>
              <span>{reaction.count}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
