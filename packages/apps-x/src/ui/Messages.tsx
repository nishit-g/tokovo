import React from "react";
import type { WorldState } from "@tokovo/core";
import { useXTheme } from "./ThemeContext.js";
import {
  getDMThreads,
  getThreadDraft,
  getXState,
} from "../runtime/selectors.js";
import { AppShell } from "./AppShell.js";
import { Avatar, VerifiedBadge, XIcon, formatTimestamp } from "./components.js";
import { ScreenTransition } from "./ScreenTransition.js";
import { BottomNav } from "./BottomNav.js";

interface MessagesProps {
  world: WorldState;
}

export const Messages: React.FC<MessagesProps> = ({ world }) => {
  const theme = useXTheme();
  const state = getXState(world);
  const threads = getDMThreads(world);
  const users = state?.users ?? [];
  const currentUser = users.find((user) => user.id === state?.currentUserId);
  const nowMs = (state?.dmMessages ?? []).reduce(
    (max, message) => Math.max(max, message.createdAt),
    0,
  );

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
            justifyContent: "space-between",
            padding: `0 ${theme.spacing.screenPadding}px`,
            borderBottom: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background,
            flexShrink: 0,
          }}
        >
          <Avatar size={32} src={currentUser?.avatarUrl} />
          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: theme.colors.textPrimary,
            }}
          >
            Messages
          </span>
          <XIcon name="compose" size={22} color={theme.colors.textPrimary} />
        </div>

        <div style={{ padding: `12px ${theme.spacing.screenPadding}px`, flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 999,
              backgroundColor: theme.colors.surfaceRaised,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <XIcon name="search" size={18} color={theme.colors.textSecondary} />
            <span style={{ fontSize: 15, color: theme.colors.textSecondary }}>
              Search Direct Messages
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `0 ${theme.spacing.screenPadding}px 12px`,
            borderBottom: `1px solid ${theme.colors.border}`,
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: theme.colors.textPrimary,
              }}
            >
              Message requests
            </div>
            <div style={{ marginTop: 2, fontSize: 13, color: theme.colors.textSecondary }}>
              Keep spam and unknown senders separate from your inbox.
            </div>
          </div>
          <XIcon name="mail" size={20} color={theme.colors.textSecondary} />
        </div>

        <ScreenTransition lastNavFrame={state?.lastNavFrame}>
          <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            {threads.length === 0 ? (
              <div
                style={{
                  padding: 32,
                  color: theme.colors.textSecondary,
                }}
              >
                <div
                  style={{
                    fontSize: 31,
                    lineHeight: 1.1,
                    fontWeight: 800,
                    color: theme.colors.textPrimary,
                  }}
                >
                  Welcome to your inbox
                </div>
                <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.45 }}>
                  Seed DM threads and messages to show private conversations,
                  unread states, and typing previews.
                </div>
              </div>
            ) : null}

            {threads.map((thread) => {
              const participants = thread.participantIds.filter(
                (id) => id !== state?.currentUserId,
              );
              const mainParticipant = users.find((user) => user.id === participants[0]);
              const lastMessageId = thread.messageIds[thread.messageIds.length - 1];
              const lastMessage = state?.dmMessages.find((message) => message.id === lastMessageId);
              const draft = getThreadDraft(world, thread.id);
              const title =
                thread.title ??
                (participants.length > 1
                  ? participants
                      .map((id) => users.find((user) => user.id === id)?.name ?? "Unknown")
                      .join(", ")
                  : mainParticipant?.name ?? "Unknown");
              const preview = thread.typingUserId
                ? `${users.find((user) => user.id === thread.typingUserId)?.name ?? "Someone"} is typing…`
                : draft
                  ? `Draft: ${draft}`
                  : lastMessage?.text ?? "No messages yet";

              return (
                <div
                  key={thread.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: `${theme.spacing.tweetPaddingV}px ${theme.spacing.tweetPaddingH}px`,
                    borderBottom: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <Avatar size={48} src={mainParticipant?.avatarUrl} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {thread.pinned ? (
                        <span
                          style={{
                            fontSize: 12,
                            color: theme.colors.accent,
                            fontWeight: 700,
                            letterSpacing: 0.2,
                          }}
                        >
                          PINNED
                        </span>
                      ) : null}
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: theme.colors.textPrimary,
                        }}
                      >
                        {title}
                      </span>
                      {mainParticipant?.verified && participants.length === 1 ? (
                        <VerifiedBadge variant={mainParticipant.verified} size={16} />
                      ) : null}
                      <div style={{ marginLeft: "auto", fontSize: 13, color: theme.colors.textSecondary }}>
                        {thread.lastMessageAt
                          ? formatTimestamp(thread.lastMessageAt, { nowMs })
                          : ""}
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 15,
                        color: thread.typingUserId
                          ? theme.colors.accent
                          : thread.unreadCount > 0
                            ? theme.colors.textPrimary
                            : theme.colors.textSecondary,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {preview}
                    </div>
                  </div>
                  {thread.unreadCount > 0 ? (
                    <div
                      style={{
                        minWidth: 22,
                        height: 22,
                        borderRadius: 999,
                        backgroundColor: theme.colors.accent,
                        color: "#FFFFFF",
                        fontSize: 12,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        alignSelf: "center",
                      }}
                    >
                      {thread.unreadCount}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </ScreenTransition>
      </div>

      <BottomNav active="mail" />
    </AppShell>
  );
};
