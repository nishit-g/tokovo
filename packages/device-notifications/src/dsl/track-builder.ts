/**
 * Notification Track Builder
 *
 * Fluent DSL for authoring notification events in tracks.
 * Follows the keyboard/whatsapp TrackBuilder pattern.
 */

import type { NotificationTrackEvent } from "../ir/track-event";
import type {
  NotificationPayloads,
  ShowNotificationPayload,
  DismissNotificationPayload,
  DynamicIslandPayload,
} from "../types/payloads";

// =============================================================================
// TYPES
// =============================================================================

type GetOrder = () => number;

// =============================================================================
// POINT BUILDER (at)
// =============================================================================

/**
 * NotificationPointBuilder - Methods available at a specific point in time
 */
export class NotificationPointBuilder {
  constructor(
    private _frame: number,
    private _deviceId: string,
    private _events: NotificationTrackEvent[],
    private _getOrder: GetOrder,
  ) {}

  private emit<T extends keyof NotificationPayloads>(
    type: T,
    payload: NotificationPayloads[T],
  ): this {
    this._events.push({
      kind: "DEVICE",
      deviceId: this._deviceId,
      type: `NOTIFICATION_${type}` as any,
      at: this._frame,
      _declarationOrder: this._getOrder(),
      ...payload,
    } as NotificationTrackEvent);
    return this;
  }

  // =========================================================================
  // SHOW NOTIFICATION
  // =========================================================================

  /**
   * Show a notification
   */
  show(opts: ShowNotificationPayload): this {
    return this.emit("SHOW", opts);
  }

  // =========================================================================
  // DISMISS NOTIFICATION
  // =========================================================================

  /**
   * Dismiss notification(s)
   * @param idOrOpts - Notification ID or dismiss options
   */
  dismiss(idOrOpts: string | DismissNotificationPayload = {}): this {
    const opts = typeof idOrOpts === "string" ? { id: idOrOpts } : idOrOpts;
    return this.emit("DISMISS", opts);
  }

  // =========================================================================
  // TAP NOTIFICATION
  // =========================================================================

  /**
   * Tap a notification (opens app)
   */
  tap(id: string, actionId?: string): this {
    return this.emit("TAP", { id, actionId });
  }

  // =========================================================================
  // SWIPE NOTIFICATION
  // =========================================================================

  /**
   * Swipe a notification
   */
  swipe(
    id: string,
    direction: "left" | "right",
    action: "dismiss" | "archive" | "snooze" | "mark_read" = "dismiss",
  ): this {
    return this.emit("SWIPE", { id, direction, action });
  }

  // =========================================================================
  // DYNAMIC ISLAND
  // =========================================================================

  /**
   * Update Dynamic Island state (iOS 14+)
   */
  dynamicIsland(opts: DynamicIslandPayload): this {
    return this.emit("DYNAMIC_ISLAND", opts);
  }

  // =========================================================================
  // NOTIFICATION PANEL
  // =========================================================================

  /**
   * Open the notification shade/panel
   */
  openPanel(): this {
    return this.emit("OPEN_PANEL", {} as any);
  }

  /**
   * Close the notification shade/panel
   */
  closePanel(): this {
    return this.emit("CLOSE_PANEL", {} as any);
  }

  // =========================================================================
  // CLEAR ALL
  // =========================================================================

  /**
   * Clear all notifications
   */
  clearAll(): this {
    return this.emit("CLEAR_ALL", {} as any);
  }

  // =========================================================================
  // REPLY
  // =========================================================================

  /**
   * Reply to a notification inline
   */
  reply(id: string, text: string): this {
    return this.emit("REPLY", { id, text });
  }
}

// =============================================================================
// TRACK BUILDER
// =============================================================================

/**
 * NotificationTrackBuilder - Main entry point for notification DSL
 *
 * @example
 * ```typescript
 * const noti = new NotificationTrackBuilder(30, "phone", getOrder);
 *
 * noti.at("2s").show({
 *     appId: "app_whatsapp",
 *     title: "Alex",
 *     body: "Hey! How are you?",
 * });
 *
 * noti.at("5s").dismiss("notif_1");
 * ```
 */
export class NotificationTrackBuilder {
  /** Internal event storage */
  _events: NotificationTrackEvent[] = [];

  constructor(
    private _fps: number,
    private _deviceId: string,
    private _getOrder: GetOrder,
  ) {}

  // =========================================================================
  // TIME POSITIONING
  // =========================================================================

  /**
   * Set current time for next event
   * @param time - Time as string ("2s", "500ms") or frame number
   */
  at(time: string | number): NotificationPointBuilder {
    const frame = this.parseTime(time);
    return new NotificationPointBuilder(
      frame,
      this._deviceId,
      this._events,
      this._getOrder,
    );
  }

  /**
   * Create a span operation (for notifications, same as at - uses start time)
   */
  span(
    start: string | number,
    _end: string | number,
  ): NotificationPointBuilder {
    return this.at(start);
  }

  // =========================================================================
  // UTILITIES
  // =========================================================================

  private parseTime(time: string | number): number {
    if (typeof time === "number") return Math.round(time);

    const t = time.trim();
    if (t.endsWith("ms")) {
      return Math.round((parseFloat(t.slice(0, -2)) / 1000) * this._fps);
    }
    if (t.endsWith("s")) {
      return Math.round(parseFloat(t.slice(0, -1)) * this._fps);
    }
    return Math.round(parseFloat(t));
  }

  /**
   * Get all events (for track compilation)
   */
  getEvents(): NotificationTrackEvent[] {
    return this._events;
  }
}
