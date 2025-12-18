/**
 * Notification Handler - DELEGATED TO @tokovo/device-notifications
 * 
 * @description This handler has been moved to the device-notifications package.
 * This file remains for backward compatibility but does NOT process events.
 * 
 * See: packages/device-notifications/src/reducer.ts
 */

import type { WorldState } from "../../types";
import type { DeviceEvent, HandlerContext } from "./types";

/**
 * Process notification event
 * 
 * @deprecated Events are now handled by @tokovo/device-notifications package.
 * This function is a no-op stub for backward compatibility.
 */
export function processNotificationEvent(
    _draft: WorldState,
    _event: DeviceEvent,
    _ctx: HandlerContext
): void {
    // No-op: Notifications are now handled by the device-notifications reducer
    // which is auto-registered when @tokovo/device-notifications is imported.
    // 
    // The NotificationScheduler and HeadsUpNotification are also in that package.
}
