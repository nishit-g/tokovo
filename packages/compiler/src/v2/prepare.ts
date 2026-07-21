/**
 * Prepare Track Episode - Converts TrackEpisodeIR to engine-ready format
 *
 * @description The glue between v2 DSL and the runtime engine.
 * Takes TrackEpisodeIR from episode().build() and produces
 * a PreparedTrackEpisode ready for replayIncremental().
 *
 * @see docs/architecture/dsl-v2.md
 */

import type { TrackEpisodeIR, TrackEvent } from "@tokovo/ir";
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
  DEFAULT_AUDIO_STATE,
  DEFAULT_CAMERA_STATE,
  DEFAULT_OS_STATE,
  createScopedLogger,
} from "@tokovo/core";
import {
  compareEvents,
  createEventIndex,
  createKeyframedEventIndex,
  computeEventSignature,
  TokovoConfig,
} from "@tokovo/core";
import { lowerEpisodeWithCapabilities } from "./lowering.js";
import { validateV1RuntimeEpisode } from "./validation.js";
import {
  CompilerSchemaValidationError,
  RuntimeValidationError,
} from "./errors.js";
import { collectEpisodeAssetRefs } from "./asset-refs.js";
import {
  prepareInputProgram,
  type PreparedInputProgram,
} from "@tokovo/device-keyboard";
import {
  prepareNotificationProgram,
  type NotificationAppAdapter,
  type NotificationDeviceContextOperation,
  type PreparedNotificationActionEffect,
  type PreparedNotificationProgram,
} from "@tokovo/device-notifications";

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
  /** Immutable random-access program for every app-owned input field. */
  inputProgram: PreparedInputProgram;
  /** Immutable delivery, lifecycle, interaction and presentation program. */
  notificationProgram: PreparedNotificationProgram;
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

  const lowered = lowerEpisodeWithCapabilities(ir, plugins);

  // Build initial world state from device configs before capability preparation.
  const initialWorld = buildInitialWorld(ir, plugins);
  const inputProgram = buildInputProgram(ir);
  const notificationProgram = buildNotificationProgram(ir, plugins, lowered);
  const runtimeEvents = [
    ...lowered.events,
    ...lowerNotificationActionEffects(notificationProgram.actionEffects),
  ] as RuntimeEvent[];
  const sortedEvents = runtimeEvents
    .map((event, index) => ({ event, index }))
    .sort((a, b) => compareEvents(a.event, b.event, a.index, b.index))
    .map((entry) => entry.event);

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
    inputProgram,
    notificationProgram,
    plugins,
    assetRefs,
    metadata,
  };
}

function eventSequence(event: TrackEvent, index: number): number {
  return event._declarationOrder ?? index;
}

function buildNotificationDeviceOperations(
  ir: TrackEpisodeIR,
): NotificationDeviceContextOperation[] {
  const fallbackDeviceId = ir.devices[0]?.id;
  const operations: NotificationDeviceContextOperation[] = [];
  ir.events.forEach((event, index) => {
    if (event.kind !== "DEVICE" && event.kind !== "OS") return;
    const deviceId = event.deviceId ?? fallbackDeviceId;
    if (!deviceId) return;
    const base = { at: event.at, sequence: eventSequence(event, index), deviceId };
    if (event.kind === "DEVICE") {
      switch (event.type) {
        case "LOCK":
          operations.push({ ...base, type: "lock" });
          return;
        case "UNLOCK":
          operations.push({ ...base, type: "unlock" });
          return;
        case "OPEN_APP":
          operations.push({
            ...base,
            type: "openApp",
            appId: event.payload.appId,
          });
          return;
        case "CLOSE_APP":
        case "GO_HOME":
          operations.push({ ...base, type: "goHome" });
          return;
        default:
          return;
      }
    }
    if (event.type === "SET_DND") {
      operations.push({ ...base, type: "setDnd", enabled: event.payload.enabled });
    } else if (event.type === "SET_STATE" && event.payload.dnd !== undefined) {
      operations.push({ ...base, type: "setDnd", enabled: event.payload.dnd });
    }
  });
  return operations;
}

function buildNotificationProgram(
  ir: TrackEpisodeIR,
  plugins: TokovoPlugin[],
  lowered: ReturnType<typeof lowerEpisodeWithCapabilities>,
): PreparedNotificationProgram {
  const adapters = new Map<string, NotificationAppAdapter>();
  for (const plugin of plugins) {
    const adapter = (plugin as TokovoPlugin & {
      notificationAdapter?: NotificationAppAdapter;
    }).notificationAdapter;
    if (!adapter) continue;
    if (adapter.appId !== plugin.id) {
      throw new RuntimeValidationError(
        `[prepareTrackEpisode] notification adapter ${JSON.stringify(adapter.appId)} ` +
          `is attached to plugin ${JSON.stringify(plugin.id)}`,
      );
    }
    adapters.set(adapter.appId, adapter);
  }

  try {
    return prepareNotificationProgram({
      fps: ir.fps,
      durationInFrames: ir.durationInFrames,
      intents: [
        ...(ir.notificationIntents ?? []),
        ...lowered.notificationIntents,
      ],
      interactions: [
        ...(ir.notificationInteractions ?? []),
        ...lowered.notificationInteractions,
      ],
      devices: ir.devices.map((device) => ({
        id: device.id,
        platform: device.profile.includes("pixel") ? "android" : "ios",
        appearance: device.os?.appearance ?? device.appearance ?? "light",
        locale: device.os?.locale ?? "en-US",
        initialLocked: device.locked ?? false,
        initialDnd: device.os?.dnd ?? false,
        initialForegroundAppId: device.app,
      })),
      deviceOperations: buildNotificationDeviceOperations(ir),
      adapters,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new RuntimeValidationError(
      `[prepareTrackEpisode] notification preparation failed: ${message}`,
    );
  }
}

function lowerNotificationActionEffects(
  effects: readonly PreparedNotificationActionEffect[],
): RuntimeEvent[] {
  return effects.flatMap((effect) => {
    const events: RuntimeEvent[] = [];
    if (effect.target.navigation) {
      events.push({
        at: effect.at,
        kind: "DEVICE",
        type: "OPEN_APP",
        deviceId: effect.deviceId,
        _declarationOrder: effect.sequence,
        payload: {
          appId: effect.target.navigation.appId,
          route: effect.target.navigation.route,
          params: effect.target.navigation.params,
        },
      } as RuntimeEvent);
    }
    if (effect.target.appEvent) {
      const replyPayload =
        effect.replyText !== undefined
          ? { [effect.replyTextField ?? "replyText"]: effect.replyText }
          : {};
      events.push({
        at: effect.at,
        kind: "APP",
        appId: effect.target.appEvent.appId,
        deviceId: effect.deviceId,
        type: effect.target.appEvent.type,
        payload: {
          ...(effect.target.appEvent.payload ?? {}),
          ...replyPayload,
        },
      } as RuntimeEvent);
    }
    return events;
  });
}

function buildInputProgram(ir: TrackEpisodeIR): PreparedInputProgram {
  const intents = (ir.inputSessions ?? []).map((session) => {
    const device = ir.devices.find((candidate) => candidate.id === session.deviceId);
    if (!device) {
      throw new RuntimeValidationError(
        `[prepareTrackEpisode] input session ${JSON.stringify(session.id ?? session.fieldId)} ` +
          `targets unknown device ${JSON.stringify(session.deviceId)}`,
      );
    }

    const platform = device.profile.includes("pixel") ? "android" : "ios";
    return {
      ...session,
      fps: ir.fps,
      seed: session.seed ?? ir.seed,
      keyboard: {
        ...session.keyboard,
        platform: session.keyboard?.platform ?? platform,
        appearance:
          session.keyboard?.appearance ?? device.os?.appearance ?? device.appearance ?? "light",
        locale: session.keyboard?.locale ?? session.locale ?? "en-US",
      },
    };
  });

  try {
    return prepareInputProgram(intents);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new RuntimeValidationError(
      `[prepareTrackEpisode] input preparation failed: ${message}`,
    );
  }
}

// =============================================================================
// WORLD BUILDER
// =============================================================================

/**
 * Build initial WorldState from TrackEpisodeIR device configs.
 */
function buildInitialWorld(
  ir: TrackEpisodeIR,
  plugins: TokovoPlugin[],
): WorldState {
  const devices: Record<string, DeviceState> = {};
  for (const device of ir.devices) {
    const platform = device.profile.includes("pixel") ? "android" : "ios";
    const installedApps = device.installedApps ?? [];
    const hasHomeScreen =
      Boolean(device.homeScreen) || installedApps.length > 0;
    const authoredTime = device.os?.time;
    const clock =
      authoredTime instanceof Date
        ? authoredTime.getTime()
        : (authoredTime ?? DEFAULT_OS_STATE.clock);
    const network =
      device.os?.network === "none"
        ? "no-service"
        : (device.os?.network ?? DEFAULT_OS_STATE.network);
    const strength = device.os?.strength;

    devices[device.id] = {
      id: device.id,
      profileId: device.profile,
      foregroundAppId: device.app,
      isLocked: device.locked ?? false,
      platform,
      appTheme: device.theme,
      appAppearance: device.appearance,
      os: {
        ...DEFAULT_OS_STATE,
        locale: device.os?.locale ?? DEFAULT_OS_STATE.locale,
        appearance:
          device.os?.appearance ?? device.appearance ?? DEFAULT_OS_STATE.appearance,
        hourCycle: device.os?.hourCycle,
        lockScreenWallpaper: device.os?.lockScreenWallpaper,
        clock,
        battery: device.os?.battery ?? DEFAULT_OS_STATE.battery,
        charging: device.os?.charging ?? DEFAULT_OS_STATE.charging,
        network,
        wifiStrength:
          network === "wifi" && strength !== undefined
            ? strength
            : DEFAULT_OS_STATE.wifiStrength,
        cellStrength:
          network !== "wifi" && strength !== undefined
            ? strength
            : DEFAULT_OS_STATE.cellStrength,
        dnd: device.os?.dnd ?? DEFAULT_OS_STATE.dnd,
      },
      homeScreen: hasHomeScreen
        ? buildHomeScreenConfig({
            platform,
            installedApps:
              installedApps.length > 0 ? installedApps : [device.app],
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
      ...(DEFAULT_CAMERA_STATE.layout ?? {
        mode: "SINGLE",
        primaryDeviceId: firstDeviceId,
      }),
      primaryDeviceId: firstDeviceId,
    },
  };
  const audio = { ...DEFAULT_AUDIO_STATE };

  const pluginsById = new Map<string, TokovoPlugin>(
    plugins.map((p) => [p.id, p]),
  );

  const appState: Record<string, unknown> = {};
  const hydratedAppInstances = new Map<
    string,
    Array<{ deviceId: string; state: Record<string, unknown> }>
  >();
  const snapshotEntries = new Map<
    string,
    import("@tokovo/ir").AppSnapshotEntry
  >();
  const initialViewEntries = new Map<
    string,
    import("@tokovo/ir").AppInitialViewEntry
  >();

  for (const entry of ir.appSnapshots) {
    snapshotEntries.set(`${entry.appId}:${entry.deviceId}`, entry);
  }

  for (const entry of ir.initialViews) {
    initialViewEntries.set(`${entry.appId}:${entry.deviceId}`, entry);
  }

  const devicesById = new Map(ir.devices.map((device) => [device.id, device]));
  const bootstrapTargets = new Map<
    string,
    {
      appId: string;
      device: (typeof ir.devices)[number];
    }
  >();

  for (const device of ir.devices) {
    if (device.app) {
      bootstrapTargets.set(`${device.app}:${device.id}`, {
        appId: device.app,
        device,
      });
    }

    for (const appId of device.installedApps ?? []) {
      if (!pluginsById.has(appId)) {
        continue;
      }

      bootstrapTargets.set(`${appId}:${device.id}`, {
        appId,
        device,
      });
    }
  }

  for (const entry of [...ir.appSnapshots, ...ir.initialViews]) {
    const device = devicesById.get(entry.deviceId);
    if (!device) {
      continue;
    }
    bootstrapTargets.set(`${entry.appId}:${entry.deviceId}`, {
      appId: entry.appId,
      device,
    });
  }

  for (const { appId, device } of bootstrapTargets.values()) {
    const plugin = pluginsById.get(appId);
    const bootstrapKey = `${appId}:${device.id}`;
    const snapshot = snapshotEntries.get(bootstrapKey);
    const initialView = initialViewEntries.get(bootstrapKey);
    const baseState = (() => {
      try {
        const created = plugin?.createInitialState?.();
        if (created && typeof created === "object")
          return { ...(created as Record<string, unknown>) };
      } catch (e) {
        log.warn(`createInitialState failed for ${appId}`, {
          event: "compiler.create_initial_state_failed",
          appId,
          error:
            e instanceof Error
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

    const instances = hydratedAppInstances.get(appId) ?? [];
    instances.push({
      deviceId: device.id,
      state: hydrated as Record<string, unknown>,
    });
    hydratedAppInstances.set(appId, instances);
  }

  const appStateByDevice: Record<string, Record<string, unknown>> = {};
  for (const [appId, instances] of hydratedAppInstances) {
    if (instances.length === 1) {
      appState[appId] = instances[0].state;
      continue;
    }

    for (const instance of instances) {
      appStateByDevice[instance.deviceId] ??= {};
      appStateByDevice[instance.deviceId][appId] = instance.state;
    }
  }

  const worldState: WorldState = {
    devices,
    appState,
    ...(Object.keys(appStateByDevice).length > 0 ? { appStateByDevice } : {}),
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
  {
    match: { kind: "DEVICE", type: "LOCK" },
    action: "PLAY_ONE_SHOT",
    sound: "lock",
    bus: "sfx",
  },
  {
    match: { kind: "DEVICE", type: "UNLOCK" },
    action: "PLAY_ONE_SHOT",
    sound: "unlock",
    bus: "sfx",
  },
  {
    match: { kind: "DEVICE", type: "OPEN_APP" },
    action: "PLAY_ONE_SHOT",
    sound: "tap",
    bus: "ui",
  },
  {
    match: { kind: "DEVICE", type: "GO_HOME" },
    action: "PLAY_ONE_SHOT",
    sound: "tap",
    bus: "ui",
  },
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
        return { label: "WhatsApp", icon: "builtin" };
      case "app_x":
        return { label: "X", icon: "builtin" };
      case "app_instagram":
        return { label: "Instagram", icon: "builtin" };
      case "app_imessage":
        return { label: "Messages", icon: "builtin" };
      case "app_linkedin":
        return { label: "LinkedIn", icon: "builtin" };
      case "app_snapchat":
        return { label: "Snapchat", icon: "builtin" };
      case "app_teams":
        return { label: "Teams", icon: "builtin" };
      case "app_camera":
        return { label: "Camera", icon: "builtin" };
      default:
        return { label: appId.replace(/^app_/, ""), icon: "builtin" };
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
