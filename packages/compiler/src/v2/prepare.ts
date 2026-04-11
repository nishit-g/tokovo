/**
 * Prepare Track Episode - Converts TrackEpisodeIR to engine-ready format
 *
 * @description The glue between v2 DSL and the runtime engine.
 * Takes TrackEpisodeIR from episode().build() and produces
 * a PreparedTrackEpisode ready for replayIncremental().
 *
 * @see docs/architecture/dsl-v2.md
 */

import type { TrackEpisodeIR } from "@tokovo/ir";
import { safeValidateTrackEpisodeIR } from "@tokovo/ir";
import type {
  RuntimeEvent,
  WorldState,
  TokovoPlugin,
  DeviceState,
  TokovoConfigType,
  AutoSoundRule,
} from "@tokovo/core";
import {
  DEFAULT_CAMERA_STATE,
  DEFAULT_AUDIO_STATE,
  createScopedLogger,
} from "@tokovo/core";
import {
  compareEvents,
  createEventIndex,
  createKeyframedEventIndex,
  computeEventSignature,
  TokovoConfig,
} from "@tokovo/core";
import { lowerEpisode } from "./lowering.js";
import { validateV1RuntimeEpisode } from "./validation.js";
import {
  CompilerSchemaValidationError,
  RuntimeValidationError,
} from "./errors.js";
import { collectEpisodeAssetRefs } from "./asset-refs.js";

const log = createScopedLogger("compiler");

// =============================================================================
// TYPES
// =============================================================================

export interface PreparedTrackEpisode {
  id: string;
  fps: number;
  durationInFrames: number;
  events: RuntimeEvent[];
  eventIndex?: ReturnType<typeof createEventIndex>;
  keyframedEventIndex?: ReturnType<typeof createKeyframedEventIndex>;
  keyframeInterval?: number;
  eventSignature?: string;
  initialWorld: WorldState;
  plugins: TokovoPlugin[];
  assetRefs: import("@tokovo/core").EpisodeAssetRef[];
  metadata: {
    title?: string;
    description?: string;
    markers: Array<{ id: string; frame: number }>;
    sections: Array<{ id: string; start: number; end: number }>;
  };
}

// =============================================================================
// PREPARE FUNCTION
// =============================================================================

/**
 * Prepare a v2 TrackEpisodeIR for the runtime engine.
 *
 * @param ir - TrackEpisodeIR from episode().build()
 * @param plugins - Array of plugins to use
 * @returns PreparedTrackEpisode ready for replayIncremental()
 */
export function prepareTrackEpisode(
  ir: TrackEpisodeIR,
  plugins: TokovoPlugin[],
  options: {
    config?: TokovoConfigType;
    validate?: boolean;
    log?: boolean;
  } = {},
): PreparedTrackEpisode {
  const config = options.config ?? TokovoConfig;
  const shouldValidate = options.validate ?? true;
  const shouldLog = options.log ?? true;
  if (shouldValidate) {
    const validation = safeValidateTrackEpisodeIR(ir);
    if (!validation.success) {
      log.error("IR validation failed", undefined, {
        event: "compiler.ir_validation_failed",
        issues: validation.error.format(),
      });
      throw new CompilerSchemaValidationError(
        `Invalid TrackEpisodeIR: ${validation.error.message}`,
      );
    }
  }

  const runtimeEvents = lowerEpisode(ir, plugins) as RuntimeEvent[];
  const sortedEvents = runtimeEvents
    .map((event, index) => ({ event, index }))
    .sort((a, b) => compareEvents(a.event, b.event, a.index, b.index))
    .map((entry) => entry.event);

  // Build initial world state from device configs
  const initialWorld = buildInitialWorld(ir, plugins);
  initialWorld.audio = {
    ...initialWorld.audio,
    autoSoundRules: [
      ...DEFAULT_DEVICE_SFX_RULES,
      ...plugins.flatMap((p) => p.audioRules ?? []),
    ] as AutoSoundRule[],
  };

  if (shouldValidate) {
    const runtimeIssues = validateV1RuntimeEpisode(sortedEvents);
    const errors = runtimeIssues.filter((i) => i.severity === "error");
    if (errors.length > 0) {
      const header = `[prepareTrackEpisode] V1 runtime validation failed (${errors.length} error(s))`;
      const body = runtimeIssues
        .slice(0, 10)
        .map((i) => {
          const at = typeof i.at === "number" ? ` at=${i.at}` : "";
          const app = i.appId ? ` appId=${i.appId}` : "";
          const type = i.type ? ` type=${i.type}` : "";
          return `- [${i.severity}]${at}${app}${type}: ${i.message}`;
        })
        .join("\n");
      throw new RuntimeValidationError(`${header}\n${body}`);
    }

    if (shouldLog) {
      for (const issue of runtimeIssues) {
        if (issue.severity === "warning") {
          log.warn(issue.message, {
            event: "compiler.runtime_validation_warning",
            issue,
          });
        }
      }
    }
  }

  // Build metadata
  const metadata = {
    title: ir.title,
    description: ir.description,
    markers: ir.markers.map((m) => ({ id: m.id, frame: m.frame })),
    sections: ir.sections.map((s) => ({
      id: s.id,
      start: s.startFrame,
      end: s.endFrame,
    })),
  };

  if (shouldLog) {
    log.info("Prepared episode", {
      event: "compiler.prepared_episode",
      id: ir.id,
      trackEvents: ir.events.length,
      runtimeEvents: runtimeEvents.length,
      devices: ir.devices.length,
      appSnapshots: ir.appSnapshots.length,
      initialViews: ir.initialViews.length,
    });
  }

  const eventSignature = computeEventSignature(sortedEvents);
  const keyframeInterval = config.rendering.cacheKeyframeInterval;
  const assetRefs = collectEpisodeAssetRefs({
    ir,
    initialWorld,
    events: sortedEvents,
    plugins,
  });

  return {
    id: ir.id,
    fps: ir.fps,
    durationInFrames: ir.durationInFrames,
    events: sortedEvents,
    eventIndex: createEventIndex(sortedEvents),
    keyframedEventIndex: createKeyframedEventIndex(
      sortedEvents,
      keyframeInterval,
    ),
    keyframeInterval,
    eventSignature,
    initialWorld,
    plugins,
    assetRefs,
    metadata,
  };
}

// =============================================================================
// WORLD BUILDER
// =============================================================================

/**
 * Build initial WorldState from TrackEpisodeIR device configs.
 */
function buildInitialWorld(ir: TrackEpisodeIR, plugins: TokovoPlugin[]): WorldState {
  const devices: Record<string, DeviceState> = {};
  for (const device of ir.devices) {
    const platform = device.profile.includes("pixel") ? "android" : "ios";
    const installedApps = device.installedApps ?? [];
    const hasHomeScreen =
      Boolean(device.homeScreen) || installedApps.length > 0;

    devices[device.id] = {
      id: device.id,
      profileId: device.profile,
      foregroundAppId: device.app,
      isLocked: device.locked ?? false,
      platform,
      appTheme: device.theme,
      notifications: [],
      keyboard: {
        visible: false,
        showFrame: null,
        hideFrame: null,
        inputText: "",
        cursorPosition: 0,
        activeKeyPresses: [],
        keyboardType: "default",
        returnKeyType: "return",
        suggestions: [],
        activeSuggestionIndex: null,
      },
      homeScreen: hasHomeScreen
        ? buildHomeScreenConfig({
            platform,
            installedApps: installedApps.length > 0 ? installedApps : [device.app],
            wallpaper: device.homeScreen?.wallpaper,
            dock: device.homeScreen?.dock,
            pages: device.homeScreen?.pages,
          })
        : undefined,
      screenRecording: device.screenRecording
        ? {
            enabled: true,
            mode: "compact",
            startedAtFrame: 0,
            activeSinceFrame: 0,
          }
        : undefined,
    } as DeviceState;
  }

  const firstDeviceId = ir.devices[0]?.id || "main_phone";
  const camera = {
    ...DEFAULT_CAMERA_STATE,
    activeDeviceId: firstDeviceId,
    layout: {
      ...(DEFAULT_CAMERA_STATE.layout ?? { mode: "SINGLE", primaryDeviceId: firstDeviceId }),
      primaryDeviceId: firstDeviceId,
    },
  };
  const audio = { ...DEFAULT_AUDIO_STATE };

  const pluginsById = new Map<string, TokovoPlugin>(
    plugins.map((p) => [p.id, p]),
  );

  const appState: Record<string, unknown> = {};
  const snapshotEntries = new Map<string, import("@tokovo/ir").AppSnapshotEntry>();
  const initialViewEntries = new Map<string, import("@tokovo/ir").AppInitialViewEntry>();

  for (const entry of ir.appSnapshots) {
    snapshotEntries.set(`${entry.appId}:${entry.deviceId}`, entry);
  }

  for (const entry of ir.initialViews) {
    initialViewEntries.set(`${entry.appId}:${entry.deviceId}`, entry);
  }

  for (const device of ir.devices) {
    if (device.app) {
      const appId = device.app;
      const plugin = pluginsById.get(appId);
      const bootstrapKey = `${appId}:${device.id}`;
      const snapshot = snapshotEntries.get(bootstrapKey);
      const initialView = initialViewEntries.get(bootstrapKey);
      const baseState = (() => {
        try {
          const created = plugin?.createInitialState?.();
          if (created && typeof created === "object") return { ...(created as Record<string, unknown>) };
        } catch (e) {
          log.warn(`createInitialState failed for ${appId}`, {
            event: "compiler.create_initial_state_failed",
            appId,
            error: e instanceof Error
              ? { name: e.name, message: e.message, stack: e.stack }
              : { name: "UnknownError", message: String(e) },
          });
        }
        return {};
      })();
      const bootstrapContext = {
        appId,
        deviceId: device.id,
        device,
        ir,
        baseState,
        snapshot: resolveBootstrapSnapshotEntry({
          appId,
          deviceId: device.id,
          entry: snapshot,
          plugin,
          baseContext: {
            appId,
            deviceId: device.id,
            device,
            ir,
            baseState,
            snapshot,
            initialView,
          },
        }),
        initialView: resolveBootstrapViewEntry({
          appId,
          deviceId: device.id,
          entry: initialView,
          plugin,
          baseContext: {
            appId,
            deviceId: device.id,
            device,
            ir,
            baseState,
            snapshot,
            initialView,
          },
        }),
      };

      const validation = plugin?.bootstrap?.validate?.(bootstrapContext);
      if (validation?.errors && validation.errors.length > 0) {
        throw new RuntimeValidationError(
          `[prepareTrackEpisode] bootstrap validation failed for ${appId} on ${device.id}\n${validation.errors.map((error: string) => `- ${error}`).join("\n")}`,
        );
      }

      if (validation?.warnings && validation.warnings.length > 0) {
        for (const warning of validation.warnings) {
          log.warn(`${appId} bootstrap warning`, {
            event: "compiler.bootstrap_warning",
            appId,
            warning,
          });
        }
      }

      const hydrated = plugin?.bootstrap?.hydrate
        ? plugin.bootstrap.hydrate(bootstrapContext)
        : baseState;

      appState[appId] = hydrated as Record<string, unknown>;
    }
  }

  const worldState: WorldState = {
    devices,
    appState,
    camera,
    audio,
  };

  return worldState;
}

function resolveBootstrapSnapshotEntry(input: {
  appId: string;
  deviceId: string;
  entry?: import("@tokovo/ir").AppSnapshotEntry;
  plugin?: TokovoPlugin;
  baseContext: import("@tokovo/core").PluginBootstrapContext;
}): import("@tokovo/ir").AppSnapshotEntry | undefined {
  if (!input.entry) {
    return undefined;
  }

  const schema = input.plugin?.bootstrap?.snapshot;
  if (!schema) {
    throw new RuntimeValidationError(
      `[prepareTrackEpisode] snapshot bootstrap schema missing for ${input.appId} on ${input.deviceId}`,
    );
  }

  const resolved = resolveVersionedBootstrapValue({
    appId: input.appId,
    deviceId: input.deviceId,
    kind: "snapshot",
    version: input.entry.snapshotVersion,
    value: input.entry.snapshot,
    schema,
    context: input.baseContext,
  });

  return {
    ...input.entry,
    snapshotVersion: resolved.version,
    snapshot: resolved.value,
  };
}

function resolveBootstrapViewEntry(input: {
  appId: string;
  deviceId: string;
  entry?: import("@tokovo/ir").AppInitialViewEntry;
  plugin?: TokovoPlugin;
  baseContext: import("@tokovo/core").PluginBootstrapContext;
}): import("@tokovo/ir").AppInitialViewEntry | undefined {
  if (!input.entry) {
    return undefined;
  }

  const schema = input.plugin?.bootstrap?.view;
  if (!schema) {
    throw new RuntimeValidationError(
      `[prepareTrackEpisode] initial view schema missing for ${input.appId} on ${input.deviceId}`,
    );
  }

  const resolved = resolveVersionedBootstrapValue({
    appId: input.appId,
    deviceId: input.deviceId,
    kind: "initial view",
    version: input.entry.viewVersion,
    value: input.entry.view,
    schema,
    context: input.baseContext,
  });

  return {
    ...input.entry,
    viewVersion: resolved.version,
    view: resolved.value,
  };
}

function resolveVersionedBootstrapValue(input: {
  appId: string;
  deviceId: string;
  kind: "snapshot" | "initial view";
  version: number;
  value: unknown;
  schema: NonNullable<TokovoPlugin["bootstrap"]>["snapshot"];
  context: import("@tokovo/core").PluginBootstrapContext;
}): { version: number; value: unknown } {
  if (!input.schema) {
    throw new RuntimeValidationError(
      `[prepareTrackEpisode] ${input.kind} schema missing for ${input.appId} on ${input.deviceId}`,
    );
  }

  let version = input.version;
  let value = input.value;
  let migrationSteps = 0;

  if (!Number.isInteger(version) || version < 1) {
    throw new RuntimeValidationError(
      `[prepareTrackEpisode] ${input.kind} version for ${input.appId} on ${input.deviceId} must be a positive integer`,
    );
  }

  if (version > input.schema.currentVersion) {
    throw new RuntimeValidationError(
      `[prepareTrackEpisode] ${input.kind} version ${version} for ${input.appId} on ${input.deviceId} is newer than supported version ${input.schema.currentVersion}`,
    );
  }

  while (version < input.schema.currentVersion) {
    if (!input.schema.migrate) {
      throw new RuntimeValidationError(
        `[prepareTrackEpisode] ${input.kind} version ${version} for ${input.appId} on ${input.deviceId} cannot be migrated to ${input.schema.currentVersion}`,
      );
    }

    const migrated = input.schema.migrate({
      appId: input.appId,
      version,
      value,
      context: input.context,
    });

    if (!Number.isInteger(migrated.version) || migrated.version <= version) {
      throw new RuntimeValidationError(
        `[prepareTrackEpisode] ${input.kind} migration for ${input.appId} on ${input.deviceId} must advance version numbers`,
      );
    }

    version = migrated.version;
    value = migrated.value;
    migrationSteps += 1;

    if (migrationSteps > 16) {
      throw new RuntimeValidationError(
        `[prepareTrackEpisode] ${input.kind} migration for ${input.appId} on ${input.deviceId} exceeded safe migration depth`,
      );
    }
  }

  const validation = input.schema.validate?.({
    appId: input.appId,
    version,
    value,
    context: input.context,
  });

  if (validation?.errors && validation.errors.length > 0) {
    throw new RuntimeValidationError(
      `[prepareTrackEpisode] ${input.kind} validation failed for ${input.appId} on ${input.deviceId}\n${validation.errors.map((error) => `- ${error}`).join("\n")}`,
    );
  }

  if (validation?.warnings && validation.warnings.length > 0) {
    for (const warning of validation.warnings) {
      log.warn(`${input.appId} ${input.kind} warning`, {
        event: "compiler.bootstrap_schema_warning",
        appId: input.appId,
        deviceId: input.deviceId,
        kind: input.kind,
        warning,
      });
    }
  }

  return { version, value };
}

const DEFAULT_DEVICE_SFX_RULES: AutoSoundRule[] = [
  { match: { kind: "DEVICE", type: "LOCK" }, action: "PLAY_ONE_SHOT", sound: "lock", bus: "sfx" },
  { match: { kind: "DEVICE", type: "UNLOCK" }, action: "PLAY_ONE_SHOT", sound: "unlock", bus: "sfx" },
  { match: { kind: "DEVICE", type: "OPEN_APP" }, action: "PLAY_ONE_SHOT", sound: "tap", bus: "ui" },
  { match: { kind: "DEVICE", type: "GO_HOME" }, action: "PLAY_ONE_SHOT", sound: "tap", bus: "ui" },
];

function buildHomeScreenConfig(input: {
  platform: "ios" | "android";
  installedApps: string[];
  wallpaper?: string;
  dock?: string[];
  pages?: string[][];
}): import("@tokovo/core").HomeScreenConfig {
  const iconFor = (appId: string): { label: string; icon: string } => {
    switch (appId) {
      case "app_whatsapp":
        return { label: "WhatsApp", icon: "💬" };
      case "app_x":
        return { label: "X", icon: "𝕏" };
      case "app_instagram":
        return { label: "Instagram", icon: "◎" };
      case "app_imessage":
        return { label: "Messages", icon: "💬" };
      case "app_camera":
        return { label: "Camera", icon: "📷" };
      default:
        return { label: appId.replace(/^app_/, ""), icon: "⬛️" };
    }
  };

  const uniq = (xs: string[]) => Array.from(new Set(xs.filter(Boolean)));
  const installed = uniq(input.installedApps);

  const dockIds =
    input.dock && input.dock.length > 0
      ? uniq(input.dock)
      : installed.slice(0, input.platform === "android" ? 5 : 4);

  const pageIds = (() => {
    if (input.pages && input.pages.length > 0) return input.pages.map(uniq);
    const remaining = installed.filter((id) => !dockIds.includes(id));
    const pageSize = input.platform === "android" ? 30 : 24;
    const pages: string[][] = [];
    for (let i = 0; i < remaining.length; i += pageSize) {
      pages.push(remaining.slice(i, i + pageSize));
    }
    return pages.length > 0 ? pages : [[]];
  })();

  return {
    wallpaper: input.wallpaper,
    dock: dockIds.map((appId) => {
      const { label, icon } = iconFor(appId);
      return { appId, label, icon };
    }),
    pages: pageIds.map((apps) => ({
      apps: apps.map((appId) => {
        const { label, icon } = iconFor(appId);
        return { appId, label, icon };
      }),
    })),
  };
}
