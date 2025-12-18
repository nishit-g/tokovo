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

        // Initialize notification center if needed with fresh mutable arrays
        if (!device.notificationCenter) {
            device.notificationCenter = {
                ...DEFAULT_NOTIFICATION_CENTER,
                items: [],
                groups: [],
                headsUpQueue: [],
            };
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
            // NOTIFICATION EVENTS - DELEGATED TO @tokovo/device-notifications
            // The following cases are intentionally removed/commented out.
            // See: packages/device-notifications/src/reducer.ts
            // =================================================================

            // case "SHOW_NOTIFICATION": - handled by device-notifications
            // case "UPDATE_NOTIFICATION": - handled by device-notifications
            // case "DISMISS_NOTIFICATION": - handled by device-notifications
            // case "TAP_NOTIFICATION": - handled by device-notifications
            // case "SWIPE_NOTIFICATION": - handled by device-notifications
            // case "REPLY_NOTIFICATION": - handled by device-notifications
            // case "TOGGLE_NOTIFICATION_PANEL": - handled by device-notifications
            // case "CLEAR_ALL_NOTIFICATIONS": - handled by device-notifications

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
