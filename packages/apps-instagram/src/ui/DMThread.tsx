import React from "react";
import type { WorldState } from "@tokovo/core";
import { getTypedTextProgress } from "@tokovo/device-keyboard";
import { AppShell } from "./AppShell.js";
import { Avatar, Icon, formatRelativeTime } from "./components.js";
import { useInstagramTheme } from "./ThemeContext.js";
import { getActiveThread, getCurrentUser, getThreadDraft, getUserById, getVisibleDMMessages } from "../runtime/selectors.js";

export const DMThread: React.FC<{
  world: WorldState;
  deviceId?: string;
  t?: number;
}> = ({ world, deviceId, t }) => {
  const theme = useInstagramTheme();
  const currentUser = getCurrentUser(world);
  const thread = getActiveThread(world);
  const messages = getVisibleDMMessages(world, thread?.id ?? null);
  const device = deviceId ? world.devices?.[deviceId] : world.devices?.[Object.keys(world.devices ?? {})[0]];
  const keyboard = device?.keyboard;
  const storedDraft = getThreadDraft(world, thread?.id ?? null);
  const typedDraft =
    keyboard?.visible && keyboard.typingAnimation
      ? getTypedTextProgress(keyboard, t ?? 0)
      : storedDraft;
  const nowMs = messages.reduce((max, message) => Math.max(max, message.createdAt), 0);

  if (!thread) {
    return (
      <AppShell>
        <div style={{ padding: 20, color: theme.colors.textSecondary }}>Thread not found.</div>
      </AppShell>
    );
  }

  const participants = thread.participantIds.filter((id) => id !== currentUser?.id);
  const lead = getUserById(world, participants[0]) ?? undefined;
  const title =
    thread.title ??
    participants.map((id) => getUserById(world, id)?.displayName ?? "Unknown").join(", ");

  return (
    <AppShell>
      <div
        style={{
          height: theme.spacing.headerHeight,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 14px",
          borderBottom: `1px solid ${theme.colors.border}`,
          flexShrink: 0,
        }}
      >
        <Icon name="back" />
        <Avatar size={34} src={lead?.avatarUrl} ring />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>
            {thread.typingUserId
              ? `${getUserById(world, thread.typingUserId)?.displayName ?? "Someone"} is typing…`
              : participants.length > 1
                ? `${participants.length} people`
                : `@${lead?.username ?? "unknown"}`}
          </div>
        </div>
        <Icon name="camera" />
        <Icon name="more" />
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.map((message, index) => {
          const sender = getUserById(world, message.senderId);
          const isSelf = message.senderId === currentUser?.id;
          const previous = messages[index - 1];
          const showTime = !previous || message.createdAt - previous.createdAt > 45 * 60 * 1000;
          return (
            <React.Fragment key={message.id}>
              {showTime ? (
                <div
                  style={{
                    alignSelf: "center",
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: theme.colors.surfaceRaised,
                    fontSize: 11,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {formatRelativeTime(message.createdAt, nowMs)}
                </div>
              ) : null}

              {!isSelf ? (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <Avatar size={28} src={sender?.avatarUrl} />
                  <div
                    style={{
                      maxWidth: "72%",
                      padding: "10px 13px",
                      borderRadius: 18,
                      borderBottomLeftRadius: 8,
                      background: theme.colors.surfaceRaised,
                      color: theme.colors.textPrimary,
                      fontSize: 14,
                      lineHeight: 1.42,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {message.storyId ? (
                      <div
                        style={{
                          marginBottom: 8,
                          padding: "8px 10px",
                          borderRadius: 12,
                          background: theme.colors.accentSoft,
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        Replied to your story
                      </div>
                    ) : null}
                    {message.text}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div
                    style={{
                      maxWidth: "74%",
                      padding: "10px 13px",
                      borderRadius: 18,
                      borderBottomRightRadius: 8,
                      background: `linear-gradient(135deg, ${theme.colors.accentWarm}, ${theme.colors.accent})`,
                      color: "#FFFFFF",
                      fontSize: 14,
                      lineHeight: 1.42,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {thread.typingUserId ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar size={28} src={getUserById(world, thread.typingUserId)?.avatarUrl} />
            <div
              style={{
                display: "inline-flex",
                gap: 4,
                padding: "10px 12px",
                borderRadius: 18,
                background: theme.colors.surfaceRaised,
              }}
            >
              <div className="ig-typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: theme.colors.textSecondary }} />
              <div className="ig-typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: theme.colors.textSecondary, animationDelay: "0.15s" }} />
              <div className="ig-typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: theme.colors.textSecondary, animationDelay: "0.3s" }} />
            </div>
          </div>
        ) : null}
      </div>

      <div
        style={{
          padding: "10px 12px 12px",
          borderTop: `1px solid ${theme.colors.border}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: theme.colors.surface,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: theme.colors.surfaceRaised,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="camera" size={18} color={theme.colors.textSecondary} />
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 40,
            borderRadius: 999,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.backgroundAlt,
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            color: typedDraft ? theme.colors.textPrimary : theme.colors.textSecondary,
            fontSize: 14,
          }}
        >
          {typedDraft || "Message…"}
        </div>
        <Icon name="heart" size={24} />
      </div>
    </AppShell>
  );
};
