import React from "react";
import type { WorldState } from "@tokovo/core";
import { Header, LIAvatar, LIIcon } from "./components.js";
import { useLinkedInTheme } from "./ThemeContext.js";
import {
  formatRelativeFrameTime,
  getCurrentUser,
  getNotifications,
  getReferenceFrame,
  getUnreadMessageCount,
  getUserById,
} from "../runtime/selectors.js";

export const Notifications: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const currentUser = getCurrentUser(world);
  const notifications = getNotifications(world);
  const unreadMessages = getUnreadMessageCount(world);
  const referenceFrame = getReferenceFrame(world);

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Header avatarSrc={currentUser?.avatarUrl} title="Notifications" showSearch={false} messageCount={unreadMessages} />

      <div style={{ flex: 1, overflow: "auto" }}>
        {notifications.length > 0 ? notifications.map((notification) => {
          const user = getUserById(world, notification.actorId);
          const config = getNotificationConfig(notification.type, theme);

          return (
            <div
              key={notification.id}
              style={{
                display: "flex",
                gap: theme.spacing.md,
                padding: `${theme.spacing.md}px ${theme.spacing.screenPadding}px`,
                background: notification.unread ? theme.colors.accentLight : theme.colors.surface,
                borderBottom: `1px solid ${theme.colors.border}`,
              }}
            >
              <div style={{ position: "relative" }}>
                <LIAvatar size="lg" src={user?.avatarUrl} name={user?.name} />
                <div
                  style={{
                    position: "absolute",
                    right: -4,
                    bottom: -4,
                    width: 22,
                    height: 22,
                    borderRadius: theme.radius.pill,
                    background: config.color,
                    border: `2px solid ${notification.unread ? theme.colors.accentLight : theme.colors.surface}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LIIcon name={config.icon} size={10} color={theme.colors.textInverse} />
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: theme.typography.body.fontSize,
                    lineHeight: theme.typography.body.lineHeight,
                    color: theme.colors.textPrimary,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{user?.name ?? notification.title ?? "Someone"}</span>{" "}
                  {notification.body ?? getFallbackBody(notification.type)}
                </div>
                <div
                  style={{
                    fontSize: theme.typography.caption.fontSize,
                    color: theme.colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  {formatRelativeFrameTime(notification.createdAt, referenceFrame)}
                </div>
              </div>

              {notification.unread ? (
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: theme.radius.pill,
                    background: theme.colors.accent,
                    alignSelf: "center",
                    marginTop: 6,
                  }}
                />
              ) : (
                <LIIcon name="more" size={16} color={theme.colors.textTertiary} />
              )}
            </div>
          );
        }) : (
          <div
            style={{
              padding: `${theme.spacing.xxxl}px ${theme.spacing.xl}px`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                margin: "0 auto",
                marginBottom: theme.spacing.lg,
                borderRadius: theme.radius.pill,
                background: theme.colors.accentLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LIIcon name="bell" size={32} color={theme.colors.accent} />
            </div>
            <div
              style={{
                fontSize: theme.typography.title.fontSize,
                fontWeight: theme.typography.title.fontWeight,
                color: theme.colors.textPrimary,
              }}
            >
              No notifications yet
            </div>
            <div
              style={{
                marginTop: theme.spacing.sm,
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.textSecondary,
              }}
            >
              New reactions, comments, follows, and messages will land here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getNotificationConfig(
  type: "reaction" | "comment" | "repost" | "connection" | "follow" | "message",
  theme: ReturnType<typeof useLinkedInTheme>,
): { icon: "like-fill" | "comment" | "repost" | "network" | "bell" | "message"; color: string } {
  switch (type) {
    case "comment":
      return { icon: "comment", color: theme.colors.accent };
    case "repost":
      return { icon: "repost", color: theme.colors.success };
    case "connection":
      return { icon: "network", color: theme.colors.success };
    case "message":
      return { icon: "message", color: "#7b61ff" };
    case "follow":
      return { icon: "bell", color: theme.colors.reactionCelebrate };
    case "reaction":
    default:
      return { icon: "like-fill", color: theme.colors.reactionLike };
  }
}

function getFallbackBody(type: "reaction" | "comment" | "repost" | "connection" | "follow" | "message"): string {
  switch (type) {
    case "comment":
      return "commented on your post";
    case "repost":
      return "reposted your update";
    case "connection":
      return "accepted your invitation";
    case "follow":
      return "started following you";
    case "message":
      return "sent you a message";
    case "reaction":
    default:
      return "reacted to your post";
  }
}
