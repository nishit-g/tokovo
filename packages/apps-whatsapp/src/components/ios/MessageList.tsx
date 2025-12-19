import React, { useEffect, useRef } from "react";
import { getTheme } from "./theme";
import { MessageBubble } from "./MessageBubble";
import { useMessageGrouping } from "../../hooks/useMessageGrouping";
import { MessageData } from "../../types";

import { TypingIndicator } from "./TypingIndicator";

interface MessageListProps {
    messages: MessageData[];
    ownerName?: string;
    isTyping?: boolean;
    isGroupChat?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, ownerName = "me", isTyping, isGroupChat = false }) => {
    const theme = getTheme("ios");

    // Architecture Layer 1: Semantic Grouping
    const groups = useMessageGrouping(messages, ownerName);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastMessageId = messages[messages.length - 1]?.id;

    // Auto-scroll to bottom when new messages arrive or typing status changes
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages.length, lastMessageId, isTyping]);

    return (
        <div
            ref={containerRef}
            data-anchor="list"
            style={{
                flex: 1,
                backgroundColor: theme.colors.chatBg,
                // Optional: Wallpaper pattern could be a CSS variable too or separate component
                backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
                backgroundSize: "400px",
                display: "flex",
                flexDirection: "column",
                padding: "10px 16px",
                // Remove 'gap' here because we control it via margins for precise rhythm
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                paddingBottom: 100
            }}>
            {groups.map((group) => {
                const isSystem = group.senderId === "system";

                return (
                    <div
                        key={group.id}
                        style={{
                            // Architecture Layer 2: Visual Rhythm
                            // 12px gap between separate speakers (Visual Run Break)
                            // System messages might want different spacing
                            marginTop: isSystem ? 12 : 6, // Refined: 12px visual gap is standard, but margins collapse?
                            // Actually, let's stick to simple vertical rhythm.
                            marginBottom: 6,
                            display: "flex",
                            flexDirection: "column",
                            // No gap here, we use marginBottom: 2 on bubbles for tight packing
                        }}
                    >
                        {group.messages.map((item, idx) => (
                            <MessageBubble
                                key={item.data.id || idx}
                                message={item.data}
                                isMe={group.isMe}
                                isFirst={item.isFirst}
                                isLast={item.isLast}
                                isGroupChat={isGroupChat}
                                senderName={item.data.from}
                                showSenderName={isGroupChat && !group.isMe && item.isFirst}
                            />
                        ))}
                    </div>
                );
            })}

            {isTyping && (
                <div style={{ marginTop: 12 }}>
                    <TypingIndicator />
                </div>
            )}
        </div>
    );
};
