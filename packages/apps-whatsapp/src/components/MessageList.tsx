import React, { useMemo } from "react";
import { ChatMessageItem } from "./ChatMessageItem.js";
import { TypingIndicator } from "./TypingIndicator.js";
import { GroupTypingIndicator, type TypingMember } from "./GroupTypingIndicator.js";
import { useTheme } from "../experience/ExperienceContext.js";
import { getSenderColor } from "../config/color-utils.js";
import type { WhatsAppThreadProjection } from "../thread/projector.js";
import type { WhatsAppGestureState } from "../types/interactions.js";
import { createWhatsAppThreadWindow } from "../thread/window.js";
import {
  calculateSmartGap,
  DEFAULT_LAYOUT_CONFIG,
  type GapContext,
  type MessageForGap,
  type MessageType,
} from "../config/layout-config.js";

interface MessageListProps {
  thread: WhatsAppThreadProjection;
  viewportWidth: number;
  isTyping?: boolean;
  typingMembers?: TypingMember[];
  isGroupChat?: boolean;
  bottomPadding?: number;
  activeGesture?: WhatsAppGestureState | null;
  anchorMessageId?: string;
}

/**
 * WhatsApp-style doodle wallpaper as an inline SVG data URI.
 * Encodes the doodle pattern once and returns a CSS-compatible url() string.
 */
function buildDoodleDataUri(color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">` +
    `<g fill="none" stroke="${color}" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round">` +
    `<g transform="translate(12 10)"><rect x="2" y="0" width="10" height="16" rx="2.5"/><line x1="5.5" y1="12.5" x2="8.5" y2="12.5"/></g>` +
    `<g transform="translate(66 16)"><circle cx="7" cy="7" r="7"/><polyline points="7,3.5 7,7.2 10,8.8"/></g>` +
    `<g transform="translate(122 12)"><path d="M0,3 Q0,0 3,0 L16,0 Q19,0 19,3 L19,11 Q19,14 16,14 L7,14 L3,18 L3.8,14 L3,14 Q0,14 0,11 Z"/></g>` +
    `<g transform="translate(24 58)"><path d="M10 1 L12.6 6.2 L18 7 L14 10.7 L14.9 16 L10 13.2 L5.1 16 L6 10.7 L2 7 L7.4 6.2 Z"/></g>` +
    `<g transform="translate(78 54)"><path d="M6,14 L1.4,9.2 Q-0.8,6.5 1.8,3.8 Q4.5,1.3 7,4 Q9.5,1.3 12.2,3.8 Q14.8,6.5 12.6,9.2 Z"/></g>` +
    `<g transform="translate(130 56)"><rect x="0" y="0" width="13" height="13" rx="3"/><polyline points="3,7 5.2,9.2 10,4.3"/></g>` +
    `<g transform="translate(12 112)"><path d="M0 5.5 Q0 0 5.5 0 H15.5 Q21 0 21 5.5 V7.5 Q21 13 15.5 13 H11.5 L7 17 V13 H5.5 Q0 13 0 7.5 Z"/><circle cx="7" cy="6.5" r="0.8"/><circle cx="10.5" cy="6.5" r="0.8"/><circle cx="14" cy="6.5" r="0.8"/></g>` +
    `<g transform="translate(72 110)"><path d="M3 4.5 H17"/><path d="M10 1 V8"/><circle cx="10" cy="12" r="5"/><path d="M7.2 12 H12.8"/></g>` +
    `<g transform="translate(126 108)"><circle cx="9" cy="9" r="8"/><path d="M5.5 9.2 Q9 12.5 12.5 9.2"/><circle cx="6.3" cy="7" r="0.8"/><circle cx="11.7" cy="7" r="0.8"/></g>` +
    `<g transform="translate(40 146)"><path d="M0 4 L10 0 L20 4 L10 8 Z"/><path d="M3 6.5 V13.5"/><path d="M17 6.5 V13.5"/><path d="M3 13.5 H17"/></g>` +
    `<g transform="translate(104 146)"><path d="M0 6 Q3 0 9 0 Q15 0 18 6"/><path d="M5 6 V15"/><path d="M13 6 V15"/><path d="M5 15 H13"/></g>` +
    `</g>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export const MessageList: React.FC<MessageListProps> = ({
  thread,
  viewportWidth,
  isTyping,
  typingMembers = [],
  isGroupChat = false,
  bottomPadding = 100,
  activeGesture,
  anchorMessageId,
}) => {
  const theme = useTheme();
  const backgroundColor = theme.colors.chatBackground;
  const doodleImage = useMemo(
    () => buildDoodleDataUri(theme.colors.wallpaperDoodle),
    [theme.colors.wallpaperDoodle],
  );
  const overlayGlow = `radial-gradient(circle at top left, ${theme.colors.wallpaperGlow}, transparent 38%), radial-gradient(circle at bottom right, ${theme.colors.wallpaperGlow}, transparent 42%)`;
  const listPaddingX = DEFAULT_LAYOUT_CONFIG.spacing.global.bubbleMargin;
  const listPaddingY = 0;
  const renderWindow = useMemo(
    () => createWhatsAppThreadWindow(thread, { anchorMessageId }),
    [anchorMessageId, thread],
  );
  const renderedItems = useMemo(
    () =>
      renderWindow.blocks.flatMap((block) =>
        block.kind === "system"
          ? [
              {
                kind: "message" as const,
                message: block.message,
                isMe: false,
                position: "single" as const,
                showSenderName: false,
                order: block.order,
              },
            ]
          : block.items,
      ),
    [renderWindow.blocks],
  );
  const gapBeforeByMessageId = useMemo(() => {
    const result = new Map<string, number>();
    for (let index = 1; index < renderedItems.length; index += 1) {
      const previous = renderedItems[index - 1].message;
      const current = renderedItems[index].message;
      const toGapMessage = (message: typeof current): MessageForGap => ({
        type: message.type as MessageType,
        from: message.from,
        at: message.at,
        hasReply: Boolean(message.replyTo),
        hasReactions: Boolean(message.reactions?.length),
        hasLinkPreview: Boolean(message.linkPreview),
      });
      const context: GapContext = {
        prevMessage: toGapMessage(previous),
        nextMessage: toGapMessage(current),
      };
      result.set(current.id, calculateSmartGap(context, DEFAULT_LAYOUT_CONFIG));
    }
    return result;
  }, [renderedItems]);
  return (
    <div
      data-anchor="list"
      data-rendered-message-count={renderWindow.renderedMessageCount}
      data-hidden-before={renderWindow.hiddenBefore}
      data-hidden-after={renderWindow.hiddenAfter}
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      style={{
        flex: 1,
        backgroundColor,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: `${listPaddingY}px ${listPaddingX}px`,
        overflow: "hidden",
        paddingBottom: bottomPadding,
        backgroundImage: `${overlayGlow}, ${doodleImage}`,
        backgroundRepeat: "no-repeat, repeat",
        backgroundSize: "100% 100%, 180px 180px",
      }}
    >
      <div
        style={{
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        {renderedItems.map((item) => (
          <ChatMessageItem
            key={item.message.id}
            message={item.message}
            isMe={item.isMe}
            position={item.position}
            isGroupChat={isGroupChat}
            senderName={item.message.senderName ?? item.message.from}
            senderColor={getSenderColor(item.message.senderName ?? item.message.from ?? "unknown")}
            showSenderName={item.showSenderName}
            messageOrder={item.order}
            gesture={activeGesture ?? undefined}
            viewportWidth={viewportWidth}
            gapBefore={gapBeforeByMessageId.get(item.message.id) ?? 0}
          />
        ))}

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
    </div>
  );
};
