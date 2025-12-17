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
 * @see docs/FUCKING_MESS.md
 */

import type { WorldState } from "./types";
import type { DeviceRuntimeEvent, AppRuntimeEvent } from "./types/runtime-event";

// =============================================================================
// TYPE GUARDS
// =============================================================================

function isDeviceEvent(event: unknown): event is DeviceRuntimeEvent {
    return (event as any)?.kind === "DEVICE";
}

function isAppNavigationEvent(event: unknown): event is AppRuntimeEvent {
    const e = event as any;
    return e?.kind === "APP" && [
        "NAVIGATE_SCREEN",
        "CONVERSATION_OPENED",
        "CONVERSATION_CLOSED",
        "GO_BACK",
    ].includes(e?.type);
}

// =============================================================================
// REDUCER
// =============================================================================

/**
 * Navigation reducer - applies device/app navigation events
 * 
 * @param draft - Immer draft of WorldState (mutable)
 * @param event - RuntimeEvent (checked for DEVICE or APP navigation types)
 */
export function navigationReducer(draft: WorldState, event: unknown): void {
    const e = event as any;

    // ===========================================================================
    // DEVICE EVENTS
    // ===========================================================================
    if (isDeviceEvent(event)) {
        const { deviceId, type, payload } = e;
        const device = draft.devices?.[deviceId];

        if (!device) {
            console.warn(`[navigation-reducer] Device not found: ${deviceId}`);
            return;
        }

        switch (type) {
            // -------------------------------------------------------------------
            // UNLOCK / LOCK
            // -------------------------------------------------------------------
            case "UNLOCK":
                device.isLocked = false;
                break;

            case "LOCK":
                device.isLocked = true;
                device.foregroundAppId = undefined;
                break;

            // -------------------------------------------------------------------
            // OPEN_APP
            // -------------------------------------------------------------------
            case "OPEN_APP": {
                const appId = payload?.appId;
                device.foregroundAppId = appId ?? undefined;
                device.isLocked = false;

                // Initialize app state if needed
                if (appId && draft.appState) {
                    const appState = draft.appState as Record<string, any>;
                    if (!appState[appId]) {
                        appState[appId] = {
                            currentScreen: "main",
                        };
                    }
                }
                break;
            }

            // -------------------------------------------------------------------
            // CLOSE_APP
            // -------------------------------------------------------------------
            case "CLOSE_APP":
                device.foregroundAppId = undefined;
                break;

            // -------------------------------------------------------------------
            // GO_HOME
            // -------------------------------------------------------------------
            case "GO_HOME":
                device.foregroundAppId = undefined;
                break;

            // -------------------------------------------------------------------
            // SHOW_NOTIFICATION
            // -------------------------------------------------------------------
            case "SHOW_NOTIFICATION": {
                // Notifications are handled by notification system
                // Just ensure device tracks active notifications
                break;
            }

            default:
                // Other device events handled elsewhere
                break;
        }

        return;
    }

    // ===========================================================================
    // APP NAVIGATION EVENTS
    // ===========================================================================
    if (isAppNavigationEvent(event)) {
        const { appId, type, payload } = e;

        if (!appId) return;

        // Ensure appState exists
        if (!draft.appState) {
            (draft as any).appState = {};
        }
        const appStateMap = draft.appState as Record<string, any>;
        if (!appStateMap[appId]) {
            appStateMap[appId] = { currentScreen: "main" };
        }

        const appState = appStateMap[appId];

        switch (type) {
            // -------------------------------------------------------------------
            // NAVIGATE_SCREEN
            // -------------------------------------------------------------------
            case "NAVIGATE_SCREEN": {
                appState.currentScreen = payload?.screen ?? "main";
                break;
            }

            // -------------------------------------------------------------------
            // CONVERSATION_OPENED
            // -------------------------------------------------------------------
            case "CONVERSATION_OPENED": {
                appState.currentScreen = "chat";
                appState.currentConversationId = payload?.conversationId;
                break;
            }

            // -------------------------------------------------------------------
            // CONVERSATION_CLOSED
            // -------------------------------------------------------------------
            case "CONVERSATION_CLOSED":
                appState.currentScreen = "chats";
                appState.currentConversationId = undefined;
                break;

            // -------------------------------------------------------------------
            // GO_BACK
            // -------------------------------------------------------------------
            case "GO_BACK":
                // Simple back navigation - could be extended with history stack
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
