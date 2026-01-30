import type {
  VoiceScriptDefinition,
  VoiceScheduleItem,
} from "../types/script-definition";
import type { VoicePlayEvent } from "./voice-track";

export class VoiceEpisodeTrackBuilder<T extends string = string> {
  private readonly _fps: number;
  private readonly _script: VoiceScriptDefinition<T>;
  private readonly _schedule: VoiceScheduleItem<T>[] = [];

  constructor(fps: number, script: VoiceScriptDefinition<T>) {
    this._fps = fps;
    this._script = script;
  }

  at(time: string | number): VoicePointBuilder<T> {
    const frame = this._parseTime(time);
    return new VoicePointBuilder(this, frame);
  }

  _addScheduleItem(item: VoiceScheduleItem<T>): void {
    this._schedule.push(item);
  }

  get script(): VoiceScriptDefinition<T> {
    return this._script;
  }

  get schedule(): VoiceScheduleItem<T>[] {
    return this._schedule;
  }

  toEvents(): VoicePlayEvent[] {
    return this._schedule.map((item) => ({
      kind: "voice" as const,
      type: "play" as const,
      at: item.at,
      payload: {
        segmentId: item.segmentId,
        volume: item.volume,
        speed: item.speed,
      },
    }));
  }

  private _parseTime(time: string | number): number {
    if (typeof time === "number") return time;

    const match = time.match(/^([\d.]+)(s|ms|f)?$/);
    if (!match) throw new Error(`Invalid time format: ${time}`);

    const value = parseFloat(match[1]);
    const unit = match[2] || "s";

    switch (unit) {
      case "s":
        return Math.round(value * this._fps);
      case "ms":
        return Math.round((value / 1000) * this._fps);
      case "f":
        return Math.round(value);
      default:
        return Math.round(value * this._fps);
    }
  }
}

class VoicePointBuilder<T extends string> {
  private readonly _builder: VoiceEpisodeTrackBuilder<T>;
  private readonly _frame: number;

  constructor(builder: VoiceEpisodeTrackBuilder<T>, frame: number) {
    this._builder = builder;
    this._frame = frame;
  }

  play(
    segmentId: T,
    options?: { volume?: number; speed?: number },
  ): VoiceEpisodeTrackBuilder<T> {
    this._builder._addScheduleItem({
      segmentId,
      at: this._frame,
      volume: options?.volume,
      speed: options?.speed,
    });
    return this._builder;
  }
}

export type VoiceTrackFn<T extends string> = (
  track: VoiceEpisodeTrackBuilder<T>,
) => void;
