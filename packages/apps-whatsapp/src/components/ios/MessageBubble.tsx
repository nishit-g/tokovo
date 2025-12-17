import React from "react";
import { getTheme } from "./theme";
import { DoubleCheckIcon } from "./Icons";
import { MessageContent } from "./MessageContent";
import { MessageData } from "../../types";

interface MessageBubbleProps {
    message: MessageData;
    isMe: boolean;
    isFirst: boolean;
    isLast: boolean;
    /** Group chat mode - enables sender name display */
    isGroupChat?: boolean;
    /** Sender name to display (for group chats) */
    senderName?: string;
    /** Sender name color (for group chats) */
    senderColor?: string;
    /** Whether to show sender name for this specific message */
    showSenderName?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isMe,
    isFirst,
    isLast,
    isGroupChat = false,
    senderName,
    senderColor,
    showSenderName = false,
}) => {
    const theme = getTheme("ios");
    const isSystem = message.type === "system";

    // Determine if we should show sender name for this bubble
    // Only show for "other" messages in group chats, at the start of a run
    const shouldShowSender = showSenderName && isGroupChat && !isMe && senderName;

    if (isSystem) {
        // System messages render outside the bubble flow directly
        return <MessageContent message={message} />;
    }

    // Only show tail for the FIRST message in a group
    const showTail = isFirst;

    // Corner Radius Logic
    // Top-Left: Sharp if Receiver & First
    // Top-Right: Sharp if Sender & First
    const borderTopLeft = !isMe && isFirst ? 0 : 16;
    const borderTopRight = isMe && isFirst ? 0 : 16;
    // Bottoms are generally rounded unless we want extremely tight "stack" look
    // Standard WhatsApp iOS rounds all bottoms.

    return (
        <div style={{
            alignSelf: isMe ? "flex-end" : "flex-start",
            maxWidth: "75%", // Standard width constraint
            position: "relative",
            marginBottom: 2, // Tight bubble spacing
            display: "flex",
            flexDirection: "column"
        }}>
            <div style={{
                backgroundColor: isMe ? theme.colors.bubbleMyBg : theme.colors.bubbleOtherBg,
                borderRadius: 16,
                borderTopLeftRadius: borderTopLeft,
                borderTopRightRadius: borderTopRight,
                // Refined padding: 6px standard
                padding: "6px 7px 8px 9px",
                boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                minWidth: 80
            }}>
                {/* Sender Name (Group Chats Only) */}
                {shouldShowSender && (
                    <span style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: senderColor || "#00A884",
                        marginBottom: 2,
                        display: "block",
                    }}>
                        {senderName}
                    </span>
                )}

                {/* Content Layer */}
                <MessageContent message={message} />

                {/* Metadata Row (Time + Read) */}
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 2,
                    // float: "right" // Could float for "compact" text, but flex row is safer
                }}>
                    <span style={{
                        fontSize: 11,
                        color: theme.colors.secondary, // Greenish on My, Gray on Other?
                        // Actually on "My" bubble, time is also theme-colored usually
                    }}>
                        {message.timestamp || "10:00"}
                    </span>
                    {isMe && <DoubleCheckIcon read={message.status === "read"} size={14} />}
                </div>
            </div>

            {/* SVG Tail */}
            {showTail && (
                <svg
                    width="12" height="20" // Logical size for tail
                    viewBox="0 0 12 20"
                    style={{
                        position: "absolute",
                        [isMe ? "right" : "left"]: -6, // Overlap slightly to merge
                        top: 0,
                        fill: isMe ? theme.colors.bubbleMyBg : theme.colors.bubbleOtherBg,
                        transform: isMe ? "scaleX(1)" : "scaleX(-1)",
                        zIndex: -1 // Behind
                    }}
                >
                    {/* Authentic WhatsApp Tail Path approximation */}
                    <path d="M0 0 C0 0 5 0 8 5 C11 10 9 15 9 15 L0 15 Z" />
                    {/* Note: This is a simplified path for the demo. SVG paths for actual WA tail are complex bezier curves */}
                </svg>
            )}
        </div>
    );
};
