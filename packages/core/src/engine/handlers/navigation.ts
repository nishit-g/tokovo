/**
 * Navigation Reducer
 *
 * Handles device and app navigation events.
 *
 * This is a CORE reducer - navigation is not a plugin, it's an OS feature.
 * Every device has the same navigation primitives.
 *
 * Events handled:
 * - DEVICE:UNLOCK / LOCK
 * - DEVICE:OPEN_APP / CLOSE_APP / GO_HOME
 * - APP:NAVIGATE_SCREEN
 * - APP:CONVERSATION_OPENED / CONVERSATION_CLOSED
 *
 * @see docs/architecture/core-runtime.md
 */

import type { WorldState } from "../../types.js";
import type { DeviceRuntimeEvent, AppRuntimeEvent } from "../../types/runtime-event.js";
import { createScopedLogger } from "../../logger/index.js";

const log = createScopedLogger("engine");

interface NavigationEventPayload {
  deviceId?: string;
  appId?: string;
  type?: string;
  payload?: {
    appId?: string;
    screen?: string;
    conversationId?: string;
  };
}

function isDeviceEvent(event: unknown): event is DeviceRuntimeEvent {
  return (
    typeof event === "object" && event !== null && (event as { kind?: string }).kind === "DEVICE"
  );
}

function isAppNavigationEvent(event: unknown): event is AppRuntimeEvent {
  if (typeof event !== "object" || event === null) return false;
  const e = event as { kind?: string; type?: string };
  return (
    e.kind === "APP" &&
    ["NAVIGATE_SCREEN", "CONVERSATION_OPENED", "CONVERSATION_CLOSED", "GO_BACK"].includes(
      e.type || "",
    )
  );
}

export function navigationReducer(draft: WorldState, event: unknown): void {
  const e = event as NavigationEventPayload;

  if (isDeviceEvent(event)) {
    const { deviceId, type, payload } = e;
    const device = draft.devices?.[deviceId || ""];

    if (!device) {
      log.warn(`Navigation reducer could not find device ${deviceId}`, {
        event: "engine.navigation.device_missing",
        deviceId,
      });
      return;
    }

    switch (type) {
      case "UNLOCK":
        device.isLocked = false;
        break;

      case "LOCK":
        device.isLocked = true;
        device.foregroundAppId = undefined;
        break;

      case "OPEN_APP": {
        const appId = payload?.appId;
        device.foregroundAppId = appId ?? undefined;
        device.isLocked = false;

        if (appId && draft.appState) {
          const appState = draft.appState as Record<string, { currentScreen?: string }>;
          if (!appState[appId]) {
            appState[appId] = {
              currentScreen: "main",
            };
          }
        }
        break;
      }

      case "CLOSE_APP":
        device.foregroundAppId = undefined;
        break;

      case "GO_HOME":
        device.foregroundAppId = undefined;
        break;

      case "SHOW_NOTIFICATION":
        break;

      default:
        break;
    }

    return;
  }

  if (isAppNavigationEvent(event)) {
    const { appId, type, payload } = e;

    if (!appId) return;

    if (!draft.appState) {
      draft.appState = {};
    }
    const appStateMap = draft.appState as Record<
      string,
      {
        currentScreen?: string;
        currentConversationId?: string;
      }
    >;
    if (!appStateMap[appId]) {
      appStateMap[appId] = { currentScreen: "main" };
    }

    const appState = appStateMap[appId];

    switch (type) {
      case "NAVIGATE_SCREEN": {
        appState.currentScreen = payload?.screen ?? "main";
        break;
      }

      case "CONVERSATION_OPENED": {
        appState.currentScreen = "chat";
        appState.currentConversationId = payload?.conversationId;
        break;
      }

      case "CONVERSATION_CLOSED":
        appState.currentScreen = "chats";
        appState.currentConversationId = undefined;
        break;

      case "GO_BACK":
        if (appState.currentScreen === "chat") {
          appState.currentScreen = "chats";
          appState.currentConversationId = undefined;
        } else {
          appState.currentScreen = "main";
        }
        break;
    }
  }
}

export default navigationReducer;
