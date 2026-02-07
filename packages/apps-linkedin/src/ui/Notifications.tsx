/**
 * Notifications Screen
 * ====================
 * LinkedIn notifications with type-specific styling.
 */
import React from "react";
import type { WorldState } from "@tokovo/core";
import { useLinkedInTheme } from "./ThemeContext.js";
import { Header, LIAvatar, LIIcon } from "./components.js";
import { getNotifications, getUserById } from "../runtime/selectors.js";

export const Notifications: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const notifications = getNotifications(world);

  // Get notification icon and color based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return { icon: "like-fill" as const, color: theme.colors.reactionLike };
      case "comment":
        return { icon: "comment" as const, color: theme.colors.accent };
      case "connection":
        return { icon: "network" as const, color: theme.colors.success };
      default:
        return { icon: "bell" as const, color: theme.colors.textSecondary };
    }
  };

  const getNotificationText = (type: string, postId?: string | null) => {
    switch (type) {
      case "like":
        return postId ? "liked your post" : "liked your comment";
      case "comment":
        return "commented on your post";
      case "connection":
        return "accepted your connection request";
      case "mention":
        return "mentioned you in a post";
      default:
        return "interacted with you";
    }
  };

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Header title="Notifications" showSearch={false} />

      {/* Notifications List */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {notifications.map((notification, index) => {
          const user = getUserById(world, notification.actorId);
          const { icon, color } = getNotificationIcon(notification.type);
          const isUnread = index < 2; // Simulate first 2 as unread

          return (
            <div
              key={notification.id}
              style={{
                display: "flex",
                gap: theme.spacing.md,
                padding: `${theme.spacing.md}px ${theme.spacing.screenPadding}px`,
                background: isUnread ? theme.colors.accentLight : "transparent",
                borderBottom: `1px solid ${theme.colors.border}`,
                cursor: "pointer",
              }}
            >
              {/* Avatar with notification type indicator */}
              <div style={{ position: "relative" }}>
                <LIAvatar size="lg" src={user?.avatarUrl} name={user?.name} />
                <div
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    width: 20,
                    height: 20,
                    borderRadius: theme.radius.pill,
                    background: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `2px solid ${isUnread ? theme.colors.accentLight : theme.colors.surface}`,
                  }}
                >
                  <LIIcon name={icon} size={10} color="white" />
                </div>
              </div>

              {/* Notification Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: theme.typography.body.fontSize,
                    lineHeight: theme.typography.body.lineHeight,
                    color: theme.colors.textPrimary,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{user?.name ?? "Someone"}</span>{" "}
                  {getNotificationText(notification.type, notification.postId)}
                </div>
                <div
                  style={{
                    fontSize: theme.typography.caption.fontSize,
                    color: theme.colors.textTertiary,
                    marginTop: theme.spacing.xs,
                  }}
                >
                  1h ago
                </div>
              </div>

              {/* More options */}
              <div style={{ padding: theme.spacing.xs }}>
                <LIIcon name="more" size={16} color={theme.colors.textTertiary} />
              </div>
            </div>
          );
        })}

        {notifications.length === 0 && (
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
              <LIIcon name="bell" size={32} color={theme.colors.accent} />
            </div>
            <div
              style={{
                fontSize: theme.typography.title.fontSize,
                fontWeight: theme.typography.title.fontWeight,
                color: theme.colors.textPrimary,
                marginBottom: theme.spacing.sm,
              }}
            >
              No notifications
            </div>
            <div
              style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.textSecondary,
              }}
            >
              When someone interacts with you, you'll see it here
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
