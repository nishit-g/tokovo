import React, { useEffect, useRef } from "react";
import { useKeyboardHeight } from "@tokovo/react";
import { MessageBubble } from "./MessageBubble.js";
import { useMessageGrouping } from "../hooks/useMessageGrouping.js";
import { MessageData } from "../types/index.js";
import { TypingIndicator } from "./TypingIndicator.js";
import { useTheme } from "../theme/ThemeContext.js";
import { senderColors } from "./theme.js";

interface MessageListProps {
  messages: MessageData[];
  ownerName?: string;
  isTyping?: boolean;
  isGroupChat?: boolean;
  bottomPadding?: number;
}

function getSenderColor(name: string | undefined): string | undefined {
  if (!name) return undefined;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % senderColors.length;
  return senderColors[index];
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  ownerName = "me",
  isTyping,
  isGroupChat = false,
  bottomPadding = 100,
}) => {
  const theme = useTheme();
  const backgroundColor = theme.colors.chatBackground;
  const doodlePattern = `radial-gradient(${theme.colors.divider} 0.8px, transparent 0.8px)`;
  const doodleOpacity = 0.22;
  const listPaddingX = theme.spacing.sectionGap;
  const listPaddingY = Math.max(8, theme.spacing.sectionGap - 4);
  const keyboardHeight = useKeyboardHeight();

  const groups = useMessageGrouping(messages, ownerName);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages[messages.length - 1]?.id;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length, lastMessageId, isTyping, keyboardHeight]);

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
        padding: `${listPaddingY}px ${listPaddingX}px`,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        paddingBottom: bottomPadding + keyboardHeight,
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
            backgroundSize: "28px 28px",
            opacity: doodleOpacity,
            pointerEvents: "none",
          }}
        />
      )}

      {groups.map((group, groupIdx) => {
        const isSystem = group.senderId === "system";
        const messageStartIndex = groups
          .slice(0, groupIdx)
          .reduce((sum, g) => sum + g.messages.length, 0);

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
                senderName={item.data.senderName ?? item.data.from}
                senderColor={getSenderColor(item.data.senderName ?? item.data.from)}
                showSenderName={isGroupChat && !group.isMe && item.isFirst}
                messageOrder={messageStartIndex + idx}
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
