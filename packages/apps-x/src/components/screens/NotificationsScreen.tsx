import React from "react";
import { useXExperience } from "../../experience/context.js";
import { formatXTimestamp, type XCopyKey } from "../../localization/index.js";
import {
  requireTweet,
  requireUser,
  requireXState,
  selectNotificationBadgeCount,
  selectUnreadThreadCount,
  selectVisibleNotifications,
} from "../../runtime/selectors.js";
import type { XNotification } from "../../runtime/state.js";
import { Avatar, VerifiedBadge } from "../primitives/Avatar.js";
import {
  AppHeader,
  BottomNav,
  EmptyState,
  IconButton,
  TabBar,
} from "../primitives/Chrome.js";
import { XIcon, type XIconName } from "../primitives/Icon.js";
import type { XScreenProps } from "./types.js";
import { requireDeviceClock } from "./types.js";

function notificationPresentation(notification: XNotification): {
  icon: XIconName;
  color: string;
} {
  switch (notification.type) {
    case "like":
      return { icon: "like", color: "#F91880" };
    case "repost":
      return { icon: "repost", color: "#00BA7C" };
    case "follow":
      return { icon: "user", color: "#1D9BF0" };
    case "verified":
      return { icon: "check", color: "#8B5CF6" };
    case "mention":
    case "reply":
      return { icon: "reply", color: "#1D9BF0" };
  }
}

function notificationCopyKey(notification: XNotification): XCopyKey {
  switch (notification.type) {
    case "like":
      return "notificationLike";
    case "repost":
      return "notificationRepost";
    case "reply":
      return "notificationReply";
    case "follow":
      return "notificationFollow";
    case "mention":
      return "notificationMention";
    case "verified":
      return "notificationVerified";
  }
}

export const NotificationsScreen: React.FC<XScreenProps> = ({
  world,
  deviceId,
}) => {
  const experience = useXExperience();
  const state = requireXState(world, deviceId);
  const notifications = selectVisibleNotifications(world, deviceId);
  const nowMs = requireDeviceClock(world, deviceId);

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppHeader
        title={experience.t("notifications")}
        trailing={
          <IconButton
            icon="moreCircle"
            label="Notification settings"
            size={20}
          />
        }
      />
      <TabBar
        active={state.notificationsTab}
        tabs={[
          { id: "all", label: experience.t("all") },
          { id: "verified", label: experience.t("verified") },
          { id: "mentions", label: experience.t("mentions") },
        ]}
      />
      <div
        data-x-anchor="x.notifications.list"
        style={{ flex: 1, minHeight: 0, overflow: "hidden" }}
      >
        {notifications.length === 0 ? (
          <EmptyState
            icon="bell"
            title={experience.t("emptyNotificationsTitle")}
            body={experience.t("emptyNotificationsBody")}
          />
        ) : (
          <div
            style={{
              transform: `translateY(${-state.scroll.notifications}px)`,
              willChange: "transform",
            }}
          >
            {notifications.map((notification) => {
              const actor = requireUser(
                state,
                notification.actorId,
                `notification "${notification.id}" actorId`,
              );
              const tweet = notification.tweetId
                ? requireTweet(
                    state,
                    notification.tweetId,
                    `notification "${notification.id}" tweetId`,
                  )
                : undefined;
              const presentation = notificationPresentation(notification);
              return (
                <article
                  key={notification.id}
                  data-x-anchor={`x.notification.${notification.id}`}
                  style={{
                    minHeight: tweet ? 116 : 88,
                    padding: "11px 16px 12px",
                    display: "grid",
                    gridTemplateColumns: "28px minmax(0,1fr)",
                    gap: 10,
                    borderBottom: `1px solid ${experience.colors.border}`,
                    boxSizing: "border-box",
                    background: notification.read
                      ? experience.colors.background
                      : experience.colors.accentSoft,
                  }}
                >
                  <div style={{ color: presentation.color, paddingTop: 4 }}>
                    <XIcon
                      name={presentation.icon}
                      size={21}
                      color={presentation.color}
                      fill={
                        notification.type === "like"
                          ? presentation.color
                          : "none"
                      }
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 7 }}
                    >
                      <Avatar user={actor} size={34} />
                      <span
                        style={{
                          marginInlineStart: "auto",
                          color: experience.colors.textSecondary,
                          fontSize: 12,
                        }}
                      >
                        {formatXTimestamp(
                          notification.createdAt,
                          nowMs,
                          experience.locale,
                        )}
                      </span>
                    </div>
                    <div
                      style={{ marginTop: 7, fontSize: 14, lineHeight: 1.34 }}
                    >
                      <strong>{actor.name}</strong>{" "}
                      <VerifiedBadge variant={actor.verified} size={14} />{" "}
                      {notification.body ??
                        notification.title ??
                        experience.t(notificationCopyKey(notification))}
                    </div>
                    {tweet ? (
                      <div
                        style={{
                          marginTop: 5,
                          color: experience.colors.textSecondary,
                          fontSize: 14,
                          lineHeight: 1.34,
                          maxHeight: 38,
                          overflow: "hidden",
                        }}
                      >
                        {tweet.text}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav
        active="notifications"
        notificationBadge={selectNotificationBadgeCount(world, deviceId)}
        messageBadge={selectUnreadThreadCount(world, deviceId)}
      />
    </div>
  );
};
