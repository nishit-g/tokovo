import React from "react";
import { Notification, NotificationGroup } from "@tokovo/core";
import { LayoutState, LockscreenLayoutState } from "./layout/types";

// =============================================================================
// APP BRANDING (for icons and colors)
// =============================================================================

const APP_BRANDING: Record<string, { color: string; icon: string; name: string }> = {
    app_whatsapp: { color: "#25D366", icon: "W", name: "WhatsApp" },
    app_instagram: { color: "#E1306C", icon: "📷", name: "Instagram" },
    app_twitter: { color: "#1DA1F2", icon: "𝕏", name: "X" },
    app_spotify: { color: "#1DB954", icon: "♪", name: "Spotify" },
    app_imessage: { color: "#34C759", icon: "💬", name: "Messages" },
    default: { color: "#8E8E93", icon: "⬤", name: "App" },
};

function getAppBranding(appId: string) {
    return APP_BRANDING[appId] || APP_BRANDING.default;
}

// =============================================================================
// GROUPING LOGIC
// =============================================================================

/**
 * Group notifications by app or threadId
 */
function groupNotifications(notifications: Notification[]): NotificationGroup[] {
    const groups = new Map<string, NotificationGroup>();

    for (const notif of notifications) {
        // Skip dismissed notifications
        if (notif.dismissedAt) continue;

        // Group key: use groupKey if provided, else threadId + appId, else just appId
        const key = notif.groupKey || (notif.threadId ? `${notif.appId}_${notif.threadId}` : notif.appId);

        if (!groups.has(key)) {
            groups.set(key, {
                key,
                appId: notif.appId,
                notifications: [],
                collapsed: true,
                count: 0,
                latestAt: 0,
            });
        }

        const group = groups.get(key)!;
        group.notifications.push(notif);
        group.count++;
        group.latestAt = Math.max(group.latestAt, notif.at);
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

const GroupCard: React.FC<GroupCardProps> = ({ group, y, opacity, translateY, variant }) => {
    const isAndroid = variant === "android";
    const branding = getAppBranding(group.appId);
    const latestNotif = group.notifications[group.notifications.length - 1];
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
                            backgroundColor: isAndroid ? "#252525" : "rgba(255, 255, 255, 0.6)",
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
                                backgroundColor: isAndroid ? "#1a1a1a" : "rgba(255, 255, 255, 0.3)",
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
                        backgroundColor: branding.color,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: 50,
                        color: "white",
                        flexShrink: 0,
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
                            {branding.name}
                        </span>
                        {hasMultiple && (
                            <span
                                style={{
                                    fontSize: 24,
                                    backgroundColor: branding.color,
                                    color: "white",
                                    borderRadius: 12,
                                    padding: "2px 10px",
                                    fontWeight: 700,
                                }}
                            >
                                {group.count}
                            </span>
                        )}
                        <span style={{ marginLeft: "auto", fontSize: 28, fontWeight: "normal" }}>
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
                        {latestNotif.title}
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
                        {latestNotif.body}
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
    notifications?: Notification[];
    variant?: "ios" | "android";
    layout?: LayoutState;
}

export const NotificationOverlay: React.FC<NotificationOverlayProps> = ({
    notifications = [],
    variant = "ios",
    layout,
}) => {
    // Only render on lockscreen with layout
    const lockscreenLayout = layout?.kind === "LOCKSCREEN" ? (layout as LockscreenLayoutState) : null;
    if (!lockscreenLayout) return null;

    // Group notifications
    const groups = groupNotifications(notifications);

    // Map groups to layout positions
    // For simplicity, use first N layout positions for groups
    const visibleGroups = groups.slice(0, lockscreenLayout.notificationLayouts.length);

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
