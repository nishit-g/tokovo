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

const SCREEN_RECORDING_COUNTDOWN_FRAMES = 45;
const SCREEN_RECORDING_STOP_FEEDBACK_FRAMES = 30;

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
        device.transition = undefined;
        break;
      case "UNLOCK":
        device.isLocked = false;
        device.transition = {
          kind: "unlock",
          startFrame: event.at,
          durationFrames: 45, // 1.5s @ 30fps (deterministic default)
          style: "faceIdSwipe",
        };
        break;

      // --- App Management ---
      case "OPEN_APP": {
        const e = event as OpenAppEvent;
        device.foregroundAppId = e.payload?.appId;
        const transition = (e.payload as unknown as { transition?: unknown })
          ?.transition as
          | {
              durationFrames?: number;
              style?: string;
              originX?: number;
              originY?: number;
            }
          | undefined;
        if (transition) {
          device.transition = {
            kind: "openApp",
            startFrame: event.at,
            durationFrames: transition.durationFrames ?? 18,
            style: (transition.style ?? "iosZoom") as "iosZoom",
            originX: transition.originX,
            originY: transition.originY,
          };
        }
        break;
      }
      case "CLOSE_APP":
        device.foregroundAppId = undefined;
        break;
      case "GO_HOME":
        device.foregroundAppId = undefined;
        {
          const transition = (event as unknown as {
            payload?: { transition?: unknown };
          }).payload?.transition as
            | {
                durationFrames?: number;
                style?: string;
                originX?: number;
                originY?: number;
              }
            | undefined;
          if (transition) {
            device.transition = {
              kind: "goHome",
              startFrame: event.at,
              durationFrames: transition.durationFrames ?? 18,
              style: (transition.style ?? "iosZoom") as "iosZoom",
              originX: transition.originX,
              originY: transition.originY,
            };
          }
        }
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

      case "SET_SCREEN_RECORDING": {
        const enabled = Boolean(
          (event as unknown as { payload?: { enabled?: unknown } }).payload
            ?.enabled ?? false,
        );
        const mode = (event as unknown as { payload?: { mode?: unknown } })
          .payload?.mode as "minimal" | "compact" | undefined;
        if (enabled) {
          if (device.screenRecording?.enabled) {
            device.screenRecording.mode = mode ?? device.screenRecording.mode;
            device.screenRecording.stopFeedbackUntilFrame = undefined;
            device.screenRecording.stoppedAtFrame = undefined;
            break;
          }
          device.screenRecording = {
            enabled: true,
            mode: mode ?? "compact",
            startedAtFrame: event.at,
            activeSinceFrame: event.at + SCREEN_RECORDING_COUNTDOWN_FRAMES,
            stoppedAtFrame: undefined,
            stopFeedbackUntilFrame: undefined,
          };
        } else {
          device.screenRecording = {
            enabled: false,
            mode: device.screenRecording?.mode ?? mode ?? "compact",
            startedAtFrame: device.screenRecording?.startedAtFrame,
            activeSinceFrame: device.screenRecording?.activeSinceFrame,
            stoppedAtFrame: event.at,
            stopFeedbackUntilFrame:
              event.at + SCREEN_RECORDING_STOP_FEEDBACK_FRAMES,
          };
          if (device.dynamicIsland?.activeContent === "recording") {
            device.dynamicIsland.activeContent = null;
            device.dynamicIsland.mode = "idle";
          }
        }
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
          callType:
            (e.payload as unknown as { callType?: string })?.callType ??
            (e.payload?.isVideo ? "video" : "voice"),
          displayMode:
            ((e.payload as unknown as { displayMode?: string })?.displayMode as
              | "overlay"
              | "fullscreen"
              | string
              | undefined) ?? "fullscreen",
          callerMetadata: (e.payload as unknown as { callerMetadata?: unknown })
            ?.callerMetadata as Record<string, unknown> | undefined,
          startedAt: e.at,
        };
        break;
      }

      case "CALL_ANSWERED":
        if (device.call && device.call.status === "incoming") {
          device.call.status = "active";
          device.call.answeredAt = event.at;
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
