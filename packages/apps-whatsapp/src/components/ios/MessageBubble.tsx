import React from "react";
import { Check, CheckCheck } from "lucide-react";
import { getTheme } from "./theme";
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

    // Only show tail for the FIRST message in a group (Visual Run)
    const showTail = isFirst;

    // Corner Radius Logic (Visual Run)
    // Top-Left: Sharp if Receiver & First
    // Top-Right: Sharp if Sender & First
    const borderTopLeft = !isMe && isFirst ? 0 : 16;
    const borderTopRight = isMe && isFirst ? 0 : 16;

    // Bottoms are rounded unless it's a middle/first message in a run, then we might want smaller radius?
    // standard WhatsApp iOS:
    // First: Rounded except corner
    // Middle: Rounded
    // Last: Rounded
    // Actually, usually in rapid succession they look 'stacked'. 
    // For now keeping simple logic: 16px everywhere else.

    // ANCHOR DATA
    // We attach data-anchor="message" and data-message-id={id} 
    // so the camera system can find this element.

    return (
        <div
            data-anchor="message"
            data-message-id={message.id}
            style={{
                alignSelf: isMe ? "flex-end" : "flex-start",
                maxWidth: "75%", // Standard width constraint
                position: "relative",
                // Visual Run Spacing: 
                // If isLast (of group), we rely on parent margin. 
                // Inside group, we use small margin.
                marginBottom: 2,
                display: "flex",
                flexDirection: "column"
            }}
        >
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
                        color: senderColor || "#00A884", // Fallback color
                        marginBottom: 2,
                        display: "block",
                    }}>
                        {senderName}
                    </span>
                )}

                {/* Reply-To Preview */}
                {message.replyTo && (
                    <div style={{
                        backgroundColor: "rgba(0, 0, 0, 0.06)",
                        borderLeft: `3px solid ${theme.colors.primary}`,
                        borderRadius: 4,
                        padding: "4px 8px",
                        marginBottom: 4,
                        fontSize: 12,
                        cursor: "pointer"
                    }}>
                        <div style={{
                            color: theme.colors.primary,
                            fontWeight: 500,
                            marginBottom: 2,
                        }}>
                            {message.replyTo.from || "You"}
                        </div>
                        <div style={{
                            color: theme.colors.bubbleText,
                            opacity: 0.7,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 200,
                        }}>
                            {message.replyTo.text || "📷 Photo"}
                        </div>
                    </div>
                )}

                {/* Content Layer */}
                <div style={{ color: theme.colors.bubbleText }}>
                    <MessageContent message={message} />
                </div>

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
                        color: theme.colors.bubbleTime,
                    }}>
                        {message.timestamp || "10:00"}
                    </span>
                    {isMe && (
                        message.status === "read" ?
                            <CheckCheck size={14} color={theme.colors.primary} /> : // Read Blue
                            <Check size={14} color={theme.colors.bubbleTime} /> // Sent Gray
                    )}
                </div>
            </div>

            {/* Reactions - Floating pill at bottom-right like WhatsApp */}
            {message.reactions && message.reactions.length > 0 && (
                <div style={{
                    position: "absolute",
                    bottom: -8,
                    right: isMe ? 8 : undefined,
                    left: isMe ? undefined : 8,
                    display: "flex",
                    gap: 2,
                    zIndex: 1,
                }}>
                    {message.reactions.map((reaction, idx) => (
                        <span
                            key={`${reaction.emoji}_${idx}`}
                            style={{
                                background: theme.colors.background, // Match app bg or bubble bg? usually white/app bg
                                borderRadius: 10,
                                padding: "2px 6px",
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                                border: `1px solid ${theme.colors.separator}`,
                            }}
                        >
                            {reaction.emoji}
                            {reaction.count > 1 && (
                                <span style={{ fontSize: 10, color: theme.colors.secondary }}>
                                    {reaction.count}
                                </span>
                            )}
                        </span>
                    ))}
                </div>
            )}

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
                </svg>
            )}
        </div>
    );
};
