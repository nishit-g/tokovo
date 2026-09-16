import { ShapedText } from "@tokovo/react";
import { measureXNotification } from "../../layout/measure.js";
import React from "react";
import { useXExperience } from "../../experience/context.js";
import { formatXTimestamp } from "../../localization/index.js";
import {
  requireUser,
  requireXState,
  selectNotificationBadgeCount,
  selectUnreadThreadCount,
  selectVisibleNotifications,
} from "../../runtime/selectors.js";
import type { XNotification } from "../../runtime/state.js";
import { Avatar } from "../primitives/Avatar.js";
import { AppHeader, BottomNav, EmptyState, IconButton, TabBar } from "../primitives/Chrome.js";
import { XIcon, type XIconName } from "../primitives/Icon.js";
import type { XScreenProps } from "./types.js";
import { requireDeviceClock } from "./types.js";

function notificationPresentation(
  notification: XNotification,
  colors: ReturnType<typeof useXExperience>["colors"],
): {
  icon: XIconName;
  color: string;
} {
  switch (notification.type) {
    case "like":
      return { icon: "like", color: colors.like };
    case "repost":
      return { icon: "repost", color: colors.repost };
    case "follow":
      return { icon: "user", color: colors.accent };
    case "verified":
      return { icon: "check", color: colors.accent };
    case "mention":
    case "reply":
      return { icon: "reply", color: colors.accent };
  }
}

export const NotificationsScreen: React.FC<XScreenProps> = ({ world, deviceId, width, height }) => {
  const experience = useXExperience();
  const state = requireXState(world, deviceId);
  const notifications = selectVisibleNotifications(world, deviceId);
  let cursor = 0;
  const rows = notifications.map((notification) => {
    const measurement = measureXNotification(notification, state, width, experience);
    const y = cursor;
    cursor += measurement.height;
    return { notification, measurement, y };
  });
  const visibleRows = rows.filter(
    (row) =>
      row.y + row.measurement.height >= state.scroll.notifications - 160 &&
      row.y <= state.scroll.notifications + height + 160,
  );
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
        trailing={<IconButton icon="moreCircle" label="Notification settings" size={20} />}
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
              height: cursor,
              position: "relative",
              transform: `translateY(${-state.scroll.notifications}px)`,
              willChange: "transform",
            }}
          >
            {visibleRows.map(({ notification, measurement, y }) => {
              const actor = requireUser(
                state,
                notification.actorId,
                `notification "${notification.id}" actorId`,
              );
              const presentation = notificationPresentation(notification, experience.colors);
              return (
                <article
                  key={notification.id}
                  data-x-anchor={`x.notification.${notification.id}`}
                  style={{
                    height: measurement.height,
                    position: "absolute",
                    top: y,
                    width: "100%",
                    overflow: "hidden",
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
                      fill={notification.type === "like" ? presentation.color : "none"}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <Avatar user={actor} size={34} />
                      <span
                        style={{
                          marginInlineStart: "auto",
                          color: experience.colors.textSecondary,
                          fontSize: 12,
                        }}
                      >
                        {formatXTimestamp(notification.createdAt, nowMs, experience.locale)}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 7,
                        fontSize: experience.text.body,
                        lineHeight: `${experience.text.bodyLine}px`,
                      }}
                    >
                      {measurement.lines.map((line, i) => (
                        <div
                          key={i}
                          style={{ height: experience.text.bodyLine, whiteSpace: "pre" }}
                        >
                          <ShapedText text={line} />
                        </div>
                      ))}
                    </div>
                    {measurement.previewLines.length ? (
                      <div
                        style={{
                          marginTop: 5,
                          fontSize: experience.text.body,
                          lineHeight: `${experience.text.bodyLine}px`,
                          color: experience.colors.textSecondary,
                        }}
                      >
                        {measurement.previewLines.map((line, i) => (
                          <div
                            key={i}
                            style={{ height: experience.text.bodyLine, whiteSpace: "pre" }}
                          >
                            <ShapedText text={line} />
                          </div>
                        ))}
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
