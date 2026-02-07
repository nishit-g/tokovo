import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { prepareTrackEpisode } from "@tokovo/compiler";
import {
  replayIncremental,
  createKeyframedEventIndex,
  createStateCache,
  createConfig,
  getSoundPath,
} from "@tokovo/core";
import type { RuntimeEvent } from "@tokovo/core";

import {
  createTokovoRegistries,
  PluginManagerClass,
  type TokovoRegistries,
} from "@tokovo/react";

import {
  createDeviceRegistries,
  registerDevicesPlugin,
  type DeviceRegistries,
  ensureCanvasProfile,
  resolveCanvasProfileId,
} from "@tokovo/devices";

import { registerCameraPlugin } from "@tokovo/device-camera";
import { registerTypewriterPlugin } from "@tokovo/apps-typewriter";
import { createVideoRunnerEpisodeRegistry } from "../episode-registry";
import { getFormat, type FormatId } from "@tokovo/episodes";

function createRuntime(): {
  tokovoRegistries: TokovoRegistries;
  deviceRegistries: DeviceRegistries;
  pluginManager: PluginManagerClass;
  config: ReturnType<typeof createConfig>;
} {
  const config = createConfig();
  const tokovoRegistries = createTokovoRegistries();
  const deviceRegistries = createDeviceRegistries();
  const pluginManager = new PluginManagerClass(tokovoRegistries.plugins);

  registerDevicesPlugin(tokovoRegistries, deviceRegistries);
  registerCameraPlugin(pluginManager, tokovoRegistries.engine);
  registerTypewriterPlugin(pluginManager);

  return { tokovoRegistries, deviceRegistries, pluginManager, config };
}

function publicSoundPath(relFromSoundsFolder: string): string {
  // `getSoundPath()` returns something like `sounds/plugins/typewriter/key.wav`.
  const videoRunnerDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
  );
  return path.resolve(videoRunnerDir, "public", relFromSoundsFolder);
}

describe("typewriter audio", () => {
  it("typewriter-letter: never falls back for _soft sounds and always has finite durations", () => {
    const registry = createVideoRunnerEpisodeRegistry();
    const runtime = createRuntime();

    const ep = registry.get("typewriter-letter");
    expect(ep, "episode not found: typewriter-letter").toBeTruthy();
    if (!ep) return;

    const ir = ep.build();

    // Resolve placeholder canvas device profiles deterministically from episode format.
    const fmt =
      typeof ep.config.format === "string"
        ? getFormat(ep.config.format as FormatId)
        : ep.config.format;

    for (const d of ir.devices ?? []) {
      if (d.profile === "canvas") {
        const canvasId = resolveCanvasProfileId({
          width: fmt.width,
          height: fmt.height,
        });
        d.profile = canvasId;
        ensureCanvasProfile(runtime.deviceRegistries, canvasId, {
          width: fmt.width,
          height: fmt.height,
        });
      }
    }

    const plugins = ep.config.apps.map((appId) => {
      const p = runtime.pluginManager.get(appId);
      if (!p) throw new Error(`Missing plugin: ${appId}`);
      return p;
    });

    const prepared = prepareTrackEpisode(ir, plugins, {
      config: runtime.config,
      validate: true,
      log: false,
    });

    const keyframed =
      prepared.keyframedEventIndex ??
      createKeyframedEventIndex(
        prepared.events,
        prepared.keyframeInterval ?? 60,
      );
    const stateCache = createStateCache(prepared.keyframeInterval ?? 60);

    const seenSoundIds = new Set<string>();
    const maxFrames = Math.min(prepared.durationInFrames, 300);

    for (let t = 0; t < maxFrames; t++) {
      const errors: Array<{ frame: number; error: unknown; event: unknown }> =
        [];
      const world = replayIncremental(
        prepared.initialWorld,
        prepared.events as RuntimeEvent[],
        t,
        {
          mode: "preview",
          fps: prepared.fps,
          registries: runtime.tokovoRegistries.engine,
          config: runtime.config,
          errors,
        },
        keyframed,
        stateCache,
      );

      expect(errors, `engine errors at frame=${t}`).toHaveLength(0);

      const cues = Object.values(world.audio?.activeSounds ?? {});
      for (const cue of cues) {
        if (seenSoundIds.has(cue.soundId)) continue;
        seenSoundIds.add(cue.soundId);

        // If this ever fails, we regress to the exact silent timeline bars shown in the screenshot:
        // fallback path becomes `sounds/<soundId>.wav` which doesn't exist.
        const rel = getSoundPath(
          cue.soundId,
          runtime.tokovoRegistries.plugins.sounds,
        );
        expect(rel.startsWith("sounds/")).toBe(true);

        const abs = publicSoundPath(rel);
        expect(
          fs.existsSync(abs),
          `missing audio asset: ${cue.soundId} -> ${rel}`,
        ).toBe(true);

        // Typewriter one-shots should always be bounded. Unbounded durations render as huge
        // bars in the Remotion timeline and can starve concurrency policies.
        expect(typeof cue.duration).toBe("number");
        expect(Number.isFinite(cue.duration)).toBe(true);
        expect(cue.duration).toBeGreaterThan(0);
        expect(cue.duration).toBeLessThanOrEqual(1800); // 60s hard cap for safety
      }
    }

    // Ensure we actually exercised softened variants during spam typing.
    expect(
      Array.from(seenSoundIds).some((id) => id.endsWith("_soft")),
      `expected at least one softened sound id; saw: ${Array.from(seenSoundIds).join(", ")}`,
    ).toBe(true);
  });
});
