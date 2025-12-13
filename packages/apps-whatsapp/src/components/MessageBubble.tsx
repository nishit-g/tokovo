/**
 * WhatsApp Message Bubble Component
 * 
 * Authentic iOS WhatsApp message styling with:
 * - Timestamps and read receipts
 * - Reply/Quote UI for quoted messages
 * - Reactions (tapbacks) display
 */

import React from "react";
import { ChatMessageLayout } from "@tokovo/core";
import { DoubleCheckIcon } from "./icons";
import { ReplyQuote, ReplyToData } from "./ReplyQuote";
import { ReactionsBar, Reaction } from "./Reactions";

// =============================================================================
// TYPES
// =============================================================================

export interface MessageData {
    id: string;
    from: string;
    text?: string;
    timestamp?: string;
    read?: boolean;
    type?: "text" | "image" | "voice" | "system" | "video" | "gif";
    // Reply/Quote
    replyTo?: ReplyToData;
    // Reactions (tapbacks)
    reactions?: Reaction[];
}

export interface MessageBubbleProps {
    msg: MessageData;
    layout: ChatMessageLayout;
}

// =============================================================================
// MESSAGE BUBBLE
// =============================================================================

export const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, layout }) => {
    const isMe = msg.from === "me";
    const { opacity, translateX, translateY, rect } = layout;

    // Safety check - layout should always have rect if computed correctly
    if (!rect) return null;

    const hasReactions = msg.reactions && msg.reactions.length > 0;

    return (
        <div style={{
            position: "absolute",
            top: rect.y,
            left: rect.x,
            width: rect.width,
            // maxWidth: "78%", // Controlled by layout engine now
            opacity,
            transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
            zIndex: 1, // Ensure bubbles are above background
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
                gap: 6,
                // Add bottom margin if reactions present
                marginBottom: hasReactions ? 24 : 0,
            }}>
                {/* Reply/Quote - Shows quoted message if replying */}
                {msg.replyTo && (
                    <ReplyQuote
                        replyTo={msg.replyTo}
                        isMyMessage={isMe}
                    />
                )}

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

            {/* Reactions Bar - Shows below the bubble */}
            {hasReactions && (
                <ReactionsBar
                    reactions={msg.reactions!}
                    isMyMessage={isMe}
                />
            )}
        </div>
    );
};
