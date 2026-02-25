/**
 * Device Track Builder (v2) - First-class device authoring surface
 *
 * @description Emits DEVICE events with v2-correct nested payloads.
 * Also supports per-action SFX overrides by emitting AUDIO:PLAY events
 * and setting `silent: true` on the DEVICE event to suppress auto-sounds.
 */

import type {
  AudioTrackEvent,
  DeviceTrackEvent,
  TrackEvent,
} from "@tokovo/ir";
import { parseTimeToFrames } from "./utils/time.js";

// =============================================================================
// TYPES
// =============================================================================

type GetDeclarationOrder = () => number;

export interface SfxOverride {
  soundId: string;
  volume?: number;
}

export interface DeviceEventMetaOptions {
  /** Suppress auto-sound rules for this action */
  silent?: boolean;
  /** Explicit SFX override (emits AUDIO:PLAY at the same frame) */
  sfx?: SfxOverride;
}

export interface TransitionOptions {
  durationFrames?: number;
  style?: string;
  originX?: number;
  originY?: number;
}

export interface NotificationShowOptions extends DeviceEventMetaOptions {
  id?: string;
  appId: string;
  title: string;
  body: string;
  icon?: string;
  preview?: {
    kind: "text" | "image" | "video";
    value: string;
    aspectRatio?: number;
  };
  mode?: "headsup" | "lockscreen" | "both";
  priority?:
    | "HIGH"
    | "DEFAULT"
    | "LOW"
    | "high"
    | "default"
    | "low"
    | "critical";
  duration?: number;
  groupKey?: string;
  threadKey?: string;
  actions?: Array<{ id: string; label: string; destructive?: boolean }>;
  replyable?: boolean;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// POINT BUILDER
// =============================================================================

export class DevicePointBuilderV2 {
  constructor(
    private _frame: number,
    private _deviceId: string,
    private _events: TrackEvent[],
    private _getOrder: GetDeclarationOrder,
  ) {}

  private emitDevice(
    type: DeviceTrackEvent["type"],
    payload: DeviceTrackEvent["payload"],
    options?: DeviceEventMetaOptions,
  ): void {
    const silent = options?.silent === true || Boolean(options?.sfx);

    if (options?.sfx) {
      const audioEvent: AudioTrackEvent = {
        at: this._frame,
        kind: "AUDIO",
        type: "PLAY",
        payload: {
          soundId: options.sfx.soundId,
          volume: options.sfx.volume,
        },
        _declarationOrder: this._getOrder(),
      };
      this._events.push(audioEvent);
    }

    const deviceEvent = {
      at: this._frame,
      deviceId: this._deviceId,
      kind: "DEVICE",
      type,
      payload,
      _declarationOrder: this._getOrder(),
      silent: silent ? true : undefined,
    } as DeviceTrackEvent & { silent?: boolean };
    this._events.push(deviceEvent);
  }

  lock(options?: DeviceEventMetaOptions): void {
    this.emitDevice("LOCK", {}, options);
  }

  unlock(options?: DeviceEventMetaOptions): void {
    this.emitDevice("UNLOCK", {}, options);
  }

  openApp(
    appId: string,
    options?: DeviceEventMetaOptions & { transition?: TransitionOptions },
  ): void {
    this.emitDevice(
      "OPEN_APP",
      { appId, transition: options?.transition },
      options,
    );
  }

  goHome(
    options?: DeviceEventMetaOptions & { transition?: TransitionOptions },
  ): void {
    this.emitDevice("GO_HOME", { transition: options?.transition }, options);
  }

  setBadge(
    appId: string,
    count: number,
    options?: DeviceEventMetaOptions,
  ): void {
    this.emitDevice("SET_BADGE", { appId, count }, options);
  }

  screenRecording(
    enabled: boolean,
    options?: DeviceEventMetaOptions & { mode?: "minimal" | "compact" },
  ): void {
    this.emitDevice(
      "SET_SCREEN_RECORDING",
      { enabled, mode: options?.mode },
      options,
    );
  }

  notificationShow(options: NotificationShowOptions): string {
    const id =
      options.id ??
      `notif_${this._deviceId}_${this._frame}_${this._events.length}`;
    this.emitDevice(
      "NOTIFICATION_SHOW",
      {
        kind: "show",
        id,
        appId: options.appId,
        title: options.title,
        body: options.body,
        icon: options.icon,
        preview: options.preview,
        mode: options.mode,
        priority: options.priority,
        duration: options.duration,
        groupKey: options.groupKey,
        threadKey: options.threadKey,
        actions: options.actions,
        replyable: options.replyable,
        metadata: options.metadata,
      },
      options,
    );
    return id;
  }

  notificationTap(id: string, options?: DeviceEventMetaOptions): void {
    this.emitDevice("NOTIFICATION_TAP", { kind: "tap", id }, options);
  }

  notificationSwipe(
    id: string,
    direction: "left" | "right" = "right",
    options?: DeviceEventMetaOptions,
  ): void {
    this.emitDevice(
      "NOTIFICATION_SWIPE",
      { kind: "swipe", id, direction },
      options,
    );
  }

  notificationReply(
    id: string,
    text: string,
    options?: DeviceEventMetaOptions,
  ): void {
    this.emitDevice("NOTIFICATION_REPLY", { kind: "reply", id, text }, options);
  }

  notificationDynamicIsland(
    mode: "idle" | "minimal" | "compact" | "expanded",
    options?: DeviceEventMetaOptions,
  ): void {
    this.emitDevice(
      "NOTIFICATION_DYNAMIC_ISLAND",
      { kind: "dynamicIsland", mode },
      options,
    );
  }

  notificationOpenPanel(options?: DeviceEventMetaOptions): void {
    this.emitDevice("NOTIFICATION_OPEN_PANEL", {}, options);
  }

  notificationClosePanel(options?: DeviceEventMetaOptions): void {
    this.emitDevice("NOTIFICATION_CLOSE_PANEL", {}, options);
  }

  notificationDismiss(id: string, options?: DeviceEventMetaOptions): void {
    this.emitDevice("NOTIFICATION_DISMISS", { kind: "dismiss", id }, options);
  }

  notificationClearAll(options?: DeviceEventMetaOptions): void {
    this.emitDevice("NOTIFICATION_CLEAR_ALL", { kind: "clearAll" }, options);
  }

  keyboardShow(
    options?: DeviceEventMetaOptions & {
      returnKeyType?: "default" | "go" | "search" | "send" | "next" | "done";
    },
  ): void {
    this.emitDevice(
      "KEYBOARD_SHOW",
      { returnKeyType: options?.returnKeyType },
      options,
    );
  }

  keyboardHide(options?: DeviceEventMetaOptions): void {
    this.emitDevice("KEYBOARD_HIDE", {}, options);
  }

  keyboardType(
    text: string,
    options?: DeviceEventMetaOptions & { speed?: "slow" | "natural" | "fast" },
  ): void {
    this.emitDevice("KEYBOARD_TYPE", { text, speed: options?.speed }, options);
  }

  keyboardKeyPress(key: string, options?: DeviceEventMetaOptions): void {
    this.emitDevice("KEYBOARD_KEY_PRESS", { key }, options);
  }

  keyboardClear(options?: DeviceEventMetaOptions): void {
    this.emitDevice("KEYBOARD_CLEAR", {}, options);
  }

  keyboardSetSuggestions(
    suggestions: string[],
    options?: DeviceEventMetaOptions,
  ): void {
    this.emitDevice("KEYBOARD_SET_SUGGESTIONS", { suggestions }, options);
  }

  keyboardTapSuggestion(index: number, options?: DeviceEventMetaOptions): void {
    this.emitDevice("KEYBOARD_TAP_SUGGESTION", { index }, options);
  }
}

// =============================================================================
// TRACK BUILDER
// =============================================================================

export class DeviceTrackBuilderV2 {
  _events: TrackEvent[] = [];

  constructor(
    private _fps: number,
    private _deviceId: string,
    private _getOrder: GetDeclarationOrder,
  ) {}

  at(time: string | number): DevicePointBuilderV2 {
    const frame =
      typeof time === "number" ? time : parseTimeToFrames(time, this._fps);
    return new DevicePointBuilderV2(
      frame,
      this._deviceId,
      this._events,
      this._getOrder,
    );
  }

  span(start: string | number, _end: string | number): DevicePointBuilderV2 {
    // For now, device operations are point-based. Span is a convenience alias.
    return this.at(start);
  }
}
