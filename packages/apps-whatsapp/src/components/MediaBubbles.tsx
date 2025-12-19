import React from "react";
import { getAppConfig, Platform } from "@tokovo/core";

// Stub for getTokens (to be implemented properly)
const getTokens = (_platform: Platform) => ({
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
});

// ============================================================================
// IMAGE MESSAGE BUBBLE - Authentic WhatsApp iOS Style
// ============================================================================

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
    platform = "ios"
}) => {
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    return (
        <div style={{
            backgroundColor: isMe ? config.bubbleMyColor : config.bubbleOtherColor,
            borderRadius: config.bubbleRadius,
            borderTopLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
            borderTopRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
            boxShadow: config.bubbleShadow,
            overflow: "hidden",
            // Width is controlled by layout container
            width: "100%",
        }}>
            {/* Sender Name (Group Chat) */}
            {senderName && !isMe && (
                <div style={{
                    padding: `${config.bubblePaddingHorizontal}px ${config.bubblePaddingHorizontal}px 4px`,
                    backgroundColor: "transparent"
                }}>
                    <span style={{
                        fontSize: config.senderNameSize,
                        fontWeight: 600,
                        color: config.senderNameColor,
                        fontFamily: tokens.fontFamily,
                        display: "block",
                    }}>
                        {senderName}
                    </span>
                </div>
            )}

            {/* Image container */}
            <div style={{
                position: "relative",
                // Square top corners if sender name is above
                borderTopLeftRadius: senderName ? 0 : config.bubbleRadius,
                borderTopRightRadius: senderName ? 0 : config.bubbleRadius,
                // Square bottom corners if caption is below
                borderBottomLeftRadius: caption ? 0 : config.bubbleRadius,
                borderBottomRightRadius: caption ? 0 : config.bubbleRadius,
                overflow: "hidden",
            }}>
                <img
                    src={imageUrl}
                    style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: 600,
                        objectFit: "cover",
                        display: "block",
                    }}
                    alt=""
                />

                {/* Timestamp overlay on image (when no caption) */}
                {!caption && (
                    <div style={{
                        position: "absolute",
                        bottom: 12,
                        right: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        padding: "6px 12px",
                        borderRadius: 12,
                    }}>
                        <span style={{
                            fontSize: 28,
                            color: "#FFFFFF",
                            fontFamily: tokens.fontFamily,
                        }}>
                            {timestamp}
                        </span>
                        {isMe && <DoubleCheckIcon read={read} light />}
                    </div>
                )}
            </div>

            {/* Caption if present */}
            {caption && (
                <div style={{
                    padding: `${config.bubblePadding}px ${config.bubblePaddingHorizontal}px`,
                }}>
                    <span style={{
                        fontSize: config.messageTextSize,
                        lineHeight: `${config.messageLineHeight}px`,
                        color: config.bubbleTextColor,
                        fontFamily: tokens.fontFamily,
                    }}>
                        {caption}
                    </span>

                    {/* Timestamp + Read receipts */}
                    <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: config.bubbleGap * 0.75,
                        marginTop: 6,
                    }}>
                        <span style={{
                            fontSize: config.timestampSize,
                            color: config.timestampColor,
                            fontFamily: tokens.fontFamily,
                        }}>
                            {timestamp}
                        </span>
                        {isMe && <DoubleCheckIcon read={read} />}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// VIDEO MESSAGE BUBBLE - With Play Overlay
// ============================================================================

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
    platform = "ios"
}) => {
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    const formatDuration = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            backgroundColor: isMe ? config.bubbleMyColor : config.bubbleOtherColor,
            borderRadius: config.bubbleRadius,
            borderTopLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
            borderTopRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
            boxShadow: config.bubbleShadow,
            overflow: "hidden",
            // Width is controlled by layout container
            width: "100%",
        }}>
            {/* Sender Name (Group Chat) */}
            {senderName && !isMe && (
                <div style={{
                    padding: `${config.bubblePaddingHorizontal}px ${config.bubblePaddingHorizontal}px 4px`,
                    backgroundColor: "transparent"
                }}>
                    <span style={{
                        fontSize: config.senderNameSize,
                        fontWeight: 600,
                        color: config.senderNameColor,
                        fontFamily: tokens.fontFamily,
                        display: "block",
                    }}>
                        {senderName}
                    </span>
                </div>
            )}

            {/* Video thumbnail container */}
            <div style={{
                position: "relative",
                overflow: "hidden",
                // Square top corners if sender name is above
                borderTopLeftRadius: senderName ? 0 : config.bubbleRadius,
                borderTopRightRadius: senderName ? 0 : config.bubbleRadius,
            }}>
                <img
                    src={thumbnailUrl}
                    style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: 600,
                        objectFit: "cover",
                        display: "block",
                    }}
                    alt=""
                />

                {/* Play button overlay */}
                {!isPlaying && (
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 120,
                        height: 120,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <svg width="54" height="54" viewBox="0 0 24 24" fill="#FFFFFF">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                )}

                {/* Duration badge */}
                <div style={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    padding: "6px 12px",
                    borderRadius: 12,
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
                        <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.69l-8.14-5.17A.998.998 0 0 0 8 6.82z" />
                    </svg>
                    <span style={{
                        fontSize: 28,
                        color: "#FFFFFF",
                        fontFamily: tokens.fontFamily,
                    }}>
                        {formatDuration(duration)}
                    </span>
                </div>

                {/* Timestamp overlay (when no caption) */}
                {!caption && (
                    <div style={{
                        position: "absolute",
                        bottom: 12,
                        right: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        padding: "6px 12px",
                        borderRadius: 12,
                    }}>
                        <span style={{
                            fontSize: 28,
                            color: "#FFFFFF",
                            fontFamily: tokens.fontFamily,
                        }}>
                            {timestamp}
                        </span>
                        {isMe && <DoubleCheckIcon read={read} light />}
                    </div>
                )}

                {/* Progress bar during playback */}
                {isPlaying && (
                    <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 6,
                        backgroundColor: "rgba(255,255,255,0.3)",
                    }}>
                        <div style={{
                            height: "100%",
                            width: `${(playProgress / duration) * 100}%`,
                            backgroundColor: "#25D366",
                        }} />
                    </div>
                )}
            </div>

            {/* Caption if present */}
            {caption && (
                <div style={{
                    padding: `${config.bubblePadding}px ${config.bubblePaddingHorizontal}px`,
                }}>
                    <span style={{
                        fontSize: config.messageTextSize,
                        lineHeight: `${config.messageLineHeight}px`,
                        color: config.bubbleTextColor,
                        fontFamily: tokens.fontFamily,
                    }}>
                        {caption}
                    </span>

                    <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: config.bubbleGap * 0.75,
                        marginTop: 6,
                    }}>
                        <span style={{
                            fontSize: config.timestampSize,
                            color: config.timestampColor,
                            fontFamily: tokens.fontFamily,
                        }}>
                            {timestamp}
                        </span>
                        {isMe && <DoubleCheckIcon read={read} />}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// GIF MESSAGE BUBBLE - Auto-playing with GIPHY badge
// ============================================================================

interface GifMessageBubbleProps {
    gifUrl: string;
    width?: number;
    height?: number;
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
    platform = "ios"
}) => {
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    return (
        <div style={{
            backgroundColor: isMe ? config.bubbleMyColor : config.bubbleOtherColor,
            borderRadius: config.bubbleRadius,
            borderTopLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
            borderTopRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
            boxShadow: config.bubbleShadow,
            overflow: "hidden",
            // Width is controlled by layout container
            width: "100%",
        }}>
            {/* Sender Name (Group Chat) */}
            {senderName && !isMe && (
                <div style={{
                    padding: `${config.bubblePaddingHorizontal}px ${config.bubblePaddingHorizontal}px 4px`,
                    backgroundColor: "transparent"
                }}>
                    <span style={{
                        fontSize: config.senderNameSize,
                        fontWeight: 600,
                        color: config.senderNameColor,
                        fontFamily: tokens.fontFamily,
                        display: "block",
                    }}>
                        {senderName}
                    </span>
                </div>
            )}

            {/* GIF container */}
            <div style={{
                position: "relative",
                overflow: "hidden",
                // Square top corners if sender name is above
                borderTopLeftRadius: senderName ? 0 : config.bubbleRadius,
                borderTopRightRadius: senderName ? 0 : config.bubbleRadius,
            }}>
                <img
                    src={gifUrl}
                    style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: 500,
                        objectFit: "cover",
                        display: "block",
                    }}
                    alt=""
                />

                {/* GIF badge */}
                <div style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    padding: "4px 12px",
                    borderRadius: 8,
                }}>
                    <span style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "#FFFFFF",
                        fontFamily: tokens.fontFamily,
                        letterSpacing: 1,
                    }}>
                        GIF
                    </span>
                </div>

                {/* Timestamp overlay */}
                <div style={{
                    position: "absolute",
                    bottom: 12,
                    right: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    padding: "6px 12px",
                    borderRadius: 12,
                }}>
                    <span style={{
                        fontSize: 28,
                        color: "#FFFFFF",
                        fontFamily: tokens.fontFamily,
                    }}>
                        {timestamp}
                    </span>
                    {isMe && <DoubleCheckIcon read={read} light />}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// VOICE MESSAGE BUBBLE - With Waveform Animation
// ============================================================================

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
    platform = "ios"
}) => {
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    const formatDuration = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins}:${s.toString().padStart(2, '0')}`;
    };

    // Generate waveform bars (deterministic based on duration)
    const waveformBars = Array.from({ length: 35 }, (_, i) => {
        // Create realistic voice pattern using sin + noise
        const seed = (duration * 13 + i * 7) % 100;
        const baseHeight = 0.3 + 0.5 * Math.sin((i / 35) * Math.PI);
        const noise = (seed % 30) / 100;
        return Math.min(1, Math.max(0.15, baseHeight + noise));
    });

    const playedBars = Math.floor(playProgress * waveformBars.length);

    return (
        <div style={{
            backgroundColor: isMe ? config.bubbleMyColor : config.bubbleOtherColor,
            borderRadius: config.bubbleRadius,
            borderTopLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
            borderTopRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
            boxShadow: config.bubbleShadow,
            padding: config.bubblePaddingHorizontal,
            minWidth: 480,
        }}>
            {/* Sender Name (Group Chat) */}
            {senderName && !isMe && (
                <div style={{ marginBottom: 8 }}>
                    <span style={{
                        fontSize: config.senderNameSize,
                        fontWeight: 600,
                        color: config.senderNameColor,
                        fontFamily: tokens.fontFamily,
                    }}>
                        {senderName}
                    </span>
                </div>
            )}

            {/* Voice message content */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
            }}>
                {/* Avatar / Microphone icon */}
                <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    backgroundColor: isMe ? "#128C7E" : "#00A884",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}>
                    {isPlaying ? (
                        // Pause icon
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="#FFFFFF">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                    ) : (
                        // Play icon
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="#FFFFFF">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </div>

                {/* Waveform visualization */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                }}>
                    {/* Waveform bars */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        height: 60,
                    }}>
                        {waveformBars.map((height, i) => (
                            <div
                                key={i}
                                style={{
                                    width: 6,
                                    height: `${height * 100}%`,
                                    backgroundColor: i < playedBars
                                        ? (isMe ? "#128C7E" : "#00A884")
                                        : (isMe ? "rgba(18, 140, 126, 0.3)" : "rgba(0, 168, 132, 0.3)"),
                                    borderRadius: 3,
                                    transition: "background-color 0.1s",
                                }}
                            />
                        ))}
                    </div>

                    {/* Duration + Timestamp */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}>
                        <span style={{
                            fontSize: 28,
                            color: config.timestampColor,
                            fontFamily: tokens.fontFamily,
                        }}>
                            {isPlaying
                                ? formatDuration(Math.floor(playProgress * duration))
                                : formatDuration(duration)
                            }
                        </span>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}>
                            {/* Microphone icon */}
                            <svg width="28" height="28" viewBox="0 0 24 24" fill={isMe ? "#128C7E" : "#00A884"}>
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
                            </svg>

                            <span style={{
                                fontSize: config.timestampSize,
                                color: config.timestampColor,
                                fontFamily: tokens.fontFamily,
                            }}>
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

// ============================================================================
// SHARED: Double Check Icon for read receipts
// ============================================================================

const DoubleCheckIcon: React.FC<{ read?: boolean; light?: boolean }> = ({ read = false, light = false }) => (
    <svg width="36" height="24" viewBox="0 0 16 10" fill="none">
        <path d="M1 5L4 8L10 2" stroke={read ? "#53BDEB" : (light ? "#FFFFFF" : "#8696A0")} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 5L8 8L14 2" stroke={read ? "#53BDEB" : (light ? "#FFFFFF" : "#8696A0")} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

