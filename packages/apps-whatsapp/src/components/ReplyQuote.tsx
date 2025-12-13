/**
 * Reply Quote Component
 * 
 * Renders quoted/replied-to message above the current message.
 * Matches WhatsApp iOS styling with the colored bar.
 */

import React from "react";

// =============================================================================
// TYPES
// =============================================================================

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

// =============================================================================
// REPLY QUOTE
// =============================================================================

/**
 * Displays the quoted message within a bubble.
 * Appears above the actual message content with a colored bar.
 */
export const ReplyQuote: React.FC<ReplyQuoteProps> = ({
    replyTo,
    isMyMessage = false,
    onClick,
}) => {
    // Color based on who sent the original
    const barColor = replyTo.from === "me" ? "#25D366" : "#34B7F1";

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
                        color: "#667781",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                    }}>
                        {/* Type icon */}
                        {replyTo.type === "image" && (
                            <>
                                <CameraIcon />
                                <span>Photo</span>
                            </>
                        )}
                        {replyTo.type === "video" && (
                            <>
                                <VideoIcon />
                                <span>Video</span>
                            </>
                        )}
                        {replyTo.type === "voice" && (
                            <>
                                <MicIcon />
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

// =============================================================================
// ICONS
// =============================================================================

const CameraIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="#667781">
        <path d="M21 6h-3.17L16 4h-6v2h5.12l1.83 2H21v12H5V10H3v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM8 14c0 2.76 2.24 5 5 5s5-2.24 5-5-2.24-5-5-5-5 2.24-5 5zm5-3c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3zM5 6h3V4H5V1H3v3H0v2h3v3h2V6z" />
    </svg>
);

const VideoIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="#667781">
        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
);

const MicIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="#667781">
        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
    </svg>
);

export default ReplyQuote;
