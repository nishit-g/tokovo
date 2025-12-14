/**
 * Instagram Notification Adapter
 * 
 * Formats Instagram notifications with social-specific styling.
 */

import { NotificationAdapter, NotificationAdapterRegistry, Notification, FormattedNotification } from "@tokovo/core";

const INSTAGRAM_GRADIENT = "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)";
const INSTAGRAM_PINK = "#E1306C";

const instagramAdapter: NotificationAdapter = {
    appId: "app_instagram",

    format(notification: Notification): FormattedNotification {
        const isLike = notification.body?.includes("liked") || notification.body?.includes("❤");
        const isFollow = notification.body?.includes("follow");
        const isComment = notification.body?.includes("comment");

        return {
            title: notification.title,
            body: notification.body,
            icon: "📸",
            iconBackground: INSTAGRAM_PINK,
            accentColor: INSTAGRAM_PINK,
            preview: notification.preview || (isLike ? { kind: "text", value: "❤️" } : undefined),
            actions: [
                isLike ? { id: "like_back", label: "❤️ Like Back" } : null,
                isComment ? { id: "reply", label: "Reply" } : null,
                isFollow ? { id: "follow_back", label: "Follow Back" } : null,
            ].filter(Boolean) as FormattedNotification["actions"],
            sender: notification.metadata?.sender,
        };
    },

    handleAction(actionId: string, notification: Notification) {
        return [{
            at: Date.now(),
            kind: "DEVICE",
            deviceId: notification.deviceId || "phone",
            type: "OPEN_APP",
            appId: "app_instagram",
        }] as any[];
    },

    measureHeight(notification: Notification, viewport: { width: number }) {
        let height = 160;
        if (notification.preview?.kind === "image") {
            height += 200;
        }
        return height;
    },
};

// Register adapter
NotificationAdapterRegistry.register(instagramAdapter);

export { instagramAdapter };
