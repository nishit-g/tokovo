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
 *     app: "app_whatsapp",
 *     conversations: [{ id: "dm_sarah", name: "Sarah" }]
 *   })
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
  ConversationConfig,
  OSConfig,
  Marker,
  Section,
  DirectorStyle,
  TrackEvent,
} from "@tokovo/ir";
import { parseTimeToFrames } from "./utils/time";
import { CameraTrackBuilder } from "./camera-track";
import { AudioTrackBuilder } from "./audio-track";
import { OSTrackBuilder } from "./os-track";

// =============================================================================
// TYPES
// =============================================================================

export interface DeviceOptions {
  app: string;
  conversations?: ConversationConfig[];
  os?: OSConfig;
}

// Track builder base interface - implementations can have additional methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TrackBuilder {
  _events: any[];
  at: (time: string | number) => any;
  span: (start: string | number, end: string | number) => any;
}

// Track factory function type - use any for factory to allow app-specific builders
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TrackFactory<T> = () => T;
export type TrackFn<T> = (track: T) => void;

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
  private _events: TrackEvent[] = [];
  private _markers: Marker[] = [];
  private _sections: Section[] = [];
  private _director?: DirectorStyle;
  private _declarationOrder = 0;

  constructor(id: string, config: TrackEpisodeConfig) {
    this._id = id;
    this._fps = config.fps;
    this._durationInFrames = parseTimeToFrames(config.duration, config.fps);
    this._title = config.title;
    this._description = config.description;
  }

  /**
   * Add a device to the episode.
   */
  device(id: string, profile: string, options: DeviceOptions): this {
    this._devices.push({
      id,
      profile,
      app: options.app,
      conversations: options.conversations,
      os: options.os,
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
   * Add a generic track by ID.
   * Used for plugin tracks (e.g., "app_whatsapp").
   */
  track<T extends { _events: any[]; at: any; span: any }>(
    trackId: string,
    factory: () => T,
    fn: TrackFn<T>,
  ): this {
    const builder = factory();
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
   * Build the TrackEpisodeIR.
   */
  build(): TrackEpisodeIR {
    // Sort events by frame, then by declaration order
    const sortedEvents = [...this._events].sort((a, b) => {
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
      events: sortedEvents,
      markers: this._markers,
      sections: this._sections,
      director: this._director,
    };
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
