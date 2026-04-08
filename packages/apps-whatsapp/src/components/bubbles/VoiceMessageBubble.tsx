import React, { memo } from "react";
import { MediaBubbleBase, DoubleCheckIcon, formatDuration } from "./shared.js";
import { useTheme } from "../../theme/ThemeContext.js";
import { useCurrentFrame } from "remotion";
import { resolveDeliveryStage } from "../../utils/status.js";

export interface VoiceMessageBubbleProps {
  duration: number;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  isPlaying?: boolean;
  playProgress?: number;
  messageAt?: number;
  deliveredAt?: number;
  readAt?: number;
  status?: "sending" | "sent" | "delivered" | "read";
  starred?: boolean;
  platform?: string;
}

export const VoiceMessageBubble = memo(function VoiceMessageBubble({
  duration,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
  isPlaying = false,
  playProgress = 0,
  messageAt,
  deliveredAt,
  readAt,
  status,
  starred = false,
}: VoiceMessageBubbleProps) {
  const theme = useTheme();
  const currentFrame = useCurrentFrame();
  const waveformBars = Array.from({ length: 35 }, (_, i) => {
    const seed = (duration * 13 + i * 7) % 100;
    const baseHeight = 0.3 + 0.5 * Math.sin((i / 35) * Math.PI);
    const noise = (seed % 30) / 100;
    return Math.min(1, Math.max(0.15, baseHeight + noise));
  });

  const playedBars = Math.floor(playProgress * waveformBars.length);
  const playBtnBg = isMe ? theme.colors.accent : theme.colors.onlineStatus;
  const deliveryStage =
    isMe
      ? resolveDeliveryStage(
        {
          from: "me",
          at: messageAt,
          deliveredAt,
          readAt,
          status,
        },
        currentFrame,
      )
      : undefined;

  return (
    <MediaBubbleBase
      isMe={isMe}
      senderName={senderName}
      timestamp={timestamp}
      read={read}
      messageAt={messageAt}
      deliveredAt={deliveredAt}
      readAt={readAt}
      status={status}
      starred={starred}
      overlayTimestamp
      minWidth={160}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            backgroundColor: playBtnBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>

        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              height: 20,
            }}
          >
            {waveformBars.map((height, i) => (
              <div
                key={i}
                style={{
                  width: 2,
                  height: `${height * 100}%`,
                  backgroundColor:
                    i < playedBars
                      ? playBtnBg
                      : isMe
                        ? "rgba(18, 140, 126, 0.3)"
                        : "rgba(0, 168, 132, 0.3)",
                  borderRadius: 1,
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: theme.typography.timestampFontSize,
                color: theme.colors.timestamp,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {isPlaying
                ? formatDuration(Math.floor(playProgress * duration))
                : formatDuration(duration)}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill={playBtnBg}
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
              </svg>
              <span
                style={{
                  fontSize: theme.typography.timestampFontSize,
                  color: theme.colors.timestamp,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                {timestamp}
              </span>
              {starred && (
                <span style={{ color: theme.colors.timestamp, fontSize: 10 }}>★</span>
              )}
              {isMe && (
                <DoubleCheckIcon
                  stage={deliveryStage ?? (read ? "read" : "delivered")}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </MediaBubbleBase>
  );
});
