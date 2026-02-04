import React from "react";
import type { WorldState } from "@tokovo/core";
import { getXTheme } from "../config/theme";
import { getActiveThread, getThreadMessages, getXState } from "../runtime/selectors";
import { AppShell } from "./AppShell";
import { XIcon } from "./components";
import { ScreenTransition } from "./ScreenTransition";
import { BottomNav } from "./BottomNav";

interface MessageThreadProps {
  world: WorldState;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ world }) => {
  const theme = getXTheme("dark");
  const state = getXState(world);
  const thread = getActiveThread(world);
  const messages = getThreadMessages(world, thread?.id ?? null);

  const getUserName = (id: string) =>
    state?.users.find((u) => u.id === id)?.name ?? "Unknown";

  if (!thread) {
    return (
      <AppShell>
        <div style={{ padding: theme.spacing.screenPadding, color: theme.colors.textSecondary }}>
          Thread not found.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div
        style={{
          height: theme.spacing.headerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${theme.spacing.screenPadding}px`,
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.surface,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700 }}>
          {thread.participantIds.map(getUserName).join(", ")}
        </span>
        <XIcon name="search" />
      </div>

      <ScreenTransition lastNavFrame={state?.lastNavFrame}>
        <div
          style={{
            flex: 1,
            padding: theme.spacing.screenPadding,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {messages.length === 0 && (
            <div style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
              No messages yet.
            </div>
          )}
          {messages.map((message) => {
            const isSelf = message.senderId === state?.currentUserId;
            return (
              <div
                key={message.id}
                style={{
                  alignSelf: isSelf ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  padding: "10px 12px",
                  borderRadius: 16,
                  backgroundColor: isSelf ? theme.colors.accent : theme.colors.surface,
                  color: isSelf ? "#000" : theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <div style={{ fontSize: 14 }}>{message.text}</div>
                <div style={{ fontSize: 11, color: isSelf ? "#0f172a" : theme.colors.textMuted, marginTop: 4 }}>
                  {getUserName(message.senderId)}
                </div>
              </div>
            );
          })}
        </div>
      </ScreenTransition>

      <div
        style={{
          padding: theme.spacing.screenPadding,
          borderTop: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.surface,
        }}
      >
        <div
          style={{
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 999,
            padding: "10px 14px",
            color: theme.colors.textMuted,
            fontSize: 13,
          }}
        >
          Message
        </div>
      </div>

      <BottomNav active="mail" />
    </AppShell>
  );
};
