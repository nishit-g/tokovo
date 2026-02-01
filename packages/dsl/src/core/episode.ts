/**
 * Episode Builder - Fluent API for track-based episodes
 *
 * Creates a TrackEpisodeIR using the track-based DSL.
 *
 * @example
 * ```typescript
 * const ir = episode("demo", { fps: 30, duration: "60s" })
 *   .device("phone", "iphone16", {
 *     app: "app_whatsapp",
 *     conversations: [{ id: "dm_sarah", name: "Sarah" }]
 *   })
 *   .camera(cam => {
 *     cam.at("0s").set({ scale: 1 });
 *     cam.at("1s").animate({ scale: 1.2, duration: "0.5s" });
 *   })
 *   .build();
 * ```
 */

import type {
  TrackEpisodeIR,
  TrackEpisodeConfig,
  DeviceConfig,
  ConversationConfig,
  OSConfig,
  Marker,
  Section,
  DirectorStyle,
  TrackEvent,
  VoiceScriptDefinition,
  VoiceScheduleItem,
} from "@tokovo/ir";
import type { CompilerPlugin, CompilerContext } from "@tokovo/compiler";
import { parseTimeToFrames } from "../utils/time";
import { CameraTrackBuilder } from "./tracks/camera";
import { AudioTrackBuilder } from "./tracks/audio";
import { OSTrackBuilder } from "./tracks/os";

class VoicePointBuilder<T extends string> {
  private readonly _addItem: (item: VoiceScheduleItem<T>) => void;
  private readonly _frame: number;

  constructor(addItem: (item: VoiceScheduleItem<T>) => void, frame: number) {
    this._addItem = addItem;
    this._frame = frame;
  }

  play(segmentId: T, options?: { volume?: number; speed?: number }): void {
    this._addItem({
      segmentId,
      at: this._frame,
      volume: options?.volume,
      speed: options?.speed,
    });
  }
}

class VoiceTrackBuilderInternal<T extends string> {
  private readonly _fps: number;
  private readonly _script: VoiceScriptDefinition<T>;
  private readonly _schedule: VoiceScheduleItem<T>[] = [];

  constructor(fps: number, script: VoiceScriptDefinition<T>) {
    this._fps = fps;
    this._script = script;
  }

  at(time: string | number): VoicePointBuilder<T> {
    const frame =
      typeof time === "number" ? time : parseTimeToFrames(time, this._fps);
    return new VoicePointBuilder((item) => this._schedule.push(item), frame);
  }

  get schedule(): VoiceScheduleItem<T>[] {
    return this._schedule;
  }

  get script(): VoiceScriptDefinition<T> {
    return this._script;
  }
}

// =============================================================================
// TYPES
// =============================================================================

export interface DeviceOptions {
  app: string;
  conversations?: ConversationConfig[];
  os?: OSConfig;
  /** UI theme/strategy to use (e.g., "whatsapp-ghibli") */
  theme?: string;
}

/**
 * Base interface for all track builders.
 * Track builders collect events and expose them via _events.
 */
export interface TrackBuilder {
  readonly _events: readonly TrackEvent[];
  at: (time: string | number) => unknown;
  span: (start: string | number, end: string | number) => unknown;
}

/**
 * Function type for track configuration callbacks.
 */
export type TrackFn<T extends TrackBuilder> = (track: T) => void;

// =============================================================================
// EPISODE BUILDER
// =============================================================================

/**
 * Episode builder - fluent API for creating episodes.
 */
export class EpisodeBuilder {
  private readonly _id: string;
  private readonly _fps: number;
  private readonly _durationInFrames: number;
  private readonly _title: string | undefined;
  private readonly _description: string | undefined;
  private readonly _devices: DeviceConfig[] = [];
  private readonly _events: TrackEvent[] = [];
  private readonly _markers: Marker[] = [];
  private readonly _sections: Section[] = [];
  private readonly _plugins: CompilerPlugin[] = [];
  private _director: DirectorStyle | undefined;
  private _declarationOrder = 0;
  private _voiceConfig:
    | {
      script: VoiceScriptDefinition<string>;
      schedule: VoiceScheduleItem<string>[];
    }
    | undefined;

  constructor(id: string, config: TrackEpisodeConfig) {
    this._id = id;
    this._fps = config.fps;
    this._durationInFrames = parseTimeToFrames(config.duration, config.fps);
    this._title = config.title;
    this._description = config.description;
  }

  voice<T extends string>(
    script: VoiceScriptDefinition<T>,
    fn: (track: VoiceTrackBuilderInternal<T>) => void,
  ): this {
    const builder = new VoiceTrackBuilderInternal(this._fps, script);
    fn(builder);
    this._voiceConfig = {
      script: script as VoiceScriptDefinition<string>,
      schedule: builder.schedule as VoiceScheduleItem<string>[],
    };
    return this;
  }

  /**
   * Add a device to the episode.
   */
  device(id: string, profile: string, options: DeviceOptions): this {
    const deviceConfig: DeviceConfig = {
      id,
      profile,
      app: options.app,
      conversations: options.conversations,
      os: options.os,
      theme: options.theme,
    };
    this._devices.push(deviceConfig);
    return this;
  }

  /**
   * Enable auto-camera director.
   */
  director(style: DirectorStyle): this {
    this._director = style;
    return this;
  }

  /**
   * Add a camera track.
   */
  camera(fn: TrackFn<CameraTrackBuilder>): this {
    const getOrder = (): number => this._declarationOrder++;
    const builder = new CameraTrackBuilder(this._fps, getOrder);
    fn(builder);
    this._events.push(...builder._events);
    return this;
  }

  /**
   * Add an audio track.
   */
  audio(fn: TrackFn<AudioTrackBuilder>): this {
    const getOrder = (): number => this._declarationOrder++;
    const builder = new AudioTrackBuilder(this._fps, getOrder);
    fn(builder);
    this._events.push(...builder._events);
    return this;
  }

  /**
   * Add an OS track.
   */
  os(fn: TrackFn<OSTrackBuilder>): this {
    const getOrder = (): number => this._declarationOrder++;
    const builder = new OSTrackBuilder(this._fps, getOrder);
    fn(builder);
    this._events.push(...builder._events);
    return this;
  }

  /**
   * Add a generic track by ID.
   * Used for plugin tracks (e.g., app_whatsapp).
   * 
   * @param trackId - Track identifier (e.g., "app_whatsapp")
   * @param factory - Factory function that creates the track builder.
   *                  Can be either:
   *                  - `() => T` (legacy, uses external order counter)
   *                  - `(getOrder: () => number) => T` (recommended, uses central counter)
   * @param fn - Function that configures the track
   */
  track<T extends TrackBuilder>(
    trackId: string,
    factory: (() => T) | ((getOrder: () => number) => T),
    fn: TrackFn<T>,
  ): this {
    void trackId;
    const getOrder = (): number => this._declarationOrder++;
    // Check if factory expects a getOrder parameter
    const builder = factory.length === 1
      ? (factory as (getOrder: () => number) => T)(getOrder)
      : (factory as () => T)();
    fn(builder);
    this._events.push(...(builder._events as unknown as TrackEvent[]));
    return this;
  }

  /**
   * Add a marker at a specific time.
   */
  mark(id: string, time: string | number): this {
    const frame = parseTimeToFrames(time, this._fps);
    this._markers.push({ id, frame });
    const event: TrackEvent = {
      at: frame,
      kind: "MARKER",
      type: "MARK",
      payload: { id },
      _declarationOrder: this._declarationOrder++,
    };
    this._events.push(event);
    return this;
  }

  /**
   * Add a section (region) between two times.
   */
  section(id: string, start: string | number, end: string | number): this {
    const startFrame = parseTimeToFrames(start, this._fps);
    const endFrame = parseTimeToFrames(end, this._fps);
    this._sections.push({ id, startFrame, endFrame });

    const startEvent: TrackEvent = {
      at: startFrame,
      kind: "MARKER",
      type: "SECTION_START",
      payload: { id },
      _declarationOrder: this._declarationOrder++,
    };
    const endEvent: TrackEvent = {
      at: endFrame,
      kind: "MARKER",
      type: "SECTION_END",
      payload: { id },
      _declarationOrder: this._declarationOrder++,
    };

    this._events.push(startEvent, endEvent);
    return this;
  }

  /**
   * Register a compiler plugin.
   * Plugins run during the build() phase to generate additional events.
   *
   * @param plugin - The plugin to register
   * @returns this (for chaining)
   *
   * @example
   * ```typescript
   * episode("demo", { fps: 30, duration: "30s" })
   *   .track("whatsapp", factory, wa => { ... })
   *   .use(new CameraDirectorPlugin("fluid-tennis"))
   *   .build();
   * ```
   */
  use(plugin: CompilerPlugin): this {
    this._plugins.push(plugin);
    return this;
  }

  build(): TrackEpisodeIR {
    let allEvents = [...this._events];

    if (this._plugins.length > 0) {
      const context = this._buildCompilerContext();
      const orderedPlugins = this._orderPluginsByDependencies(this._plugins);

      for (const plugin of orderedPlugins) {
        const generatedEvents = plugin.process(allEvents, context);

        for (const event of generatedEvents) {
          if (!event._declarationOrder) {
            event._declarationOrder = this._declarationOrder++;
          }
        }

        allEvents = [...allEvents, ...generatedEvents];
      }
    }

    const sortedEvents = allEvents.sort((a, b) => {
      if (a.at !== b.at) {
        return a.at - b.at;
      }
      const orderA = a._declarationOrder ?? 0;
      const orderB = b._declarationOrder ?? 0;
      return orderA - orderB;
    });

    return {
      id: this._id,
      fps: this._fps,
      durationInFrames: this._durationInFrames,
      title: this._title,
      description: this._description,
      devices: this._devices,
      events: sortedEvents,
      markers: this._markers,
      sections: this._sections,
      director: this._director,
      voice: this._voiceConfig
        ? {
          manifestPath: this._voiceConfig.script.manifestPath,
          audioPath: this._voiceConfig.script.audioPath,
          usePerSegmentControl: true,
          segmentSchedule: this._voiceConfig.schedule,
          durationMs: this._voiceConfig.script.durationMs,
          segments: Object.values(this._voiceConfig.script.segments).map(
            (seg) => ({
              id: seg.id,
              startMs: seg.startMs,
              endMs: seg.endMs,
              durationMs: seg.endMs - seg.startMs,
              speaker: seg.speaker,
            }),
          ),
        }
        : undefined,
    };
  }

  private _buildCompilerContext(): any {
    return {
      fps: this._fps,
      durationInFrames: this._durationInFrames,
      devices: this._devices,
      anchors: {
        list: () => [],
        has: () => false,
        get: () => undefined,
        filter: () => [],
      },
    };
  }

  private _orderPluginsByDependencies(
    plugins: CompilerPlugin[],
  ): CompilerPlugin[] {
    const ordered: CompilerPlugin[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (plugin: CompilerPlugin): void => {
      if (visited.has(plugin.name)) return;
      if (visiting.has(plugin.name)) {
        throw new Error(`Circular dependency detected: ${plugin.name}`);
      }

      visiting.add(plugin.name);

      if (plugin.dependsOn) {
        for (const depName of plugin.dependsOn) {
          const dep = plugins.find((p) => p.name === depName);
          if (!dep) {
            throw new Error(
              `Plugin "${plugin.name}" depends on "${depName}" which is not registered`,
            );
          }
          visit(dep);
        }
      }

      visiting.delete(plugin.name);
      visited.add(plugin.name);
      ordered.push(plugin);
    };

    for (const plugin of plugins) {
      visit(plugin);
    }

    return ordered;
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new episode.
 *
 * @param id - Episode ID
 * @param config - Episode configuration
 * @returns EpisodeBuilder for fluent chaining
 */
export function episode(
  id: string,
  config: TrackEpisodeConfig,
): EpisodeBuilder {
  return new EpisodeBuilder(id, config);
}
