/**
 * prepareEpisode() - The Single Entry Point
 *
 * This is the ONLY way to create a CompiledEpisode.
 * It orchestrates: compile → lower → validate → package
 *
 * @see docs/FUCKING_MESS.md Section 3
 */

import {
  CompiledEpisode,
  PrepareOptions,
  AssetManifest,
} from "../types/compiled-episode";
import { RuntimeEvent } from "../types/runtime-event";
import { TokovoPluginContract } from "../types/plugin-contract";
import { createEventIndex } from "../utils/event-utils";
import {
  WorldState,
  DEFAULT_BASE_CAMERA_STATE as DEFAULT_BASE_CAMERA_STATE,
  DEFAULT_AUDIO_STATE,
  DEFAULT_OS_STATE,
} from "../types";
import { replay } from "../engine";

// Type for compile function (optional peer dependency)
interface CompileResult {
  timeline: { ops: RuntimeEvent[] };
}
type CompileFunction = (episode: EpisodeDefinition) => CompileResult;

// Compile function is injected at runtime or provided by caller
let compileEpisode: CompileFunction | null = null;

/**
 * Set the compile function for internal use.
 * Call this from the entry point that has access to @tokovo/compiler.
 */
export function setCompiler(compileFn: CompileFunction): void {
  compileEpisode = compileFn;
}

// =============================================================================
// PLUGIN REGISTRY
// =============================================================================

interface PluginRegistry {
  plugins: TokovoPluginContract[];
  byId: Map<string, TokovoPluginContract>;
}

function buildPluginRegistry(plugins: TokovoPluginContract[]): PluginRegistry {
  const byId = new Map<string, TokovoPluginContract>();
  for (const plugin of plugins) {
    byId.set(plugin.id, plugin);
  }
  return { plugins, byId };
}

// =============================================================================
// DERIVE INITIAL WORLD
// =============================================================================

interface DeviceDefinition {
  id: string;
  platform?: "ios" | "android";
  appId?: string;
  profileId?: string;
  theme?: string;
  conversations?: Array<{
    id: string;
    name?: string;
    type?: "dm" | "group";
    avatar?: string;
  }>;
}

interface SceneIRLike {
  id: string;
  fps?: number;
  durationInFrames?: number;
  devices?: DeviceDefinition[];
}

/**
 * Derive initial world state from scene definition
 */
export function deriveInitialWorld(
  sceneIR: SceneIRLike,
  registry: PluginRegistry,
): WorldState {
  const world: WorldState = {
    devices: {},
    appState: {},
    camera: { ...DEFAULT_BASE_CAMERA_STATE },
    audio: { ...DEFAULT_AUDIO_STATE },
    touches: [],
  };

  for (const deviceDef of sceneIR.devices || []) {
    const appId = deviceDef.appId;

    world.devices[deviceDef.id] = {
      id: deviceDef.id,
      profileId: deviceDef.profileId || deviceDef.id,
      isLocked: false,
      foregroundAppId: appId || undefined,
      notifications: [],
      os: { ...DEFAULT_OS_STATE },
      appTheme: deviceDef.theme,
    };

    if (appId) {
      if (!world.appState[appId]) {
        world.appState[appId] = { conversations: {} };
      }
      const appState = world.appState[appId] as {
        conversations: Record<
          string,
          {
            id: string;
            name: string;
            type: string;
            avatar?: string;
            messages: unknown[];
            typing: Record<string, unknown>;
          }
        >;
      };

      for (const convDef of deviceDef.conversations || []) {
        appState.conversations[convDef.id] = {
          id: convDef.id,
          name: convDef.name || convDef.id,
          type: convDef.type || "dm",
          avatar: convDef.avatar,
          messages: [],
          typing: {},
        };
      }
    }

    for (const plugin of registry.plugins) {
      if (plugin.createInitialState) {
        if (!world.appState[deviceDef.id]) {
          world.appState[deviceDef.id] = {};
        }
        const deviceAppState = world.appState[deviceDef.id] as Record<
          string,
          unknown
        >;
        deviceAppState[plugin.id] = plugin.createInitialState();
      }
    }
  }

  // Set camera to first device
  const deviceIds = Object.keys(world.devices);
  if (deviceIds.length > 0) {
    world.camera.activeDeviceId = deviceIds[0];
    world.camera.layout = { mode: "SINGLE", primaryDeviceId: deviceIds[0] };
  }

  return world;
}

// =============================================================================
// SORT EVENTS
// =============================================================================

const EVENT_KIND_PRIORITY: Record<string, number> = {
  DEVICE: 1,
  APP: 2,
  CAMERA: 3,
  AUDIO: 4,
  KEYBOARD: 5,
};

function sortEvents(events: RuntimeEvent[]): RuntimeEvent[] {
  return [...events].sort((a, b) => {
    // 1. Sort by frame
    if (a.at !== b.at) return a.at - b.at;

    // 2. Sort by kind priority
    const priorityA = EVENT_KIND_PRIORITY[a.kind] || 10;
    const priorityB = EVENT_KIND_PRIORITY[b.kind] || 10;
    return priorityA - priorityB;
  });
}

// =============================================================================
// VALIDATE
// =============================================================================

interface ValidationError {
  type: "error" | "warning";
  message: string;
  eventIndex?: number;
}

function validateEpisode(
  episode: Pick<CompiledEpisode, "events" | "initialWorld">,
  options: PrepareOptions,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check events are sorted
  for (let i = 1; i < episode.events.length; i++) {
    if (episode.events[i].at < episode.events[i - 1].at) {
      errors.push({
        type: "error",
        message: `Events not sorted: event ${i} at frame ${episode.events[i].at} comes before event ${i - 1} at frame ${episode.events[i - 1].at}`,
        eventIndex: i,
      });
    }
  }

  // Check all events have required fields
  for (let i = 0; i < episode.events.length; i++) {
    const e = episode.events[i];
    if (typeof e.at !== "number") {
      errors.push({
        type: "error",
        message: `Event ${i} missing 'at' field`,
        eventIndex: i,
      });
    }
    if (!e.kind) {
      errors.push({
        type: "error",
        message: `Event ${i} missing 'kind' field`,
        eventIndex: i,
      });
    }
  }

  // In strict mode, throw on errors
  if (options.strict && errors.some((e) => e.type === "error")) {
    const errorMessages = errors
      .filter((e) => e.type === "error")
      .map((e) => e.message);
    throw new Error(`Episode validation failed:\n${errorMessages.join("\n")}`);
  }

  return errors;
}

// =============================================================================
// COLLECT ASSETS
// =============================================================================

function collectAssets(registry: PluginRegistry): AssetManifest {
  const sounds: Record<string, string> = {};
  const icons: Record<string, string> = {};
  const images: Record<string, string> = {};

  for (const plugin of registry.plugins) {
    if (plugin.assets?.sounds) {
      for (const [id, path] of Object.entries(plugin.assets.sounds)) {
        sounds[`${plugin.id}.${id}`] = path;
      }
    }
    if (plugin.assets?.icons) {
      for (const [id, path] of Object.entries(plugin.assets.icons)) {
        icons[`${plugin.id}.${id}`] = path;
      }
    }
    if (plugin.assets?.images) {
      for (const [id, path] of Object.entries(plugin.assets.images)) {
        images[`${plugin.id}.${id}`] = path;
      }
    }
  }

  return { sounds, icons, images };
}

// =============================================================================
// VALIDATE ASSETS
// =============================================================================

interface AssetValidationResult {
  valid: boolean;
  missing: Array<{
    type: "sound" | "icon" | "image";
    id: string;
    path: string;
  }>;
  warnings: string[];
}

/**
 * Validate that all declared assets exist
 *
 * In preview mode: logs warnings for missing assets
 * In render mode with strict: throws error if assets missing
 */
function _validateAssets(
  assets: AssetManifest,
  options: PrepareOptions,
): AssetValidationResult {
  const missing: AssetValidationResult["missing"] = [];
  const warnings: string[] = [];

  // Check sounds
  for (const [id, path] of Object.entries(assets.sounds || {})) {
    // Basic path validation - in browser, we can't check file existence
    // But we can validate path format
    if (!path || typeof path !== "string") {
      missing.push({ type: "sound", id, path: path ?? "undefined" });
    } else if (!path.startsWith("/") && !path.startsWith("http")) {
      warnings.push(`Sound '${id}' has invalid path format: ${path}`);
    }
  }

  // Check icons
  for (const [id, path] of Object.entries(assets.icons || {})) {
    if (!path || typeof path !== "string") {
      missing.push({ type: "icon", id, path: path ?? "undefined" });
    }
  }

  // Check images
  for (const [id, path] of Object.entries(assets.images || {})) {
    if (!path || typeof path !== "string") {
      missing.push({ type: "image", id, path: path ?? "undefined" });
    }
  }

  // Log warnings in preview mode
  if (missing.length > 0 || warnings.length > 0) {
    if (options.mode === "preview") {
      for (const m of missing) {
        console.warn(`[Asset] Missing ${m.type}: ${m.id} (${m.path})`);
      }
      for (const w of warnings) {
        console.warn(`[Asset] ${w}`);
      }
    } else if (options.strict && missing.length > 0) {
      // In render mode with strict, throw error
      throw new Error(
        `Missing assets:\\n${missing.map((m) => `  ${m.type}: ${m.id}`).join("\\n")}`,
      );
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

// =============================================================================
// PREPARE EPISODE
// =============================================================================

/**
 * EpisodeDefinition - DSL episode output (from episode() call)
 */
export interface EpisodeDefinition {
  episodeId: string;
  fps?: number;
  durationInFrames?: number;
  devices: Array<{
    deviceId: string;
    platform?: "ios" | "android";
    appId?: string;
    profileId?: string;
    conversations?: Array<{
      id: string;
      name?: string;
      type?: "dm" | "group";
      avatar?: string;
    }>;
    beats?: Array<{
      id?: string;
      at?: number;
      duration?: number;
      type?: string;
    }>;
  }>;
}

/**
 * prepareEpisode - The single entry point for creating a CompiledEpisode
 *
 * Accepts EpisodeDefinition (from DSL) and compiles it.
 *
 * @param input - Episode definition from DSL
 * @param plugins - Array of plugins to register
 * @param options - Prepare options
 * @returns CompiledEpisode ready for rendering
 */
export function prepareEpisode(
  input: EpisodeDefinition,
  plugins: TokovoPluginContract[] = [],
  options: PrepareOptions = {},
): CompiledEpisode {
  const { strict = true, mode = "preview", includeDebug = true } = options;
  const effectiveOptions = { ...options, strict, mode };

  // 1. Build plugin registry
  const registry = buildPluginRegistry(plugins);

  // 2. Compile episode
  if (!compileEpisode) {
    throw new Error(
      "[prepareEpisode] @tokovo/compiler not available. " +
        "Call setCompiler() from entry point that has access to @tokovo/compiler.",
    );
  }

  const { timeline } = compileEpisode(input);

  const sceneIR: SceneIRLike = {
    id: input.episodeId,
    fps: input.fps,
    durationInFrames: input.durationInFrames,
    devices: input.devices.map((d) => ({
      id: d.deviceId,
      platform: d.platform,
      appId: d.appId,
      profileId: d.profileId,
      conversations: d.conversations,
    })),
  };

  // 3. Create initial world
  const initialWorld = deriveInitialWorld(sceneIR, registry);

  // 4. Sort events
  const rawEvents = timeline.ops as RuntimeEvent[];
  const sortedEvents = sortEvents(rawEvents);

  // 5. Validate
  validateEpisode({ events: rawEvents, initialWorld }, effectiveOptions);

  // 6. Collect assets
  const assets = collectAssets(registry);
  _validateAssets(assets, effectiveOptions);

  // 7. Build compiled episode with event index for O(1) lookups
  const compiled: CompiledEpisode = {
    id: input.episodeId,
    durationInFrames: input.durationInFrames || 600,
    fps: input.fps || 30,
    initialWorld,
    events: sortedEvents,
    eventIndex: createEventIndex(sortedEvents),
    assets,
  };

  // 8. Add debug info
  if (includeDebug) {
    compiled.debug = {
      buildTimestamp: Date.now(),
      sourceEpisodeId: input.episodeId,
    };
  }

  return compiled;
}

// =============================================================================
// RUN EPISODE
// =============================================================================

export interface RunOptions {
  mode: "preview" | "render";
  registries: import("../engine/registries").EngineRegistries;
  onError?: (error: Error, event: RuntimeEvent) => void;
}

/**
 * run - Apply events up to frame and return world state
 *
 * @param episode - CompiledEpisode from prepareEpisode()
 * @param frame - Current frame number
 * @param options - Run options
 * @returns WorldState at the given frame
 */
export function runEpisode(
  episode: CompiledEpisode,
  frame: number,
  options: RunOptions,
): WorldState {
  // Run replay with events - let replay() handle the filtering
  // RuntimeEvent is compatible with TimelineEvent by design
  return replay(
    episode.initialWorld,
    episode.events,
    frame,
    { mode: options.mode, registries: options.registries },
    episode.eventIndex,
  );
}

export const __test__ = {
  collectAssets,
  validateAssets: _validateAssets,
  sortEvents,
};

// =============================================================================
// RE-EXPORT TYPES
// =============================================================================

export type {
  CompiledEpisode,
  PrepareOptions,
  AssetManifest,
} from "../types/compiled-episode";
export type {
  RuntimeEvent,
  AppRuntimeEvent,
  DeviceRuntimeEvent,
  CameraRuntimeEvent,
  AudioRuntimeEvent,
  KeyboardRuntimeEvent,
} from "../types/runtime-event";
