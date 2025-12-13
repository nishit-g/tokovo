/**
 * Episode Builder
 * 
 * Top-level fluent API for defining an episode.
 * Entry point: episode("my-episode", ep => { ... })
 */

import { SceneIR, EpisodeMeta } from "@tokovo/ir";
import { DeviceBuilder, BeatFn } from "./device-builder";
import { CameraBuilder, CameraEvent } from "./camera-builder";
import { SceneBuilder } from "./scene-builder";
import { EpisodeConfig } from "../types";

/**
 * Device callback function.
 */
export type DeviceFn = (d: DeviceBuilder) => void;

/**
 * Camera callback function.
 */
export type CameraFn = (c: CameraBuilder) => void;

/**
 * Scene callback function.
 */
export type SceneFn = (s: SceneBuilder) => void;

/**
 * Episode builder collects devices and metadata.
 */
export class EpisodeBuilder {
    private readonly episodeId: string;
    private readonly meta: EpisodeMeta;
    private readonly deviceBuilders: DeviceBuilder[] = [];
    private readonly cameraEvents: CameraEvent[] = [];
    private readonly scenes: SceneBuilder[] = [];

    constructor(episodeId: string, config: EpisodeConfig = {}) {
        this.episodeId = episodeId;
        this.meta = {
            title: config.title ?? episodeId,
            fps: config.fps ?? 30,
        };
    }

    /**
     * Set episode metadata.
     */
    config(cfg: EpisodeConfig): this {
        if (cfg.fps) {
            (this.meta as any).fps = cfg.fps;
        }
        if (cfg.title) {
            (this.meta as any).title = cfg.title;
        }
        return this;
    }

    /**
     * Define a device with a story.
     */
    device(deviceId: string, fn: DeviceFn): this;
    device(deviceId: string, profileId: string, fn: DeviceFn): this;
    device(deviceId: string, profileIdOrFn: string | DeviceFn, maybeFn?: DeviceFn): this {
        let profileId: string;
        let fn: DeviceFn;

        if (typeof profileIdOrFn === "function") {
            profileId = "iphone16";
            fn = profileIdOrFn;
        } else {
            profileId = profileIdOrFn;
            fn = maybeFn!;
        }

        const builder = new DeviceBuilder(deviceId, profileId);
        fn(builder);
        this.deviceBuilders.push(builder);
        return this;
    }

    /**
     * Define camera operations for multi-POV.
     * Camera operations control cuts, layouts, and effects.
     */
    camera(fn: CameraFn): this {
        const builder = new CameraBuilder();
        fn(builder);
        this.cameraEvents.push(...builder.getEvents());
        return this;
    }

    /**
     * Define a cross-device scene.
     * Scenes coordinate actions across multiple devices.
     */
    scene(name: string, fn: SceneFn): this {
        const builder = new SceneBuilder(name);
        fn(builder);
        this.scenes.push(builder);
        return this;
    }

    /**
     * Build the Scene IR.
     */
    build(): SceneIR {
        return {
            episodeId: this.episodeId,
            meta: this.meta,
            devices: this.deviceBuilders.map((b) => b.build()),
            // TODO: Include camera events and scenes in SceneIR
        };
    }
}

/**
 * Entry point for creating an episode.
 * 
 * @example
 * const ir = episode("breakup-01", ep => {
 *   ep.device("AlicePhone", d => {
 *     d.conversation("dm_bob", { name: "Bob" })
 *     d.beat("tension", b => {
 *       b.receive("Bob", "We need to talk.")
 *     })
 *   })
 * })
 */
export function episode(
    episodeId: string,
    fn: (ep: EpisodeBuilder) => void,
    config?: EpisodeConfig
): SceneIR {
    const builder = new EpisodeBuilder(episodeId, config);
    fn(builder);
    return builder.build();
}
