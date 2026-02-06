import type { CompilerPlugin, CompilerContext } from "./types.js";
import type { TrackEvent } from "@tokovo/ir";

/**
 * Audio mood presets mapping to sound IDs
 */
const MOOD_PRESETS: Record<string, string> = {
  chill: "lofi_chill",
  casual: "ambient_light",
  upbeat: "ambient_upbeat",
  intense: "dramatic_swell",
  dramatic: "ambient_dramatic",
  epic: "epic_tension",
  soft: "ambient_soft",
  tension: "tension_ambient",
  dark: "synth_dark",
  romantic: "romantic_tension",
};

export interface AudioDirectorPluginOptions {
  /**
   * Mood preset (maps to bgm sound ID)
   * @default "chill"
   */
  mood?: keyof typeof MOOD_PRESETS | string;

  /**
   * Background music volume (0-1)
   * @default 0.15
   */
  volume?: number;

  /**
   * Fade in duration
   * @default "2s"
   */
  fadeIn?: string;

  /**
   * Fade out duration
   * @default "3s"
   */
  fadeOut?: string;

  /**
   * Start time (defaults to episode start)
   * @default "0s"
   */
  startTime?: string;

  /**
   * End time (defaults to episode end)
   * @default undefined (auto-calculated from episode duration)
   */
  endTime?: string;
}

/**
 * AudioDirectorPlugin
 *
 * Auto-generates background music span for episodes.
 * Eliminates repetitive audio blocks.
 *
 * @example
 * ```typescript
 * // Before (4 lines repeated 10+ times)
 * .audio((audio) => {
 *   audio.span("0s", "90s").bgm("lofi_chill", {
 *     volume: 0.15, fadeIn: "2s", fadeOut: "3s"
 *   });
 * })
 *
 * // After (plugin auto-generates)
 * .use(new AudioDirectorPlugin({ mood: "chill", volume: 0.15 }))
 * ```
 */
export class AudioDirectorPlugin implements CompilerPlugin {
  name = "audio-director";
  version = "1.0.0";
  subscribesTo = ["*"]; // Listen to all events to determine episode duration
  emits = ["AUDIO"];

  private readonly config: Required<
    Omit<AudioDirectorPluginOptions, "endTime">
  > & { endTime?: string };

  constructor(options: AudioDirectorPluginOptions = {}) {
    const mood = options.mood || "chill";
    const soundId = MOOD_PRESETS[mood] || mood; // If mood not in presets, use as-is

    this.config = {
      mood: soundId,
      volume: options.volume ?? 0.15,
      fadeIn: options.fadeIn || "2s",
      fadeOut: options.fadeOut || "3s",
      startTime: options.startTime || "0s",
      endTime: options.endTime,
    };

    // Validation
    if (this.config.volume < 0 || this.config.volume > 1) {
      throw new Error(
        `AudioDirectorPlugin: volume must be 0-1 (got ${this.config.volume})`,
      );
    }
  }

  process(events: TrackEvent[], context: CompilerContext): TrackEvent[] {
    const maxFrame = Math.max(
      context.durationInFrames,
      ...events.map((e) => e.at),
    );

    const startFrame = this.parseTimeToFrames(this.config.startTime, context);
    const endFrame = this.config.endTime
      ? this.parseTimeToFrames(this.config.endTime, context)
      : maxFrame;

    const fadeInFrames = this.parseDurationToFrames(
      this.config.fadeIn,
      context,
    );

    const bgmStartEvent: TrackEvent = {
      at: startFrame,
      kind: "AUDIO",
      type: "BGM_START",
      payload: {
        soundId: this.config.mood,
        volume: this.config.volume,
        fadeIn: fadeInFrames,
      },
      _declarationOrder: 0,
    };

    const fadeOutFrames = this.parseDurationToFrames(
      this.config.fadeOut,
      context,
    );

    const bgmEndEvent: TrackEvent = {
      at: endFrame,
      kind: "AUDIO",
      type: "BGM_END",
      payload: {
        fadeOut: fadeOutFrames,
      },
      _declarationOrder: 1,
    };

    return [bgmStartEvent, bgmEndEvent];
  }

  private parseTimeToFrames(timeStr: string, context: CompilerContext): number {
    const match = timeStr.match(/^(\d+(?:\.\d+)?)s$/);
    if (!match) {
      throw new Error(
        `AudioDirectorPlugin: Invalid time format "${timeStr}" (expected "5s")`,
      );
    }
    const seconds = parseFloat(match[1]);
    return Math.floor(seconds * context.fps);
  }

  private parseDurationToFrames(
    timeStr: string,
    context: CompilerContext,
  ): number {
    const match = timeStr.match(/^(\d+(?:\.\d+)?)s$/);
    if (!match) {
      throw new Error(
        `AudioDirectorPlugin: Invalid duration format "${timeStr}" (expected "2s")`,
      );
    }
    const seconds = parseFloat(match[1]);
    return Math.floor(seconds * context.fps);
  }
}
