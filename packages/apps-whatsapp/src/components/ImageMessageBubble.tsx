import React from "react";
import { Platform, getAppConfig, getTokens } from "@tokovo/core";
import { DoubleCheckIcon } from "./icons";

interface ImageMessageBubbleProps {
    isMe: boolean;
    imageUrl: string;
    caption?: string;
    timestamp?: string;
    read?: boolean;
    platform?: Platform;
}

export const ImageMessageBubble: React.FC<ImageMessageBubbleProps> = ({
    isMe,
    imageUrl,
    caption,
    timestamp,
    read,
    platform = "ios"
}) => {
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    return (
        <div style={{
            backgroundColor: isMe ? config.bubbleMyColor : config.bubbleOtherColor,
            padding: "6px", // Tight padding for image
            borderRadius: config.bubbleRadius,
            borderTopLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
            borderTopRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
            boxShadow: config.bubbleShadow,
            display: "flex",
            flexDirection: "column",
            maxWidth: config.bubbleMaxWidth,
            overflow: "hidden"
        }}>
            {/* Image Container */}
            <div style={{
                borderRadius: config.bubbleRadius - 4, // Slightly less radius inner
                overflow: "hidden",
                position: "relative"
            }}>
                <img
                    src={imageUrl}
                    alt="shared"
                    style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        maxHeight: 600,
                        objectFit: "cover"
                    }}
                />
            </div>

            {/* Caption (Optional) */}
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
            {/* If no caption, overlay on image gradient? Standard WA puts it below or over image depending.
                For simplicity, we put it in a footer row inside the bubble.
            */}
             <div style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: config.bubbleGap * 0.75,
                padding: "6px 12px 6px 0",
                // If caption, standard margin. If no caption, maybe overlay?
                // Let's stick to standard flow
                marginTop: caption ? 0 : -30, // Negative margin to overlap image if no caption? No, simpler to just have it floating?
                // Actually WA puts time inside the image container if no caption, with a gradient.
                // Let's keep it simple: always below for now, or minimal overlay.
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
                {isMe && <DoubleCheckIcon read={read} />} {/* Need to style check icon color for overlay */}
            </div>
        </div>
    );
};
