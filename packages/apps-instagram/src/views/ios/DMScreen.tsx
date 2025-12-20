/**
 * Instagram DM Thread Screen (iOS)
 * 
 * NOTE: Safe area top is handled by InstagramApp router.
 */

import React from "react";
import { instagramTheme } from "../../config/theme";
import type { InstagramThread, InstagramDM } from "../../types";

interface DMScreenProps {
    thread: InstagramThread;
    width: number;
    height: number;
    safeAreaBottom?: number;
}

// Back arrow
const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

// Video call
const VideoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
);

// Voice call
const PhoneIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

export const DMScreen: React.FC<DMScreenProps> = ({
    thread,
    width,
    height,
    safeAreaBottom = 34,
}) => {
    const theme = instagramTheme;

    return (
        <div style={{
            width,
            height,
            backgroundColor: theme.colors.background,
            display: "flex",
            flexDirection: "column",
            fontFamily: theme.typography.fontFamily,
        }}>
            {/* Header */}
            <div style={{
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingLeft: 8,
                paddingRight: 16,
                borderBottom: `1px solid ${theme.colors.divider}`,
                flexShrink: 0,
            }}>
                {/* Left: Back + Avatar + Name */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ color: theme.colors.textPrimary }}>
                        <BackIcon />
                    </div>
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: theme.colors.backgroundSecondary,
                        backgroundImage: thread.participant.avatar ? `url(${thread.participant.avatar})` : undefined,
                        backgroundSize: "cover",
                    }} />
                    <span style={{
                        ...theme.typography.username,
                        color: theme.colors.textPrimary,
                    }}>
                        {thread.participant.username}
                    </span>
                </div>

                {/* Right: Actions */}
                <div style={{ display: "flex", gap: 16, color: theme.colors.textPrimary }}>
                    <PhoneIcon />
                    <VideoIcon />
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 8,
            }}>
                {thread.messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Typing indicator */}
                {thread.typing && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "8px 12px",
                        backgroundColor: theme.colors.dmBubbleIncoming,
                        borderRadius: 18,
                        alignSelf: "flex-start",
                        maxWidth: "60%",
                    }}>
                        <span style={{ fontSize: 14 }}>•••</span>
                    </div>
                )}
            </div>

            {/* Input bar */}
            <div
                data-anchor="dm-input"
                style={{
                    display: "flex",
                    alignItems: "center",
                    padding: 12,
                    paddingBottom: 12 + safeAreaBottom,
                    gap: 12,
                    borderTop: `1px solid ${theme.colors.divider}`,
                    backgroundColor: theme.colors.background,
                    flexShrink: 0,
                }}
            >
                {/* Camera */}
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: theme.colors.brandBlue,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                }}>
                    📷
                </div>

                {/* Text input */}
                <div style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 18,
                    border: `1px solid ${theme.colors.border}`,
                    paddingLeft: 16,
                    paddingRight: 16,
                    display: "flex",
                    alignItems: "center",
                    color: theme.colors.textSecondary,
                    fontSize: 14,
                }}>
                    Message...
                </div>

                {/* Mic */}
                <div style={{ color: theme.colors.textPrimary }}>🎤</div>
                {/* Image */}
                <div style={{ color: theme.colors.textPrimary }}>🖼️</div>
            </div>
        </div>
    );
};

// Message Bubble
const MessageBubble: React.FC<{ message: InstagramDM }> = ({ message }) => {
    const theme = instagramTheme;
    const isMe = message.sender === "me";

    return (
        <div
            data-dm-id={message.id}
            style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
            }}
        >
            <div style={{
                maxWidth: "70%",
                padding: "10px 14px",
                borderRadius: 18,
                backgroundColor: isMe ? theme.colors.dmBubbleOutgoing : theme.colors.dmBubbleIncoming,
                color: isMe ? theme.colors.dmTextOutgoing : theme.colors.dmTextIncoming,
                fontSize: 14,
                lineHeight: 1.4,
            }}>
                {message.content}
            </div>
        </div>
    );
};
