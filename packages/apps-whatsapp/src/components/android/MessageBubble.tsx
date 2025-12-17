/**
 * Android WhatsApp Message Bubble Component
 * 
 * Material Design inspired message bubbles with Android-specific styling.
 * Dark theme with teal accent for sent messages.
 */

import React from "react";
import { MessageData } from "../../types";

export interface MessageBubbleProps {
    message: MessageData;
    isMe: boolean;
    isFirst: boolean;
    isLast: boolean;
    isGroupChat?: boolean;
    senderName?: string;
    senderColor?: string;
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
    // Handle system messages separately
    if (message.type === "system") {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                padding: "4px 16px",
            }}>
                <div style={{
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    borderRadius: 7,
                    padding: "6px 12px",
                    maxWidth: "80%",
                }}>
                    <span style={{
                        fontSize: 12,
                        color: "rgba(255, 255, 255, 0.7)",
                        fontFamily: "Roboto, sans-serif",
                        textAlign: "center",
                    }}>
                        {message.text}
                    </span>
                </div>
            </div>
        );
    }

    // Android-specific styling
    const bubbleBg = isMe ? "#005C4B" : "#202C33";
    const textColor = "#E9EDEF";
    const timestampColor = "rgba(255, 255, 255, 0.6)";

    // Should show sender name?
    const shouldShowSender = showSenderName && isGroupChat && !isMe && senderName;

    // Get message text based on type
    const messageText = message.type === "text" || message.type === "video" || message.type === "image"
        ? 'text' in message ? message.text : ('caption' in message ? message.caption : "")
        : "";

    return (
        <div style={{
            display: "flex",
            justifyContent: isMe ? "flex-end" : "flex-start",
            padding: "1px 8px",
        }}>
            <div style={{
                backgroundColor: bubbleBg,
                borderRadius: 8,
                borderTopLeftRadius: !isMe && isFirst ? 0 : 8,
                borderTopRightRadius: isMe && isFirst ? 0 : 8,
                padding: "6px 7px 8px 9px",
                maxWidth: "80%",
                minWidth: 80,
                position: "relative",
            }}>
                {/* Sender Name (Group Chats Only) */}
                {shouldShowSender && (
                    <span style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: senderColor || "#00A884",
                        marginBottom: 2,
                        display: "block",
                        fontFamily: "Roboto, sans-serif",
                    }}>
                        {senderName}
                    </span>
                )}

                {/* Message Content */}
                <span style={{
                    fontSize: 14.5,
                    lineHeight: 1.3,
                    color: textColor,
                    fontFamily: "Roboto, sans-serif",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                }}>
                    {messageText}
                </span>

                {/* Timestamp + Status */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 3,
                    marginTop: 2,
                    marginLeft: 8,
                    float: "right",
                }}>
                    <span style={{
                        fontSize: 11,
                        color: timestampColor,
                        fontFamily: "Roboto, sans-serif",
                    }}>
                        {message.timestamp || "10:42"}
                    </span>

                    {/* Read receipts for sent messages */}
                    {isMe && (
                        <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                            <path
                                d="M1 5.5L4.5 9L11 2.5"
                                stroke={message.status === "read" ? "#53BDEB" : "#8696A0"}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M5 5.5L8.5 9L15 2.5"
                                stroke={message.status === "read" ? "#53BDEB" : "#8696A0"}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
