import { describe, expect, it } from "vitest";

import { prepareTrackEpisode } from "@tokovo/compiler";
import {
  replayIncremental,
  createKeyframedEventIndex,
  createStateCache,
  createConfig,
} from "@tokovo/core";
import type { WorldState, RuntimeEvent } from "@tokovo/core";

import { computeLayout } from "@tokovo/renderer";

import {
  getAnchorsForApp,
  resolveAnchorWithFallback,
  resetAnchorDiagnostics,
  getAnchorDiagnostics,
} from "@tokovo/device-camera";

import {
  createTokovoRegistries,
  PluginManagerClass,
  type TokovoRegistries,
} from "@tokovo/react";
import {
  createDeviceRegistries,
  registerDevicesPlugin,
  type DeviceRegistries,
} from "@tokovo/devices";
import { registerNotificationPlugin } from "@tokovo/device-notifications";
import { registerCameraPlugin } from "@tokovo/device-camera";
import { registerKeyboardPlugin } from "@tokovo/device-keyboard";

import { registerWhatsAppPlugin } from "@tokovo/apps-whatsapp";
import { registerXPlugin } from "@tokovo/apps-x";
import { registerIMessagePlugin } from "@tokovo/apps-imessage";

import { createVideoRunnerEpisodeRegistry } from "../episode-registry";

function createRuntimeForSmoke(): {
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
  registerWhatsAppPlugin(pluginManager);
  registerXPlugin(pluginManager);
  registerIMessagePlugin(pluginManager);
  registerNotificationPlugin(tokovoRegistries.engine);
  registerCameraPlugin(pluginManager, tokovoRegistries.engine);
  registerKeyboardPlugin(tokovoRegistries.engine);

  // OS providers only. App providers must come from plugins.
  // (intentionally not calling registerBuiltInAnchorProviders here)
  return { tokovoRegistries, deviceRegistries, pluginManager, config };
}

function getPrimaryDeviceId(world: WorldState): string {
  return world.camera?.activeDeviceId ?? Object.keys(world.devices ?? {})[0] ?? "phone";
}

function getActiveAppId(world: WorldState, deviceId: string): string | undefined {
  return world.devices?.[deviceId]?.foregroundAppId;
}

function getViewKind(world: WorldState, appId: string): string {
  const appState = world.appState?.[appId] as { viewMode?: string } | undefined;
  return appState?.viewMode ?? "TRANSITION";
}

function getConversationId(world: WorldState, appId: string): string | undefined {
  const appState = world.appState?.[appId] as { conversationId?: string } | undefined;
  return typeof appState?.conversationId === "string" ? appState.conversationId : undefined;
}

function getActiveAnchorEffect(
  world: WorldState,
  t: number,
): { anchorId?: string; type?: string } | null {
  const cameraWithEffects = world.camera as unknown as {
    activeEffects?: Array<{ type: string; startFrame: number; endFrame: number; anchorId?: string }>;
  };
  const effects = Array.isArray(cameraWithEffects.activeEffects)
    ? cameraWithEffects.activeEffects
    : [];

  const active = effects
    .filter(
      (e) =>
        (e.type === "focus" || e.type === "track") &&
        t >= e.startFrame &&
        t < e.endFrame,
    )
    .sort((a, b) => b.startFrame - a.startFrame)[0];

  return active ?? null;
}

describe("v1 render smoke", () => {
  const registry = createVideoRunnerEpisodeRegistry();
  const runtime = createRuntimeForSmoke();

  // If you add a new flagship episode, add it here. These are your "v1 canaries".
  const smokeEpisodeIds = [
    "x-anchor-tour",
    "imessage-anchor-tour",
    "track-demo-v2",
  ] as const;

  for (const episodeId of smokeEpisodeIds) {
    it(`${episodeId}: replays first frames with no camera-anchor fallbacks`, () => {
      const ep = registry.get(episodeId);
      expect(ep, `episode not found: ${episodeId}`).toBeTruthy();
      if (!ep) return;

      resetAnchorDiagnostics();

      const ir = ep.build();
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

      const keyframed = prepared.keyframedEventIndex ?? createKeyframedEventIndex(prepared.events, prepared.keyframeInterval ?? 60);
      const stateCache = createStateCache(prepared.keyframeInterval ?? 60);

      const maxFrames = Math.min(prepared.durationInFrames, 300); // ~10s at 30fps

      for (let t = 0; t < maxFrames; t++) {
        const errors: Array<{ frame: number; error: unknown; event: unknown }> = [];
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

        expect(errors, `engine errors at frame=${t} episode=${episodeId}`).toHaveLength(0);

        const deviceId = getPrimaryDeviceId(world);
        const appId = getActiveAppId(world, deviceId);
        if (!appId) continue;

        const profileId = world.devices?.[deviceId]?.profileId ?? "iphone16";
        const profile =
          runtime.deviceRegistries.devices.get(profileId) ??
          runtime.deviceRegistries.devices.get("iphone16");
        if (!profile) continue;

        const viewKind = getViewKind(world, appId);

        const layout = computeLayout(
          {
            world,
            t,
            activeDeviceId: deviceId,
            activeAppId: appId,
            viewKind: viewKind as any,
            activeConversationId: getConversationId(world, appId),
            viewportWidth: profile.dimensions.width,
            viewportHeight: profile.dimensions.height,
            safeAreaInsets: profile.safeArea,
          } as any,
          runtime.tokovoRegistries.plugins.layouts,
        );

        const anchorContext = {
          getDeviceProfile: (pid?: string) =>
            pid
              ? runtime.deviceRegistries.devices.get(pid) ??
                runtime.deviceRegistries.devices.get("iphone16")
              : undefined,
          getDeviceShell: (pid?: string) =>
            pid ? runtime.deviceRegistries.shells.get(pid) : undefined,
        };

        const snapshot = getAnchorsForApp(
          runtime.tokovoRegistries.plugins.anchors,
          appId,
          world,
          layout,
          deviceId,
          anchorContext as any,
        );

        const active = getActiveAnchorEffect(world, t);
        if (!active?.anchorId || !snapshot) continue;

        const resolved = resolveAnchorWithFallback(
          active.anchorId,
          snapshot.anchors ?? {},
          { width: profile.dimensions.width, height: profile.dimensions.height },
        );

        // For v1 canaries: no silent fallback. If this fails, you broke anchors.
        expect(
          resolved.isFallback,
          `frame=${t} app=${appId} requested=${active.anchorId} resolved=${resolved.anchor}`,
        ).toBe(false);
      }

      const diag = getAnchorDiagnostics();
      expect(diag.unresolvedCount, `unresolved anchors: ${JSON.stringify(diag.perAnchorUnresolvedCount)}`).toBe(0);
      expect(diag.fallbackCount, `fallback anchors: ${JSON.stringify(diag.perAnchorFallbackCount)}`).toBe(0);
    });
  }
});
