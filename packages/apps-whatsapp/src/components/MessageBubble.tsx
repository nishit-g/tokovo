import React from "react";
import { Platform, getAppConfig, getTokens, ChatMessageLayout } from "@tokovo/core";
import { DoubleCheckIcon } from "./icons";

interface MessageBubbleProps {
    msg: { id: string; from: string; text: string; timestamp?: string; read?: boolean; status?: string; edited?: boolean };
    isMe: boolean;
    isGroup?: boolean;
    layout?: ChatMessageLayout; // Optional if handled by parent
    platform?: Platform;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, isMe, isGroup, layout, platform = "ios" }) => {
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    // If layout provided, use it for animation props, but positioning is handled by parent wrapper in MessageList usually
    // to separate concerns of "where it is" vs "what it looks like".
    // But original code had absolute positioning inside bubble.
    // In our refactored MessageList, we handle absolute positioning on the container.

    return (
        <div style={{
            backgroundColor: isMe ? config.bubbleMyColor : config.bubbleOtherColor,
            padding: `${config.bubblePadding}px ${config.bubblePaddingHorizontal}px`,
            borderRadius: config.bubbleRadius,
            borderTopLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
            borderTopRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
            boxShadow: config.bubbleShadow,
            display: "flex",
            flexDirection: "column",
            gap: config.bubbleGap / 2,
            maxWidth: config.bubbleMaxWidth,
            minWidth: 120 // Ensure small messages aren't too squished
        }}>
            {/* Sender name for GROUP chats only */}
            {isGroup && !isMe && msg.from !== "system" && (
                <div style={{
                    fontSize: config.senderNameSize,
                    fontWeight: 600,
                    color: config.senderNameColor,
                    marginBottom: 3
                }}>
                    {msg.from}
                </div>
            )}

            {/* Message text */}
            <span style={{
                fontSize: config.messageTextSize,
                lineHeight: `${config.messageLineHeight}px`,
                color: config.bubbleTextColor,
                fontFamily: tokens.fontFamily,
                wordWrap: "break-word"
            }}>
                {msg.text}
            </span>

            {/* Timestamp + Read receipts + Edited */}
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: config.bubbleGap * 0.75,
                marginTop: 3
            }}>
                {msg.edited && (
                    <span style={{
                        fontSize: config.editedLabelSize,
                        color: config.editedLabelColor,
                        fontFamily: tokens.fontFamily,
                        marginRight: 6
                    }}>
                        Edited
                    </span>
                )}
                <span style={{
                    fontSize: config.timestampSize,
                    color: config.timestampColor,
                    fontFamily: tokens.fontFamily
                }}>
                    {msg.timestamp || "10:42"}
                </span>
                {isMe && <DoubleCheckIcon read={msg.status === "read"} />}
            </div>
        </div>
    );
};
