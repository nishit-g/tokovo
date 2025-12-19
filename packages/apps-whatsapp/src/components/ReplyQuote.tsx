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

export const ReplyQuote: React.FC<ReplyQuoteProps> = ({
    replyTo,
    isMyMessage = false,
    onClick,
}) => {
    // Color based on who sent the original
    // Use CSS vars for these brand colors? Or keep specific brand colors?
    // Whatsapp usually uses specific colors for names.
    const barColor = replyTo.from === "me" ? "var(--app-wa-bubble-my-bg)" : "var(--app-wa-primary)";

    return (
        <div
            onClick={onClick}
            style={{
                display: "flex",
                gap: 0,
                backgroundColor: isMyMessage ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.03)",
                borderRadius: 18,
                overflow: "hidden",
                marginBottom: 12,
                cursor: onClick ? "pointer" : "default",
            }}
        >
            {/* Colored bar */}
            <div style={{
                width: 12,
                backgroundColor: barColor,
                flexShrink: 0,
            }} />

            {/* Content */}
            <div style={{
                flex: 1,
                padding: "15px 18px",
                display: "flex",
                alignItems: "center",
                gap: 18,
            }}>
                {/* Text content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Sender name */}
                    <div style={{
                        fontSize: 36,
                        fontWeight: 600,
                        color: barColor,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                        marginBottom: 6,
                    }}>
                        {replyTo.from === "me" ? "You" : replyTo.from}
                    </div>

                    {/* Message preview */}
                    <div style={{
                        fontSize: 39,
                        color: "var(--app-wa-bubble-text)",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        opacity: 0.7
                    }}>
                        {/* Type icon */}
                        {replyTo.type === "image" && (
                            <>
                                <Camera size={36} color="var(--app-wa-bubble-text)" />
                                <span>Photo</span>
                            </>
                        )}
                        {replyTo.type === "video" && (
                            <>
                                <Video size={36} color="var(--app-wa-bubble-text)" />
                                <span>Video</span>
                            </>
                        )}
                        {replyTo.type === "voice" && (
                            <>
                                <Mic size={36} color="var(--app-wa-bubble-text)" />
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
                        width: 120,
                        height: 120,
                        borderRadius: 12,
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
