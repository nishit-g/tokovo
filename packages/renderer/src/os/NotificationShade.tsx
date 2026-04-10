/**
 * NotificationShade - Pull-down notification panel
 *
 * Shows all pending notifications grouped by app or thread.
 */

import React from "react";
import { NotificationCenterState, NotificationGroup, Notification } from "@tokovo/core";
import { useRendererRegistries } from "../RegistryContext.js";

interface NotificationShadeProps {
  notificationCenter: NotificationCenterState;
  platform?: "ios" | "android";
  currentFrame?: number;
  onClose?: () => void;
}

function formatNotificationAge(
  currentFrame: number,
  shownAtFrame?: number,
  fps: number = 30,
): string {
  if (shownAtFrame === undefined) return "now";
  const seconds = Math.max(0, Math.floor((currentFrame - shownAtFrame) / fps));
  if (seconds < 8) return "now";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

const AppIcon: React.FC<{
  appId: string;
  platform: "ios" | "android";
}> = ({ appId, platform }) => {
  const registries = useRendererRegistries();
  const meta = registries.plugins.metadata.get(appId);
  const isIOS = platform === "ios";

  if (typeof meta.icon === "string") {
    return (
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: isIOS ? 18 : 14,
          background: meta.themeColor || "#8E8E93",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 28,
          flexShrink: 0,
          boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
        }}
      >
        {meta.icon}
      </div>
    );
  }

  return (
    <div
      style={{
        width: 60,
        height: 60,
        borderRadius: isIOS ? 18 : 14,
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.12)",
      }}
    >
      {meta.icon}
    </div>
  );
};

const NotificationCard: React.FC<{
  notification: Notification;
  platform: "ios" | "android";
  currentFrame: number;
}> = ({ notification, platform, currentFrame }) => {
  const registries = useRendererRegistries();
  const formatted = registries.plugins.notifications.format(notification);
  const meta = registries.plugins.metadata.get(notification.ir.appId);
  const isIOS = platform === "ios";
  const appName = meta.displayName || notification.ir.appId.replace(/^app_/, "");
  const eyebrow = formatted.sender?.name || appName;

  return (
    <div
      style={{
        background: isIOS ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.95)",
        backdropFilter: isIOS ? "blur(32px) saturate(1.4)" : undefined,
        borderRadius: isIOS ? 28 : 16,
        padding: "18px 20px",
        marginBottom: 12,
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
        border: isIOS
          ? "1px solid rgba(255,255,255,0.22)"
          : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <AppIcon appId={notification.ir.appId} platform={platform} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
            color: "rgba(20,20,20,0.72)",
            fontSize: 16,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          <span>{appName}</span>
          <span
            style={{ fontSize: 15, opacity: 0.72, textTransform: "none" }}
          >
            {formatNotificationAge(currentFrame, notification.shownAtFrame)}
          </span>
        </div>
        <div
          style={{
            color: "#111",
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            color: "#222",
            fontSize: 20,
            fontWeight: 500,
            marginBottom: 4,
          }}
        >
          {formatted.title}
        </div>
        <div
          style={{
            color: "rgba(34,34,34,0.72)",
            fontSize: 18,
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {formatted.body}
        </div>
      </div>
    </div>
  );
};

const GroupedNotifications: React.FC<{
  group: NotificationGroup;
  platform: "ios" | "android";
  currentFrame: number;
}> = ({ group, platform, currentFrame }) => {
  const isIOS = platform === "ios";
  const latestNotif = group.notifications[0];
  const registries = useRendererRegistries();
  const formatted = registries.plugins.notifications.format(latestNotif);
  const meta = registries.plugins.metadata.get(group.appId);
  const appName = meta.displayName || group.appId.replace(/^app_/, "");

  return (
    <div
      style={{
        background: isIOS ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.95)",
        backdropFilter: isIOS ? "blur(32px) saturate(1.4)" : undefined,
        borderRadius: isIOS ? 28 : 16,
        padding: "18px 20px",
        marginBottom: 12,
        boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
        border: isIOS
          ? "1px solid rgba(255,255,255,0.22)"
          : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <AppIcon appId={group.appId} platform={platform} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1b1b1d" }}>
              {appName}
            </div>
            <div
              style={{
                fontSize: 14,
                color: "rgba(27,27,29,0.58)",
                fontWeight: 700,
              }}
            >
              {formatNotificationAge(currentFrame, latestNotif.shownAtFrame)}
            </div>
            <div
              style={{
                marginLeft: "auto",
                minWidth: 26,
                height: 26,
                padding: "0 8px",
                borderRadius: 999,
                background: meta.themeColor || formatted.iconBackground || "#999",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {group.count}
            </div>
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#141416",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {formatted.title}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 17,
              color: "rgba(20,20,22,0.72)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {formatted.body}
          </div>
        </div>
      </div>

      {group.notifications.slice(0, 3).map((notification, index) => (
        <div
          key={notification.id}
          style={{
            padding: "10px 0",
            borderTop: index > 0 ? "1px solid rgba(0,0,0,0.08)" : undefined,
            fontSize: 16,
            color: "#333",
          }}
        >
          <strong>{notification.title}</strong> {notification.body}
        </div>
      ))}

      {group.count > 3 && (
        <div
          style={{
            fontSize: 15,
            color: "#666",
            marginTop: 8,
            fontWeight: 600,
          }}
        >
          +{group.count - 3} more
        </div>
      )}
    </div>
  );
};

export const NotificationShade: React.FC<NotificationShadeProps> = ({
  notificationCenter,
  platform = "ios",
  currentFrame = 0,
  onClose,
}) => {
  const isIOS = platform === "ios";
  const activeGroups = notificationCenter.groups.filter((group) => group.count > 0);

  if (activeGroups.length === 0) {
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(30px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
        }}
      >
        <div style={{ color: "white", fontSize: 36, opacity: 0.7 }}>
          No Notifications
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: isIOS ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0.4)",
        backdropFilter: "blur(34px) saturate(1.08)",
        padding: "140px 24px 100px",
        boxSizing: "border-box",
        overflow: "hidden",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 22,
          padding: "0 8px",
        }}
      >
        <div style={{ color: "white", fontSize: 38, fontWeight: 700 }}>
          {isIOS ? "Notification Center" : "Notifications"}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "none",
              borderRadius: 20,
              padding: "10px 18px",
              color: "white",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        )}
      </div>

      <div style={{ overflowY: "hidden" }}>
        {activeGroups.map((group) =>
          group.collapsed ? (
            <GroupedNotifications
              key={group.key}
              group={group}
              platform={platform}
              currentFrame={currentFrame}
            />
          ) : (
            group.notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                platform={platform}
                currentFrame={currentFrame}
              />
            ))
          ),
        )}
      </div>
    </div>
  );
};

export default NotificationShade;
