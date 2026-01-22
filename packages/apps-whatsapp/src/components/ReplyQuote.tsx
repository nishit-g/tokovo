/**
 * ReplyQuote Component
 * 
 * Renders quoted/reply messages in WhatsApp style.
 * Shows preview of replied message with colored accent bar.
 * 
 * NOTE: Uses 1x logical pixels (matches iOS components)
 */

import React from "react";
import { Camera, Video, Mic } from "lucide-react";

export interface ReplyToData {
    messageId: string;
    text: string;
    from: string;
    type?: "text" | "image" | "video" | "voice";
    thumbnailUrl?: string;
}

interface ReplyQuoteProps {
    replyTo: ReplyToData;
    isMyMessage?: boolean;
    onClick?: () => void;
}

// WhatsApp brand colors
const WA_GREEN = "#25D366";
const WA_TEAL = "#128C7E";

export const ReplyQuote: React.FC<ReplyQuoteProps> = ({
    replyTo,
    isMyMessage = false,
    onClick,
}) => {
    // Color based on who sent the original
    const barColor = replyTo.from === "me" ? WA_TEAL : WA_GREEN;

    return (
        <div
            onClick={onClick}
            style={{
                display: "flex",
                gap: 0,
                backgroundColor: isMyMessage ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.03)",
                borderRadius: 6,
                overflow: "hidden",
                marginBottom: 4,
                cursor: onClick ? "pointer" : "default",
            }}
        >
            {/* Colored bar */}
            <div style={{
                width: 4,
                backgroundColor: barColor,
                flexShrink: 0,
            }} />

            {/* Content */}
            <div style={{
                flex: 1,
                padding: "5px 6px",
                display: "flex",
                alignItems: "center",
                gap: 6,
            }}>
                {/* Text content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Sender name */}
                    <div style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: barColor,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                        marginBottom: 2,
                    }}>
                        {replyTo.from === "me" ? "You" : replyTo.from}
                    </div>

                    {/* Message preview */}
                    <div style={{
                        fontSize: 13,
                        color: "#667781",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                    }}>
                        {/* Type icon */}
                        {replyTo.type === "image" && (
                            <>
                                <Camera size={12} color="#667781" />
                                <span>Photo</span>
                            </>
                        )}
                        {replyTo.type === "video" && (
                            <>
                                <Video size={12} color="#667781" />
                                <span>Video</span>
                            </>
                        )}
                        {replyTo.type === "voice" && (
                            <>
                                <Mic size={12} color="#667781" />
                                <span>Voice message</span>
                            </>
                        )}
                        {(!replyTo.type || replyTo.type === "text") && (
                            <span>{replyTo.text}</span>
                        )}
                    </div>
                </div>

                {/* Thumbnail for media */}
                {replyTo.thumbnailUrl && (
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 4,
                        backgroundImage: `url(${replyTo.thumbnailUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        flexShrink: 0,
                    }} />
                )}
            </div>
        </div>
    );
};

export default ReplyQuote;
