import React from "react";
import type { WorldState } from "@tokovo/core";
import { getXTheme } from "../config/theme";
import { getNotifications, getXState } from "../runtime/selectors";
import { AppShell } from "./AppShell";
import { Avatar, XIcon } from "./components";
import { ScreenTransition } from "./ScreenTransition";
import { BottomNav } from "./BottomNav";

interface NotificationsProps {
  world: WorldState;
}

export const Notifications: React.FC<NotificationsProps> = ({ world }) => {
  const theme = getXTheme("dark");
  const state = getXState(world);
  const notifications = getNotifications(world);
  const users = state?.users ?? [];
  const tab = state?.notificationsTab ?? "all";

  const getUser = (id: string | undefined) => users.find((u) => u.id === id);
  const filtered =
    tab === "mentions"
      ? notifications.filter((n) => n.isMention || n.type === "mention")
      : notifications;

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
        <span style={{ fontSize: 14, fontWeight: 700 }}>Notifications</span>
        <XIcon name="search" />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          padding: `12px ${theme.spacing.screenPadding}px 0`,
        }}
      >
        <button
          style={{
            flex: 1,
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: tab === "all" ? theme.colors.textPrimary : theme.colors.surface,
            color: tab === "all" ? theme.colors.background : theme.colors.textMuted,
            borderRadius: 999,
            padding: "6px 0",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          All
        </button>
        <button
          style={{
            flex: 1,
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: tab === "mentions" ? theme.colors.textPrimary : theme.colors.surface,
            color: tab === "mentions" ? theme.colors.background : theme.colors.textMuted,
            borderRadius: 999,
            padding: "6px 0",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Mentions
        </button>
      </div>

      <ScreenTransition lastNavFrame={state?.lastNavFrame}>
        <div style={{ padding: theme.spacing.screenPadding, flex: 1 }}>
          {filtered.length === 0 && (
            <div style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
              Nothing new yet.
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.cardGap }}>
            {filtered.map((n) => {
              const actor = getUser(n.actorId);
              const label = n.type.charAt(0).toUpperCase() + n.type.slice(1);
              return (
                <div
                  key={n.id}
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
                    <div style={{ fontSize: 14 }}>
                      {actor?.name ?? "Someone"} {label} your post
                    </div>
                    {n.tweetId && (
                      <div style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 6 }}>
                        Tweet ID: {n.tweetId}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScreenTransition>

      <BottomNav active="bell" />
    </AppShell>
  );
};
