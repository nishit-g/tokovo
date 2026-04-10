import React from "react";
import type { WorldState } from "@tokovo/core";
import { AppShell } from "./AppShell.js";
import { Avatar, Icon, formatRelativeTime } from "./components.js";
import { useInstagramTheme } from "./ThemeContext.js";
import { getCurrentUser, getInboxThreads, getInstagramState, getThreadDraft, getUserById } from "../runtime/selectors.js";

export const Inbox: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useInstagramTheme();
  const state = getInstagramState(world);
  const currentUser = getCurrentUser(world);
  const threads = getInboxThreads(world);
  const nowMs = (state?.dmMessages ?? []).reduce((max, message) => Math.max(max, message.createdAt), 0);

  return (
    <AppShell>
      <div
        style={{
          height: theme.spacing.headerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: `1px solid ${theme.colors.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="back" />
          <div style={{ fontSize: 18, fontWeight: 700 }}>{currentUser?.username ?? "inbox"}</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <Icon name="camera" />
          <Icon name="plus" />
        </div>
      </div>

      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${theme.colors.border}`, flexShrink: 0 }}>
        <div
          style={{
            height: 40,
            borderRadius: 12,
            background: theme.colors.surfaceRaised,
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            gap: 8,
            color: theme.colors.textSecondary,
            fontSize: 14,
          }}
        >
          <Icon name="search" size={18} color={theme.colors.textSecondary} />
          Search
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {threads.map((thread) => {
          const otherIds = thread.participantIds.filter((id) => id !== currentUser?.id);
          const lead = getUserById(world, otherIds[0]) ?? undefined;
          const previewMessageId = thread.messageIds[thread.messageIds.length - 1];
          const previewMessage = state?.dmMessages.find((message) => message.id === previewMessageId);
          const draft = getThreadDraft(world, thread.id);
          const title =
            thread.title ??
            otherIds.map((id) => getUserById(world, id)?.displayName ?? "Unknown").join(", ");
          const preview =
            thread.typingUserId
              ? `${getUserById(world, thread.typingUserId)?.displayName ?? "Someone"} is typing…`
              : draft
                ? `Draft: ${draft}`
                : previewMessage?.text ?? "No messages yet";
          return (
            <div
              key={thread.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderBottom: `1px solid ${theme.colors.border}`,
              }}
            >
              <Avatar size={54} src={lead?.avatarUrl} ring />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {title}
                  </div>
                  {thread.pinned ? (
                    <div style={{ fontSize: 10, color: theme.colors.accent, fontWeight: 700 }}>PINNED</div>
                  ) : null}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: thread.typingUserId ? theme.colors.accentCool : theme.colors.textSecondary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {preview}
                </div>
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <div style={{ fontSize: 11, color: theme.colors.textMuted }}>
                  {thread.lastMessageAt ? formatRelativeTime(thread.lastMessageAt, nowMs) : ""}
                </div>
                {thread.unreadCount > 0 ? (
                  <div
                    style={{
                      minWidth: 18,
                      height: 18,
                      borderRadius: 999,
                      background: theme.colors.accent,
                      color: "#FFFFFF",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 6px",
                    }}
                  >
                    {thread.unreadCount}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
};
