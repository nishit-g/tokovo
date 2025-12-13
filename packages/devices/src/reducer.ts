import { produce } from "immer";
import { TimelineEvent, DeviceState } from "@tokovo/core";
import { ReducerRegistry } from "@tokovo/core";

/**
 * Device Reducer
 * Handles all DEVICE events: lock/unlock, app open/close, notifications, calls, home screen
 */
export function deviceReducer(devices: Record<string, DeviceState>, event: TimelineEvent): Record<string, DeviceState> {
    return produce(devices, draft => {
        if (event.kind !== "DEVICE") return;

        const device = draft[event.deviceId];
        if (!device) return;

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
                    // Update badge in dock
                    const dockIcon = device.homeScreen.dock.find(a => a.appId === event.appId);
                    if (dockIcon) {
                        dockIcon.badge = event.count > 0 ? event.count : undefined;
                    }
                    // Update badge in pages
                    device.homeScreen.pages.forEach(page => {
                        page.apps.forEach(item => {
                            if ('appId' in item && item.appId === event.appId) {
                                item.badge = event.count > 0 ? event.count : undefined;
                            }
                        });
                    });
                }
                break;

            // --- Notifications ---
            case "SHOW_NOTIFICATION":
                if (!device.notifications) device.notifications = [];
                device.notifications.push({
                    id: `notif_${event.at}_${event.appId}`,
                    appId: event.appId,
                    title: event.title,
                    body: event.body,
                    at: event.at,
                    mode: event.mode || "both",
                    icon: event.icon
                });
                break;

            case "DISMISS_NOTIFICATION":
                if (device.notifications) {
                    const notif = device.notifications.find(n => n.id === event.notificationId);
                    if (notif) {
                        notif.dismissedAt = event.at;
                    }
                }
                break;

            // --- Call Events ---
            case "INCOMING_CALL":
                device.call = {
                    status: "incoming",
                    callerId: event.callerId,
                    callerName: event.callerName,
                    callerAvatar: event.callerAvatar,
                    isVideo: event.isVideo || false,
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

            // --- Background Apps (e.g., Spotify playing) ---
            case "START_BACKGROUND_APP":
                if (!device.backgroundApps) device.backgroundApps = [];
                // Remove existing entry for this app (if any)
                device.backgroundApps = device.backgroundApps.filter(a => a.appId !== event.appId);
                device.backgroundApps.push({
                    appId: event.appId,
                    startedAt: event.at,
                    indicator: event.indicator || "music",
                    label: event.label,
                });
                break;

            case "STOP_BACKGROUND_APP":
                if (device.backgroundApps) {
                    device.backgroundApps = device.backgroundApps.filter(a => a.appId !== event.appId);
                }
                break;
        }
    });
}

// Register itself with the core engine
ReducerRegistry.registerDeviceReducer(deviceReducer);
