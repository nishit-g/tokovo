import React, { useEffect, useRef, useMemo } from "react";
import { useKeyboardHeight } from "@tokovo/react";
import { MessageBubble } from "./MessageBubble.js";
import { useMessageGrouping } from "../hooks/useMessageGrouping.js";
import { MessageData } from "../types/index.js";
import { TypingIndicator } from "./TypingIndicator.js";
import { GroupTypingIndicator, type TypingMember } from "./GroupTypingIndicator.js";
import { useTheme } from "../theme/ThemeContext.js";
import { senderColors } from "./theme.js";

interface MessageListProps {
  messages: MessageData[];
  ownerName?: string;
  isTyping?: boolean;
  typingMembers?: TypingMember[];
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

/**
 * WhatsApp-style doodle wallpaper as an inline SVG data URI.
 * Encodes the doodle pattern once and returns a CSS-compatible url() string.
 */
function buildDoodleDataUri(color: string): string {
  // SVG with 7 WhatsApp-style doodle icons tiled in a 120x120 pattern
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">`
    // Phone
    + `<g transform="translate(10,8)" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round">`
    + `<rect x="2" y="0" width="8" height="14" rx="2"/>`
    + `<line x1="5" y1="11.5" x2="7" y2="11.5"/>`
    + `</g>`
    // Clock
    + `<g transform="translate(72,12)" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round">`
    + `<circle cx="6" cy="6" r="6"/>`
    + `<polyline points="6,3 6,6 8.5,7.5"/>`
    + `</g>`
    // Speech bubble
    + `<g transform="translate(38,52)" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round">`
    + `<path d="M0,2 Q0,0 2,0 L12,0 Q14,0 14,2 L14,8 Q14,10 12,10 L5,10 L2,13 L2.5,10 L2,10 Q0,10 0,8 Z"/>`
    + `</g>`
    // At symbol
    + `<g transform="translate(85,58)" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round">`
    + `<circle cx="5.5" cy="6" r="5"/>`
    + `<path d="M8.5,6 Q8.5,9 6,9 Q3.5,9 3.5,6 Q3.5,3.5 6,3.5 Q8,3.5 8.5,5 L8.5,9"/>`
    + `</g>`
    // Checkbox
    + `<g transform="translate(14,85)" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">`
    + `<rect x="0" y="0" width="11" height="11" rx="2"/>`
    + `<polyline points="2.5,5.5 4.5,7.5 8.5,3.5"/>`
    + `</g>`
    // Star
    + `<g transform="translate(50,90)" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">`
    + `<polygon points="6,0 7.5,4 12,4.5 8.5,7.5 9.5,12 6,9.5 2.5,12 3.5,7.5 0,4.5 4.5,4"/>`
    + `</g>`
    // Heart
    + `<g transform="translate(90,92)" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">`
    + `<path d="M6,11 L1,6 Q-1,3 1.5,1.5 Q4,0 6,3 Q8,0 10.5,1.5 Q13,3 11,6 Z"/>`
    + `</g>`
    + `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  ownerName = "me",
  isTyping,
  typingMembers = [],
  isGroupChat = false,
  bottomPadding = 100,
}) => {
  const theme = useTheme();
  const backgroundColor = theme.colors.chatBackground;
  const doodleImage = useMemo(
    () => buildDoodleDataUri(theme.colors.divider),
    [theme.colors.divider],
  );
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
        backgroundImage: doodleImage,
        backgroundRepeat: "repeat",
        backgroundSize: "120px 120px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: `${listPaddingY}px ${listPaddingX}px`,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        paddingBottom: bottomPadding,
      }}
    >
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
          {isGroupChat && typingMembers.length > 0 ? (
            <GroupTypingIndicator typingMembers={typingMembers} />
          ) : (
            <TypingIndicator />
          )}
        </div>
      )}
    </div>
  );
};
