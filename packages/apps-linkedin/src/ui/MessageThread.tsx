/**
 * Message Thread Screen
 * =====================
 * Single conversation view with chat bubbles.
 */
import React from "react";
import type { WorldState } from "@tokovo/core";
import { useLinkedInTheme } from "./ThemeContext.js";
import { LIAvatar, LIIcon } from "./components.js";
import { getActiveThread, getThreadMessages, getUserById } from "../runtime/selectors.js";

export const MessageThread: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const thread = getActiveThread(world);
  const messages = getThreadMessages(world, thread?.id ?? null);
  const otherUserId = thread?.participantIds?.[0] ?? null;
  const otherUser = getUserById(world, otherUserId);

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header with user info */}
      <div
        style={{
          height: theme.spacing.headerHeight,
          background: theme.colors.surface,
          borderBottom: `1px solid ${theme.colors.border}`,
          display: "flex",
          alignItems: "center",
          padding: `0 ${theme.spacing.screenPadding}px`,
          gap: theme.spacing.md,
        }}
      >
        <LIIcon name="back" size={24} color={theme.colors.textPrimary} />
        <LIAvatar size="sm" src={otherUser?.avatarUrl} name={otherUser?.name} showOnline />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: theme.typography.headline.fontSize,
              fontWeight: theme.typography.headline.fontWeight,
              color: theme.colors.textPrimary,
            }}
          >
            {otherUser?.name ?? "Conversation"}
          </div>
          <div
            style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.success,
            }}
          >
            Active now
          </div>
        </div>
        <LIIcon name="video" size={24} color={theme.colors.textSecondary} />
        <LIIcon name="more" size={24} color={theme.colors.textSecondary} />
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: theme.spacing.screenPadding,
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.sm,
        }}
      >
        {messages.map((message, index) => {
          const isMe = message.senderId === "me";
          const sender = getUserById(world, message.senderId);
          const showAvatar =
            !isMe &&
            (index === messages.length - 1 ||
              messages[index + 1]?.senderId !== message.senderId);

          return (
            <div
              key={message.id}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: theme.spacing.sm,
              }}
            >
              {/* Other user avatar */}
              {!isMe && (
                <div style={{ width: theme.spacing.avatarSm }}>
                  {showAvatar && (
                    <LIAvatar size="sm" src={sender?.avatarUrl} name={sender?.name} />
                  )}
                </div>
              )}

              {/* Message bubble */}
              <div
                style={{
                  maxWidth: "70%",
                  padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
                  borderRadius: isMe
                    ? `${theme.radius.lg}px ${theme.radius.lg}px ${theme.radius.sm}px ${theme.radius.lg}px`
                    : `${theme.radius.lg}px ${theme.radius.lg}px ${theme.radius.lg}px ${theme.radius.sm}px`,
                  background: isMe ? theme.colors.accent : theme.colors.surfaceHover,
                  color: isMe ? theme.colors.textInverse : theme.colors.textPrimary,
                  fontSize: theme.typography.body.fontSize,
                  lineHeight: theme.typography.body.lineHeight,
                }}
              >
                {message.text}
              </div>
            </div>
          );
        })}

        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.md,
            }}
          >
            <LIAvatar size="xl" src={otherUser?.avatarUrl} name={otherUser?.name} />
            <div
              style={{
                fontSize: theme.typography.title.fontSize,
                fontWeight: theme.typography.title.fontWeight,
                color: theme.colors.textPrimary,
              }}
            >
              {otherUser?.name}
            </div>
            <div
              style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.textSecondary,
                textAlign: "center",
              }}
            >
              Start a conversation
            </div>
          </div>
        )}
      </div>

      {/* Message Composer */}
      <div
        style={{
          padding: theme.spacing.md,
          background: theme.colors.surface,
          borderTop: `1px solid ${theme.colors.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.md,
          }}
        >
          <LIIcon name="photo" size={24} color={theme.colors.textSecondary} />
          <div
            style={{
              flex: 1,
              height: theme.spacing.inputHeight,
              background: theme.colors.surfaceHover,
              borderRadius: theme.radius.pill,
              display: "flex",
              alignItems: "center",
              padding: `0 ${theme.spacing.md}px`,
              color: theme.colors.textTertiary,
              fontSize: theme.typography.body.fontSize,
            }}
          >
            Write a message...
          </div>
          <LIIcon name="send" size={24} color={theme.colors.accent} />
        </div>
      </div>
    </div>
  );
};
