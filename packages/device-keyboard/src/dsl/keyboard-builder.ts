import { createSeededRng } from "@tokovo/core";

export type TimeInput = string | number;

export interface TypeOptions {
  speed?: "slow" | "natural" | "fast";
  showKeyPresses?: boolean;
  seed?: number | string;
}

export interface KeyboardTrackEvent {
  kind: "DEVICE";
  type:
    | "KEYBOARD_SHOW"
    | "KEYBOARD_HIDE"
    | "KEYBOARD_KEY_PRESS"
    | "KEYBOARD_TYPE"
    | "KEYBOARD_CLEAR"
    | "KEYBOARD_SET_SUGGESTIONS"
    | "KEYBOARD_TAP_SUGGESTION";
  deviceId: string;
  at: number;
  _declarationOrder: number;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TrackCompatibleEvent = any;

export class KeyboardTrackBuilder {
  private readonly _fps: number;
  private readonly _deviceId: string;
  private readonly _getOrder: () => number;
  readonly _events: TrackCompatibleEvent[] = [];

  constructor(fps: number, deviceId: string, getOrder: () => number) {
    this._fps = fps;
    this._deviceId = deviceId;
    this._getOrder = getOrder;
  }

  private _parseTime(time: TimeInput): number {
    if (typeof time === "number") return time;
    if (time.endsWith("s")) {
      return Math.round(parseFloat(time) * this._fps);
    }
    if (time.endsWith("ms")) {
      return Math.round((parseFloat(time) / 1000) * this._fps);
    }
    return parseInt(time, 10);
  }

  private _push(event: Record<string, unknown>): void {
    this._events.push({
      kind: "DEVICE",
      deviceId: this._deviceId,
      _declarationOrder: this._getOrder(),
      ...event,
    });
  }

  show(
    time: TimeInput,
    options?: { keyboardType?: string; returnKeyType?: string },
  ): this {
    this._push({
      type: "KEYBOARD_SHOW",
      at: this._parseTime(time),
      returnKeyType: options?.returnKeyType,
    });
    return this;
  }

  hide(time: TimeInput): this {
    this._push({
      type: "KEYBOARD_HIDE",
      at: this._parseTime(time),
    });
    return this;
  }

  type(text: string, startTime: TimeInput, options?: TypeOptions): this {
    const speed = options?.speed || "natural";
    const showKeyPresses = options?.showKeyPresses ?? true;

    const baseDelayMs = speed === "slow" ? 200 : speed === "fast" ? 80 : 130;
    const varianceMs = speed === "slow" ? 80 : speed === "fast" ? 20 : 50;

    let currentFrame = this._parseTime(startTime);
    const seedInput =
      options?.seed ?? `${text}|${startTime}|${speed}|${this._deviceId}`;
    const rng = createSeededRng(seedInput);

    for (const char of text) {
      const delayMs = baseDelayMs + (rng.next() - 0.5) * varianceMs;
      const delayFrames = Math.round((delayMs / 1000) * this._fps);

      if (showKeyPresses) {
        const keyChar = char === " " ? "space" : char;
        this._push({
          type: "KEYBOARD_KEY_PRESS",
          at: currentFrame,
          key: keyChar,
          duration: Math.round(this._fps * 0.15),
        });
      }

      currentFrame += delayFrames;
    }

    this._push({
      type: "KEYBOARD_TYPE",
      at: currentFrame,
      text,
    });

    return this;
  }

  clear(time: TimeInput): this {
    this._push({
      type: "KEYBOARD_CLEAR",
      at: this._parseTime(time),
    });
    return this;
  }

  suggest(suggestions: string[], time: TimeInput): this {
    this._push({
      type: "KEYBOARD_SET_SUGGESTIONS",
      at: this._parseTime(time),
      suggestions,
    });
    return this;
  }

  tapSuggestion(index: number, time: TimeInput): this {
    this._push({
      type: "KEYBOARD_TAP_SUGGESTION",
      at: this._parseTime(time),
      index,
    });
    return this;
  }

  keyPress(key: string, time: TimeInput, durationFrames?: number): this {
    this._push({
      type: "KEYBOARD_KEY_PRESS",
      at: this._parseTime(time),
      key,
      duration: durationFrames ?? Math.round(this._fps * 0.15),
    });
    return this;
  }

  pressReturn(time: TimeInput): this {
    return this.keyPress("return", time);
  }

  at(_time: TimeInput): this {
    return this;
  }

  span(_start: TimeInput, _end: TimeInput): this {
    return this;
  }
}
