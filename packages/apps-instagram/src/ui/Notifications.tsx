import React from "react";
import type { WorldState } from "@tokovo/core";
import { AppShell } from "./AppShell.js";
import { Avatar, BottomNav, Icon, formatRelativeTime } from "./components.js";
import { useInstagramTheme } from "./ThemeContext.js";
import { getInstagramState, getUserById, getVisibleNotifications } from "../runtime/selectors.js";

export const NotificationsScreen: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useInstagramTheme();
  const state = getInstagramState(world);
  const notifications = getVisibleNotifications(world);
  const nowMs = notifications.reduce((max, item) => Math.max(max, item.createdAt), 0);

  return (
    <AppShell>
      <div
        style={{
          height: theme.spacing.headerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `1px solid ${theme.colors.border}`,
          fontSize: 17,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        Notifications
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {notifications.map((notification) => {
          const actor = getUserById(world, notification.actorId);
          const post = state?.posts.find((item) => item.id === notification.postId);
          return (
            <div
              key={notification.id}
              style={{
                display: "flex",
                gap: 12,
                padding: "14px 16px",
                borderBottom: `1px solid ${theme.colors.border}`,
                background: notification.read ? theme.colors.surface : theme.colors.accentSoft,
              }}
            >
              <Avatar size={42} src={actor?.avatarUrl} ring />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, lineHeight: 1.45 }}>
                  <span style={{ fontWeight: 700 }}>{actor?.username ?? "unknown"}</span>{" "}
                  <span style={{ color: theme.colors.textSecondary }}>
                    {notification.body ??
                      (notification.type === "follow"
                        ? "started following you."
                        : notification.type === "dm"
                          ? "sent you a new message."
                          : notification.type === "story_reply"
                            ? "replied to your story."
                            : notification.type === "comment"
                              ? "commented on your post."
                              : "liked your post.")}
                  </span>
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: theme.colors.textMuted }}>
                  {formatRelativeTime(notification.createdAt, nowMs)}
                </div>
              </div>
              {post ? (
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 8,
                    overflow: "hidden",
                    background: theme.colors.backgroundAlt,
                  }}
                >
                  <img src={post.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <Icon name="heart" size={18} color={theme.colors.accent} />
              )}
            </div>
          );
        })}
      </div>

      <BottomNav active="heart" />
    </AppShell>
  );
};
