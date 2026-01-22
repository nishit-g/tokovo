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
// STICKER MESSAGE BUBBLE
// =============================================================================

interface StickerMessageBubbleProps {
  stickerUrl: string;
  isMe: boolean;
  timestamp?: string;
  read?: boolean;
}

export const StickerMessageBubble: React.FC<StickerMessageBubbleProps> = ({
  stickerUrl,
  isMe,
  timestamp = "10:42",
  read = false,
}) => {
  return (
    <div
      style={{
        position: "relative",
        width: 136,
        height: 136,
        // No background, no shadow, no border radius needed on container
      }}
    >
      <img
        src={stickerUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          // Add a subtle drop shadow to lift sticker off wallpaper
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))",
        }}
        alt="Sticker"
      />

      {/* Timestamp overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 4,
          right: 4,
          display: "flex",
          alignItems: "center",
          gap: 3,
          backgroundColor: "rgba(0,0,0,0.3)", // Lighter background for sticker overlay
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
// DOCUMENT MESSAGE BUBBLE
// =============================================================================

interface DocumentMessageBubbleProps {
  fileName: string;
  fileSize: string;
  fileType?: string;
  pageCount?: number;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  platform?: Platform;
}

export const DocumentMessageBubble: React.FC<DocumentMessageBubbleProps> = ({
  fileName,
  fileSize,
  fileType = "pdf",
  pageCount,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
}) => {
  const getIconColor = () => {
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return "#F40F02";
    if (type.includes("xls") || type.includes("sheet")) return "#1D6F42";
    if (type.includes("doc") || type.includes("word")) return "#2B579A";
    if (type.includes("ppt") || type.includes("slide")) return "#D24726";
    return WA_GRAY;
  };

  const iconColor = getIconColor();

  return (
    <div
      style={{
        backgroundColor: isMe ? BUBBLE_MY_COLOR : BUBBLE_OTHER_COLOR,
        borderRadius: BUBBLE_RADIUS,
        borderTopLeftRadius: isMe ? BUBBLE_RADIUS : BUBBLE_TAIL_RADIUS,
        borderTopRightRadius: isMe ? BUBBLE_TAIL_RADIUS : BUBBLE_RADIUS,
        boxShadow: BUBBLE_SHADOW,
        padding: BUBBLE_PADDING_H,
        minWidth: 200,
        maxWidth: 280,
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

      {/* Document Content */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "6px 0",
        }}
      >
        {/* Document Icon (Left) */}
        <div
          style={{
            position: "relative",
            width: 34,
            height: 40,
            flexShrink: 0,
          }}
        >
          {/* File Icon SVG */}
          <svg width="34" height="40" viewBox="0 0 34 40" fill="none">
            <path
              d="M4 0H20L34 14V36C34 38.2 32.2 40 30 40H4C1.8 40 0 38.2 0 36V4C0 1.8 1.8 0 4 0Z"
              fill={iconColor}
              fillOpacity="0.15"
            />
            <path d="M20 0V14H34" fill={iconColor} fillOpacity="0.3" />
            <text
              x="50%"
              y="65%"
              textAnchor="middle"
              fill={iconColor}
              fontSize="10"
              fontWeight="bold"
              fontFamily={FONT_FAMILY}
              style={{ textTransform: "uppercase" }}
            >
              {fileType.slice(0, 3)}
            </text>
          </svg>
        </div>

        {/* File Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: MESSAGE_TEXT_SIZE,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.3,
            }}
          >
            {fileName}
          </div>
          <div
            style={{
              fontSize: 13,
              color: WA_GRAY,
              fontFamily: FONT_FAMILY,
              marginTop: 1,
            }}
          >
            {pageCount ? `${pageCount} pages • ` : ""}
            {fileSize} • {fileType.toUpperCase()}
          </div>
        </div>

        {/* Download Icon (Right) */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `1px solid ${WA_GRAY}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={WA_GRAY}>
            <path d="M12 16L7 11L8.4 9.55L11 12.15V4H13V12.15L15.6 9.55L17 11L12 16ZM6 20V18H18V20H6Z" />
          </svg>
        </div>
      </div>

      {/* Timestamp Row */}
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

// =============================================================================
// CONTACT MESSAGE BUBBLE
// =============================================================================

interface ContactMessageBubbleProps {
  contactName: string;
  contactPhone?: string;
  contactAvatarUrl?: string;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  platform?: Platform;
}

export const ContactMessageBubble: React.FC<ContactMessageBubbleProps> = ({
  contactName,
  contactPhone,
  contactAvatarUrl,
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
        minWidth: 200,
        maxWidth: 280,
      }}
    >
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: BUBBLE_PADDING_H,
        }}
      >
        {contactAvatarUrl ? (
          <img
            src={contactAvatarUrl}
            alt=""
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: "#DFE5E7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#8696A0">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: MESSAGE_TEXT_SIZE,
              fontWeight: 500,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {contactName}
          </div>
          {contactPhone && (
            <div
              style={{
                fontSize: 13,
                color: WA_GRAY,
                fontFamily: FONT_FAMILY,
                marginTop: 2,
              }}
            >
              {contactPhone}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.08)",
          padding: `${BUBBLE_PADDING}px ${BUBBLE_PADDING_H}px`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: WA_TEAL,
            fontWeight: 500,
            fontFamily: FONT_FAMILY,
          }}
        >
          Message
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
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
    </div>
  );
};

// =============================================================================
// LOCATION MESSAGE BUBBLE
// =============================================================================

interface LocationMessageBubbleProps {
  latitude: number;
  longitude: number;
  locationName?: string;
  locationAddress?: string;
  mapThumbnailUrl?: string;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
}

export const LocationMessageBubble: React.FC<LocationMessageBubbleProps> = ({
  locationName,
  locationAddress,
  mapThumbnailUrl,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
}) => {
  const defaultMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=0,0&zoom=15&size=300x150&maptype=roadmap&key=DEMO`;

  return (
    <div
      style={{
        backgroundColor: isMe ? BUBBLE_MY_COLOR : BUBBLE_OTHER_COLOR,
        borderRadius: BUBBLE_RADIUS,
        borderTopLeftRadius: isMe ? BUBBLE_RADIUS : BUBBLE_TAIL_RADIUS,
        borderTopRightRadius: isMe ? BUBBLE_TAIL_RADIUS : BUBBLE_RADIUS,
        boxShadow: BUBBLE_SHADOW,
        overflow: "hidden",
        minWidth: 240,
        maxWidth: 300,
      }}
    >
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

      <div
        style={{
          width: "100%",
          height: 140,
          backgroundColor: "#E8E8E8",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {mapThumbnailUrl ? (
          <img
            src={mapThumbnailUrl}
            alt="Map"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#D4E4D4",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill={WA_TEAL}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -100%)",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#EA4335">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
      </div>

      <div
        style={{
          padding: BUBBLE_PADDING_H,
        }}
      >
        {locationName && (
          <div
            style={{
              fontSize: MESSAGE_TEXT_SIZE,
              fontWeight: 500,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              marginBottom: 2,
            }}
          >
            {locationName}
          </div>
        )}

        {locationAddress && (
          <div
            style={{
              fontSize: 13,
              color: WA_GRAY,
              fontFamily: FONT_FAMILY,
              marginBottom: 4,
            }}
          >
            {locationAddress}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 3,
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
    </div>
  );
};
