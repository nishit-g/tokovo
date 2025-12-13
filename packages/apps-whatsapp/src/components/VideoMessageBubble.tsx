import React from "react";
import { Platform, getAppConfig, getTokens } from "@tokovo/core";
import { DoubleCheckIcon, PlayIcon } from "./icons";

interface VideoMessageBubbleProps {
    isMe: boolean;
    thumbnailUrl?: string; // Or videoUrl
    caption?: string;
    timestamp?: string;
    duration?: string;
    read?: boolean;
    platform?: Platform;
}

export const VideoMessageBubble: React.FC<VideoMessageBubbleProps> = ({
    isMe,
    thumbnailUrl,
    caption,
    timestamp,
    duration = "0:15",
    read,
    platform = "ios"
}) => {
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    return (
        <div style={{
            backgroundColor: isMe ? config.bubbleMyColor : config.bubbleOtherColor,
            padding: "6px",
            borderRadius: config.bubbleRadius,
            borderTopLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
            borderTopRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
            boxShadow: config.bubbleShadow,
            display: "flex",
            flexDirection: "column",
            maxWidth: config.bubbleMaxWidth,
            overflow: "hidden"
        }}>
            {/* Video Thumbnail Container */}
            <div style={{
                borderRadius: config.bubbleRadius - 4,
                overflow: "hidden",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#000",
                minHeight: 300
            }}>
                {thumbnailUrl && (
                    <img
                        src={thumbnailUrl}
                        alt="video thumbnail"
                        style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                            maxHeight: 600,
                            objectFit: "cover",
                            opacity: 0.8
                        }}
                    />
                )}

                {/* Play Button Overlay */}
                <div style={{
                    position: "absolute",
                    width: 72,
                    height: 72,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "3px solid #FFFFFF"
                }}>
                    <PlayIcon />
                </div>

                {/* Duration Label */}
                <div style={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                }}>
                     <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                        <path d="M15 7L20 2V12L15 7Z" fill="white"/>
                        <rect width="14" height="14" rx="2" fill="white"/>
                     </svg>
                     <span style={{ color: "#FFF", fontSize: 24, fontWeight: 500 }}>{duration}</span>
                </div>
            </div>

            {/* Caption */}
            {caption && (
                <div style={{
                    padding: "12px 18px 6px 18px",
                }}>
                     <span style={{
                        fontSize: config.messageTextSize,
                        lineHeight: `${config.messageLineHeight}px`,
                        color: config.bubbleTextColor,
                        fontFamily: tokens.fontFamily,
                        wordWrap: "break-word"
                    }}>
                        {caption}
                    </span>
                </div>
            )}

            {/* Timestamp & Status */}
             <div style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: config.bubbleGap * 0.75,
                padding: "6px 12px 6px 0",
                position: caption ? "static" : "absolute",
                bottom: caption ? "auto" : 12,
                right: caption ? "auto" : 12,
                background: caption ? "transparent" : "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
                borderRadius: 10,
                paddingLeft: 12
            }}>
                <span style={{
                    fontSize: config.timestampSize,
                    color: caption ? config.timestampColor : "#FFFFFF",
                    fontFamily: tokens.fontFamily,
                    textShadow: caption ? "none" : "0 1px 2px rgba(0,0,0,0.4)"
                }}>
                    {timestamp || "10:42"}
                </span>
                {isMe && <DoubleCheckIcon read={read} />}
            </div>
        </div>
    );
};
