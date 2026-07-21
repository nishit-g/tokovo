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

export interface IncomingCallOptions extends DeviceEventMetaOptions {
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  isVideo?: boolean;
  callType?: string;
  displayMode?: string;
  callerMetadata?: Record<string, unknown>;
}

export interface ScreenRecordingOptions extends DeviceEventMetaOptions {
  /** Compact red indicator, expanded stop control, or user-dismissed indicator. */
  presentation?: "compact" | "expanded" | "hidden";
  /** Capture microphone audio in addition to system audio. */
  microphoneEnabled?: boolean;
  /** Countdown duration. Strings use normal Tokovo time syntax; numbers are frames. */
  countdown?: string | number;
  /** Post-stop system feedback duration. Strings use time syntax; numbers are frames. */
  feedback?: string | number;
}

// =============================================================================
// POINT BUILDER
// =============================================================================

export class DevicePointBuilderV2 {
  constructor(
    private _frame: number,
    private _fps: number,
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
    options?: ScreenRecordingOptions,
  ): void {
    const toDurationFrames = (
      value: string | number | undefined,
      fallbackSeconds: number,
    ): number => {
      if (value === undefined) return Math.round(this._fps * fallbackSeconds);
      return typeof value === "number"
        ? Math.max(0, Math.round(value))
        : Math.max(0, parseTimeToFrames(value, this._fps));
    };
    this.emitDevice(
      "SET_SCREEN_RECORDING",
      {
        enabled,
        presentation: options?.presentation,
        microphoneEnabled: options?.microphoneEnabled,
        countdownFrames: enabled
          ? toDurationFrames(options?.countdown, 3)
          : undefined,
        feedbackFrames: !enabled
          ? toDurationFrames(options?.feedback, 2.4)
          : undefined,
      },
      options,
    );
  }

  incomingCall(options: IncomingCallOptions): void {
    this.emitDevice(
      "INCOMING_CALL",
      {
        callerId: options.callerId,
        callerName: options.callerName,
        callerAvatar: options.callerAvatar,
        isVideo: options.isVideo,
        callType: options.callType,
        displayMode: options.displayMode,
        callerMetadata: options.callerMetadata,
      },
      options,
    );
  }

  answerCall(options?: DeviceEventMetaOptions): void {
    this.emitDevice("CALL_ANSWERED", {}, options);
  }

  endCall(options?: DeviceEventMetaOptions): void {
    this.emitDevice("CALL_ENDED", {}, options);
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
      this._fps,
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
