type TimeInput = number | string;

/** Base event structure for notification DSL events */
interface NotificationDSLEventBase {
  at: number;
  order: number;
  kind: "DEVICE";
  deviceId: string;
}

/** Show a notification on the device */
export interface NotificationShowEvent extends NotificationDSLEventBase {
  type: "NOTIFICATION_SHOW";
  payload: {
    kind: "show";
    id: string;
    appId: string;
    title: string;
    body: string;
    icon?: string;
    mode?: "headsup" | "lockscreen" | "both";
    priority?: "low" | "default" | "high" | "critical";
    duration?: number;
    groupKey?: string;
    threadKey?: string;
    actions?: Array<{
      id: string;
      label: string;
      destructive?: boolean;
    }>;
    replyable?: boolean;
    metadata?: Record<string, unknown>;
  };
}

/** Dismiss a notification by ID */
export interface NotificationDismissEvent extends NotificationDSLEventBase {
  type: "NOTIFICATION_DISMISS";
  payload: {
    kind: "dismiss";
    id: string;
  };
}

/** User tapped on a notification */
export interface NotificationTapEvent extends NotificationDSLEventBase {
  type: "NOTIFICATION_TAP";
  payload: {
    kind: "tap";
    id: string;
  };
}

/** User swiped a notification */
export interface NotificationSwipeEvent extends NotificationDSLEventBase {
  type: "NOTIFICATION_SWIPE";
  payload: {
    kind: "swipe";
    id: string;
    direction?: "left" | "right";
  };
}

/** User replied to a notification */
export interface NotificationReplyEvent extends NotificationDSLEventBase {
  type: "NOTIFICATION_REPLY";
  payload: {
    kind: "reply";
    id: string;
    text: string;
  };
}

/** Clear all notifications */
export interface NotificationClearAllEvent extends NotificationDSLEventBase {
  type: "NOTIFICATION_CLEAR_ALL";
  payload: {
    kind: "clearAll";
  };
}

/** Set Dynamic Island state (iOS only) */
export interface DynamicIslandEvent extends NotificationDSLEventBase {
  type: "SET_DYNAMIC_ISLAND";
  payload: {
    kind: "dynamicIsland";
    visible: boolean;
    mode?: "idle" | "minimal" | "compact" | "expanded";
  };
}

/** Union type of all notification DSL events */
export type NotificationDSLEvent =
  | NotificationShowEvent
  | NotificationDismissEvent
  | NotificationTapEvent
  | NotificationSwipeEvent
  | NotificationReplyEvent
  | NotificationClearAllEvent
  | DynamicIslandEvent;

/**
 * Parse time input into frame number.
 * Supports: numbers (frames), "1s" (seconds), "500ms" (milliseconds), "30f" (frames).
 */
function parseTime(input: TimeInput, fps: number): number {
  if (typeof input === "number") return input;

  const match = input.match(/^(\d+(?:\.\d+)?)(s|ms|f)$/);
  if (!match) {
    throw new Error(
      `Invalid time format: ${input}. Use "1s", "500ms", or "30f"`,
    );
  }

  const value = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return Math.round(value * fps);
    case "ms":
      return Math.round((value / 1000) * fps);
    case "f":
      return Math.round(value);
    default:
      return Math.round(value);
  }
}

/** Options for showing a notification */
export interface ShowOptions {
  id?: string;
  appId: string;
  title: string;
  body: string;
  icon?: string;
  mode?: "headsup" | "lockscreen" | "both";
  priority?: "low" | "default" | "high" | "critical";
  duration?: number;
  groupKey?: string;
  threadKey?: string;
  actions?: Array<{
    id: string;
    label: string;
    destructive?: boolean;
  }>;
  replyable?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Builder for creating notification timeline events.
 *
 * @example
 * ```typescript
 * const noti = new NotificationTrackBuilder(30, "phone", getOrder);
 *
 * noti
 *   .at("2s")
 *   .show({ appId: "whatsapp", title: "Alex", body: "Hey!" })
 *   .at("5s")
 *   .dismiss("notif_1");
 *
 * const events = noti.build();
 * ```
 */
export class NotificationTrackBuilder {
  readonly _events: NotificationDSLEvent[] = [];
  private fps: number;
  private deviceId: string;
  private getOrder: () => number;
  private currentTime: number = 0;
  private notificationCounter: number = 0;

  constructor(fps: number, deviceId: string, getOrder: () => number) {
    this.fps = fps;
    this.deviceId = deviceId;
    this.getOrder = getOrder;
  }

  /**
   * Set the current time for subsequent actions.
   *
   * @param time - Frame number or time string ("1s", "500ms", "30f")
   * @returns this builder for chaining
   *
   * @example
   * ```typescript
   * noti.at("2s").show(...) // Show at 2 seconds
   * noti.at(60).dismiss(...) // Dismiss at frame 60
   * ```
   */
  at(time: TimeInput): this {
    this.currentTime = parseTime(time, this.fps);
    return this;
  }

  /**
   * Show a notification on the device.
   *
   * @param options - Notification configuration
   * @returns this builder for chaining
   *
   * @example
   * ```typescript
   * noti.show({
   *   appId: "whatsapp",
   *   title: "Alex",
   *   body: "Hey there!",
   *   mode: "headsup",
   *   priority: "HIGH",
   * });
   * ```
   */
  show(options: ShowOptions): this {
    const id = options.id ?? `notif_${++this.notificationCounter}`;

    const event: NotificationShowEvent = {
      at: this.currentTime,
      order: this.getOrder(),
      kind: "DEVICE",
      deviceId: this.deviceId,
      type: "NOTIFICATION_SHOW",
      payload: {
        kind: "show",
        id,
        appId: options.appId,
        title: options.title,
        body: options.body,
        icon: options.icon,
        mode: options.mode,
        priority: options.priority,
        duration: options.duration,
        groupKey: options.groupKey,
        threadKey: options.threadKey,
        actions: options.actions,
        replyable: options.replyable,
        metadata: options.metadata,
      },
    };

    this._events.push(event);
    return this;
  }

  /**
   * Dismiss a notification by ID.
   *
   * @param id - Notification ID to dismiss
   * @returns this builder for chaining
   *
   * @example
   * ```typescript
   * noti.at("5s").dismiss("notif_1");
   * ```
   */
  dismiss(id: string): this {
    const event: NotificationDismissEvent = {
      at: this.currentTime,
      order: this.getOrder(),
      kind: "DEVICE",
      deviceId: this.deviceId,
      type: "NOTIFICATION_DISMISS",
      payload: { kind: "dismiss", id },
    };

    this._events.push(event);
    return this;
  }

  /**
   * Simulate a tap on a notification.
   *
   * @param id - Notification ID to tap
   * @returns this builder for chaining
   *
   * @example
   * ```typescript
   * noti.at("3s").tap("notif_1"); // Tap notification
   * ```
   */
  tap(id: string): this {
    const event: NotificationTapEvent = {
      at: this.currentTime,
      order: this.getOrder(),
      kind: "DEVICE",
      deviceId: this.deviceId,
      type: "NOTIFICATION_TAP",
      payload: { kind: "tap", id },
    };

    this._events.push(event);
    return this;
  }

  /**
   * Simulate a swipe on a notification.
   *
   * @param id - Notification ID to swipe
   * @param direction - Swipe direction ("left" or "right")
   * @returns this builder for chaining
   *
   * @example
   * ```typescript
   * noti.at("4s").swipe("notif_1", "left");
   * ```
   */
  swipe(id: string, direction?: "left" | "right"): this {
    const event: NotificationSwipeEvent = {
      at: this.currentTime,
      order: this.getOrder(),
      kind: "DEVICE",
      deviceId: this.deviceId,
      type: "NOTIFICATION_SWIPE",
      payload: { kind: "swipe", id, direction },
    };

    this._events.push(event);
    return this;
  }

  /**
   * Simulate a reply to a notification.
   *
   * @param id - Notification ID to reply to
   * @param text - Reply text content
   * @returns this builder for chaining
   *
   * @example
   * ```typescript
   * noti.at("5s").reply("notif_1", "Thanks!");
   * ```
   */
  reply(id: string, text: string): this {
    const event: NotificationReplyEvent = {
      at: this.currentTime,
      order: this.getOrder(),
      kind: "DEVICE",
      deviceId: this.deviceId,
      type: "NOTIFICATION_REPLY",
      payload: { kind: "reply", id, text },
    };

    this._events.push(event);
    return this;
  }

  /**
   * Clear all notifications from the device.
   *
   * @returns this builder for chaining
   *
   * @example
   * ```typescript
   * noti.at("10s").clearAll();
   * ```
   */
  clearAll(): this {
    const event: NotificationClearAllEvent = {
      at: this.currentTime,
      order: this.getOrder(),
      kind: "DEVICE",
      deviceId: this.deviceId,
      type: "NOTIFICATION_CLEAR_ALL",
      payload: { kind: "clearAll" },
    };

    this._events.push(event);
    return this;
  }

  /**
   * Set the Dynamic Island state (iOS only).
   *
   * @param visible - Whether the Dynamic Island should be visible
   * @param mode - Display mode for the Dynamic Island
   * @returns this builder for chaining
   *
   * @example
   * ```typescript
   * noti.at("0s").dynamicIsland(true, "expanded");
   * noti.at("3s").dynamicIsland(false);
   * ```
   */
  dynamicIsland(
    visible: boolean,
    mode?: "idle" | "minimal" | "compact" | "expanded",
  ): this {
    const event: DynamicIslandEvent = {
      at: this.currentTime,
      order: this.getOrder(),
      kind: "DEVICE",
      deviceId: this.deviceId,
      type: "SET_DYNAMIC_ISLAND",
      payload: { kind: "dynamicIsland", visible, mode },
    };

    this._events.push(event);
    return this;
  }

  /**
   * Set a time span (for DSL compatibility).
   * Note: Currently just sets currentTime to start - span semantics not used.
   *
   * @param start - Start time
   * @param _end - End time (currently unused)
   * @returns this builder for chaining
   */
  span(start: TimeInput, _end: TimeInput): this {
    this.currentTime = parseTime(start, this.fps);
    return this;
  }

  /**
   * Build and return a copy of all events.
   *
   * @returns Array of notification events
   */
  build(): NotificationDSLEvent[] {
    return [...this._events];
  }

  /**
   * Get all events (alias for build()).
   *
   * @returns Array of notification events
   */
  getEvents(): NotificationDSLEvent[] {
    return this.build();
  }
}
