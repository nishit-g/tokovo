import React from "react";
import { getTheme } from "./theme";
import { DoubleCheckIcon } from "./Icons";

// Logical MessageList
// Bubbles: ~16px font, 8-12px padding

interface Message {
    id: string;
    text: string;
    from: string; // "me" or other
    timestamp?: string;
    read?: boolean;
}

interface MessageListProps {
    messages: Message[];
    ownerName?: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, ownerName = "me" }) => {
    const theme = getTheme("ios");

    return (
        <div style={{
            flex: 1,
            backgroundColor: theme.colors.chatBg,
            backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", // Authentic BG pattern
            backgroundSize: "400px", // Logical size
            display: "flex",
            flexDirection: "column",
            padding: "10px 16px",
            gap: 8, // Logical gap
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            paddingBottom: 100 // Space for input area
        }}>
            {messages.map((msg, idx) => {
                const isMe = msg.from === ownerName;
                const showTail = true; // For now simplify logic

                return (
                    <div key={msg.id || idx} style={{
                        alignSelf: isMe ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                        position: "relative",
                        marginBottom: 4
                    }}>
                        <div style={{
                            backgroundColor: isMe ? theme.colors.bubbleMyBg : theme.colors.bubbleOtherBg,
                            borderRadius: 16,
                            borderTopLeftRadius: !isMe && showTail ? 4 : 16,
                            borderTopRightRadius: isMe && showTail ? 4 : 16,
                            padding: "6px 10px 6px 12px", // Compact padding
                            boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                            display: "flex",
                            flexDirection: "column",
                            minWidth: 80
                        }}>
                            {/* Message Text */}
                            <div style={{
                                fontSize: 16,
                                lineHeight: "21px",
                                color: "#000",
                                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                                wordWrap: "break-word"
                            }}>
                                {msg.text}
                            </div>

                            {/* Metadata Row */}
                            <div style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                gap: 4,
                                marginTop: 2
                            }}>
                                <span style={{
                                    fontSize: 11,
                                    color: theme.colors.secondary,
                                }}>
                                    {msg.timestamp || "10:00"}
                                </span>
                                {isMe && <DoubleCheckIcon read={msg.read} size={14} />}
                            </div>
                        </div>

                        {/* SVG Tail (Optional high-fidelity) */}
                        {showTail && (
                            <svg
                                width="8" height="12"
                                viewBox="0 0 8 12"
                                style={{
                                    position: "absolute",
                                    // Tail positioning logic needs standard 1x coords
                                    [isMe ? "right" : "left"]: -6,
                                    top: 0,
                                    fill: isMe ? theme.colors.bubbleMyBg : theme.colors.bubbleOtherBg,
                                    transform: isMe ? "scaleX(1)" : "scaleX(-1)"
                                }}
                            >
                                <path d="M0 0C0 0 4 0 6 2C8 4 8 8 8 8V12H0V0Z" />
                                {/* Simplifying tail path for 1x visual check */}
                            </svg>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
