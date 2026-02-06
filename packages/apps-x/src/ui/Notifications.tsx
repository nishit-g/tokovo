import React from "react";
import type { WorldState } from "@tokovo/core";
import { useXTheme } from "./ThemeContext";
import { getNotifications, getXState } from "../runtime/selectors";
import { AppShell } from "./AppShell";
import { Avatar, XIcon, VerifiedBadge, TabButton, formatTimestamp } from "./components";
import { ScreenTransition } from "./ScreenTransition";
import { BottomNav } from "./BottomNav";

interface NotificationsProps {
  world: WorldState;
}

// Notification icon based on type
const NotificationIcon: React.FC<{ type: string }> = ({ type }) => {
  const theme = useXTheme();

  switch (type) {
    case "like":
      return (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: "rgba(249,24,128,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <XIcon name="likeFilled" size={16} color={theme.colors.likeActive} />
        </div>
      );
    case "repost":
      return (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: "rgba(0,186,124,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <XIcon name="repost" size={16} color={theme.colors.repostActive} />
        </div>
      );
    case "follow":
      return (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: "rgba(29,155,240,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill={theme.colors.accent}>
            <path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z" />
          </svg>
        </div>
      );
    case "mention":
    case "reply":
      return (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: "rgba(29,155,240,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <XIcon name="reply" size={16} color={theme.colors.accent} />
        </div>
      );
    default:
      return (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: "rgba(29,155,240,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <XIcon name="bell" size={16} color={theme.colors.accent} />
        </div>
      );
  }
};

// Get notification text based on type
const getNotificationText = (type: string, count: number = 1): string => {
  switch (type) {
    case "like":
      return count > 1 ? "liked your post" : "liked your post";
    case "repost":
      return "reposted your post";
    case "follow":
      return "followed you";
    case "mention":
      return "mentioned you";
    case "reply":
      return "replied to your post";
    default:
      return "interacted with your post";
  }
};

export const Notifications: React.FC<NotificationsProps> = ({ world }) => {
  const theme = useXTheme();
  const state = getXState(world);
  const notifications = getNotifications(world);
  const users = state?.users ?? [];
  const tweets = state?.tweets ?? [];
  const tab = state?.notificationsTab ?? "all";
  const referenceNowMs = notifications.reduce(
    (max, notification) => Math.max(max, notification.createdAt),
    0,
  );

  const getUser = (id: string | undefined) => users.find((u) => u.id === id);
  const getTweet = (id: string | undefined) => tweets.find((t) => t.id === id);

  const filtered =
    tab === "mentions"
      ? notifications.filter((n) => n.isMention || n.type === "mention")
      : notifications;

  return (
    <AppShell>
      {/* Header */}
      <div
        style={{
          height: theme.spacing.headerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: theme.colors.textPrimary,
          }}
        >
          Notifications
        </span>
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <TabButton label="All" active={tab === "all"} />
        <TabButton label="Verified" active={false} />
        <TabButton label="Mentions" active={tab === "mentions"} />
      </div>

      <ScreenTransition lastNavFrame={state?.lastNavFrame}>
        <div style={{ flex: 1 }}>
          {filtered.length === 0 && (
            <div
              style={{
                padding: 32,
                textAlign: "center",
                color: theme.colors.textSecondary,
              }}
            >
              <div style={{ fontSize: 31, fontWeight: 800, color: theme.colors.textPrimary }}>
                Nothing to see here — yet
              </div>
              <div style={{ marginTop: 8, fontSize: 15 }}>
                {tab === "mentions"
                  ? "When someone mentions you, you'll find it here."
                  : "From likes to reposts and a whole lot more, this is where all the action happens."}
              </div>
            </div>
          )}

          {filtered.map((notification) => {
            const actor = getUser(notification.actorId);
            const tweet = getTweet(notification.tweetId);

            return (
              <div
                key={notification.id}
                style={{
                  display: "flex",
                  padding: `${theme.spacing.tweetPaddingV}px ${theme.spacing.tweetPaddingH}px`,
                  borderBottom: `1px solid ${theme.colors.border}`,
                  gap: 12,
                }}
              >
                {/* Notification Icon */}
                <div style={{ width: 40, display: "flex", justifyContent: "center" }}>
                  <NotificationIcon type={notification.type} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Actor Avatar */}
                  <Avatar size={32} />

                  {/* Notification Text */}
                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: theme.colors.textPrimary,
                      }}
                    >
                      {actor?.name ?? "Someone"}
                    </span>
                    {actor?.verified && (
                      <VerifiedBadge variant={actor.verified} size={16} />
                    )}
                    <span
                      style={{
                        fontSize: 15,
                        color: theme.colors.textSecondary,
                        marginLeft: 4,
                      }}
                    >
                      {getNotificationText(notification.type)}
                    </span>
                  </div>

                  {/* Tweet Preview */}
                  {tweet && notification.type !== "follow" && (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 15,
                        color: theme.colors.textSecondary,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {tweet.text}
                    </div>
                  )}

                  {/* Follow button for follow notifications */}
                  {notification.type === "follow" && (
                    <button
                      style={{
                        marginTop: 12,
                        padding: "6px 16px",
                        borderRadius: 20,
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: "transparent",
                        color: theme.colors.textPrimary,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Follow back
                    </button>
                  )}

                  {/* Timestamp */}
                  {notification.createdAt && (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        color: theme.colors.textMuted,
                      }}
                    >
                      {formatTimestamp(notification.createdAt, { nowMs: referenceNowMs })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScreenTransition>

      <BottomNav active="bell" />
    </AppShell>
  );
};
