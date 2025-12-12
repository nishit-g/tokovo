import { produce } from "immer";
import { TimelineEvent, DeviceState } from "@tokovo/core";
import { ReducerRegistry } from "@tokovo/core";

/**
 * Device Reducer
 * Handles all DEVICE events: lock/unlock, app open/close, notifications, and calls
 */
export function deviceReducer(devices: Record<string, DeviceState>, event: TimelineEvent): Record<string, DeviceState> {
    return produce(devices, draft => {
        if (event.kind !== "DEVICE") return;

        const device = draft[event.deviceId];
        if (!device) return; // Device not found

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
        }
    });
}

// Register itself with the core engine
ReducerRegistry.registerDeviceReducer(deviceReducer);
