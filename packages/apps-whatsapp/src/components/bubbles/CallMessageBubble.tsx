import React, { memo } from "react";
import { useTheme } from "../../theme/ThemeContext.js";
import { PhoneCallIcon, VideoCallIcon } from "../Icons.js";
import { formatDuration } from "./shared.js";

type CallType = "voice" | "video";

export interface CallMessageBubbleProps {
  callType?: CallType;
  duration?: number;
  missed?: boolean;
  isMe?: boolean;
}

function formatCallDuration(duration?: number): string | undefined {
  if (typeof duration !== "number") return undefined;
  if (duration < 60) return `${duration} sec`;
  return formatDuration(duration);
}

export const CallMessageBubble = memo(function CallMessageBubble({
  callType = "voice",
  duration,
  missed = false,
  isMe = false,
}: CallMessageBubbleProps) {
  const theme = useTheme();
  const label =
    callType === "video"
      ? missed
        ? "Missed video call"
        : "Video call"
      : missed
        ? "Missed voice call"
        : "Voice call";
  const subtext =
    missed
      ? "Tap to call back"
      : formatCallDuration(duration) ?? "Call ended";

  const iconColor = missed ? theme.colors.callCardMissed : theme.colors.callCardIcon;
  const iconBg = isMe
    ? theme.colors.callCardIconBgOutgoing
    : theme.colors.callCardIconBgIncoming;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div style={{ transform: "scale(0.85)" }}>
          {callType === "video" ? (
            <VideoCallIcon color={iconColor} />
          ) : (
            <PhoneCallIcon color={iconColor} />
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontSize: Math.max(15, theme.typography.messageFontSize - 1),
            fontWeight: 600,
            color: isMe
              ? theme.colors.sentBubbleText
              : theme.colors.receivedBubbleText,
            fontFamily: theme.typography.fontFamily,
            lineHeight: "18px",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: theme.typography.timestampFontSize + 2,
            color: theme.colors.callCardSubtext,
            fontFamily: theme.typography.fontFamily,
            lineHeight: "16px",
          }}
        >
          {subtext}
        </span>
      </div>
    </div>
  );
});

export default CallMessageBubble;
