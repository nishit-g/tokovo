import React from "react";
import {
  NotificationInstance,
  NotificationGroup,
  AppMetadataRegistry,
} from "@tokovo/core";
import type {
  LockscreenLayoutState,
  NotificationLayout,
} from "../layout/types";

interface LayoutState {
  kind: string;
  notificationLayouts?: NotificationLayout[];
}

// =============================================================================
// GROUPING LOGIC
// =============================================================================

/**
 * Group notifications by app or threadId
 */
function groupNotifications(
  notifications: NotificationInstance[],
): NotificationGroup[] {
  const groups = new Map<string, NotificationGroup>();

  for (const notif of notifications) {
    const ir = notif.ir;
    // Skip dismissed notifications or those not meant for lockscreen
    if (notif.state === "dismissed") continue;
    if (notif.mode === "headsup" || notif.mode === "silent") continue;

    // Group key: use groupKey if provided, else threadId + appId, else just appId
    // Use threadKey from IR now
    const key =
      ir.groupKey || (ir.threadKey ? `${ir.appId}_${ir.threadKey}` : ir.appId);

    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        appId: ir.appId,
        notifications: [],
        collapsed: true,
        count: 0,
        latestAt: 0,
      };
      groups.set(key, group);
    }

    group.notifications.push(notif);
    group.count++;
    // Use shownAtFrame for sorting, fallback to createdAtFrame
    const time = notif.shownAtFrame || notif.createdAtFrame;
    group.latestAt = Math.max(group.latestAt, time);
  }

  // Sort by latest notification time (most recent first)
  return Array.from(groups.values()).sort((a, b) => b.latestAt - a.latestAt);
}

// =============================================================================
// NOTIFICATION GROUP CARD
// =============================================================================

interface GroupCardProps {
  group: NotificationGroup;
  y: number;
  opacity: number;
  translateY: number;
  variant: "ios" | "android";
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  y,
  opacity,
  translateY,
  variant,
}) => {
  const isAndroid = variant === "android";
  // Use Registry for branding
  const branding = AppMetadataRegistry.get(group.appId);

  const latestNotif = group.notifications[group.notifications.length - 1];
  const ir = latestNotif.ir;
  const hasMultiple = group.count > 1;

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: "50%",
        transform: `translateX(-50%) translateY(${translateY}px)`,
        width: "92%",
        opacity,
      }}
    >
      {/* Stacked cards effect (show 2 cards behind if multiple) */}
      {hasMultiple && (
        <>
          <div
            style={{
              position: "absolute",
              top: 6,
              left: "2%",
              right: "2%",
              height: 100,
              backgroundColor: isAndroid
                ? "#252525"
                : "rgba(255, 255, 255, 0.6)",
              borderRadius: isAndroid ? 24 : 36,
              zIndex: 1,
            }}
          />
          {group.count > 2 && (
            <div
              style={{
                position: "absolute",
                top: 12,
                left: "4%",
                right: "4%",
                height: 100,
                backgroundColor: isAndroid
                  ? "#1a1a1a"
                  : "rgba(255, 255, 255, 0.3)",
                borderRadius: isAndroid ? 24 : 36,
                zIndex: 0,
              }}
            />
          )}
        </>
      )}

      {/* Main notification card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          backgroundColor: isAndroid ? "#303030" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: isAndroid ? 24 : 36,
          padding: "30px 40px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 30,
          color: isAndroid ? "white" : "black",
        }}
      >
        {/* App Icon */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 20,
            backgroundColor: branding.themeColor,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 50,
            color: "white",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {branding.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {/* Header: App name + count + time */}
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: isAndroid ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)",
            }}
          >
            <span style={{ textTransform: "uppercase", letterSpacing: 1 }}>
              {branding.displayName}
            </span>
            {hasMultiple && (
              <span
                style={{
                  fontSize: 24,
                  backgroundColor: branding.themeColor,
                  color: "white",
                  borderRadius: 12,
                  padding: "2px 10px",
                  fontWeight: 700,
                }}
              >
                {group.count}
              </span>
            )}
            <span
              style={{ marginLeft: "auto", fontSize: 28, fontWeight: "normal" }}
            >
              now
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 36,
              fontWeight: "bold",
              marginBottom: 8,
              color: isAndroid ? "white" : "black",
            }}
          >
            {ir.title}
          </div>

          {/* Body */}
          <div
            style={{
              fontSize: 34,
              opacity: 0.8,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {ir.body}
          </div>

          {/* Summary for groups */}
          {hasMultiple && (
            <div
              style={{
                fontSize: 28,
                marginTop: 8,
                opacity: 0.5,
              }}
            >
              +{group.count - 1} more notification{group.count > 2 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// NOTIFICATION OVERLAY
// =============================================================================

interface NotificationOverlayProps {
  notifications?: NotificationInstance[];
  variant?: "ios" | "android";
  layout?: LayoutState;
}

export const NotificationOverlay: React.FC<NotificationOverlayProps> = ({
  notifications = [],
  variant = "ios",
  layout,
}) => {
  // Only render on lockscreen with layout
  const lockscreenLayout =
    layout?.kind === "LOCKSCREEN" ? (layout as LockscreenLayoutState) : null;
  if (!lockscreenLayout) return null;

  // Group notifications
  const groups = groupNotifications(notifications);

  // Map groups to layout positions
  // For simplicity, use first N layout positions for groups
  const visibleGroups = groups.slice(
    0,
    lockscreenLayout.notificationLayouts.length,
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      {visibleGroups.map((group, index) => {
        const layoutInfo = lockscreenLayout.notificationLayouts[index];
        if (!layoutInfo) return null;

        return (
          <GroupCard
            key={group.key}
            group={group}
            y={layoutInfo.y}
            opacity={layoutInfo.opacity}
            translateY={layoutInfo.translateY}
            variant={variant}
          />
        );
      })}
    </div>
  );
};
