import React, { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { useMessageGrouping } from "../../hooks/useMessageGrouping";
import { MessageData } from "../../types";
import { UIThemeTokens } from "../../ui/ui-strategy";
import { TypingIndicator } from "./TypingIndicator";

const DEFAULT_BG = "#ECE5DD";

interface MessageListProps {
  messages: MessageData[];
  ownerName?: string;
  isTyping?: boolean;
  isGroupChat?: boolean;
  tokens?: UIThemeTokens;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  ownerName = "me",
  isTyping,
  isGroupChat = false,
  tokens,
}) => {
  const backgroundColor = tokens?.backgroundColor || DEFAULT_BG;
  const doodlePattern = tokens?.doodlePattern || "";
  const doodleOpacity = tokens?.doodleOpacity ?? 0.04;

  const groups = useMessageGrouping(messages, ownerName);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages[messages.length - 1]?.id;

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
        backgroundColor,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "10px 16px",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        paddingBottom: 100,
      }}
    >
      {doodlePattern && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: doodlePattern,
            backgroundSize: "200px 200px",
            opacity: doodleOpacity,
            pointerEvents: "none",
          }}
        />
      )}

      {groups.map((group) => {
        const isSystem = group.senderId === "system";

        return (
          <div
            key={group.id}
            style={{
              marginTop: isSystem ? 12 : 6,
              marginBottom: 6,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              zIndex: 1,
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
                tokens={tokens}
              />
            ))}
          </div>
        );
      })}

      {isTyping && (
        <div style={{ marginTop: 12, position: "relative", zIndex: 1 }}>
          <TypingIndicator />
        </div>
      )}
    </div>
  );
};
