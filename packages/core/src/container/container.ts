/**
 * TokovoContainer - Dependency Injection Container
 *
 * Provides isolated registry instances for testability and hot-reload safety.
 * The global container is exported for backward compatibility.
 *
 * @example
 * // Use global container (default behavior)
 * import { PluginManager, SoundRegistry } from "@tokovo/core";
 *
 * @example
 * // Create isolated container for testing
 * import { createContainer } from "@tokovo/core";
 * const container = createContainer();
 * container.plugins.register(MyPlugin);
 * // Test runs isolated from global state
 *
 * @example
 * // Reset all state (useful for hot-reload)
 * import { globalContainer } from "@tokovo/core";
 * globalContainer.reset();
 */

import { createRegistry, type Registry } from "../registries/factory";
import type { AppViewComponent } from "../registries/app";
import type { AppMetadata } from "../registries/metadata";
import type { LayoutStrategy } from "../registries/layout";
import type { AppBehavior } from "../registries/behavior";
import type { IconMetadata } from "../registries/icon";
import { createScopedLogger } from "../logger";

const log = createScopedLogger("container");

export interface SoundRegistryInterface {
  register(key: string, path: string): void;
  registerMany(sounds: Record<string, string>): void;
  registerNamespaced(appId: string, sounds: Record<string, string>): void;
  getPath(key: string): string | undefined;
  getNamespaced(appId: string, soundId: string): string | undefined;
  has(key: string): boolean;
  getAll(): Record<string, string>;
  keys(): string[];
  clear(): void;
  readonly size: number;
}

export interface LayoutRegistryInterface {
  register(key: string, strategy: LayoutStrategy): void;
  get(key: string): LayoutStrategy | undefined;
  has(key: string): boolean;
  keys(): string[];
  clear(): void;
  readonly size: number;
}

export interface TokovoContainer {
  readonly sounds: SoundRegistryInterface;
  readonly layouts: LayoutRegistryInterface;
  readonly apps: Registry<string, AppViewComponent>;
  readonly metadata: Registry<string, AppMetadata>;
  readonly behaviors: Registry<string, AppBehavior>;
  readonly icons: Registry<string, IconMetadata>;
  readonly widgets: Registry<string, React.ComponentType<unknown>>;

  reset(): void;
}

function createSoundRegistry(): SoundRegistryInterface {
  const registry = createRegistry<string, string>("Sound");

  return {
    register: registry.register,
    registerMany(sounds: Record<string, string>): void {
      Object.entries(sounds).forEach(([id, path]) =>
        registry.register(id, path),
      );
    },
    registerNamespaced(appId: string, sounds: Record<string, string>): void {
      Object.entries(sounds).forEach(([id, path]) => {
        registry.register(`${appId}:${id}`, path);
      });
    },
    getPath: registry.get,
    getNamespaced(appId: string, soundId: string): string | undefined {
      return registry.get(`${appId}:${soundId}`);
    },
    has: registry.has,
    getAll: registry.entries,
    keys: registry.keys,
    clear: registry.clear,
    get size() {
      return registry.size;
    },
  };
}

function createLayoutRegistry(): LayoutRegistryInterface {
  const registry = createRegistry<string, LayoutStrategy>("Layout");

  return {
    register(key: string, strategy: LayoutStrategy): void {
      if (registry.has(key)) {
        log.warn(`Overwriting layout for: ${key}`);
      }
      registry.register(key, strategy);
      log.debug(`Registered layout: ${key}`);
    },
    get: registry.get,
    has: registry.has,
    keys: registry.keys,
    clear: registry.clear,
    get size() {
      return registry.size;
    },
  };
}

export function createContainer(): TokovoContainer {
  const sounds = createSoundRegistry();
  const layouts = createLayoutRegistry();
  const apps = createRegistry<string, AppViewComponent>("App");
  const metadata = createRegistry<string, AppMetadata>("AppMetadata");
  const behaviors = createRegistry<string, AppBehavior>("Behavior");
  const icons = createRegistry<string, IconMetadata>("Icon");
  const widgets = createRegistry<string, React.ComponentType<unknown>>(
    "Widget",
  );

  return {
    sounds,
    layouts,
    apps,
    metadata,
    behaviors,
    icons,
    widgets,

    reset(): void {
      sounds.clear();
      layouts.clear();
      apps.clear();
      metadata.clear();
      behaviors.clear();
      icons.clear();
      widgets.clear();
    },
  };
}

export const globalContainer = createContainer();

export function resetGlobalContainer(): void {
  globalContainer.reset();
}
