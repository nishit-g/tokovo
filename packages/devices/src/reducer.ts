import { produce } from "immer";
import {
    TimelineEvent,
    DeviceState,
    Notification,
    NotificationPriority,
    NotificationCenterState,
    DEFAULT_NOTIFICATION_CENTER,
    DEFAULT_DYNAMIC_ISLAND,
    IOS_NOTIFICATION_POLICY,
} from "@tokovo/core";
import { ReducerRegistry } from "@tokovo/core";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateNotificationId(event: any): string {
    return `notif_${event.at}_${event.appId}_${Math.random().toString(36).substr(2, 5)}`;
}

function computeGroups(items: Notification[]): NotificationCenterState["groups"] {
    const groupMap = new Map<string, Notification[]>();

    items.filter(n => n.state !== "dismissed").forEach(n => {
        const key = n.groupKey || n.appId;
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key)!.push(n);
    });

    return Array.from(groupMap.entries()).map(([key, notifs]) => ({
        key,
        appId: notifs[0].appId,
        notifications: notifs,
        collapsed: notifs.length >= IOS_NOTIFICATION_POLICY.groupCollapseThreshold,
        count: notifs.length,
        latestAt: Math.max(...notifs.map(n => n.at)),
    }));
}

// =============================================================================
// DEVICE REDUCER
// =============================================================================

/**
 * Device Reducer
 * Handles all DEVICE events: lock/unlock, app open/close, notifications, calls
 */
export function deviceReducer(devices: Record<string, DeviceState>, event: TimelineEvent): Record<string, DeviceState> {
    return produce(devices, draft => {
        if (event.kind !== "DEVICE") return;

        const device = draft[event.deviceId];
        if (!device) return;

        // Initialize notification center if needed
        if (!device.notificationCenter) {
            device.notificationCenter = { ...DEFAULT_NOTIFICATION_CENTER };
        }

        switch (event.type) {
            // --- Lock/Unlock ---
            case "LOCK":
                device.isLocked = true;
                break;
            case "UNLOCK":
                device.isLocked = false;
                break;

            // --- App Management ---
            case "OPEN_APP":
                device.foregroundAppId = event.appId;
                break;
            case "CLOSE_APP":
                device.foregroundAppId = undefined;
                break;
            case "GO_HOME":
                device.foregroundAppId = undefined;
                break;

            // --- Badge ---
            case "SET_BADGE":
                if (device.homeScreen) {
                    const dockIcon = device.homeScreen.dock.find(a => a.appId === event.appId);
                    if (dockIcon) dockIcon.badge = event.count > 0 ? event.count : undefined;
                    device.homeScreen.pages.forEach(page => {
                        page.apps.forEach(item => {
                            if ('appId' in item && item.appId === event.appId) {
                                item.badge = event.count > 0 ? event.count : undefined;
                            }
                        });
                    });
                }
                break;

            // =================================================================
            // NOTIFICATION EVENTS (IR-compliant)
            // =================================================================

            case "SHOW_NOTIFICATION": {
                const e = event as any;
                const notification: Notification = {
                    id: generateNotificationId(e),
                    deviceId: e.deviceId,
                    appId: e.appId,
                    title: e.title,
                    body: e.body,
                    at: e.at,
                    deliveredAt: e.at,
                    state: e.mode === "silent" ? "inShade" : "headsUp",
                    mode: e.mode || "both",
                    priority: e.priority || "active",
                    deliverWhen: e.deliverWhen || "always",
                    groupKey: e.groupKey,
                    threadId: e.threadId,
                    icon: e.icon,
                    preview: e.preview,
                    actions: e.actions,
                    replyable: e.replyable,
                    metadata: e.metadata,
                    headsUp: e.mode !== "silent" ? {
                        shownAt: e.at,
                        duration: IOS_NOTIFICATION_POLICY.headsUpDurationByPriority[(e.priority || "active") as NotificationPriority],
                    } : undefined,
                };

                // Add to items
                device.notificationCenter!.items.push(notification);

                // Legacy array
                if (!device.notifications) device.notifications = [];
                device.notifications.push(notification);

                // Set as headsUp if not silent
                if (notification.state === "headsUp") {
                    const currentHeadsUp = device.notificationCenter!.headsUp;
                    if (!currentHeadsUp) {
                        device.notificationCenter!.headsUp = notification.id;
                    } else {
                        // Queue it
                        device.notificationCenter!.headsUpQueue.push(notification.id);
                    }
                }

                // Update groups
                device.notificationCenter!.groups = computeGroups(device.notificationCenter!.items);
                break;
            }

            case "UPDATE_NOTIFICATION": {
                const e = event as any;
                const item = device.notificationCenter!.items.find(n => n.id === e.notificationId);
                if (item) {
                    Object.assign(item, e.patch);
                    item.updatedAt = e.at;
                }
                device.notificationCenter!.groups = computeGroups(device.notificationCenter!.items);
                break;
            }

            case "DISMISS_NOTIFICATION": {
                const e = event as any;
                if (e.all) {
                    device.notificationCenter!.items.forEach(n => {
                        n.state = "dismissed";
                        n.dismissedAt = e.at;
                    });
                    device.notificationCenter!.headsUp = null;
                    device.notificationCenter!.headsUpQueue = [];
                } else if (e.groupKey) {
                    device.notificationCenter!.items.filter(n => n.groupKey === e.groupKey).forEach(n => {
                        n.state = "dismissed";
                        n.dismissedAt = e.at;
                    });
                } else if (e.notificationId) {
                    const item = device.notificationCenter!.items.find(n => n.id === e.notificationId);
                    if (item) {
                        item.state = "dismissed";
                        item.dismissedAt = e.at;
                    }
                    // Clear headsUp if dismissed
                    if (device.notificationCenter!.headsUp === e.notificationId) {
                        device.notificationCenter!.headsUp = device.notificationCenter!.headsUpQueue.shift() || null;
                    }
                }
                device.notificationCenter!.groups = computeGroups(device.notificationCenter!.items);

                // Legacy
                if (device.notifications && e.notificationId) {
                    const notif = device.notifications.find(n => n.id === e.notificationId);
                    if (notif) notif.dismissedAt = e.at;
                }
                break;
            }

            case "TAP_NOTIFICATION": {
                const e = event as any;
                const item = device.notificationCenter!.items.find(n => n.id === e.notificationId);
                if (item) {
                    // Transition: headsUp → inShade (or dismissed)
                    item.state = "inShade";
                    if (device.notificationCenter!.headsUp === e.notificationId) {
                        device.notificationCenter!.headsUp = device.notificationCenter!.headsUpQueue.shift() || null;
                    }
                    // Open the app
                    device.foregroundAppId = item.appId;
                }
                break;
            }

            case "SWIPE_NOTIFICATION": {
                const e = event as any;
                const item = device.notificationCenter!.items.find(n => n.id === e.notificationId);
                if (item && (e.action === "dismiss" || e.direction === "right")) {
                    item.state = "dismissed";
                    item.dismissedAt = e.at;
                    if (device.notificationCenter!.headsUp === e.notificationId) {
                        device.notificationCenter!.headsUp = device.notificationCenter!.headsUpQueue.shift() || null;
                    }
                }
                device.notificationCenter!.groups = computeGroups(device.notificationCenter!.items);
                break;
            }

            case "REPLY_NOTIFICATION": {
                // App-level handling - reducer just marks as replied
                const e = event as any;
                const item = device.notificationCenter!.items.find(n => n.id === e.notificationId);
                if (item) {
                    item.metadata = { ...item.metadata, replied: true, replyText: e.text };
                    item.state = "inShade";
                    if (device.notificationCenter!.headsUp === e.notificationId) {
                        device.notificationCenter!.headsUp = device.notificationCenter!.headsUpQueue.shift() || null;
                    }
                }
                break;
            }

            case "TOGGLE_NOTIFICATION_PANEL": {
                // Will be used by renderer to show/hide panel
                // State managed in renderer, but we could add panelOpen to DeviceState if needed
                break;
            }

            case "CLEAR_ALL_NOTIFICATIONS": {
                device.notificationCenter!.items.forEach(n => {
                    n.state = "dismissed";
                    n.dismissedAt = event.at;
                });
                device.notificationCenter!.headsUp = null;
                device.notificationCenter!.headsUpQueue = [];
                device.notificationCenter!.groups = [];
                break;
            }

            case "SET_DYNAMIC_ISLAND": {
                const e = event as any;
                if (!device.dynamicIsland) device.dynamicIsland = { ...DEFAULT_DYNAMIC_ISLAND };
                device.dynamicIsland.visible = e.visible;
                if (e.mode) device.dynamicIsland.mode = e.mode;
                break;
            }

            // --- Call Events ---
            case "INCOMING_CALL":
                device.call = {
                    status: "incoming",
                    callerId: event.callerId,
                    callerName: event.callerName,
                    callerAvatar: event.callerAvatar,
                    isVideo: event.isVideo || false,
                    callType: "voice",
                    displayMode: "fullscreen",
                    startedAt: event.at
                };
                break;

            case "CALL_ANSWERED":
                if (device.call && device.call.status === "incoming") {
                    device.call.status = "active";
                }
                break;

            case "CALL_ENDED":
                if (device.call) {
                    device.call.status = "ended";
                    device.call.endedAt = event.at;
                }
                break;

            // --- Background Apps ---
            case "START_BACKGROUND_APP": {
                const e = event as any;
                if (!device.backgroundApps) device.backgroundApps = [];
                device.backgroundApps = device.backgroundApps.filter(a => a.appId !== e.appId);
                device.backgroundApps.push({
                    appId: e.appId,
                    startedAt: e.at,
                    indicator: e.indicator || "music",
                    label: e.label,
                });
                // Update Dynamic Island to show music
                if (!device.dynamicIsland) device.dynamicIsland = { ...DEFAULT_DYNAMIC_ISLAND };
                device.dynamicIsland.activeContent = e.indicator || "music";
                device.dynamicIsland.mode = "compact";
                break;
            }

            case "STOP_BACKGROUND_APP": {
                const e = event as any;
                if (device.backgroundApps) {
                    device.backgroundApps = device.backgroundApps.filter(a => a.appId !== e.appId);
                }
                // Reset Dynamic Island if no more background apps
                if (device.dynamicIsland && device.backgroundApps?.length === 0) {
                    device.dynamicIsland.activeContent = null;
                    device.dynamicIsland.mode = "idle";
                }
                break;
            }
        }
    });
}

// Register itself with the core engine
ReducerRegistry.registerDeviceReducer(deviceReducer);
