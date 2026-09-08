/**
 * Audio Message Component - Voice memo with waveform visualization
 * Uses iMessage design tokens for spacing/typography and iOS_COLORS for colors
 */

import React from "react";
import { useIMessageTheme } from "../ui/ThemeContext.js";
import { iMessageSpacing, iMessageTypography } from "../config/tokens.js";
import { iOS_COLORS } from "../config/colors.js";
import type { VoiceAttachment } from "../types/index.js";

interface AudioMessageProps {
  attachment: VoiceAttachment;
  fromMe?: boolean;
}

export const AudioMessage: React.FC<AudioMessageProps> = ({ attachment, fromMe }) => {
  const theme = useIMessageTheme();
  const { colors } = theme;
  const progress = attachment.played ? 1 : 0;

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate deterministic fallback waveform if not provided
  const seed = Math.max(1, Math.floor(attachment.duration * 100));
  const waveform =
    attachment.waveform ||
    Array.from({ length: 40 }, (_, i) => {
      const x = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453123;
      const unit = x - Math.floor(x);
      return 0.2 + unit * 0.8;
    });

  // Color derivations
  const playButtonBg = fromMe ? "rgba(255,255,255,0.18)" : iOS_COLORS.blue;
  const waveActiveColor = fromMe ? iOS_COLORS.textWhite : iOS_COLORS.blue;
  const waveInactiveColor = fromMe ? "rgba(255,255,255,0.7)" : colors.system.timestamp;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: iMessageSpacing.inputIconGap,
        padding: `${iMessageSpacing.bubblePaddingV}px ${iMessageSpacing.bubblePaddingH}px`,
        width: 270,
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        background: fromMe ? undefined : colors.bubble.received,
      }}
    >
      {/* Play button */}
      <button
        type="button"
        aria-label="Play audio message"
        style={{
          width: iMessageSpacing.tapbackSize + 6,
          height: iMessageSpacing.tapbackSize + 6,
          borderRadius: "50%",
          backgroundColor: playButtonBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          border: 0,
          padding: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill={iOS_COLORS.textWhite}>
          <path d="M2.5 1.5L12.5 7L2.5 12.5V1.5Z" />
        </svg>
      </button>

      {/* Waveform visualization */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: iMessageSpacing.messageGapMinimal,
          height: iMessageSpacing.tapbackSize,
        }}
      >
        {waveform.map((amplitude, i) => {
          const isPlayed = i / waveform.length < progress;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${Math.max(0, Math.min(1, amplitude)) * 100}%`,
                minHeight: iMessageSpacing.unit,
                backgroundColor: isPlayed ? waveActiveColor : waveInactiveColor,
                borderRadius: 1,
              }}
            />
          );
        })}
      </div>

      {/* Duration */}
      <div
        style={{
          fontFamily: iMessageTypography.fontFamily,
          fontSize: iMessageTypography.caption.fontSize,
          color: fromMe ? iOS_COLORS.textWhite : colors.bubble.timestamp,
          minWidth: iMessageSpacing.tapbackSize + 5,
          textAlign: "right",
        }}
      >
        {formatDuration(attachment.duration)}
      </div>
    </div>
  );
};

export default AudioMessage;
