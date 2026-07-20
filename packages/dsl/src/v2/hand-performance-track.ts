import type {
  Handedness,
  HandMotionPreset,
  HandPerformanceCueIR,
  HandTypingMode,
} from "@tokovo/ir";
import { parseTimeToFrames } from "./utils/time.js";

export interface HandCueOptions {
  intensity?: number;
}

export interface HandTapOptions extends HandCueOptions {
  hand?: Handedness;
  duration?: string | number;
}

export interface HandSwipeOptions extends HandCueOptions {
  hand?: Handedness;
}

function clampIntensity(intensity: number | undefined): number | undefined {
  if (intensity === undefined) return undefined;
  return Math.max(0, Math.min(1, intensity));
}

export class HandPerformancePointBuilder {
  constructor(
    private readonly _frame: number,
    private readonly _fps: number,
    private readonly _cues: HandPerformanceCueIR[],
  ) {}

  tap(target: string, options: HandTapOptions = {}): void {
    const durationFrames =
      options.duration === undefined
        ? Math.max(1, Math.round(this._fps * 0.32))
        : typeof options.duration === "number"
          ? options.duration
          : parseTimeToFrames(options.duration, this._fps);

    this._cues.push({
      kind: "tap",
      startFrame: this._frame,
      endFrame: this._frame + Math.max(1, durationFrames),
      target,
      hand: options.hand,
      intensity: clampIntensity(options.intensity),
    });
  }
}

export class HandPerformanceSpanBuilder {
  constructor(
    private readonly _startFrame: number,
    private readonly _endFrame: number,
    private readonly _cues: HandPerformanceCueIR[],
  ) {}

  hold(
    options: HandCueOptions & { motion?: HandMotionPreset } = {},
  ): void {
    this._cues.push({
      kind: "hold",
      startFrame: this._startFrame,
      endFrame: this._endFrame,
      motion: options.motion ?? "steady",
      intensity: clampIntensity(options.intensity),
    });
  }

  type(
    options: HandCueOptions & { mode?: HandTypingMode } = {},
  ): void {
    this._cues.push({
      kind: "type",
      startFrame: this._startFrame,
      endFrame: this._endFrame,
      mode: options.mode ?? "oneThumb",
      intensity: clampIntensity(options.intensity),
    });
  }

  swipe(
    direction: "up" | "down" | "left" | "right",
    options: HandSwipeOptions = {},
  ): void {
    this._cues.push({
      kind: "swipe",
      startFrame: this._startFrame,
      endFrame: this._endFrame,
      direction,
      hand: options.hand,
      intensity: clampIntensity(options.intensity),
    });
  }
}

export class HandPerformanceTrackBuilder {
  readonly _cues: HandPerformanceCueIR[] = [];

  constructor(private readonly _fps: number) {}

  at(time: string | number): HandPerformancePointBuilder {
    const frame =
      typeof time === "number" ? time : parseTimeToFrames(time, this._fps);
    return new HandPerformancePointBuilder(frame, this._fps, this._cues);
  }

  span(
    start: string | number,
    end: string | number,
  ): HandPerformanceSpanBuilder {
    const startFrame =
      typeof start === "number" ? start : parseTimeToFrames(start, this._fps);
    const endFrame =
      typeof end === "number" ? end : parseTimeToFrames(end, this._fps);

    if (endFrame <= startFrame) {
      throw new Error(
        `Hand performance span must end after it starts (${startFrame}..${endFrame})`,
      );
    }

    return new HandPerformanceSpanBuilder(
      startFrame,
      endFrame,
      this._cues,
    );
  }
}
