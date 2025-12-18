/**
 * WhatsApp Notification Adapter
 * 
 * Formats WhatsApp notifications with messaging-specific styling.
 */

import { NotificationAdapter, NotificationAdapterRegistry, Notification, FormattedNotification } from "@tokovo/core";

const WHATSAPP_GREEN = "#25D366";

const whatsappAdapter: NotificationAdapter = {
    appId: "app_whatsapp",

    format(notification: Notification): FormattedNotification {
        const ir = notification.ir;
        return {
            title: ir.title,
            body: ir.body,
            icon: "💬",
            iconBackground: WHATSAPP_GREEN,
            accentColor: WHATSAPP_GREEN,
            preview: ir.preview,
            actions: ir.actions || [
                { id: "reply", label: "Reply" },
                { id: "mark_read", label: "Mark as Read" },
            ],
            sender: ir.payload?.sender,
        };
    },

    handleAction(actionId: string, notification: Notification) {
        const baseEvents: any[] = [];
        const threadId = notification.ir.threadKey;

        if (actionId === "open" || actionId === "reply") {
            baseEvents.push({
                at: Date.now(),
                kind: "DEVICE",
                deviceId: notification.deviceId || "phone",
                type: "OPEN_APP",
                appId: "app_whatsapp",
            });

            if (threadId) {
                baseEvents.push({
                    at: Date.now(),
                    kind: "APP",
                    appId: "app_whatsapp",
                    type: "NAVIGATE",
                    screen: "chat",
                    conversationId: threadId,
                });
            }
        }

        return baseEvents;
    },

    measureHeight(notification: Notification, viewport: { width: number }) {
        // Base height + extra for image preview
        let height = 180;
        if (notification.ir.preview?.kind === "image") {
            height += 200;
        }
        return height;
    },
};

// Register adapter
// NotificationAdapterRegistry.register(whatsappAdapter); -- DEPRECATED

export { whatsappAdapter as WhatsAppNotificationAdapter };
