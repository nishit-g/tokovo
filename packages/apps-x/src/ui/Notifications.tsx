import React from "react";
import type { WorldState } from "@tokovo/core";
import { useXTheme } from "./ThemeContext.js";
import {
  getVisibleNotifications,
  getXState,
} from "../runtime/selectors.js";
import { AppShell } from "./AppShell.js";
import { Avatar, XIcon, VerifiedBadge, TabButton, formatTimestamp } from "./components.js";
import { ScreenTransition } from "./ScreenTransition.js";
import { BottomNav } from "./BottomNav.js";

interface NotificationsProps {
  world: WorldState;
}

function iconNameForType(type: string) {
  if (type === "like") return "likeFilled";
  if (type === "repost") return "repost";
  if (type === "follow") return "mail";
  return "reply";
}

export const Notifications: React.FC<NotificationsProps> = ({ world }) => {
  const theme = useXTheme();
  const state = getXState(world);
  const notifications = getVisibleNotifications(world);
  const users = state?.users ?? [];
  const tweets = state?.tweets ?? [];
  const tab = state?.notificationsTab ?? "all";
  const nowMs = notifications.reduce((max, item) => Math.max(max, item.createdAt), 0);

  return (
    <AppShell>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: theme.colors.background,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              height: theme.spacing.headerHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: `1px solid ${theme.colors.border}`,
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
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${theme.colors.border}`,
            }}
          >
            <TabButton label="All" active={tab === "all"} />
            <TabButton label="Mentions" active={tab === "mentions"} />
          </div>
        </div>

        <ScreenTransition lastNavFrame={state?.lastNavFrame}>
          <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: 32,
                  color: theme.colors.textSecondary,
                }}
              >
                <div
                  style={{
                    fontSize: 31,
                    lineHeight: 1.1,
                    fontWeight: 800,
                    color: theme.colors.textPrimary,
                  }}
                >
                  Nothing to see here yet
                </div>
                <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.45 }}>
                  Likes, mentions, follows, and replies will surface here once
                  the scene starts generating activity.
                </div>
              </div>
            ) : null}

            {notifications.map((notification) => {
              const actor = users.find((user) => user.id === notification.actorId);
              const tweet = tweets.find((item) => item.id === notification.tweetId);
              return (
                <div
                  key={notification.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: `${theme.spacing.tweetPaddingV}px ${theme.spacing.tweetPaddingH}px`,
                    borderBottom: `1px solid ${theme.colors.border}`,
                    backgroundColor: notification.read ? "transparent" : theme.colors.accentSoft,
                  }}
                >
                  <div style={{ width: 36, display: "flex", justifyContent: "center" }}>
                    <XIcon
                      name={iconNameForType(notification.type) as "likeFilled" | "repost" | "mail" | "reply"}
                      size={18}
                      color={
                        notification.type === "like"
                          ? theme.colors.likeActive
                          : notification.type === "repost"
                            ? theme.colors.repostActive
                            : theme.colors.accent
                      }
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Avatar size={34} src={actor?.avatarUrl} />
                    <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.42 }}>
                      <span style={{ fontWeight: 700, color: theme.colors.textPrimary }}>
                        {actor?.name ?? "Someone"}
                      </span>
                      {actor?.verified ? (
                        <span style={{ marginLeft: 4, verticalAlign: "middle" }}>
                          <VerifiedBadge variant={actor.verified} size={16} />
                        </span>
                      ) : null}
                      <span style={{ marginLeft: 4, color: theme.colors.textSecondary }}>
                        {notification.body ??
                          (notification.type === "follow"
                            ? "followed you"
                            : notification.type === "mention"
                              ? "mentioned you"
                              : notification.type === "reply"
                                ? "replied to your post"
                                : notification.type === "repost"
                                  ? "reposted your post"
                                  : "liked your post")}
                      </span>
                    </div>
                    {tweet ? (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 15,
                          lineHeight: 1.38,
                          color: theme.colors.textSecondary,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {tweet.text}
                      </div>
                    ) : null}
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        color: theme.colors.textMuted,
                      }}
                    >
                      {formatTimestamp(notification.createdAt, { nowMs })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScreenTransition>
      </div>

      <BottomNav active="bell" />
    </AppShell>
  );
};
