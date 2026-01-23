/**
 * Notification Track Event
 *
 * IR event types for notification-related timeline events.
 */

import type { NotificationPayloads } from "../types/payloads";

// =============================================================================
// NOTIFICATION TRACK EVENT
// =============================================================================

/**
 * NotificationTrackEvent - A notification event in the V2 track IR
 */
export type NotificationTrackEvent = {
  /** Event kind - notifications are DEVICE events */
  kind: "DEVICE";

  /** Device ID */
  deviceId: string;

  /** Event type */
  type: `NOTIFICATION_${keyof NotificationPayloads}`;

  /** Frame when this event occurs */
  at: number;

  /** Declaration order for stable sorting */
  _declarationOrder: number;
} & (
  | ({ type: "NOTIFICATION_SHOW" } & NotificationPayloads["SHOW"])
  | ({ type: "NOTIFICATION_DISMISS" } & NotificationPayloads["DISMISS"])
  | ({ type: "NOTIFICATION_TAP" } & NotificationPayloads["TAP"])
  | ({ type: "NOTIFICATION_SWIPE" } & NotificationPayloads["SWIPE"])
  | ({
      type: "NOTIFICATION_DYNAMIC_ISLAND";
    } & NotificationPayloads["DYNAMIC_ISLAND"])
  | { type: "NOTIFICATION_OPEN_PANEL" }
  | { type: "NOTIFICATION_CLOSE_PANEL" }
  | { type: "NOTIFICATION_CLEAR_ALL" }
  | ({ type: "NOTIFICATION_REPLY" } & NotificationPayloads["REPLY"])
);

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isNotificationEvent(
  event: unknown,
): event is NotificationTrackEvent {
  const e = event as { kind?: string; type?: string };
  return (
    e.kind === "DEVICE" &&
    typeof e.type === "string" &&
    e.type.startsWith("NOTIFICATION_")
  );
}
