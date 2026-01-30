import { createRegistry, Registry } from "./factory";
import type {
  AppReducer,
  DeviceReducer,
  FeatureReducer,
} from "../engine/registry";

export interface RegistryContainer {
  sound: Registry<string, string>;
  icon: Registry<string, string>;
  app: Registry<string, unknown>;
  behavior: Registry<string, unknown>;
  metadata: Registry<string, Record<string, unknown>>;
}

export interface ReducerContainer {
  device: DeviceReducer | null;
  app: Map<string, AppReducer>;
  feature: Map<string, FeatureReducer>;
  eventKindToAppId: Map<string, string>;
}

export interface TokovoContainer {
  registries: RegistryContainer;
  reducers: ReducerContainer;
}

function createDefaultRegistries(): RegistryContainer {
  return {
    sound: createRegistry<string, string>("Sound"),
    icon: createRegistry<string, string>("Icon"),
    app: createRegistry<string, unknown>("App"),
    behavior: createRegistry<string, unknown>("Behavior"),
    metadata: createRegistry<string, Record<string, unknown>>("Metadata"),
  };
}

function createDefaultReducers(): ReducerContainer {
  return {
    device: null,
    app: new Map(),
    feature: new Map(),
    eventKindToAppId: new Map(),
  };
}

let globalContainer: TokovoContainer | null = null;

export function getContainer(): TokovoContainer {
  if (!globalContainer) {
    globalContainer = {
      registries: createDefaultRegistries(),
      reducers: createDefaultReducers(),
    };
  }
  return globalContainer;
}

export function createScopedContainer(): TokovoContainer {
  return {
    registries: createDefaultRegistries(),
    reducers: createDefaultReducers(),
  };
}

export function setGlobalContainer(container: TokovoContainer): void {
  globalContainer = container;
}

export function resetGlobalContainer(): void {
  globalContainer = null;
}
