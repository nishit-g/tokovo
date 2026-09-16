import { memo, type CSSProperties, type ReactNode } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

import { getReactionAccessibilityLabel } from "../accessibility/index.js";
import { useTheme, useWhatsAppLocale } from "../experience/ExperienceContext.js";
import { formatWhatsAppNumber } from "../localization/index.js";
import type { MessageRunPosition, ProjectedThreadMessage } from "../thread/projector.js";
import type { DeliveryStage } from "../utils/status.js";
import { getReactionWidth, metadataLineHeight } from "../config/layout-config.js";
import { WHATSAPP_INTERACTION_TOKENS as tokens } from "../theme/index.js";

export interface MessageChrome {
  edgeMedia: boolean;
  overlayFooter: boolean;
  sticker: boolean;
}

export function resolveMessageChrome(message: ProjectedThreadMessage): MessageChrome {
  const edgeMedia = ["image", "video", "gif", "location"].includes(message.type);
  const overlayFooter =
    message.type === "sticker" ||
    message.type === "gif" ||
    ((message.type === "image" || message.type === "video") && !message.caption) ||
    (message.type === "location" && !message.locationName && !message.locationAddress);

  return {
    edgeMedia,
    overlayFooter,
    sticker: message.type === "sticker",
  };
}

export function bubbleRadii(
  position: MessageRunPosition,
  isMe: boolean,
  radius: number,
): CSSProperties {
  const first = position === "single" || position === "start";
  const last = position === "single" || position === "end";
  const joined = Math.max(5, Math.round(radius * 0.34));
  const tail = Math.max(4, Math.round(radius * 0.28));

  return {
    borderTopLeftRadius: !isMe && first ? tail : !isMe && !first ? joined : radius,
    borderTopRightRadius: isMe && first ? tail : isMe && !first ? joined : radius,
    borderBottomLeftRadius: !isMe && !last ? joined : radius,
    borderBottomRightRadius: isMe && !last ? joined : radius,
  };
}

function DeliveryGlyph({ stage, color }: { stage: DeliveryStage; color: string }) {
  if (stage === "sending") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <circle cx="6" cy="6" r="4.25" fill="none" stroke={color} strokeWidth="1" />
        <path d="M6 3.3v3l2 1.1" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  }

  if (stage === "failed") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <circle cx="7" cy="7" r="5.25" fill="none" stroke={color} strokeWidth="1.35" />
        <path d="M7 3.8v4.1" stroke={color} strokeWidth="1.35" strokeLinecap="round" />
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
        d="M1.5 6 4.5 9 11.5 2"
        fill="none"
        stroke={color}
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {stage !== "sent" && (
        <path
          d="M8.5 9 15.5 2"
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

export function BubbleSurface({ isMe, fill, border, width, height, position, radius }: {
  isMe: boolean; fill: string; border: string; width: number; height: number; position: MessageRunPosition; radius: number;
}) {
  const hasTail = position === "single" || position === "start";
  const radii = bubbleRadii(position, true, Math.min(radius, height / 2));
  const tl = Number(radii.borderTopLeftRadius);
  const tr = Number(radii.borderTopRightRadius);
  const bl = Number(radii.borderBottomLeftRadius);
  const br = Number(radii.borderBottomRightRadius);
  // One closed silhouette: the tail shares its fill, border and shadow with
  // the body, so there is no triangle seam or double-shadow at the join.
  const topRight = hasTail
    ? `H${width + 4} Q${width + 7} 0 ${width + 4.5} 2.5 L${width} 8`
    : `H${width - tr} Q${width} 0 ${width} ${tr}`;
  const path = `M${tl} 0 ${topRight} V${height - br} Q${width} ${height} ${width - br} ${height} H${bl} Q0 ${height} 0 ${height - bl} V${tl} Q0 0 ${tl} 0 Z`;
  return (
    <svg
      width={width + 16}
      height={height + 6}
      viewBox={`-8 -1 ${width + 16} ${height + 6}`}
      data-bubble-surface={hasTail ? "tail" : "joined"}
      aria-hidden="true"
      style={{
        position: "absolute",
        top: -1,
        left: -8,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 0,
        filter: "drop-shadow(0 1px 0.5px rgba(0,0,0,0.10))",
      }}
    >
      <path
        d={path}
        fill={fill}
        stroke={border}
        strokeWidth={0.5}
        strokeLinejoin="round"
        transform={isMe ? undefined : `translate(${width} 0) scale(-1 1)`}
      />
    </svg>
  );
}

export function ReplyAffordance({ progress }: { progress: number }) {
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

export const ForwardedMetadata = memo(function ForwardedMetadata() {
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

export const MessageMetadata = memo(function MessageMetadata({
  inline = false,
  message,
  isMe,
  deliveryStage,
  overlay,
  colorOverride,
}: {
  inline?: boolean;
  message: ProjectedThreadMessage;
  isMe: boolean;
  deliveryStage?: DeliveryStage;
  overlay: boolean;
  colorOverride?: string;
}) {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  const color = overlay ? "#FFFFFF" : (colorOverride ?? theme.colors.timestamp);
  const lineHeight = metadataLineHeight(theme.typography.timestampFontSize);
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
          : (colorOverride ?? theme.colors.checkmark);

  return (
    <div
      data-cinematic-subject="message-footer"
      aria-label={isMe && deliveryStage ? t(`a11y.delivery.${deliveryStage}`) : undefined}
      style={{
        position: overlay || inline ? "absolute" : "relative",
        insetInlineEnd: overlay ? 6 : inline ? 0 : undefined,
        bottom: overlay ? 6 : inline ? 0 : undefined,
        alignSelf: "flex-end",
        flexShrink: 0,
        minHeight: lineHeight,
        height: overlay ? undefined : lineHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 3,
        padding: overlay ? "2px 5px" : undefined,
        borderRadius: overlay ? 6 : undefined,
        color,
        backgroundColor: overlay ? theme.colors.mediaScrim : undefined,
        fontSize: theme.typography.timestampFontSize,
        lineHeight: `${lineHeight}px`,
        fontFamily: theme.typography.fontFamily,
        letterSpacing: -0.08,
        whiteSpace: "nowrap",
      }}
    >
      {message.edited && <span>{t("message.edited")}</span>}
      {message.timestamp && <span>{message.timestamp}</span>}
      {message.starred && <span style={{ fontSize: 9 }}>★</span>}
      {isMe && deliveryStage && <DeliveryGlyph stage={deliveryStage} color={deliveryColor} />}
    </div>
  );
});

export const ReactionCluster = memo(function ReactionCluster({
  message,
  isMe,
}: {
  message: ProjectedThreadMessage;
  isMe: boolean;
}) {
  const theme = useTheme();
  const { locale } = useWhatsAppLocale();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!message.reactions?.length) return null;
  const total = message.reactions.reduce((sum, reaction) => sum + reaction.count, 0);
  const progress = message.reactionsChangedAt === undefined ? 1
    : Math.max(0, Math.min(1, (frame - message.reactionsChangedAt) / (fps * tokens.reactionSeconds)));
  const settle = 1 - (1 - progress) ** 3;

  return (
    <div
      data-cinematic-subject="reactions"
      role="status"
      aria-label={getReactionAccessibilityLabel(message, locale)}
      style={{
        position: "absolute",
        right: isMe ? tokens.reactionInset : undefined,
        left: isMe ? undefined : tokens.reactionInset,
        bottom: 0,
        height: tokens.reactionHeight,
        width: getReactionWidth(message.reactions),
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "2px 6px",
        border: `1px solid ${theme.colors.reactionBorder}`,
        borderRadius: tokens.reactionHeight / 2,
        color: theme.colors.receivedBubbleText,
        backgroundColor: theme.colors.reactionSurface,
        boxShadow: theme.colors.reactionShadow,
        fontSize: 15,
        lineHeight: "17px",
        fontFamily: theme.typography.fontFamily,
        zIndex: 2,
        opacity: settle,
        transform: `translateY(${(1 - settle) * 4}px) scale(${0.85 + settle * 0.15})`,
        transformOrigin: isMe ? "right top" : "left top",
      }}
    >
      {message.reactions.slice(0, 3).map((reaction) => (
        <span
          key={reaction.emoji}
          style={{
            display: "inline-block",
            width: 18,
            flexShrink: 0,
            textAlign: "center",
          }}
        >
          <span>{reaction.emoji}</span>
        </span>
      ))}
      {total > 1 && (
        <span style={{ marginInlineStart: 4, fontSize: 11, color: theme.colors.timestamp }}>
          {formatWhatsAppNumber(locale, total)}
        </span>
      )}
    </div>
  );
});

export function MetadataSlot({ children, edgeMedia }: { children: ReactNode; edgeMedia: boolean }) {
  return <div style={{ padding: edgeMedia ? "5px 7px 0" : undefined }}>{children}</div>;
}
