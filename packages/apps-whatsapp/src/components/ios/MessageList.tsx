import React from "react";
import { getTheme } from "./theme";
import { MessageBubble } from "./MessageBubble";
import { useMessageGrouping } from "../../hooks/useMessageGrouping";
import { MessageData } from "../../types";

interface MessageListProps {
    messages: MessageData[];
    ownerName?: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, ownerName = "me" }) => {
    const theme = getTheme("ios");

    // Architecture Layer 1: Semantic Grouping
    const groups = useMessageGrouping(messages, ownerName);

    return (
        <div style={{
            flex: 1,
            backgroundColor: theme.colors.chatBg,
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
                            // 12px gap between separate speakers
                            // System messages might want different spacing
                            marginTop: isSystem ? 8 : 12,
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
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};
