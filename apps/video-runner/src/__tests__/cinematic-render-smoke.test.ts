import { describe, expect, it } from "vitest";

import { prepareTrackEpisode } from "@tokovo/compiler";
import {
  createConfig,
  createKeyframedEventIndex,
  createStateCache,
  replayIncremental,
  type RuntimeEvent,
} from "@tokovo/core";
import { ensureCanvasProfile, resolveCanvasProfileId } from "@tokovo/devices";
import {
  createEpisodeRegistryForProfiles,
  createTokovoRuntime,
  getFormat,
  type FormatId,
} from "@tokovo/episodes";

describe("cinematic render smoke", () => {
  const registry = createEpisodeRegistryForProfiles(["studio"]);
  const runtime = createTokovoRuntime("studio");
  const config = createConfig();
  const smokeEpisodeIds = [
    "cinematic-subject-exhaustive",
    "imessage-flagship-v2",
    "notification-center-exhaustive",
    "screen-recording-exhaustive",
    "multi-device-exhaustive",
    "v2-device-baseline",
    "v2-creator-series-showcase",
    "v2-overlay-baseline",
    "v2-creator-group-chat-multiapp",
    "v2-creator-friends-chat-no-overlay",
    "v2-local-friends-chat-no-overlay",
    "v2-whatsapp-group-replies-baseline",
    "v2-x-reply-thread-baseline",
    "typewriter-flagship-v2",
  ] as const;

  for (const episodeId of smokeEpisodeIds) {
    it(`${episodeId}: prepares native cinematics and replays deterministically`, () => {
      const definition = registry.get(episodeId);
      expect(definition, `episode not found: ${episodeId}`).toBeTruthy();
      if (!definition) return;

      const ir = definition.build();
      const format =
        typeof definition.config.format === "string"
          ? getFormat(definition.config.format as FormatId)
          : definition.config.format;
      for (const device of ir.devices ?? []) {
        if (device.profile !== "canvas") continue;
        const canvasId = resolveCanvasProfileId({
          width: format.width,
          height: format.height,
        });
        device.profile = canvasId;
        ensureCanvasProfile(runtime.deviceRegistries, canvasId, {
          width: format.width,
          height: format.height,
        });
      }
      const plugins = definition.config.apps.map((appId) => {
        const plugin = runtime.pluginManager.get(appId);
        if (!plugin) throw new Error(`Missing plugin: ${appId}`);
        return plugin;
      });
      const prepared = prepareTrackEpisode(ir, plugins, {
        config,
        validate: true,
        log: false,
      });

      expect(prepared.cinematics).toBeDefined();
      expect(prepared.cinematics?.cameraPrograms.length).toBeGreaterThan(0);
      expect(
        prepared.events.some(
          (event) => (event as { kind?: string }).kind === "CAMERA",
        ),
      ).toBe(false);

      const keyframed =
        prepared.keyframedEventIndex ??
        createKeyframedEventIndex(
          prepared.events,
          prepared.keyframeInterval ?? 60,
        );
      const stateCache = createStateCache(prepared.keyframeInterval ?? 60);
      const maxFrames = Math.min(prepared.durationInFrames, 300);
      for (let frame = 0; frame < maxFrames; frame += 1) {
        const errors: Array<{ frame: number; error: unknown; event: unknown }> =
          [];
        replayIncremental(
          prepared.initialWorld,
          prepared.events as RuntimeEvent[],
          frame,
          {
            mode: "preview",
            fps: prepared.fps,
            registries: runtime.tokovoRegistries.engine,
            config,
            errors,
          },
          keyframed,
          stateCache,
        );
        expect(
          errors,
          `engine errors at frame=${frame} episode=${episodeId}`,
        ).toHaveLength(0);
      }
    });
  }
});
