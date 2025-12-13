/**
 * Notifications Screen
 * 
 * Shows notifications: likes, retweets, follows, mentions.
 */

import React from "react";
import { twitterColors, twitterTypography, twitterSpacing, twitterLayout } from "../config";
import { Avatar, VerifiedType } from "./Avatar";

// =============================================================================
// TYPES
// =============================================================================

export type NotificationType = "like" | "retweet" | "follow" | "mention" | "reply";

export interface NotificationData {
    id: string;
    type: NotificationType;
    actor: {
        name: string;
        handle: string;
        avatarUrl?: string;
        verified?: VerifiedType;
    };
    timestamp: string;
    // For like/retweet notifications
    tweetText?: string;
    // For mention/reply notifications
    content?: string;
    // Multiple actors for "X and Y others liked"
    additionalActors?: number;
}

export interface NotificationsProps {
    notifications: NotificationData[];
    activeTab?: "all" | "verified" | "mentions";
    onBack?: () => void;
}

// =============================================================================
// HEADER
// =============================================================================

const NotificationsHeader: React.FC<{
    activeTab: "all" | "verified" | "mentions";
    onBack?: () => void;
}> = ({ activeTab, onBack }) => (
    <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(36px)",
        paddingTop: twitterLayout.safeAreaTop,
    }}>
        {/* Title Row */}
        <div style={{
            display: "flex",
            alignItems: "center",
            padding: `24px ${twitterSpacing.horizontalPadding}px`,
        }}>
            <span style={{
                fontSize: twitterTypography.sizes.displayName,
                fontWeight: twitterTypography.weights.bold,
                color: twitterColors.text.primary,
                fontFamily: twitterTypography.fontFamily,
            }}>
                Notifications
            </span>
            <div style={{ marginLeft: "auto", fontSize: 72 }}>⚙️</div>
        </div>

        {/* Tabs */}
        <div style={{
            display: "flex",
            borderBottom: `1px solid ${twitterColors.border.primary}`,
        }}>
            {[
                { id: "all", label: "All" },
                { id: "verified", label: "Verified" },
                { id: "mentions", label: "Mentions" },
            ].map(tab => (
                <div key={tab.id} style={{
                    flex: 1,
                    padding: "36px 0",
                    textAlign: "center",
                    fontSize: 45,
                    fontWeight: activeTab === tab.id ? 700 : 400,
                    color: activeTab === tab.id ? twitterColors.text.primary : twitterColors.text.secondary,
                    borderBottom: activeTab === tab.id
                        ? `6px solid ${twitterColors.brand.blue}`
                        : "none",
                }}>
                    {tab.label}
                </div>
            ))}
        </div>
    </div>
);

// =============================================================================
// NOTIFICATION ICON
// =============================================================================

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
    const icons: Record<NotificationType, { icon: string; color: string }> = {
        like: { icon: "❤️", color: twitterColors.engagement.like },
        retweet: { icon: "🔁", color: twitterColors.engagement.retweet },
        follow: { icon: "👤", color: twitterColors.brand.blue },
        mention: { icon: "@", color: twitterColors.brand.blue },
        reply: { icon: "💬", color: twitterColors.brand.blue },
    };

    const { icon, color } = icons[type];

    return (
        <div style={{
            width: 96,
            height: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 60,
        }}>
            {icon}
        </div>
    );
};

// =============================================================================
// NOTIFICATION ITEM
// =============================================================================

const NotificationItem: React.FC<{ notification: NotificationData }> = ({ notification }) => {
    const getActionText = (): string => {
        const others = notification.additionalActors
            ? ` and ${notification.additionalActors} others`
            : "";

        switch (notification.type) {
            case "like": return `${notification.actor.name}${others} liked your post`;
            case "retweet": return `${notification.actor.name}${others} reposted your post`;
            case "follow": return `${notification.actor.name}${others} followed you`;
            case "mention": return `${notification.actor.name} mentioned you`;
            case "reply": return `${notification.actor.name} replied to you`;
            default: return "";
        }
    };

    return (
        <div style={{
            display: "flex",
            padding: twitterSpacing.tweetPadding,
            gap: 36,
            borderBottom: `1px solid ${twitterColors.border.primary}`,
        }}>
            {/* Icon */}
            <NotificationIcon type={notification.type} />

            {/* Content */}
            <div style={{ flex: 1 }}>
                {/* Actor avatar(s) */}
                <div style={{ marginBottom: 24 }}>
                    <Avatar
                        imageUrl={notification.actor.avatarUrl}
                        name={notification.actor.name}
                        size="small"
                        verified={notification.actor.verified}
                    />
                </div>

                {/* Action text */}
                <div style={{
                    fontSize: twitterTypography.sizes.tweetText,
                    color: twitterColors.text.primary,
                    marginBottom: 12,
                }}>
                    <span style={{ fontWeight: 700 }}>{notification.actor.name}</span>
                    {notification.additionalActors && (
                        <span> and {notification.additionalActors} others</span>
                    )}
                    <span style={{ color: twitterColors.text.secondary }}>
                        {notification.type === "like" && " liked your post"}
                        {notification.type === "retweet" && " reposted your post"}
                        {notification.type === "follow" && " followed you"}
                        {notification.type === "mention" && " mentioned you"}
                        {notification.type === "reply" && " replied to you"}
                    </span>
                </div>

                {/* Tweet text for like/retweet */}
                {notification.tweetText && (
                    <div style={{
                        fontSize: 42,
                        color: twitterColors.text.tertiary,
                        lineHeight: 1.35,
                    }}>
                        {notification.tweetText}
                    </div>
                )}

                {/* Content for mention/reply */}
                {notification.content && (
                    <div style={{
                        fontSize: twitterTypography.sizes.tweetText,
                        color: twitterColors.text.primary,
                        lineHeight: 1.35,
                    }}>
                        {notification.content}
                    </div>
                )}
            </div>
        </div>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const Notifications: React.FC<NotificationsProps> = ({
    notifications,
    activeTab = "all",
    onBack,
}) => {
    return (
        <div style={{
            height: "100%",
            backgroundColor: twitterColors.background.primary,
            overflowY: "auto",
        }}>
            <NotificationsHeader activeTab={activeTab} onBack={onBack} />

            {notifications.length === 0 ? (
                <div style={{
                    padding: 96,
                    textAlign: "center",
                }}>
                    <div style={{
                        fontSize: 60,
                        fontWeight: 700,
                        color: twitterColors.text.primary,
                        marginBottom: 24,
                    }}>
                        Nothing to see here — yet
                    </div>
                    <div style={{
                        fontSize: 45,
                        color: twitterColors.text.secondary,
                    }}>
                        Likes, mentions, reposts, and more will show up here.
                    </div>
                </div>
            ) : (
                notifications.map(notif => (
                    <NotificationItem key={notif.id} notification={notif} />
                ))
            )}
        </div>
    );
};

export default Notifications;
