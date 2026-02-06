/**
 * NotificationShade - Pull-down notification panel
 *
 * Shows all pending notifications grouped by app.
 * Used for both iOS and Android (with styling differences).
 */

import React from "react";
import { NotificationCenterState, NotificationGroup, Notification } from "@tokovo/core";
import { useRendererRegistries } from "../RegistryContext.js";

interface NotificationShadeProps {
  notificationCenter: NotificationCenterState;
  platform?: "ios" | "android";
  onClose?: () => void;
}

/**
 * Single notification card in the shade
 */
const NotificationCard: React.FC<{
  notification: Notification;
  platform: "ios" | "android";
}> = ({ notification, platform }) => {
  const registries = useRendererRegistries();
  const formatted = registries.plugins.notifications.format(notification);
  const isIOS = platform === "ios";

  return (
    <div
      style={{
        background: isIOS ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.95)",
        backdropFilter: isIOS ? "blur(20px)" : undefined,
        borderRadius: isIOS ? 30 : 12,
        padding: "20px 24px",
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        gap: 18,
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
      }}
    >
      {/* App icon */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: isIOS ? 15 : 8,
          background: formatted.iconBackground || "#ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          flexShrink: 0,
        }}
      >
        {formatted.icon || "📱"}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: "#000",
            fontSize: 22,
            fontWeight: 600,
            marginBottom: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {formatted.title}
        </div>
        <div
          style={{
            color: "#666",
            fontSize: 20,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {formatted.body}
        </div>
      </div>

      {/* Time indicator */}
      <div style={{ color: "#999", fontSize: 18, flexShrink: 0 }}>now</div>
    </div>
  );
};

/**
 * Grouped notifications (collapsed)
 */
const GroupedNotifications: React.FC<{
  group: NotificationGroup;
  platform: "ios" | "android";
}> = ({ group, platform }) => {
  const isIOS = platform === "ios";
  const latestNotif = group.notifications[0];
  const registries = useRendererRegistries();
  const formatted = registries.plugins.notifications.format(latestNotif);

  return (
    <div
      style={{
        background: isIOS ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.95)",
        backdropFilter: isIOS ? "blur(20px)" : undefined,
        borderRadius: isIOS ? 30 : 12,
        padding: "20px 24px",
        marginBottom: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header with app info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: formatted.iconBackground || "#ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          {formatted.icon || "📱"}
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#333" }}>
          {group.appId.replace("app_", "").toUpperCase()}
        </div>
        <div style={{ fontSize: 18, color: "#999", marginLeft: "auto" }}>
          {group.count} notifications
        </div>
      </div>

      {/* Stacked preview */}
      {group.notifications.slice(0, 3).map((n, i) => (
        <div
          key={n.id}
          style={{
            padding: "8px 0",
            borderTop: i > 0 ? "1px solid rgba(0,0,0,0.1)" : undefined,
            fontSize: 18,
            color: "#333",
          }}
        >
          <strong>{n.title}</strong>: {n.body}
        </div>
      ))}

      {group.count > 3 && (
        <div style={{ fontSize: 16, color: "#999", marginTop: 8 }}>
          +{group.count - 3} more
        </div>
      )}
    </div>
  );
};

/**
 * NotificationShade Component
 */
export const NotificationShade: React.FC<NotificationShadeProps> = ({
  notificationCenter,
  platform = "ios",
  onClose,
}) => {
  const isIOS = platform === "ios";
  const activeGroups = notificationCenter.groups.filter((g) => g.count > 0);

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
        background: isIOS ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.4)",
        backdropFilter: "blur(30px)",
        padding: "150px 40px 100px",
        boxSizing: "border-box",
        overflow: "hidden",
        zIndex: 2000,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <div style={{ color: "white", fontSize: 40, fontWeight: 700 }}>
          {isIOS ? "Notification Center" : "Notifications"}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: 20,
              padding: "10px 20px",
              color: "white",
              fontSize: 24,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Notifications */}
      {activeGroups.map((group) =>
        group.collapsed ? (
          <GroupedNotifications
            key={group.key}
            group={group}
            platform={platform}
          />
        ) : (
          group.notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} platform={platform} />
          ))
        ),
      )}
    </div>
  );
};

export default NotificationShade;
