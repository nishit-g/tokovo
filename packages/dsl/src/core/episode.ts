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
} from "@tokovo/ir";
import { parseTimeToFrames } from "../utils/time";
import { CameraTrackBuilder } from "./tracks/camera";
import { AudioTrackBuilder } from "./tracks/audio";
import { OSTrackBuilder } from "./tracks/os";

// =============================================================================
// TYPES
// =============================================================================

export interface DeviceOptions {
    app: string;
    conversations?: ConversationConfig[];
    os?: OSConfig;
}

/**
 * Base interface for all track builders.
 * Track builders collect events and expose them via _events.
 */
export interface TrackBuilder {
    readonly _events: TrackEvent[];
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
    private _director: DirectorStyle | undefined;
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
        const deviceConfig: DeviceConfig = {
            id,
            profile,
            app: options.app,
            conversations: options.conversations,
            os: options.os,
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
     */
    track<T extends TrackBuilder>(
        trackId: string,
        factory: () => T,
        fn: TrackFn<T>
    ): this {
        void trackId; // trackId reserved for future use
        const builder = factory();
        fn(builder);
        this._events.push(...builder._events);
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
     * Build the TrackEpisodeIR.
     */
    build(): TrackEpisodeIR {
        const sortedEvents = [...this._events].sort((a, b) => {
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
 */
export function episode(id: string, config: TrackEpisodeConfig): EpisodeBuilder {
    return new EpisodeBuilder(id, config);
}
