/**
 * OS Track Builder - Device state control
 *
 * @description Controls device-level state like time, battery,
 * network and DND mode.
 *
 * @see docs/architecture/dsl-v2.md
 */

import { OSTrackEvent } from "@tokovo/ir";
import { parseTimeToFrames } from "./utils/time.js";

// =============================================================================
// TYPES
// =============================================================================

type GetDeclarationOrder = () => number;

export interface OSStateOptions {
  locale?: string;
  appearance?: "light" | "dark";
  hourCycle?: "h12" | "h24";
  lockScreenWallpaper?: string;
  time?: Date | number;
  battery?: number;
  charging?: boolean;
  network?: "wifi" | "5G" | "4G" | "3G" | "none";
  strength?: number;
  dnd?: boolean;
  lowPowerMode?: boolean;
}

export interface BatteryOptions {
  charging?: boolean;
}

export interface NetworkOptions {
  strength?: number;
}

// =============================================================================
// POINT BUILDER (at)
// =============================================================================

export class OSPointBuilder {
  constructor(
    private _frame: number,
    private _fps: number,
    private _events: OSTrackEvent[],
    private _getOrder: GetDeclarationOrder,
  ) {}

  /**
   * Set full OS state.
   */
  set(options: OSStateOptions): void {
    const time =
      options.time instanceof Date ? options.time.getTime() : options.time;

    this._events.push({
      at: this._frame,
      kind: "OS",
      type: "SET_STATE",
      payload: {
        locale: options.locale,
        appearance: options.appearance,
        hourCycle: options.hourCycle,
        lockScreenWallpaper: options.lockScreenWallpaper,
        time,
        battery: options.battery,
        charging: options.charging,
        network: options.network,
        strength: options.strength,
        dnd: options.dnd,
        lowPowerMode: options.lowPowerMode,
      },
      _declarationOrder: this._getOrder(),
    });
  }

  /**
   * Set device time.
   */
  time(date: Date | number): void {
    const time = date instanceof Date ? date.getTime() : date;
    this._events.push({
      at: this._frame,
      kind: "OS",
      type: "SET_TIME",
      payload: { time },
      _declarationOrder: this._getOrder(),
    });
  }

  /**
   * Set battery level.
   */
  battery(level: number, options: BatteryOptions = {}): void {
    this._events.push({
      at: this._frame,
      kind: "OS",
      type: "SET_BATTERY",
      payload: {
        level,
        charging: options.charging,
      },
      _declarationOrder: this._getOrder(),
    });
  }

  /**
   * Set network status.
   */
  network(
    type: "wifi" | "5G" | "4G" | "3G" | "none",
    options: NetworkOptions = {},
  ): void {
    this._events.push({
      at: this._frame,
      kind: "OS",
      type: "SET_NETWORK",
      payload: {
        type,
        strength: options.strength,
      },
      _declarationOrder: this._getOrder(),
    });
  }

  /**
   * Set Do Not Disturb mode.
   */
  dnd(enabled: boolean): void {
    this._events.push({
      at: this._frame,
      kind: "OS",
      type: "SET_DND",
      payload: { enabled },
      _declarationOrder: this._getOrder(),
    });
  }

}

// =============================================================================
// OS TRACK BUILDER
// =============================================================================

export class OSTrackBuilder {
  _events: OSTrackEvent[] = [];

  constructor(
    private _fps: number,
    private _getOrder: GetDeclarationOrder,
  ) {}

  /**
   * Create a point (instant) operation at a specific time.
   */
  at(time: string | number): OSPointBuilder {
    const frame = parseTimeToFrames(time, this._fps);
    return new OSPointBuilder(frame, this._fps, this._events, this._getOrder);
  }

  /**
   * Create a span (duration) operation. For OS events, this just returns a point builder at start.
   */
  span(start: string | number, _end: string | number): OSPointBuilder {
    const frame = parseTimeToFrames(start, this._fps);
    return new OSPointBuilder(frame, this._fps, this._events, this._getOrder);
  }
}
