import React from "react";
import type { WorldState } from "@tokovo/core";
import { getTypedTextProgress } from "@tokovo/device-keyboard";
import { useXTheme } from "./ThemeContext.js";
import {
  getActiveThread,
  getThreadDraft,
  getThreadMessages,
  getXState,
} from "../runtime/selectors.js";
import { AppShell } from "./AppShell.js";
import { Avatar, VerifiedBadge, XIcon, formatTimestamp } from "./components.js";
import { ScreenTransition } from "./ScreenTransition.js";
import { BottomNav } from "./BottomNav.js";

interface MessageThreadProps {
  world: WorldState;
  deviceId?: string;
  t?: number;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  world,
  deviceId,
  t,
}) => {
  const theme = useXTheme();
  const state = getXState(world);
  const thread = getActiveThread(world);
  const messages = getThreadMessages(world, thread?.id ?? null);
  const users = state?.users ?? [];
  const focusedDevice =
    (deviceId && world.devices?.[deviceId]) ||
    world.devices?.[Object.keys(world.devices ?? {})[0]];
  const keyboard = focusedDevice?.keyboard;
  const storedDraft = getThreadDraft(world, thread?.id ?? null);
  const typedDraft =
    keyboard?.visible && keyboard.typingAnimation
      ? getTypedTextProgress(keyboard, t ?? 0)
      : storedDraft;
  const nowMs = messages.reduce((max, message) => Math.max(max, message.createdAt), 0);

  if (!thread) {
    return (
      <AppShell>
        <div
          style={{
            padding: theme.spacing.screenPadding,
            color: theme.colors.textSecondary,
          }}
        >
          Thread not found.
        </div>
      </AppShell>
    );
  }

  const participants = thread.participantIds.filter((id) => id !== state?.currentUserId);
  const mainParticipant = users.find((user) => user.id === participants[0]);
  const title =
    thread.title ??
    (participants.length > 1
      ? participants
          .map((id) => users.find((user) => user.id === id)?.name ?? "Unknown")
          .join(", ")
      : mainParticipant?.name ?? "Unknown");
  const subtitle =
    participants.length > 1
      ? `${participants.length} participants`
      : `@${mainParticipant?.handle ?? "unknown"}`;
  const typingUser = thread.typingUserId
    ? users.find((user) => user.id === thread.typingUserId)
    : null;

  return (
    <AppShell>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: theme.spacing.headerHeight,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: `0 ${theme.spacing.screenPadding}px`,
            borderBottom: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background,
            flexShrink: 0,
          }}
        >
          <XIcon name="back" size={20} color={theme.colors.textPrimary} />
          <Avatar size={32} src={mainParticipant?.avatarUrl} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: theme.colors.textPrimary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {title}
              </span>
              {mainParticipant?.verified && participants.length === 1 ? (
                <VerifiedBadge variant={mainParticipant.verified} size={16} />
              ) : null}
            </div>
            <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>
              {typingUser ? `${typingUser.name} is typing…` : subtitle}
            </div>
          </div>
          <XIcon name="more" size={20} color={theme.colors.textPrimary} />
        </div>

        <ScreenTransition lastNavFrame={state?.lastNavFrame}>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              padding: `${theme.spacing.screenPadding}px`,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  marginTop: 24,
                  fontSize: 15,
                  color: theme.colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Start your conversation.
              </div>
            ) : null}

            {messages.map((message, index) => {
              const isSelf = message.senderId === state?.currentUserId;
              const previous = messages[index - 1];
              const showDayBreak =
                !previous || message.createdAt - previous.createdAt > 60 * 60 * 1000;
              const sender = users.find((user) => user.id === message.senderId);
              return (
                <React.Fragment key={message.id}>
                  {showDayBreak ? (
                    <div
                      style={{
                        alignSelf: "center",
                        margin: "8px 0 4px",
                        padding: "6px 12px",
                        borderRadius: 999,
                        backgroundColor: theme.colors.surfaceRaised,
                        color: theme.colors.textSecondary,
                        fontSize: 13,
                      }}
                    >
                      {formatTimestamp(message.createdAt, { nowMs })}
                    </div>
                  ) : null}

                  {!isSelf && participants.length > 1 ? (
                    <div
                      style={{
                        marginLeft: 44,
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {sender?.name ?? "Unknown"}
                    </div>
                  ) : null}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: isSelf ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "78%",
                        padding: "12px 14px",
                        borderRadius: 18,
                        borderBottomRightRadius: isSelf ? 6 : 18,
                        borderBottomLeftRadius: isSelf ? 18 : 6,
                        backgroundColor: isSelf ? theme.colors.accent : theme.colors.surfaceRaised,
                        color: isSelf ? "#FFFFFF" : theme.colors.textPrimary,
                        fontSize: 15,
                        lineHeight: 1.4,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {message.text}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {typingUser ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 6,
                }}
              >
                <Avatar size={28} src={typingUser.avatarUrl} />
                <div
                  style={{
                    display: "inline-flex",
                    gap: 4,
                    padding: "10px 12px",
                    borderRadius: 18,
                    backgroundColor: theme.colors.surfaceRaised,
                  }}
                >
                  <div className="x-typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: theme.colors.textSecondary }} />
                  <div className="x-typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: theme.colors.textSecondary, animationDelay: "0.15s" }} />
                  <div className="x-typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: theme.colors.textSecondary, animationDelay: "0.3s" }} />
                </div>
              </div>
            ) : null}
          </div>
        </ScreenTransition>
      </div>

      <div
        style={{
          padding: `10px ${theme.spacing.screenPadding}px`,
          borderTop: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.background,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: `1px solid ${theme.colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.colors.accent,
            flexShrink: 0,
          }}
        >
          <XIcon name="compose" size={16} color={theme.colors.accent} />
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 42,
            padding: "10px 14px",
            borderRadius: 999,
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.surfaceRaised,
            color: typedDraft ? theme.colors.textPrimary : theme.colors.textSecondary,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
          }}
        >
          {typedDraft || "Start a new message"}
        </div>
        <XIcon name="mail" size={22} color={theme.colors.textSecondary} />
      </div>

      <BottomNav active="mail" />
    </AppShell>
  );
};
