/**
 * V2 Episode Builder - Fluent API for track-based episodes
 *
 * @description Creates a TrackEpisodeIR using the new track-based DSL.
 * No more beats, just tracks.
 *
 * @example
 * ```typescript
 * const ir = episode("demo", { fps: 30, duration: "60s" })
 *   .device("phone", "iphone16", {
 *     app: "app_whatsapp"
 *   })
 *   .snapshot("app_whatsapp", "phone", { conversations: [] })
 *   .view("app_whatsapp", "phone", { screen: "chat-list" })
 *   .track("camera", cam => {
 *     cam.at("0s").set({ scale: 1 });
 *     cam.at("1s").animate({ scale: 1.2, duration: "0.5s" });
 *   })
 *   .build();
 * ```
 *
 * @see docs-v2/DSL_REVAMP.md
 */

import {
  TrackEpisodeIR,
  TrackEpisodeConfig,
  DeviceConfig,
  AppSnapshotEntry,
  AppInitialViewEntry,
  OSConfig,
  Marker,
  Section,
  DirectorStyle,
  TrackEvent,
  VoiceScriptDefinition,
  VoiceScheduleItem,
  BackgroundConfigIR,
} from "@tokovo/ir";
import type { CompilerContext, CompilerPlugin } from "@tokovo/compiler";
import { parseTimeToFrames } from "./utils/time.js";
import { CameraTrackBuilder } from "./camera-track.js";
import { AudioTrackBuilder } from "./audio-track.js";
import { OSTrackBuilder } from "./os-track.js";
import { DeviceTrackBuilderV2 } from "./device-track.js";
import { OverlayTrackBuilder } from "./overlay-track.js";

// =============================================================================
// TYPES
// =============================================================================

export interface DeviceOptions {
  app: string;
  os?: OSConfig;
  /** UI theme/strategy to use (e.g., "whatsapp-ghibli") */
  theme?: string;
  /** Start locked at frame 0 */
  locked?: boolean;
  /** Apps installed on the home screen (deterministic icon layout) */
  installedApps?: string[];
  /** Optional home screen layout override */
  homeScreen?: {
    preset?: "ios-default" | "android-default";
    dock?: string[];
    pages?: string[][];
    wallpaper?: string;
  };
  /** Start with screen recording indicator enabled */
  screenRecording?: boolean;
}

export interface TrackBuilder {
  _events: TrackEvent[];
  at: (time: string | number) => unknown;
  span: (start: string | number, end: string | number) => unknown;
}

export interface SnapshotOptions {
  version?: number;
}

export interface ViewOptions {
  version?: number;
}

// Track factory function type for app-specific builders.
export type TrackFactory<T> = () => T;
export type TrackFn<T> = (track: T) => void;

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
// EPISODE BUILDER
// =============================================================================

/**
 * Episode builder - fluent API for creating episodes.
 */
export class EpisodeBuilder {
  private _id: string;
  private _fps: number;
  private _durationInFrames: number;
  private _title?: string;
  private _description?: string;
  private _devices: DeviceConfig[] = [];
  private _appSnapshots: AppSnapshotEntry[] = [];
  private _initialViews: AppInitialViewEntry[] = [];
  private _events: TrackEvent[] = [];
  private _markers: Marker[] = [];
  private _sections: Section[] = [];
  private _director?: DirectorStyle;
  private _declarationOrder = 0;
  private _plugins: CompilerPlugin[] = [];
  private _voiceConfig:
    | {
      script: VoiceScriptDefinition<string>;
      schedule: VoiceScheduleItem<string>[];
    }
    | undefined;
  private _background?: BackgroundConfigIR;

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
    this._devices.push({
      id,
      profile,
      app: options.app,
      os: options.os,
      theme: options.theme,
      locked: options.locked,
      installedApps: options.installedApps,
      homeScreen: options.homeScreen,
      screenRecording: options.screenRecording,
    });
    return this;
  }

  snapshot(
    appId: string,
    deviceId: string,
    snapshot: unknown,
    options: SnapshotOptions = {},
  ): this {
    this._appSnapshots = this._appSnapshots.filter(
      (entry) => !(entry.appId === appId && entry.deviceId === deviceId),
    );
    this._appSnapshots.push({
      appId,
      deviceId,
      snapshotVersion: options.version ?? 1,
      snapshot,
    });
    return this;
  }

  view(
    appId: string,
    deviceId: string,
    view: unknown,
    options: ViewOptions = {},
  ): this {
    this._initialViews = this._initialViews.filter(
      (entry) => !(entry.appId === appId && entry.deviceId === deviceId),
    );
    this._initialViews.push({
      appId,
      deviceId,
      viewVersion: options.version ?? 1,
      view,
    });
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
   * Set the background for the video canvas.
   * Can be a preset ID ("ambient-night", "neon-city", etc.) or full config.
   * 
   * @example
   * // Using preset
   * .background("ambient-night")
   * 
   * @example
   * // Using image
   * .background({ type: "image", src: "/backgrounds/city.jpg", blur: 5 })
   * 
   * @example
   * // Using video
   * .background({ type: "video", src: "/backgrounds/loop.mp4", opacity: 0.8 })
   */
  background(config: BackgroundConfigIR): this {
    this._background = config;
    return this;
  }

  /**
   * Add a camera track.
   */
  camera(fn: TrackFn<CameraTrackBuilder>): this {
    const builder = new CameraTrackBuilder(
      this._fps,
      () => this._declarationOrder++,
    );
    fn(builder);
    this._events.push(...builder._events);
    return this;
  }

  /**
   * Add an audio track.
   */
  audio(fn: TrackFn<AudioTrackBuilder>): this {
    const builder = new AudioTrackBuilder(
      this._fps,
      () => this._declarationOrder++,
    );
    fn(builder);
    this._events.push(...builder._events);
    return this;
  }

  /**
   * Add a story overlay track (hook/captions/receipts).
   * Renders above devices and is unaffected by camera transforms.
   */
  overlay(fn: TrackFn<OverlayTrackBuilder>): this {
    const builder = new OverlayTrackBuilder(
      this._fps,
      () => this._declarationOrder++,
    );
    fn(builder);
    this._events.push(...builder._events);
    return this;
  }

  /**
   * Add an OS track.
   */
  os(fn: TrackFn<OSTrackBuilder>): this {
    const builder = new OSTrackBuilder(
      this._fps,
      () => this._declarationOrder++,
    );
    fn(builder);
    this._events.push(...builder._events);
    return this;
  }

  /**
   * Add a first-class device track for a specific device.
   * This is the canonical authoring surface for lock/unlock, app switching,
   * notifications, keyboard, badges, screen recording, etc.
   */
  deviceTrack(deviceId: string, fn: TrackFn<DeviceTrackBuilderV2>): this {
    const builder = new DeviceTrackBuilderV2(
      this._fps,
      deviceId,
      () => this._declarationOrder++,
    );
    fn(builder);
    this._events.push(...builder._events);
    return this;
  }

  /**
   * Add a generic track by ID.
   * Used for plugin tracks (e.g., "app_whatsapp").
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
    const getOrder = () => this._declarationOrder++;
    // Check if factory expects a getOrder parameter
    const builder = factory.length === 1
      ? (factory as (getOrder: () => number) => T)(getOrder)
      : (factory as () => T)();
    fn(builder);
    this._events.push(...(builder._events as TrackEvent[]));
    return this;
  }

  /**
   * Add a marker at a specific time.
   */
  mark(id: string, time: string | number): this {
    const frame = parseTimeToFrames(time, this._fps);
    this._markers.push({ id, frame });
    this._events.push({
      at: frame,
      kind: "MARKER" as const,
      type: "MARK" as const,
      payload: { id },
      _declarationOrder: this._declarationOrder++,
    });
    return this;
  }

  /**
   * Add a section (region) between two times.
   */
  section(id: string, start: string | number, end: string | number): this {
    const startFrame = parseTimeToFrames(start, this._fps);
    const endFrame = parseTimeToFrames(end, this._fps);
    this._sections.push({ id, startFrame, endFrame });
    this._events.push(
      {
        at: startFrame,
        kind: "MARKER" as const,
        type: "SECTION_START" as const,
        payload: { id },
        _declarationOrder: this._declarationOrder++,
      },
      {
        at: endFrame,
        kind: "MARKER" as const,
        type: "SECTION_END" as const,
        payload: { id },
        _declarationOrder: this._declarationOrder++,
      },
    );
    return this;
  }

  /**
   * Register a compiler plugin.
   * Plugins run during the build() phase to generate additional events.
   */
  use(plugin: CompilerPlugin): this {
    this._plugins.push(plugin);
    return this;
  }

  /**
   * Build the TrackEpisodeIR.
   */
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

    // Sort events by frame, then by declaration order
    const sortedEvents = [...allEvents].sort((a, b) => {
      if (a.at !== b.at) return a.at - b.at;
      return (a._declarationOrder ?? 0) - (b._declarationOrder ?? 0);
    });

    return {
      id: this._id,
      fps: this._fps,
      durationInFrames: this._durationInFrames,
      title: this._title,
      description: this._description,
      devices: this._devices,
      appSnapshots: this._appSnapshots,
      initialViews: this._initialViews,
      events: sortedEvents,
      markers: this._markers,
      sections: this._sections,
      director: this._director,
      background: this._background,
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

  private _buildCompilerContext(): CompilerContext {
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
 *
 * @example
 * ```typescript
 * const ir = episode("demo", { fps: 30, duration: "30s" })
 *   .device("phone", "iphone16", { app: "app_whatsapp" })
 *   .camera(cam => cam.at("0s").set({ scale: 1 }))
 *   .build();
 * ```
 */
export function episode(
  id: string,
  config: TrackEpisodeConfig,
): EpisodeBuilder {
  return new EpisodeBuilder(id, config);
}
