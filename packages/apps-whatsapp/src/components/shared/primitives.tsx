import React from "react";
import { Img, staticFile } from "remotion";
import { useTheme } from "../../theme/ThemeContext";

interface MessageBubbleProps {
  isMe: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  showTail?: boolean;
}

export const MessageBubble = React.memo(function MessageBubble({
  isMe,
  children,
  style,
  showTail = true,
}: MessageBubbleProps): React.ReactElement {
  const theme = useTheme();

  const bubbleStyle: React.CSSProperties = {
    backgroundColor: isMe
      ? theme.colors.sentBubble
      : theme.colors.receivedBubble,
    color: isMe ? theme.colors.sentBubbleText : theme.colors.receivedBubbleText,
    borderRadius: theme.spacing.bubbleRadius,
    padding: `${theme.spacing.messagePaddingVertical}px ${theme.spacing.messagePaddingHorizontal}px`,
    maxWidth: "85%",
    wordWrap: "break-word",
    position: "relative",
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.messageFontSize,
    lineHeight: `${theme.typography.messageLineHeight}px`,
    ...style,
  };

  if (showTail) {
    bubbleStyle.borderBottomRightRadius = isMe
      ? theme.spacing.bubbleRadiusTail
      : theme.spacing.bubbleRadius;
    bubbleStyle.borderBottomLeftRadius = isMe
      ? theme.spacing.bubbleRadius
      : theme.spacing.bubbleRadiusTail;
  }

  return <div style={bubbleStyle}>{children}</div>;
});

interface MessageTextProps {
  text: string;
  style?: React.CSSProperties;
}

export const MessageText = React.memo(function MessageText({
  text,
  style,
}: MessageTextProps): React.ReactElement {
  const theme = useTheme();

  return (
    <span
      style={{
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.messageFontSize,
        lineHeight: `${theme.typography.messageLineHeight}px`,
        whiteSpace: "pre-wrap",
        ...style,
      }}
    >
      {text}
    </span>
  );
});

interface TimestampProps {
  time: string;
  isMe?: boolean;
  showCheckmarks?: boolean;
  status?: "sending" | "sent" | "delivered" | "read";
  style?: React.CSSProperties;
}

export const Timestamp = React.memo(function Timestamp({
  time,
  isMe = false,
  showCheckmarks = true,
  status = "sent",
  style,
}: TimestampProps): React.ReactElement {
  const theme = useTheme();

  const checkmarkColor =
    status === "read" ? theme.colors.checkmarkRead : theme.colors.checkmark;

  return (
    <span
      style={{
        fontSize: theme.typography.timestampFontSize,
        color: theme.colors.timestamp,
        marginLeft: 4,
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        ...style,
      }}
    >
      {time}
      {isMe && showCheckmarks && (
        <span style={{ color: checkmarkColor, marginLeft: 2 }}>
          {status === "sending" ? "○" : status === "sent" ? "✓" : "✓✓"}
        </span>
      )}
    </span>
  );
});

interface AvatarProps {
  src?: string;
  name?: string;
  size?: "small" | "medium" | "large";
  style?: React.CSSProperties;
}

export const Avatar = React.memo(function Avatar({
  src,
  name = "",
  size = "medium",
  style,
}: AvatarProps): React.ReactElement {
  const theme = useTheme();

  const sizeMap = {
    small: theme.spacing.avatarSizeSmall,
    medium: theme.spacing.avatarSize,
    large: 64,
  };

  const pixelSize = sizeMap[size];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatarStyle: React.CSSProperties = {
    width: pixelSize,
    height: pixelSize,
    borderRadius: "50%",
    backgroundColor: theme.colors.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.colors.unreadBadgeText,
    fontFamily: theme.typography.fontFamily,
    fontSize: pixelSize * 0.4,
    fontWeight: 600,
    overflow: "hidden",
    ...style,
  };

  if (src) {
    const resolvedSrc = src.startsWith("/") ? staticFile(src) : src;
    return (
      <div style={avatarStyle}>
        <Img
          src={resolvedSrc}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  return <div style={avatarStyle}>{initials}</div>;
});

interface SystemMessageProps {
  text: string;
  style?: React.CSSProperties;
}

export const SystemMessage = React.memo(function SystemMessage({
  text,
  style,
}: SystemMessageProps): React.ReactElement {
  const theme = useTheme();
  const paddingY = Math.max(4, theme.spacing.messagePaddingVertical - 2);
  const paddingX = Math.max(12, theme.spacing.messagePaddingHorizontal);
  const radius = Math.max(10, theme.spacing.bubbleRadius - 8);

  return (
    <div
      style={{
        backgroundColor: theme.colors.systemMessageBg,
        borderRadius: radius,
        padding: `${paddingY}px ${paddingX}px`,
        border: `0.5px solid ${theme.colors.systemMessageBorder}`,
        fontSize: theme.typography.systemMessageFontSize,
        color: theme.colors.systemMessage,
        textAlign: "center",
        margin: `${Math.max(8, theme.spacing.sectionGap - 6)}px auto`,
        maxWidth: "80%",
        fontFamily: theme.typography.fontFamily,
        boxShadow: theme.colors.systemMessageShadow,
        ...style,
      }}
    >
      {text}
    </div>
  );
});

interface UnreadBadgeProps {
  count: number;
  style?: React.CSSProperties;
}

export const UnreadBadge = React.memo(function UnreadBadge({
  count,
  style,
}: UnreadBadgeProps): React.ReactElement | null {
  const theme = useTheme();

  if (count <= 0) return null;

  const displayCount = count > 99 ? "99+" : count.toString();

  return (
    <div
      style={{
        backgroundColor: theme.colors.unreadBadge,
        color: theme.colors.unreadBadgeText,
        borderRadius: 12,
        minWidth: 20,
        height: 20,
        padding: "0 6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 600,
        fontFamily: theme.typography.fontFamily,
        ...style,
      }}
    >
      {displayCount}
    </div>
  );
});
