import { produce } from "immer";
import {
  TimelineEvent,
  DeviceState,
  DEFAULT_DYNAMIC_ISLAND,
  OpenAppEvent,
  SetBadgeEvent,
  SetDynamicIslandEvent,
  SetScreenRecordingEvent,
  IncomingCallEvent,
  StartBackgroundAppEvent,
  StopBackgroundAppEvent,
} from "@tokovo/core";
import type { EngineRegistries } from "@tokovo/core";

const DEFAULT_SCREEN_RECORDING_COUNTDOWN_FRAMES = 90;
const DEFAULT_SCREEN_RECORDING_FEEDBACK_FRAMES = 72;

// =============================================================================
// DEVICE REDUCER
// =============================================================================

/**
 * Device Reducer
 * Handles device navigation, chrome, recording, and call events.
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

      case "SET_DYNAMIC_ISLAND": {
        const e = event as SetDynamicIslandEvent;
        if (!device.dynamicIsland)
          device.dynamicIsland = { ...DEFAULT_DYNAMIC_ISLAND };
        device.dynamicIsland.visible = e.payload?.visible ?? true;
        if (e.payload?.presentation) {
          device.dynamicIsland.presentation = e.payload.presentation;
        }
        if (e.payload && "activity" in e.payload) {
          device.dynamicIsland.activity = e.payload.activity ?? null;
        }
        if (e.payload?.appId !== undefined) {
          device.dynamicIsland.appId = e.payload.appId;
        }
        if (e.payload?.content !== undefined) {
          device.dynamicIsland.content = e.payload.content;
        }
        device.dynamicIsland.updatedAtFrame = event.at;
        break;
      }

      case "SET_SCREEN_RECORDING": {
        const e = event as SetScreenRecordingEvent;
        const enabled = e.payload?.enabled ?? false;
        const presentation = e.payload?.presentation;
        const microphoneEnabled = e.payload?.microphoneEnabled;
        if (enabled) {
          if (device.screenRecording?.isCapturing) {
            if (
              presentation &&
              presentation !== device.screenRecording.presentation
            ) {
              device.screenRecording.previousPresentation =
                device.screenRecording.presentation;
              device.screenRecording.presentation = presentation;
              device.screenRecording.presentationChangedAtFrame = event.at;
            }
            if (microphoneEnabled !== undefined) {
              device.screenRecording.microphoneEnabled = microphoneEnabled;
            }
            device.screenRecording.captureStoppedAtFrame = undefined;
            device.screenRecording.feedbackEndsAtFrame = undefined;
            device.screenRecording.completion = undefined;
            break;
          }
          const countdownFrames = Math.max(
            0,
            Math.round(
              e.payload?.countdownFrames ??
                DEFAULT_SCREEN_RECORDING_COUNTDOWN_FRAMES,
            ),
          );
          device.screenRecording = {
            isCapturing: true,
            presentation: presentation ?? "compact",
            microphoneEnabled: microphoneEnabled ?? false,
            requestedAtFrame: event.at,
            captureStartedAtFrame: event.at + countdownFrames,
            previousPresentation: "idle",
            presentationChangedAtFrame: event.at,
          };
        } else {
          if (!device.screenRecording?.isCapturing) break;
          const previousPresentation =
            event.at < device.screenRecording.captureStartedAtFrame
              ? "countdown"
              : device.screenRecording.presentation;
          const feedbackFrames = Math.max(
            0,
            Math.round(
              e.payload?.feedbackFrames ?? DEFAULT_SCREEN_RECORDING_FEEDBACK_FRAMES,
            ),
          );
          device.screenRecording = {
            ...device.screenRecording,
            isCapturing: false,
            captureStoppedAtFrame: event.at,
            feedbackEndsAtFrame: event.at + feedbackFrames,
            completion:
              event.at < device.screenRecording.captureStartedAtFrame
                ? "cancelled"
                : "saved",
            previousPresentation,
            presentationChangedAtFrame: event.at,
          };
          if (device.dynamicIsland?.activity === "recording") {
            device.dynamicIsland.activity = null;
            device.dynamicIsland.presentation = "idle";
            device.dynamicIsland.updatedAtFrame = event.at;
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
        device.dynamicIsland.activity = e.payload?.indicator || "music";
        device.dynamicIsland.presentation = "compact";
        device.dynamicIsland.updatedAtFrame = event.at;
        device.dynamicIsland.appId = appId;
        device.dynamicIsland.content = {
          title: e.payload?.label,
        };
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
          device.dynamicIsland.activity = null;
          device.dynamicIsland.presentation = "idle";
          device.dynamicIsland.updatedAtFrame = event.at;
          device.dynamicIsland.appId = undefined;
          device.dynamicIsland.content = undefined;
        }
        break;
      }
    }
  });
}

export function registerDeviceReducer(registries: EngineRegistries): void {
  registries.reducers.registerDeviceReducer(deviceReducer);
}
