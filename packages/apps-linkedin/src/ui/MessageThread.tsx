import React from "react";
import type { WorldState } from "@tokovo/core";
import { KeyboardAwareView, ScrollableContent, useKeyboardState } from "@tokovo/react";
import { LIAvatar, LIIcon } from "./components.js";
import { useLinkedInTheme } from "./ThemeContext.js";
import {
  formatRelativeFrameTime,
  getActiveThread,
  getCurrentUserId,
  getReferenceFrame,
  getThreadMessages,
  getUserById,
} from "../runtime/selectors.js";

export const MessageThread: React.FC<{ world: WorldState; deviceId?: string; t?: number }> = ({
  world,
  deviceId: _deviceId,
  t: _t,
}) => {
  const theme = useLinkedInTheme();
  const thread = getActiveThread(world);
  const messages = getThreadMessages(world, thread?.id ?? null);
  const currentUserId = getCurrentUserId(world);
  const otherUserId = thread?.participantIds.find((id) => id !== currentUserId) ?? thread?.participantIds[0] ?? null;
  const otherUser = getUserById(world, otherUserId);
  const currentUser = getUserById(world, currentUserId);
  const referenceFrame = getReferenceFrame(world);
  const keyboardState = useKeyboardState();
  const liveDraft =
    keyboardState.isKeyboardVisible && keyboardState.inputText
      ? keyboardState.inputText
      : thread?.draftText ?? "";
  const isInMail = Boolean(
    currentUser &&
    otherUserId &&
    !currentUser.connectionIds.includes(otherUserId),
  );

  return (
    <KeyboardAwareView style={{ flex: 1, minHeight: 0 }}>
      <div
        style={{
          minHeight: theme.spacing.messageHeaderHeight,
          background: theme.colors.surface,
          borderBottom: `1px solid ${theme.colors.border}`,
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.md,
          padding: `0 ${theme.spacing.screenPadding}px`,
        }}
      >
        <LIIcon name="back" size={24} color={theme.colors.textPrimary} />
        <LIAvatar size="sm" src={otherUser?.avatarUrl} name={otherUser?.name} showOnline />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.xs }}>
            <div
              style={{
                fontSize: theme.typography.headline.fontSize,
                fontWeight: theme.typography.headline.fontWeight,
                color: theme.colors.textPrimary,
              }}
            >
              {thread?.title ?? otherUser?.name ?? "Conversation"}
            </div>
            {isInMail ? (
              <span
                style={{
                  padding: "1px 6px",
                  borderRadius: theme.radius.pill,
                  background: theme.colors.warningLight,
                  color: theme.colors.warning,
                  fontSize: theme.typography.micro.fontSize,
                  fontWeight: 700,
                }}
              >
                INMAIL
              </span>
            ) : null}
          </div>
          <div
            style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.textSecondary,
            }}
          >
            {otherUser?.headline ?? "1st degree connection"}
          </div>
        </div>
        <LIIcon name="video" size={22} color={theme.colors.textSecondary} />
        <LIIcon name="more" size={22} color={theme.colors.textSecondary} />
      </div>

      <ScrollableContent
        style={{
          flex: 1,
          padding: theme.spacing.screenPadding,
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.sm,
          background: theme.colors.background,
        }}
      >
        {isInMail ? (
          <div
            style={{
              alignSelf: "center",
              padding: `${theme.spacing.xs + 2}px ${theme.spacing.md}px`,
              borderRadius: theme.radius.pill,
              background: theme.colors.warningLight,
              color: theme.colors.warning,
              fontSize: theme.typography.captionSemibold.fontSize,
              fontWeight: theme.typography.captionSemibold.fontWeight,
              marginBottom: theme.spacing.xs,
            }}
          >
            Sponsored or out-of-network messages appear here until you reply.
          </div>
        ) : null}
        {messages.length > 0 ? messages.map((message, index) => {
          const isMe = message.senderId === currentUserId;
          const sender = getUserById(world, message.senderId);
          const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.senderId !== message.senderId);

          return (
            <div key={message.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: theme.spacing.sm,
                  maxWidth: "82%",
                }}
              >
                {!isMe ? (
                  <div style={{ width: theme.spacing.avatarSm }}>
                    {showAvatar ? <LIAvatar size="sm" src={sender?.avatarUrl} name={sender?.name} /> : null}
                  </div>
                ) : null}
                <div
                  style={{
                    padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
                    borderRadius: isMe
                      ? `${theme.radius.lg}px ${theme.radius.lg}px ${theme.radius.sm}px ${theme.radius.lg}px`
                      : `${theme.radius.lg}px ${theme.radius.lg}px ${theme.radius.lg}px ${theme.radius.sm}px`,
                    background: isMe ? theme.colors.accent : theme.colors.surface,
                    color: isMe ? theme.colors.textInverse : theme.colors.textPrimary,
                    boxShadow: !isMe ? theme.shadows.card : undefined,
                    fontSize: theme.typography.body.fontSize,
                    lineHeight: theme.typography.body.lineHeight,
                  }}
                >
                  {message.text}
                </div>
              </div>
              <div
                style={{
                  marginTop: 4,
                  marginLeft: !isMe ? theme.spacing.avatarSm + theme.spacing.sm : 0,
                  fontSize: theme.typography.micro.fontSize,
                  color: theme.colors.textTertiary,
                }}
              >
                {formatRelativeFrameTime(message.createdAt, referenceFrame)}
              </div>
            </div>
          );
        }) : (
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
              {otherUser?.name ?? "Conversation"}
            </div>
            <div
              style={{
                maxWidth: 220,
                textAlign: "center",
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.textSecondary,
              }}
            >
              Reach out about opportunities, partnerships, or quick follow-up.
            </div>
          </div>
        )}
      </ScrollableContent>

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
            gap: theme.spacing.sm,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: theme.radius.pill,
              background: theme.colors.surfaceHover,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LIIcon name="compose" size={16} color={theme.colors.textSecondary} />
          </div>
          <div
            style={{
              flex: 1,
              minHeight: theme.spacing.inputHeight,
              borderRadius: theme.radius.pill,
              background: theme.colors.surfaceHover,
            display: "flex",
            alignItems: "center",
            padding: `0 ${theme.spacing.md}px`,
            fontSize: theme.typography.body.fontSize,
            color: liveDraft ? theme.colors.textPrimary : theme.colors.textTertiary,
          }}
        >
            {liveDraft || "Write a message..."}
            {keyboardState.isKeyboardVisible ? (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 16,
                  marginLeft: 2,
                  background: theme.colors.textPrimary,
                  borderRadius: 1,
                }}
              />
            ) : null}
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: theme.radius.pill,
              background: theme.colors.surfaceHover,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LIIcon name="photo" size={18} color={theme.colors.textSecondary} />
          </div>
          <LIIcon
            name="send"
            size={20}
            color={liveDraft ? theme.colors.accent : theme.colors.textTertiary}
          />
        </div>
      </div>
    </KeyboardAwareView>
  );
};
