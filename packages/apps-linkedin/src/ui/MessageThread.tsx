import React from "react";
import type { WorldState } from "@tokovo/core";
import { useLinkedInTheme } from "./ThemeContext.js";
import { LIAvatar, LIIcon } from "./components.js";
import { getActiveThread, getThreadMessages, getUserById } from "../runtime/selectors.js";

export const MessageThread: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const thread = getActiveThread(world);
  const messages = getThreadMessages(world, thread?.id ?? null);
  const titleUserId = thread?.participantIds?.[0] ?? null;
  const titleUser = getUserById(world, titleUserId);

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: theme.spacing.screenPadding,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: theme.colors.surface,
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <LIIcon name="back" />
        <LIAvatar size={34} src={titleUser?.avatarUrl} />
        <div style={{ fontWeight: 900, fontSize: 14 }}>{titleUser?.name ?? "Message"}</div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: theme.spacing.screenPadding, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m) => {
          const isMe = m.senderId === "me";
          const u = getUserById(world, m.senderId);
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "78%",
                  padding: "10px 12px",
                  borderRadius: 16,
                  background: isMe ? theme.colors.accent : theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  color: isMe ? "#fff" : theme.colors.textPrimary,
                  border: isMe ? "none" : `1px solid ${theme.colors.border}`,
                  lineHeight: "18px",
                  fontSize: 13,
                }}
              >
                {!isMe && (
                  <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.8, marginBottom: 4 }}>
                    {u?.name ?? "Them"}
                  </div>
                )}
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: 12, background: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LIAvatar size={30} />
          <div
            style={{
              flex: 1,
              height: 42,
              borderRadius: 999,
              border: `1px solid ${theme.colors.border}`,
              background: theme.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              color: theme.colors.textMuted,
              fontSize: 13,
            }}
          >
            Write a message...
          </div>
        </div>
      </div>
    </div>
  );
};

