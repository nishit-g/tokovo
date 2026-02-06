import {
  createReducerRegistry,
  createEngineRegistries,
  type EngineRegistries,
  registerBuiltInSounds,
  DeviceAnchorProvider,
} from "@tokovo/core";
import {
  createPluginRegistries,
  type PluginRegistries,
} from "../plugin/registries.js";

export interface TokovoRegistries {
  engine: EngineRegistries;
  plugins: PluginRegistries;
}

export interface TokovoRegistriesOverrides {
  engine?: Partial<EngineRegistries>;
  plugins?: Partial<PluginRegistries>;
}

export function createTokovoRegistries(
  overrides: TokovoRegistriesOverrides = {},
): TokovoRegistries {
  const sharedReducers =
    overrides.engine?.reducers ??
    overrides.plugins?.reducers ??
    createReducerRegistry();

  const engine = createEngineRegistries({
    ...overrides.engine,
    reducers: sharedReducers,
  });
  const plugins = createPluginRegistries({
    ...overrides.plugins,
    reducers: sharedReducers,
  });

  registerBuiltInSounds(plugins.sounds);
  // Official device-owned anchors (device/app/keyboard/dynamicIsland/banner)
  plugins.anchors.register(DeviceAnchorProvider);

  return { engine, plugins };
}
