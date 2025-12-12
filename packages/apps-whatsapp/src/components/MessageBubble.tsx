/**
 * WhatsApp Message Bubble Component
 * 
 * Authentic iOS WhatsApp message styling with timestamps and read receipts.
 */

import React from "react";
import { ChatMessageLayout } from "@tokovo/core";
import { DoubleCheckIcon } from "./icons";

export interface MessageData {
    id: string;
    from: string;
    text?: string;
    timestamp?: string;
    read?: boolean;
    type?: "text" | "image" | "voice" | "system";
}

export interface MessageBubbleProps {
    msg: MessageData;
    layout: ChatMessageLayout;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, layout }) => {
    const isMe = msg.from === "me";
    const { opacity, translateY, y } = layout;

    return (
        <div style={{
            position: "absolute",
            top: y,
            left: isMe ? "auto" : 36,
            right: isMe ? 36 : "auto",
            maxWidth: "78%",
            opacity,
            transform: `translateY(${translateY}px)`,
        }}>
            {/* Bubble with tail */}
            <div style={{
                position: "relative",
                backgroundColor: isMe ? "#E7FFDB" : "#FFFFFF",
                padding: "24px 36px",
                borderRadius: 24,
                // Asymmetric corners for tail effect
                borderTopLeftRadius: isMe ? 24 : 6,
                borderTopRightRadius: isMe ? 6 : 24,
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
                display: "flex",
                flexDirection: "column",
                gap: 6
            }}>
                {/* Message text */}
                <span style={{
                    fontSize: 48,
                    lineHeight: "66px",
                    color: "#111B21",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    wordWrap: "break-word"
                }}>
                    {msg.text}
                </span>

                {/* Timestamp + Read receipts */}
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 9,
                    marginTop: 3
                }}>
                    <span style={{
                        fontSize: 33,
                        color: "#667781",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                    }}>
                        {msg.timestamp || "10:42"}
                    </span>
                    {isMe && <DoubleCheckIcon read={msg.read !== false} />}
                </div>
            </div>
        </div>
    );
};
