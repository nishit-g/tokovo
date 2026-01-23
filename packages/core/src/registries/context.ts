import type { AppViewComponent } from "./app";

type RegistryMap<K extends string, V> = {
  register(key: K, value: V): void;
  get(key: K): V | undefined;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
  keys(): IterableIterator<K>;
  values(): IterableIterator<V>;
  entries(): IterableIterator<[K, V]>;
  size: number;
};

function createSimpleRegistry<V>(): RegistryMap<string, V> {
  const items = new Map<string, V>();
  return {
    register(key: string, value: V) {
      items.set(key, value);
    },
    get(key: string) {
      return items.get(key);
    },
    has(key: string) {
      return items.has(key);
    },
    delete(key: string) {
      return items.delete(key);
    },
    clear() {
      items.clear();
    },
    keys() {
      return items.keys();
    },
    values() {
      return items.values();
    },
    entries() {
      return items.entries();
    },
    get size() {
      return items.size;
    },
  };
}

export interface TokovoRuntimeContext {
  apps: RegistryMap<string, AppViewComponent>;
  sounds: RegistryMap<string, string>;
  layouts: RegistryMap<string, unknown>;
  reset(): void;
}

export function createRuntimeContext(): TokovoRuntimeContext {
  const apps = createSimpleRegistry<AppViewComponent>();
  const sounds = createSimpleRegistry<string>();
  const layouts = createSimpleRegistry<unknown>();

  return {
    apps,
    sounds,
    layouts,
    reset() {
      apps.clear();
      sounds.clear();
      layouts.clear();
    },
  };
}

let defaultContext: TokovoRuntimeContext | null = null;

export function getDefaultContext(): TokovoRuntimeContext {
  if (!defaultContext) {
    defaultContext = createRuntimeContext();
  }
  return defaultContext;
}

export function resetDefaultContext(): void {
  if (defaultContext) {
    defaultContext.reset();
  }
  defaultContext = null;
}
