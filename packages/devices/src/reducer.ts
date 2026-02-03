import { produce } from "immer";
import {
  TimelineEvent,
  DeviceState,
  DEFAULT_NOTIFICATION_CENTER,
  DEFAULT_DYNAMIC_ISLAND,
  OpenAppEvent,
  SetBadgeEvent,
  SetDynamicIslandEvent,
  IncomingCallEvent,
  StartBackgroundAppEvent,
  StopBackgroundAppEvent,
} from "@tokovo/core";
import type { EngineRegistries } from "@tokovo/core";

// =============================================================================
// DEVICE REDUCER
// =============================================================================

/**
 * Device Reducer
 * Handles all DEVICE events: lock/unlock, app open/close, notifications, calls
 */
export function deviceReducer(
  devices: Record<string, DeviceState>,
  event: TimelineEvent,
): Record<string, DeviceState> {
  return produce(devices, (draft) => {
    if (event.kind !== "DEVICE") return;

    const deviceId = (event as { deviceId?: string }).deviceId;
    if (!deviceId) return;

    const device = draft[deviceId];
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
      case "OPEN_APP": {
        const e = event as OpenAppEvent;
        device.foregroundAppId = e.payload?.appId;
        break;
      }
      case "CLOSE_APP":
        device.foregroundAppId = undefined;
        break;
      case "GO_HOME":
        device.foregroundAppId = undefined;
        break;

      // --- Badge ---
      case "SET_BADGE": {
        const e = event as SetBadgeEvent;
        const appId = e.payload?.appId;
        const count = e.payload?.count ?? 0;
        if (device.homeScreen && appId) {
          const dockIcon = device.homeScreen.dock.find(
            (a) => a.appId === appId,
          );
          if (dockIcon) dockIcon.badge = count > 0 ? count : undefined;
          device.homeScreen.pages.forEach((page) => {
            page.apps.forEach((item) => {
              if ("appId" in item && item.appId === appId) {
                item.badge = count > 0 ? count : undefined;
              }
            });
          });
        }
        break;
      }

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
        const e = event as SetDynamicIslandEvent;
        if (!device.dynamicIsland)
          device.dynamicIsland = { ...DEFAULT_DYNAMIC_ISLAND };
        device.dynamicIsland.visible = e.payload?.visible ?? true;
        if (e.payload?.mode) device.dynamicIsland.mode = e.payload.mode;
        break;
      }

      // --- Call Events ---
      case "INCOMING_CALL": {
        const e = event as IncomingCallEvent;
        device.call = {
          status: "incoming",
          callerId: e.payload?.callerId || "unknown",
          callerName: e.payload?.callerName || "Unknown",
          callerAvatar: e.payload?.callerAvatar,
          isVideo: e.payload?.isVideo || false,
          callType: "voice",
          displayMode: "fullscreen",
          startedAt: e.at,
        };
        break;
      }

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
        const e = event as StartBackgroundAppEvent;
        const appId = e.payload?.appId;
        if (!appId) break;
        if (!device.backgroundApps) device.backgroundApps = [];
        device.backgroundApps = device.backgroundApps.filter(
          (a) => a.appId !== appId,
        );
        device.backgroundApps.push({
          appId,
          startedAt: e.at,
          indicator: e.payload?.indicator || "music",
          label: e.payload?.label,
        });
        if (!device.dynamicIsland)
          device.dynamicIsland = { ...DEFAULT_DYNAMIC_ISLAND };
        device.dynamicIsland.activeContent = e.payload?.indicator || "music";
        device.dynamicIsland.mode = "compact";
        break;
      }

      case "STOP_BACKGROUND_APP": {
        const e = event as StopBackgroundAppEvent;
        const appId = e.payload?.appId;
        if (device.backgroundApps && appId) {
          device.backgroundApps = device.backgroundApps.filter(
            (a) => a.appId !== appId,
          );
        }
        if (device.dynamicIsland && device.backgroundApps?.length === 0) {
          device.dynamicIsland.activeContent = null;
          device.dynamicIsland.mode = "idle";
        }
        break;
      }
    }
  });
}

export function registerDeviceReducer(registries: EngineRegistries): void {
  registries.reducers.registerDeviceReducer(deviceReducer);
}
