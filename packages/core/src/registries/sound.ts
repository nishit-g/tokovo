/**
 * Sound Registry - Manages mapping between Sound IDs and file paths
 *
 * @description Uses createRegistry factory for DRY pattern.
 * Paths should be relative to the public/ folder.
 */

import { createRegistry } from "./factory.js";

export interface SoundRegistryAPI {
  register(key: string, path: string): void;
  registerMany(sounds: Record<string, string>): void;
  registerNamespaced(appId: string, sounds: Record<string, string>): void;
  unregisterNamespaced(appId: string): void;
  getPath(key: string): string | undefined;
  getNamespaced(appId: string, soundId: string): string | undefined;
  has(key: string): boolean;
  getAll(): Record<string, string>;
  keys(): string[];
  clear(): void;
  readonly size: number;
}

export function createSoundRegistry(): SoundRegistryAPI {
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
        const namespacedId = `${appId}:${id}`;
        registry.register(namespacedId, path);
      });
    },

    unregisterNamespaced(appId: string): void {
      const keysToRemove: string[] = [];
      const prefix = `${appId}:`;
      for (const key of registry.keys()) {
        if (key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        registry.delete(key);
      }
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
