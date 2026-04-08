/**
 * Messages Screen
 * ===============
 * LinkedIn messaging inbox with conversation list.
 */
import React from "react";
import type { WorldState } from "@tokovo/core";
import { useLinkedInTheme } from "./ThemeContext.js";
import { Header, LIAvatar, LIIcon } from "./components.js";
import { getDMThreads, getUserById } from "../runtime/selectors.js";
import { getStableBoolean } from "./stable.js";

export const Messages: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const threads = getDMThreads(world);

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Header title="Messaging" showSearch={false} />

      {/* Search Bar */}
      <div style={{ padding: `${theme.spacing.sm}px ${theme.spacing.screenPadding}px` }}>
        <div
          style={{
            height: theme.spacing.inputHeight,
            background: theme.colors.surfaceHover,
            borderRadius: theme.radius.input,
            display: "flex",
            alignItems: "center",
            padding: `0 ${theme.spacing.md}px`,
            gap: theme.spacing.sm,
            color: theme.colors.textSecondary,
            fontSize: theme.typography.body.fontSize,
          }}
        >
          <LIIcon name="search" size={16} color={theme.colors.textSecondary} />
          <span>Search messages</span>
        </div>
      </div>

      {/* Conversations List */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {threads.map((thread) => {
          const otherUserId = thread.participantIds.find((id) => id !== null);
          const user = getUserById(world, otherUserId ?? null);
          const isOnline = getStableBoolean(thread.id);

          return (
            <div
              key={thread.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.md,
                padding: `${theme.spacing.md}px ${theme.spacing.screenPadding}px`,
                borderBottom: `1px solid ${theme.colors.border}`,
                cursor: "pointer",
              }}
            >
              <LIAvatar
                size="lg"
                src={user?.avatarUrl}
                name={user?.name}
                showOnline={isOnline}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  <span
                    style={{
                      fontSize: theme.typography.headline.fontSize,
                      fontWeight: theme.typography.headline.fontWeight,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    {user?.name ?? "LinkedIn User"}
                  </span>
                  <span
                    style={{
                      fontSize: theme.typography.caption.fontSize,
                      color: theme.colors.textTertiary,
                    }}
                  >
                    2h ago
                  </span>
                </div>
                <div
                  style={{
                    fontSize: theme.typography.bodySmall.fontSize,
                    color: theme.colors.textSecondary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.headline ?? "Tap to view conversation"}
                </div>
              </div>
            </div>
          );
        })}

        {threads.length === 0 && (
          <div
            style={{
              padding: theme.spacing.xxl,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto",
                marginBottom: theme.spacing.lg,
                borderRadius: theme.radius.pill,
                background: theme.colors.accentLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LIIcon name="message" size={32} color={theme.colors.accent} />
            </div>
            <div
              style={{
                fontSize: theme.typography.title.fontSize,
                fontWeight: theme.typography.title.fontWeight,
                color: theme.colors.textPrimary,
                marginBottom: theme.spacing.sm,
              }}
            >
              No messages yet
            </div>
            <div
              style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.textSecondary,
              }}
            >
              Start a conversation with your connections
            </div>
          </div>
        )}
      </div>

      {/* Compose FAB */}
      <div
        style={{
          position: "absolute",
          bottom: theme.spacing.navHeight + theme.spacing.lg,
          right: theme.spacing.screenPadding,
          width: theme.spacing.composerHeight,
          height: theme.spacing.composerHeight,
          borderRadius: theme.radius.pill,
          background: theme.colors.accent,
          boxShadow: theme.shadows.fab,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <LIIcon name="send" size={24} color={theme.colors.textInverse} />
      </div>
    </div>
  );
};
