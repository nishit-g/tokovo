import React from "react";
import type { WorldState } from "@tokovo/core";
import { getXTheme } from "../config/theme";
import {
  getActiveThread,
  getThreadMessages,
  getXState,
} from "../runtime/selectors";
import { AppShell } from "./AppShell";
import { Avatar, XIcon, VerifiedBadge, formatTimestamp } from "./components";
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

  const getUser = (id: string) => state?.users.find((u) => u.id === id);

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

  const otherParticipants = thread.participantIds.filter(
    (id) => id !== state?.currentUserId
  );
  const mainParticipant = getUser(otherParticipants[0] ?? "");

  return (
    <AppShell>
      {/* Header */}
      <div
        style={{
          height: theme.spacing.headerHeight,
          display: "flex",
          alignItems: "center",
          padding: `0 ${theme.spacing.screenPadding}px`,
          gap: 16,
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <XIcon name="back" size={20} color={theme.colors.textPrimary} />
        <Avatar size={32} />
        <div style={{ flex: 1 }}>
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
              {mainParticipant?.name ?? "Unknown"}
            </span>
            {mainParticipant?.verified && (
              <VerifiedBadge variant={mainParticipant.verified} size={16} />
            )}
          </div>
          <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>
            @{mainParticipant?.handle ?? "unknown"}
          </div>
        </div>
        <XIcon name="more" size={20} color={theme.colors.textPrimary} />
      </div>

      <ScreenTransition lastNavFrame={state?.lastNavFrame}>
        {/* Participant Profile Card */}
        <div
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <Avatar size={64} />
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: theme.colors.textPrimary,
              }}
            >
              {mainParticipant?.name ?? "Unknown"}
            </span>
            {mainParticipant?.verified && (
              <VerifiedBadge variant={mainParticipant.verified} size={18} />
            )}
          </div>
          <div style={{ fontSize: 15, color: theme.colors.textSecondary }}>
            @{mainParticipant?.handle ?? "unknown"}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 15,
              color: theme.colors.textSecondary,
            }}
          >
            {mainParticipant?.bio ?? ""}
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 13,
              color: theme.colors.textMuted,
            }}
          >
            {mainParticipant?.followers ?? 0} Followers
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            padding: theme.spacing.screenPadding,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: theme.colors.textSecondary,
                fontSize: 15,
                marginTop: 24,
              }}
            >
              Start your conversation
            </div>
          )}

          {messages.map((message, index) => {
            const isSelf = message.senderId === state?.currentUserId;
            const prevMessage = messages[index - 1];
            const showTimestamp =
              !prevMessage ||
              message.createdAt - prevMessage.createdAt > 3600 * 1000;

            return (
              <React.Fragment key={message.id}>
                {showTimestamp && (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 13,
                      color: theme.colors.textMuted,
                      marginTop: 16,
                      marginBottom: 8,
                    }}
                  >
                    {formatTimestamp(message.createdAt)}
                  </div>
                )}
                <div
                  style={{
                    alignSelf: isSelf ? "flex-end" : "flex-start",
                    maxWidth: "75%",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 24,
                      borderBottomRightRadius: isSelf ? 4 : 24,
                      borderBottomLeftRadius: isSelf ? 24 : 4,
                      backgroundColor: isSelf
                        ? theme.colors.accent
                        : theme.colors.surfaceRaised,
                      color: isSelf ? "#FFFFFF" : theme.colors.textPrimary,
                    }}
                  >
                    <div style={{ fontSize: 15, lineHeight: 1.4 }}>
                      {message.text}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </ScreenTransition>

      {/* Message Input */}
      <div
        style={{
          padding: `12px ${theme.spacing.screenPadding}px`,
          borderTop: `1px solid ${theme.colors.border}`,
          backgroundColor: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: theme.colors.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <XIcon name="compose" size={16} color="#FFFFFF" />
        </div>
        <div
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 20,
            backgroundColor: theme.colors.surfaceRaised,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textSecondary,
            fontSize: 15,
          }}
        >
          Start a new message
        </div>
        <XIcon name="mail" size={22} color={theme.colors.textSecondary} />
      </div>

      <BottomNav active="mail" />
    </AppShell>
  );
};
