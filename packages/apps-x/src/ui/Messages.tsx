import React from "react";
import type { WorldState } from "@tokovo/core";
import { getXTheme } from "../config/theme";
import { getDMThreads, getXState } from "../runtime/selectors";
import { AppShell } from "./AppShell";
import { Avatar, XIcon } from "./components";
import { ScreenTransition } from "./ScreenTransition";
import { BottomNav } from "./BottomNav";

interface MessagesProps {
  world: WorldState;
}

export const Messages: React.FC<MessagesProps> = ({ world }) => {
  const theme = getXTheme("dark");
  const state = getXState(world);
  const threads = getDMThreads(world);

  const getUserName = (id: string) =>
    state?.users.find((u) => u.id === id)?.name ?? "Unknown";

  const getLastMessage = (threadId: string) => {
    const messages = state?.dmMessages.filter((m) => m.threadId === threadId) ?? [];
    return messages[messages.length - 1];
  };

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
        <span style={{ fontSize: 14, fontWeight: 700 }}>Messages</span>
        <XIcon name="search" />
      </div>

      <ScreenTransition lastNavFrame={state?.lastNavFrame}>
        <div style={{ padding: theme.spacing.screenPadding, flex: 1 }}>
          {threads.length === 0 && (
            <div style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
              No messages yet.
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.cardGap }}>
            {threads.map((thread) => {
              const last = getLastMessage(thread.id);
              const participants = thread.participantIds
                .map((id) => getUserName(id))
                .join(", ");
              return (
                <div
                  key={thread.id}
                  style={{
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: 12,
                    padding: theme.spacing.cardPadding,
                    backgroundColor: theme.colors.surface,
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <Avatar size={32} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{participants}</div>
                    <div style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 6 }}>
                      {last ? last.text : "No messages"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScreenTransition>

      <BottomNav active="mail" />
    </AppShell>
  );
};
