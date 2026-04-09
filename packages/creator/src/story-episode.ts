import type {
  BackgroundConfigIR,
  DirectorStyle,
  TrackEpisodeConfig,
  VoiceScriptDefinition,
} from "@tokovo/ir";
import type {
  AudioTrackBuilder,
  CameraTrackBuilder,
  DeviceOptions,
  DeviceTrackBuilderV2,
  OSTrackBuilder,
  OverlayTrackBuilder,
  TrackBuilder,
  TrackFn,
} from "@tokovo/dsl";
import type {
  IMessageTrackBuilder,
} from "@tokovo/apps-imessage";
import type {
  SnapchatTrackBuilder,
} from "@tokovo/apps-snapchat";
import type {
  TeamsTrackBuilder,
} from "@tokovo/apps-teams";
import type {
  WhatsAppTrackBuilder,
} from "@tokovo/apps-whatsapp";
import type { XTrackBuilder } from "@tokovo/apps-x";
import {
  createPackRegistry,
  type AssetBucketName,
  type AssetPack,
  type DeviceKit,
  type PackRegistry,
  type PersonaPack,
  type StyleKit,
} from "@tokovo/packs";
import { episode, type CreatorEpisodeBuilder } from "./creator-episode.js";
import {
  resolveStoryKit,
  type CastMap,
  type ResolvedActor,
  type ResolvedDevice,
  type ResolvedStoryKit,
  type ResolvedStyle,
  type StoryDeviceOverride,
  type StoryKitConfig,
} from "./story-kit.js";

type PackRef<T extends { id: string }> = T | string;

export interface StoryPackUsage {
  registry?: PackRegistry;
  personas?: PackRef<PersonaPack>;
  assets?: PackRef<AssetPack>;
  styles?: PackRef<StyleKit>;
  devices?: PackRef<DeviceKit>;
  background?: StoryKitConfig["background"];
  appThemeDefaults?: StoryKitConfig["appThemeDefaults"];
}

export interface StoryLintInput {
  rawUsers?: ReadonlyArray<{
    name?: string;
    handle?: string;
    avatar?: string;
  }>;
}

type StoryEpisodeFluentMethodName =
  | "voice"
  | "device"
  | "director"
  | "background"
  | "camera"
  | "audio"
  | "overlay"
  | "os"
  | "deviceTrack"
  | "track"
  | "mark"
  | "section"
  | "use"
  | "whatsapp"
  | "imessage"
  | "snapchat"
  | "x"
  | "teams";

export interface StoryEpisodeBuilder
  extends Omit<CreatorEpisodeBuilder, StoryEpisodeFluentMethodName> {
  voice<T extends string>(
    script: VoiceScriptDefinition<T>,
    fn: Parameters<CreatorEpisodeBuilder["voice"]>[1],
  ): StoryEpisodeBuilder;
  director(style: DirectorStyle): StoryEpisodeBuilder;
  background(config: BackgroundConfigIR): StoryEpisodeBuilder;
  camera(fn: TrackFn<CameraTrackBuilder>): StoryEpisodeBuilder;
  audio(fn: TrackFn<AudioTrackBuilder>): StoryEpisodeBuilder;
  overlay(fn: TrackFn<OverlayTrackBuilder>): StoryEpisodeBuilder;
  os(fn: TrackFn<OSTrackBuilder>): StoryEpisodeBuilder;
  deviceTrack(
    deviceId: string,
    fn: TrackFn<DeviceTrackBuilderV2>,
  ): StoryEpisodeBuilder;
  track<T extends TrackBuilder>(
    trackId: string,
    factory: (() => T) | ((getOrder: () => number) => T),
    fn: TrackFn<T>,
  ): StoryEpisodeBuilder;
  mark(id: string, time: string | number): StoryEpisodeBuilder;
  section(
    id: string,
    start: string | number,
    end: string | number,
  ): StoryEpisodeBuilder;
  use(plugin: Parameters<CreatorEpisodeBuilder["use"]>[0]): StoryEpisodeBuilder;
  whatsapp(
    deviceId: string,
    conversationId: string,
    fn: TrackFn<WhatsAppTrackBuilder>,
  ): StoryEpisodeBuilder;
  imessage(
    deviceId: string,
    conversationId: string,
    fn: TrackFn<IMessageTrackBuilder>,
  ): StoryEpisodeBuilder;
  snapchat(
    deviceId: string,
    conversationId: string,
    fn: TrackFn<SnapchatTrackBuilder>,
  ): StoryEpisodeBuilder;
  x(deviceId: string, fn: TrackFn<XTrackBuilder>): StoryEpisodeBuilder;
  teams(deviceId: string, fn: TrackFn<TeamsTrackBuilder>): StoryEpisodeBuilder;
  usePacks(input: StoryPackUsage): StoryEpisodeBuilder;
  cast(entries: CastMap): StoryEpisodeBuilder;
  device(id: string): ResolvedDevice;
  device(id: string, overrides?: StoryDeviceOverride): StoryEpisodeBuilder;
  device(id: string, profile: string, options: DeviceOptions): StoryEpisodeBuilder;
  kit(): ResolvedStoryKit;
  actor(role: string): ResolvedActor;
  asset(alias: string, bucket?: AssetBucketName): string;
  style(appId: string): ResolvedStyle;
  lint(input?: StoryLintInput): readonly string[];
}

interface StoryState {
  registryOverride?: PackRegistry;
  personaPacks: Map<string, PersonaPack>;
  assetPacks: Map<string, AssetPack>;
  styleKits: Map<string, StyleKit>;
  deviceKits: Map<string, DeviceKit>;
  config: StoryKitConfig;
  resolved?: ResolvedStoryKit;
  backgroundSetExplicitly: boolean;
  applied: boolean;
}

function cloneMapValues<T>(map: Map<string, T>): T[] {
  return [...map.values()];
}

function upsertPack<T extends { id: string }>(
  ref: PackRef<T> | undefined,
  map: Map<string, T>,
  setSelectedId: (id: string) => void,
): void {
  if (!ref) return;
  if (typeof ref === "string") {
    setSelectedId(ref);
    return;
  }
  map.set(ref.id, ref);
  setSelectedId(ref.id);
}

function mergeDeviceOverride(
  current: StoryDeviceOverride | undefined,
  next: StoryDeviceOverride | undefined,
): StoryDeviceOverride {
  if (!current && !next) return {};
  if (!current) return { ...(next ?? {}) };
  if (!next) return { ...current };
  return {
    ...current,
    ...next,
    styleOverrides: {
      appThemes: {
        ...(current.styleOverrides?.appThemes ?? {}),
        ...(next.styleOverrides?.appThemes ?? {}),
      },
      appVisualModes: {
        ...(current.styleOverrides?.appVisualModes ?? {}),
        ...(next.styleOverrides?.appVisualModes ?? {}),
      },
      appStyles: {
        ...(current.styleOverrides?.appStyles ?? {}),
        ...(next.styleOverrides?.appStyles ?? {}),
      },
    },
  };
}

/**
 * High-level creator API for authoring with persona/asset/style/device packs.
 * It stays additive and compiles down to the existing EpisodeBuilder fields.
 */
export function storyEpisode(id: string, config: TrackEpisodeConfig): StoryEpisodeBuilder {
  const base = episode(id, config);
  const baseDevice = base.device.bind(base);
  const baseBuild = base.build.bind(base);
  const baseBackground = base.background.bind(base);

  const state: StoryState = {
    personaPacks: new Map(),
    assetPacks: new Map(),
    styleKits: new Map(),
    deviceKits: new Map(),
    config: {
      cast: {},
      devices: {},
    },
    backgroundSetExplicitly: false,
    applied: false,
  };

  const getRegistry = (): PackRegistry => {
    if (state.registryOverride) return state.registryOverride;
    return createPackRegistry({
      personaPacks: cloneMapValues(state.personaPacks),
      assetPacks: cloneMapValues(state.assetPacks),
      styleKits: cloneMapValues(state.styleKits),
      deviceKits: cloneMapValues(state.deviceKits),
    });
  };

  const invalidateResolved = (): void => {
    state.resolved = undefined;
  };

  const ensureResolved = (): ResolvedStoryKit => {
    if (state.resolved) return state.resolved;
    state.resolved = resolveStoryKit({
      config: state.config,
      registry: getRegistry(),
    });
    return state.resolved;
  };

  const applyResolved = (): void => {
    if (state.applied) return;
    const explicitDevices = (
      (base as unknown as { _devices?: unknown[] })._devices ?? []
    ).length > 0;
    if (explicitDevices) {
      // If the episode already authored concrete DSL devices, treat story-kit
      // devices as logical authoring inputs only. Auto-materializing them would
      // duplicate same-app devices in IR and stomp app-state during prepare().
      state.applied = true;
      return;
    }
    const resolved = ensureResolved();
    if (!state.backgroundSetExplicitly && resolved.background) {
      baseBackground(resolved.background);
    }
    for (const device of Object.values(resolved.devices)) {
      baseDevice(device.id, device.profile, {
        app: device.app,
        installedApps: device.installedApps ? [...device.installedApps] : undefined,
        homeScreen: device.homeScreen,
        screenRecording: device.screenRecording,
        theme: device.theme,
      });
    }
    state.applied = true;
  };

  const builder = base as unknown as StoryEpisodeBuilder;

  builder.usePacks = (input: StoryPackUsage): StoryEpisodeBuilder => {
    if (input.registry) {
      state.registryOverride = input.registry;
    }
    upsertPack(input.personas, state.personaPacks, (packId) => {
      state.config.personaPackId = packId;
    });
    upsertPack(input.assets, state.assetPacks, (packId) => {
      state.config.assetPackId = packId;
    });
    upsertPack(input.styles, state.styleKits, (packId) => {
      state.config.styleKitId = packId;
    });
    upsertPack(input.devices, state.deviceKits, (packId) => {
      state.config.deviceKitId = packId;
    });

    if (input.background !== undefined) {
      state.config.background = input.background;
    }
    if (input.appThemeDefaults) {
      state.config.appThemeDefaults = {
        ...(state.config.appThemeDefaults ?? {}),
        ...input.appThemeDefaults,
      };
    }
    invalidateResolved();
    return builder;
  };

  builder.cast = (entries: CastMap): StoryEpisodeBuilder => {
    const currentRoles = new Set(Object.keys(state.config.cast));
    for (const role of Object.keys(entries)) {
      if (currentRoles.has(role)) {
        throw new Error(
          `[StoryKit] Duplicate cast role "${role}" across merged cast state`,
        );
      }
    }
    state.config.cast = {
      ...state.config.cast,
      ...entries,
    };
    invalidateResolved();
    return builder;
  };

  function overloadedDevice(id: string): ResolvedDevice;
  function overloadedDevice(id: string, overrides?: StoryDeviceOverride): StoryEpisodeBuilder;
  function overloadedDevice(
    id: string,
    profile: string,
    options: DeviceOptions,
  ): StoryEpisodeBuilder;
  function overloadedDevice(
    id: string,
    arg1?: StoryDeviceOverride | string,
    arg2?: DeviceOptions,
  ): StoryEpisodeBuilder | ResolvedDevice {
    if (arguments.length === 1) {
      return ensureResolved().device(id);
    }
    if (typeof arg1 === "string" && arg2) {
      baseDevice(id, arg1, arg2);
      return builder;
    }
    state.config.devices = {
      ...state.config.devices,
      [id]: mergeDeviceOverride(state.config.devices[id], arg1 as StoryDeviceOverride),
    };
    invalidateResolved();
    return builder;
  }

  builder.device = overloadedDevice as StoryEpisodeBuilder["device"];

  builder.background = (backgroundConfig: BackgroundConfigIR): StoryEpisodeBuilder => {
    state.backgroundSetExplicitly = true;
    baseBackground(backgroundConfig);
    return builder;
  };

  builder.build = (() => {
    applyResolved();
    return baseBuild();
  }) as StoryEpisodeBuilder["build"];

  builder.kit = (): ResolvedStoryKit => ensureResolved();
  builder.actor = (role: string): ResolvedActor => ensureResolved().actor(role);
  builder.asset = (alias: string, bucket?: AssetBucketName): string =>
    ensureResolved().asset(alias, bucket);
  builder.style = (appId: string): ResolvedStyle => ensureResolved().style(appId);
  builder.lint = (input?: StoryLintInput): readonly string[] => {
    const warnings = [...ensureResolved().warnings];
    const rawUsers = input?.rawUsers ?? [];
    if (rawUsers.length > 0 && Object.keys(state.config.cast).length > 0) {
      const castActors = Object.values(ensureResolved().actors);
      for (const rawUser of rawUsers) {
        const match = castActors.find((actor) => {
          if (rawUser.handle && actor.handle === rawUser.handle) return true;
          if (rawUser.name && actor.name === rawUser.name) return true;
          if (rawUser.avatar && actor.avatar === rawUser.avatar) return true;
          return false;
        });
        if (match) {
          warnings.push(
            `[StoryKit][lint] Raw user object overlaps cast role "${match.role}". Prefer kit.actor("${match.role}")`,
          );
        }
      }
    }
    return warnings;
  };

  return builder;
}
