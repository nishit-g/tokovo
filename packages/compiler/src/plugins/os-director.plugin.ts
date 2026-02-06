import type { CompilerPlugin, CompilerContext } from "./types.js";
import type { TrackEvent } from "@tokovo/ir";

export interface OSDirectorPluginOptions {
  startTime?: Date | string;
  startBattery?: number;
  batteryDrainRate?: number;
  updateInterval?: string;
  networkFluctuations?: boolean;
}

export class OSDirectorPlugin implements CompilerPlugin {
  name = "os-director";
  version = "1.0.0";
  subscribesTo = ["*"];
  emits = ["OS"];

  private readonly config: Required<
    Omit<OSDirectorPluginOptions, "startTime">
  > & {
    startTime: Date;
  };

  constructor(options: OSDirectorPluginOptions = {}) {
    this.config = {
      startTime: this.parseStartTime(options.startTime),
      startBattery: options.startBattery ?? 85,
      batteryDrainRate: options.batteryDrainRate ?? 1,
      updateInterval: options.updateInterval || "15s",
      networkFluctuations: options.networkFluctuations ?? false,
    };

    if (this.config.startBattery < 0 || this.config.startBattery > 100) {
      throw new Error(
        `OSDirectorPlugin: startBattery must be 0-100 (got ${this.config.startBattery})`,
      );
    }

    if (this.config.batteryDrainRate < 0) {
      throw new Error(
        `OSDirectorPlugin: batteryDrainRate must be >= 0 (got ${this.config.batteryDrainRate})`,
      );
    }
  }

  process(events: TrackEvent[], context: CompilerContext): TrackEvent[] {
    const maxFrame = Math.max(
      context.durationInFrames,
      ...events.map((e) => e.at),
    );

    const intervalFrames = this.parseDurationToFrames(
      this.config.updateInterval,
      context,
    );

    const osEvents: TrackEvent[] = [];

    let currentBattery = this.config.startBattery;
    let currentTimeMs = this.config.startTime.getTime();

    for (let frame = 0; frame <= maxFrame; frame += intervalFrames) {
      const timeEvent: TrackEvent = {
        at: frame,
        kind: "OS",
        type: "SET_TIME",
        payload: { time: currentTimeMs },
        _declarationOrder: osEvents.length,
      };
      osEvents.push(timeEvent);

      const batteryEvent: TrackEvent = {
        at: frame,
        kind: "OS",
        type: "SET_BATTERY",
        payload: { level: Math.max(0, Math.floor(currentBattery)) },
        _declarationOrder: osEvents.length,
      };
      osEvents.push(batteryEvent);

      const intervalSeconds = intervalFrames / context.fps;
      currentTimeMs += intervalSeconds * 1000;
      currentBattery -= this.config.batteryDrainRate;
    }

    if (this.config.networkFluctuations) {
      const midFrame = Math.floor(maxFrame / 2);
      osEvents.push({
        at: midFrame,
        kind: "OS",
        type: "SET_NETWORK",
        payload: { type: "none" },
        _declarationOrder: osEvents.length,
      });

      osEvents.push({
        at: midFrame + 30 * context.fps,
        kind: "OS",
        type: "SET_NETWORK",
        payload: { type: "wifi" },
        _declarationOrder: osEvents.length,
      });
    }

    return osEvents;
  }

  private parseStartTime(time: Date | string | undefined): Date {
    if (!time) {
      return new Date("2024-01-01T09:41:00Z");
    }
    if (typeof time === "string") {
      return new Date(time);
    }
    return time;
  }

  private parseDurationToFrames(
    timeStr: string,
    context: CompilerContext,
  ): number {
    const match = timeStr.match(/^(\d+(?:\.\d+)?)s$/);
    if (!match) {
      throw new Error(
        `OSDirectorPlugin: Invalid duration format "${timeStr}" (expected "15s")`,
      );
    }
    const seconds = parseFloat(match[1]);
    return Math.floor(seconds * context.fps);
  }
}
