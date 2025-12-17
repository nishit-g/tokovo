/**
 * Notification Handler - Processes notification events
 * 
 * @description Handles showing, dismissing, and tapping notifications.
 */

import type { WorldState, NotificationInstance } from "../../types";
import type { DeviceEvent, HandlerContext } from "./types";
import { AppMetadataRegistry } from "../../app-metadata";

// Default OS state for notification initialization
const DEFAULT_OS_STATE = {
    clock: Date.now(),
    battery: 100,
    charging: false,
    network: "wifi" as const,
    wifiStrength: 3,
    cellStrength: 4,
    dnd: false,
    lowPowerMode: false,
    airplaneMode: false,
    notifications: [] as NotificationInstance[],
    notificationHistory: [] as NotificationInstance[],
};

/**
 * Process notification event and update device notifications
 */
export function processNotificationEvent(
    draft: WorldState,
    event: DeviceEvent,
    _ctx: HandlerContext
): void {
    const e = event as any;
    const deviceId = e.deviceId || Object.keys(draft.devices)[0];
    const device = draft.devices[deviceId];
    if (!device) return;

    // Ensure OS/Notification state exists
    if (!device.os) {
        device.os = { ...DEFAULT_OS_STATE };
    }
    if (!device.os.notifications) device.os.notifications = [];
    if (!device.os.notificationHistory) device.os.notificationHistory = [];

    switch (event.type) {
        case "SHOW_NOTIFICATION": {
            // Resolve Metadata for defaults
            const meta = AppMetadataRegistry.get(e.appId);

            // IR to Instance Transformation
            const instance: NotificationInstance = {
                id: e.id,
                ir: {
                    id: e.id,
                    appId: e.appId,
                    title: e.title || meta.displayName || e.appId,
                    body: e.body,
                    icon: e.icon || (meta.icon as string),
                    category: e.category,
                    threadKey: e.threadKey,
                    groupKey: e.groupKey,
                    actions: e.actions,
                    replyable: e.replyable,
                },
                state: "headsUp",
                createdAtFrame: event.at,
                shownAtFrame: event.at,
                deviceId,
                importance: e.priority || "default",
                mode: e.mode || "headsup",
            };

            // DND Policy Check
            if (device.os.dnd && instance.importance !== "critical") {
                instance.state = "queued";
            }

            device.os.notifications.push(instance);
            break;
        }

        case "DISMISS_NOTIFICATION": {
            const notif = device.os.notifications.find(n => n.id === e.notificationId);
            if (notif) {
                notif.state = "dismissed";
                notif.dismissedAtFrame = event.at;
            }
            break;
        }

        case "TAP_NOTIFICATION": {
            const targetNotif = device.os.notifications.find(n => n.id === e.notificationId);
            if (targetNotif) {
                // Open the app associated with the notification
                device.foregroundAppId = targetNotif.ir.appId;
                device.isLocked = false;
            }
            break;
        }

        case "CLEAR_ALL_NOTIFICATIONS": {
            device.os.notifications.forEach(n => {
                n.state = "dismissed";
                n.dismissedAtFrame = event.at;
            });
            break;
        }
    }
}
