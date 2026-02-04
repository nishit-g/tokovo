import React from "react";
import type { WorldState } from "@tokovo/core";
import { useXTheme } from "./ThemeContext";
import { getDMThreads, getXState } from "../runtime/selectors";
import { AppShell } from "./AppShell";
import { Avatar, XIcon, formatTimestamp } from "./components";
import { ScreenTransition } from "./ScreenTransition";
import { BottomNav } from "./BottomNav";

interface MessagesProps {
  world: WorldState;
}

export const Messages: React.FC<MessagesProps> = ({ world }) => {
  const theme = useXTheme();
  const state = getXState(world);
  const threads = getDMThreads(world);

  const getUserName = (id: string) =>
    state?.users.find((u) => u.id === id)?.name ?? "Unknown";

  const getUser = (id: string) => state?.users.find((u) => u.id === id);

  const getLastMessage = (threadId: string) => {
    const messages =
      state?.dmMessages.filter((m) => m.threadId === threadId) ?? [];
    return messages[messages.length - 1];
  };

  return (
    <AppShell>
      {/* Header */}
      <div
        style={{
          height: theme.spacing.headerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${theme.spacing.screenPadding}px`,
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Avatar size={32} />
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

      {/* Search Bar */}
      <div style={{ padding: `12px ${theme.spacing.screenPadding}px` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            borderRadius: 20,
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

      {/* Requests Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `12px ${theme.spacing.screenPadding}px`,
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: theme.colors.surfaceRaised,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <XIcon name="mail" size={20} color={theme.colors.textSecondary} />
          </div>
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
            <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>
              0 requests
            </div>
          </div>
        </div>
        <XIcon name="more" size={18} color={theme.colors.textSecondary} />
      </div>

      <ScreenTransition lastNavFrame={state?.lastNavFrame}>
        <div style={{ flex: 1 }}>
          {threads.length === 0 && (
            <div
              style={{
                padding: 32,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 31,
                  fontWeight: 800,
                  color: theme.colors.textPrimary,
                }}
              >
                Welcome to your inbox!
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 15,
                  color: theme.colors.textSecondary,
                }}
              >
                Drop a line, share posts and more with private conversations
                between you and others on X.
              </div>
              <button
                style={{
                  marginTop: 24,
                  padding: "12px 32px",
                  borderRadius: 9999,
                  border: "none",
                  backgroundColor: theme.colors.accent,
                  color: "#FFFFFF",
                  fontSize: 17,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Write a message
              </button>
            </div>
          )}

          {threads.map((thread) => {
            const lastMessage = getLastMessage(thread.id);
            const otherParticipants = thread.participantIds.filter(
              (id) => id !== state?.currentUserId
            );
            const mainParticipant = getUser(otherParticipants[0] ?? "");
            const isGroup = otherParticipants.length > 1;

            return (
              <div
                key={thread.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: `12px ${theme.spacing.screenPadding}px`,
                  borderBottom: `1px solid ${theme.colors.border}`,
                  gap: 12,
                }}
              >
                {/* Avatar */}
                <Avatar size={48} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: theme.colors.textPrimary,
                      }}
                    >
                      {isGroup
                        ? otherParticipants.map(getUserName).join(", ")
                        : mainParticipant?.name ?? "Unknown"}
                    </span>
                    {mainParticipant?.verified && !isGroup && (
                      <svg width={16} height={16} viewBox="0 0 22 22" fill="none">
                        <circle cx="11" cy="11" r="11" fill="#1D9BF0" />
                        <path
                          d="M9.64 12.5l-2.14-2.14 1.06-1.06 1.08 1.08 3.54-3.54 1.06 1.06z"
                          fill="#fff"
                        />
                      </svg>
                    )}
                    <span
                      style={{
                        fontSize: 15,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      @{mainParticipant?.handle ?? "unknown"}
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      ·
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {lastMessage?.createdAt
                        ? formatTimestamp(lastMessage.createdAt)
                        : ""}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: theme.colors.textSecondary,
                      marginTop: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lastMessage?.text ?? "No messages yet"}
                  </div>
                </div>

                {/* Unread indicator (if needed) */}
              </div>
            );
          })}
        </div>
      </ScreenTransition>

      <BottomNav active="mail" />
    </AppShell>
  );
};
