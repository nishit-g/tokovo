import React from "react";
import { Platform, getAppConfig } from "@tokovo/core";
import { PlayIcon, PauseIcon, DoubleCheckIcon } from "./icons";

interface VoiceMessageBubbleProps {
    isMe: boolean;
    duration: number;
    isPlaying?: boolean;
    progress?: number;
    timestamp?: string;
    read?: boolean;
    platform?: Platform;
}

export const VoiceMessageBubble: React.FC<VoiceMessageBubbleProps> = ({
    isMe,
    duration,
    isPlaying = false,
    progress = 0,
    timestamp,
    read,
    platform = "ios"
}) => {
    const config = getAppConfig("whatsapp", platform) as any;
    // Fallbacks if config is missing specific voice note colors
    const playBtnColor = isMe ? (config.voiceNotePlayButtonMyColor || "#FFFFFF") : (config.voiceNotePlayButtonOtherColor || "#25D366");
    const playIconColor = isMe ? (config.voiceNotePlayIconMyColor || "#25D366") : (config.voiceNotePlayIconOtherColor || "#FFFFFF");

    // Improved Waveform simulation
    // We use a fixed seed-like approach based on duration to make it deterministic but random-looking
    const bars = 45;
    const wave = React.useMemo(() => {
        const result = [];
        for (let i = 0; i < bars; i++) {
             // Generate "random" heights based on sine waves to look like audio
             const x = i / bars * Math.PI * 4; // 2 cycles
             // Add some noise
             const noise = Math.sin(x * 3.5 + duration) * 0.3;
             const base = Math.abs(Math.sin(x)) * 0.5 + 0.3;
             let val = base + noise;
             // Clamp
             val = Math.max(0.2, Math.min(1.0, val));
             result.push(val);
        }
        return result;
    }, [duration]);

    const formatDuration = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: isMe ? "flex-end" : "flex-start",
            // Padding removed here, handled by MessageList container positioning
        }}>
            <div style={{
                backgroundColor: isMe ? config.bubbleMyColor : config.bubbleOtherColor,
                padding: `${config.bubblePadding}px ${config.bubblePaddingHorizontal}px`,
                borderRadius: config.bubbleRadius,
                borderTopLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
                borderTopRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
                boxShadow: config.bubbleShadow,
                display: "flex",
                alignItems: "center",
                gap: 18,
                minWidth: 450,
                position: "relative"
            }}>
                {/* Avatar if group/other (optional, depends on design) - omitted for standard DM */}

                {/* Play/Pause Button */}
                <div style={{
                    width: 54,
                    height: 54,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#95A0A6", // Default grey-ish
                    borderRadius: "50%"
                }}>
                    {isPlaying ?
                        <PauseIcon /> :
                        <PlayIcon />
                    }
                </div>

                {/* Waveform */}
                <div style={{
                    flex: 1,
                    height: 54,
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    opacity: 0.8
                }}>
                    {wave.map((h, i) => {
                        const isPlayed = (i / bars) < (progress / duration);
                        return (
                            <div key={i} style={{
                                width: 4,
                                height: `${h * 100}%`,
                                backgroundColor: isPlayed ? (isMe ? "#53BDEB" : "#53BDEB") : (isMe ? "#8FA683" : "#B0B0B0"), // Active vs Inactive colors
                                borderRadius: 2,
                                transition: "background-color 0.2s"
                            }} />
                        );
                    })}
                </div>

                {/* Progress Head (Scrubber) */}
                {/* This would be complex to render absolutely correctly over the bars, skipping for now */}

                {/* Duration */}
                <div style={{
                    position: "absolute",
                    bottom: 12,
                    left: 90, // Align with waveform start
                    fontSize: config.timestampSize,
                    color: config.timestampColor,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                }}>
                    {formatDuration(duration)}
                </div>

                {/* Timestamp + Read receipts */}
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: config.bubbleGap * 0.75,
                    marginTop: 36, // Push down
                    marginLeft: 12
                }}>
                    <span style={{
                        fontSize: config.timestampSize,
                        color: config.timestampColor,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                    }}>
                        {timestamp || "10:42"}
                    </span>
                    {isMe && <DoubleCheckIcon read={read} />}
                </div>
            </div>
        </div>
    );
};
