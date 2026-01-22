/**
 * Media Message Bubbles
 *
 * High-fidelity WhatsApp iOS-style media bubbles:
 * - ImageMessageBubble
 * - VideoMessageBubble
 * - GifMessageBubble
 * - VoiceMessageBubble
 *
 * NOTE: Uses 1x logical pixels (matches iOS components)
 */

import React from "react";
import { Platform } from "@tokovo/core";

// =============================================================================
// SHARED CONSTANTS
// =============================================================================

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const WA_GREEN = "#25D366";
const WA_TEAL = "#128C7E";
const WA_READ_BLUE = "#53BDEB";
const WA_GRAY = "#8696A0";

// iOS logical pixel values
const BUBBLE_RADIUS = 18;
const BUBBLE_TAIL_RADIUS = 4;
const BUBBLE_PADDING = 6;
const BUBBLE_PADDING_H = 8;
const TIMESTAMP_SIZE = 11;
const SENDER_NAME_SIZE = 13;
const MESSAGE_TEXT_SIZE = 16;

// Colors
const BUBBLE_MY_COLOR = "#DCF8C6";
const BUBBLE_OTHER_COLOR = "#FFFFFF";
const BUBBLE_SHADOW = "0 1px 0.5px rgba(0,0,0,0.13)";

// =============================================================================
// IMAGE MESSAGE BUBBLE
// =============================================================================

interface ImageMessageBubbleProps {
  imageUrl: string;
  caption?: string;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  platform?: Platform;
}

export const ImageMessageBubble: React.FC<ImageMessageBubbleProps> = ({
  imageUrl,
  caption,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
}) => {
  return (
    <div
      style={{
        backgroundColor: isMe ? BUBBLE_MY_COLOR : BUBBLE_OTHER_COLOR,
        borderRadius: BUBBLE_RADIUS,
        borderTopLeftRadius: isMe ? BUBBLE_RADIUS : BUBBLE_TAIL_RADIUS,
        borderTopRightRadius: isMe ? BUBBLE_TAIL_RADIUS : BUBBLE_RADIUS,
        boxShadow: BUBBLE_SHADOW,
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Sender Name (Group Chat) */}
      {senderName && !isMe && (
        <div
          style={{
            padding: `${BUBBLE_PADDING_H}px ${BUBBLE_PADDING_H}px 2px`,
          }}
        >
          <span
            style={{
              fontSize: SENDER_NAME_SIZE,
              fontWeight: 600,
              color: WA_TEAL,
              fontFamily: FONT_FAMILY,
            }}
          >
            {senderName}
          </span>
        </div>
      )}

      {/* Image container */}
      <div
        style={{
          position: "relative",
          borderTopLeftRadius: senderName ? 0 : BUBBLE_RADIUS,
          borderTopRightRadius: senderName ? 0 : BUBBLE_RADIUS,
          borderBottomLeftRadius: caption ? 0 : BUBBLE_RADIUS,
          borderBottomRightRadius: caption ? 0 : BUBBLE_RADIUS,
          overflow: "hidden",
        }}
      >
        <img
          src={imageUrl}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: 200,
            objectFit: "cover",
            display: "block",
          }}
          alt=""
        />

        {/* Timestamp overlay on image (when no caption) */}
        {!caption && (
          <div
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              display: "flex",
              alignItems: "center",
              gap: 3,
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: "2px 4px",
              borderRadius: 4,
            }}
          >
            <span
              style={{
                fontSize: TIMESTAMP_SIZE,
                color: "#FFFFFF",
                fontFamily: FONT_FAMILY,
              }}
            >
              {timestamp}
            </span>
            {isMe && <DoubleCheckIcon read={read} light />}
          </div>
        )}
      </div>

      {/* Caption if present */}
      {caption && (
        <div
          style={{
            padding: `${BUBBLE_PADDING}px ${BUBBLE_PADDING_H}px`,
          }}
        >
          <span
            style={{
              fontSize: MESSAGE_TEXT_SIZE,
              lineHeight: 1.3,
              color: "#000000",
              fontFamily: FONT_FAMILY,
            }}
          >
            {caption}
          </span>

          {/* Timestamp + Read receipts */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 3,
              marginTop: 2,
            }}
          >
            <span
              style={{
                fontSize: TIMESTAMP_SIZE,
                color: WA_GRAY,
                fontFamily: FONT_FAMILY,
              }}
            >
              {timestamp}
            </span>
            {isMe && <DoubleCheckIcon read={read} />}
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// VIDEO MESSAGE BUBBLE
// =============================================================================

interface VideoMessageBubbleProps {
  thumbnailUrl: string;
  duration: number; // in seconds
  caption?: string;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  isPlaying?: boolean;
  playProgress?: number;
  platform?: Platform;
}

export const VideoMessageBubble: React.FC<VideoMessageBubbleProps> = ({
  thumbnailUrl,
  duration,
  caption,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
  isPlaying = false,
  playProgress = 0,
}) => {
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        backgroundColor: isMe ? BUBBLE_MY_COLOR : BUBBLE_OTHER_COLOR,
        borderRadius: BUBBLE_RADIUS,
        borderTopLeftRadius: isMe ? BUBBLE_RADIUS : BUBBLE_TAIL_RADIUS,
        borderTopRightRadius: isMe ? BUBBLE_TAIL_RADIUS : BUBBLE_RADIUS,
        boxShadow: BUBBLE_SHADOW,
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Sender Name */}
      {senderName && !isMe && (
        <div
          style={{
            padding: `${BUBBLE_PADDING_H}px ${BUBBLE_PADDING_H}px 2px`,
          }}
        >
          <span
            style={{
              fontSize: SENDER_NAME_SIZE,
              fontWeight: 600,
              color: WA_TEAL,
              fontFamily: FONT_FAMILY,
            }}
          >
            {senderName}
          </span>
        </div>
      )}

      {/* Video thumbnail container */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderTopLeftRadius: senderName ? 0 : BUBBLE_RADIUS,
          borderTopRightRadius: senderName ? 0 : BUBBLE_RADIUS,
        }}
      >
        <img
          src={thumbnailUrl}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: 200,
            objectFit: "cover",
            display: "block",
          }}
          alt=""
        />

        {/* Play button overlay */}
        {!isPlaying && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 40,
              height: 40,
              backgroundColor: "rgba(0,0,0,0.6)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}

        {/* Duration badge */}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            left: 4,
            display: "flex",
            alignItems: "center",
            gap: 3,
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "2px 4px",
            borderRadius: 4,
          }}
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.69l-8.14-5.17A.998.998 0 0 0 8 6.82z" />
          </svg>
          <span
            style={{
              fontSize: TIMESTAMP_SIZE,
              color: "#FFFFFF",
              fontFamily: FONT_FAMILY,
            }}
          >
            {formatDuration(duration)}
          </span>
        </div>

        {/* Timestamp overlay (when no caption) */}
        {!caption && (
          <div
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              display: "flex",
              alignItems: "center",
              gap: 3,
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: "2px 4px",
              borderRadius: 4,
            }}
          >
            <span
              style={{
                fontSize: TIMESTAMP_SIZE,
                color: "#FFFFFF",
                fontFamily: FONT_FAMILY,
              }}
            >
              {timestamp}
            </span>
            {isMe && <DoubleCheckIcon read={read} light />}
          </div>
        )}

        {/* Progress bar during playback */}
        {isPlaying && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(playProgress / duration) * 100}%`,
                backgroundColor: WA_GREEN,
              }}
            />
          </div>
        )}
      </div>

      {/* Caption if present */}
      {caption && (
        <div
          style={{
            padding: `${BUBBLE_PADDING}px ${BUBBLE_PADDING_H}px`,
          }}
        >
          <span
            style={{
              fontSize: MESSAGE_TEXT_SIZE,
              lineHeight: 1.3,
              color: "#000000",
              fontFamily: FONT_FAMILY,
            }}
          >
            {caption}
          </span>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 3,
              marginTop: 2,
            }}
          >
            <span
              style={{
                fontSize: TIMESTAMP_SIZE,
                color: WA_GRAY,
                fontFamily: FONT_FAMILY,
              }}
            >
              {timestamp}
            </span>
            {isMe && <DoubleCheckIcon read={read} />}
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// GIF MESSAGE BUBBLE
// =============================================================================

interface GifMessageBubbleProps {
  gifUrl: string;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  platform?: Platform;
}

export const GifMessageBubble: React.FC<GifMessageBubbleProps> = ({
  gifUrl,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
}) => {
  return (
    <div
      style={{
        backgroundColor: isMe ? BUBBLE_MY_COLOR : BUBBLE_OTHER_COLOR,
        borderRadius: BUBBLE_RADIUS,
        borderTopLeftRadius: isMe ? BUBBLE_RADIUS : BUBBLE_TAIL_RADIUS,
        borderTopRightRadius: isMe ? BUBBLE_TAIL_RADIUS : BUBBLE_RADIUS,
        boxShadow: BUBBLE_SHADOW,
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Sender Name */}
      {senderName && !isMe && (
        <div
          style={{
            padding: `${BUBBLE_PADDING_H}px ${BUBBLE_PADDING_H}px 2px`,
          }}
        >
          <span
            style={{
              fontSize: SENDER_NAME_SIZE,
              fontWeight: 600,
              color: WA_TEAL,
              fontFamily: FONT_FAMILY,
            }}
          >
            {senderName}
          </span>
        </div>
      )}

      {/* GIF container */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderTopLeftRadius: senderName ? 0 : BUBBLE_RADIUS,
          borderTopRightRadius: senderName ? 0 : BUBBLE_RADIUS,
        }}
      >
        <img
          src={gifUrl}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: 170,
            objectFit: "cover",
            display: "block",
          }}
          alt=""
        />

        {/* GIF badge */}
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "1px 4px",
            borderRadius: 3,
          }}
        >
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: "#FFFFFF",
              fontFamily: FONT_FAMILY,
              letterSpacing: 0.3,
            }}
          >
            GIF
          </span>
        </div>

        {/* Timestamp overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            display: "flex",
            alignItems: "center",
            gap: 3,
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "2px 4px",
            borderRadius: 4,
          }}
        >
          <span
            style={{
              fontSize: TIMESTAMP_SIZE,
              color: "#FFFFFF",
              fontFamily: FONT_FAMILY,
            }}
          >
            {timestamp}
          </span>
          {isMe && <DoubleCheckIcon read={read} light />}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// VOICE MESSAGE BUBBLE
// =============================================================================

interface VoiceMessageBubbleProps {
  duration: number; // in seconds
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  isPlaying?: boolean;
  playProgress?: number; // 0-1
  platform?: Platform;
}

export const VoiceMessageBubble: React.FC<VoiceMessageBubbleProps> = ({
  duration,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
  isPlaying = false,
  playProgress = 0,
}) => {
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${String(s).padStart(2, "0")}`;
  };

  // Generate waveform bars (deterministic based on duration)
  const waveformBars = Array.from({ length: 35 }, (_, i) => {
    const seed = (duration * 13 + i * 7) % 100;
    const baseHeight = 0.3 + 0.5 * Math.sin((i / 35) * Math.PI);
    const noise = (seed % 30) / 100;
    return Math.min(1, Math.max(0.15, baseHeight + noise));
  });

  const playedBars = Math.floor(playProgress * waveformBars.length);

  return (
    <div
      style={{
        backgroundColor: isMe ? BUBBLE_MY_COLOR : BUBBLE_OTHER_COLOR,
        borderRadius: BUBBLE_RADIUS,
        borderTopLeftRadius: isMe ? BUBBLE_RADIUS : BUBBLE_TAIL_RADIUS,
        borderTopRightRadius: isMe ? BUBBLE_TAIL_RADIUS : BUBBLE_RADIUS,
        boxShadow: BUBBLE_SHADOW,
        padding: BUBBLE_PADDING_H,
        minWidth: 160,
      }}
    >
      {/* Sender Name */}
      {senderName && !isMe && (
        <div style={{ marginBottom: 3 }}>
          <span
            style={{
              fontSize: SENDER_NAME_SIZE,
              fontWeight: 600,
              color: WA_TEAL,
              fontFamily: FONT_FAMILY,
            }}
          >
            {senderName}
          </span>
        </div>
      )}

      {/* Voice message content */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {/* Play/Pause button */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            backgroundColor: isMe ? WA_TEAL : WA_GREEN,
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

        {/* Waveform visualization */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Waveform bars */}
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
                      ? isMe
                        ? WA_TEAL
                        : WA_GREEN
                      : isMe
                        ? "rgba(18, 140, 126, 0.3)"
                        : "rgba(0, 168, 132, 0.3)",
                  borderRadius: 1,
                  transition: "background-color 0.1s",
                }}
              />
            ))}
          </div>

          {/* Duration + Timestamp */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: TIMESTAMP_SIZE,
                color: WA_GRAY,
                fontFamily: FONT_FAMILY,
              }}
            >
              {isPlaying
                ? formatDuration(Math.floor(playProgress * duration))
                : formatDuration(duration)}
            </span>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {/* Microphone icon */}
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill={isMe ? WA_TEAL : WA_GREEN}
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
              </svg>

              <span
                style={{
                  fontSize: TIMESTAMP_SIZE,
                  color: WA_GRAY,
                  fontFamily: FONT_FAMILY,
                }}
              >
                {timestamp}
              </span>
              {isMe && <DoubleCheckIcon read={read} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// SHARED: Double Check Icon for read receipts
// =============================================================================

const DoubleCheckIcon: React.FC<{ read?: boolean; light?: boolean }> = ({
  read = false,
  light = false,
}) => (
  <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
    <path
      d="M1 5L4 8L10 2"
      stroke={read ? WA_READ_BLUE : light ? "#FFFFFF" : WA_GRAY}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 5L8 8L14 2"
      stroke={read ? WA_READ_BLUE : light ? "#FFFFFF" : WA_GRAY}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
