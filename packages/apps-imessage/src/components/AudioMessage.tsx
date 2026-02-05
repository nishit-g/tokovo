/**
 * Audio Message Component - Voice memo with waveform visualization
 * Uses iMessage design tokens for spacing/typography and iOS_COLORS for colors
 */

import React, { useState } from "react";
import { useIMessageTheme } from "../ui/ThemeContext";
import { iMessageSpacing, iMessageTypography } from "../config/tokens";
import { iOS_COLORS } from "../config/colors";
import type { VoiceAttachment } from "../types";

interface AudioMessageProps {
    attachment: VoiceAttachment;
    fromMe?: boolean;
}

export const AudioMessage: React.FC<AudioMessageProps> = ({ attachment, fromMe }) => {
    const theme = useIMessageTheme();
    const { colors } = theme;
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Generate default waveform if not provided
    const waveform = attachment.waveform || Array.from({ length: 40 }, () => 0.2 + Math.random() * 0.8);

    // Color derivations
    const playButtonBg = fromMe ? colors.bubble.iMessage : iOS_COLORS.blue;
    const waveActiveColor = fromMe ? iOS_COLORS.textWhite : iOS_COLORS.blue;
    const waveInactiveColor = fromMe ? iOS_COLORS.grayLight : iOS_COLORS.grayUltraLight;

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: iMessageSpacing.inputIconGap,
                padding: `${iMessageSpacing.bubblePaddingV}px ${iMessageSpacing.bubblePaddingH}px`,
                minWidth: 200,
            }}
        >
            {/* Play button */}
            <div
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
                }}
                onClick={() => setIsPlaying(!isPlaying)}
            >
                {isPlaying ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill={iOS_COLORS.textWhite}>
                        <rect x="2" y="1" width="4" height="12" rx="1" />
                        <rect x="8" y="1" width="4" height="12" rx="1" />
                    </svg>
                ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill={iOS_COLORS.textWhite}>
                        <path d="M2.5 1.5L12.5 7L2.5 12.5V1.5Z" />
                    </svg>
                )}
            </div>

            {/* Waveform visualization */}
            <div
                style={{
                    flex: 1,
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
                                width: iMessageSpacing.messageGapMinimal + 0.5,
                                height: `${amplitude * 100}%`,
                                minHeight: iMessageSpacing.unit,
                                backgroundColor: isPlayed ? waveActiveColor : waveInactiveColor,
                                borderRadius: 1,
                                transition: "height 0.1s ease",
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
                    color: fromMe ? iOS_COLORS.grayLight : colors.bubble.timestamp,
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
