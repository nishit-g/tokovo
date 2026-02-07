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
  // Track which sound IDs were registered per app so unregister can be safe.
  // We register both:
  // - `${appId}:${soundId}` (plugin accessor usage)
  // - `soundId` (audio engine / global usage)
  //
  // Convention: sound IDs should be globally unique (e.g. `app_whatsapp.message_in`).
  const appOwned = new Map<string, Array<{ id: string; path: string }>>();

  return {
    register: registry.register,

    registerMany(sounds: Record<string, string>): void {
      Object.entries(sounds).forEach(([id, path]) =>
        registry.register(id, path),
      );
    },

    registerNamespaced(appId: string, sounds: Record<string, string>): void {
      const owned = appOwned.get(appId) ?? [];

      Object.entries(sounds).forEach(([id, p]) => {
        const namespacedId = `${appId}:${id}`;

        // Namespaced entry for plugin router accessors
        registry.register(namespacedId, p);

        // Also register the plain ID for engine-wide audio resolution.
        // This avoids the "double namespace" trap for IDs that already include app prefix.
        registry.register(id, p);

        owned.push({ id, path: p });
      });

      appOwned.set(appId, owned);
    },

    unregisterNamespaced(appId: string): void {
      const owned = appOwned.get(appId) ?? [];
      appOwned.delete(appId);

      // Remove the namespaced keys.
      const prefix = `${appId}:`;
      for (const key of registry.keys()) {
        if (key.startsWith(prefix)) {
          registry.delete(key);
        }
      }

      // Remove the plain keys only if they still map to the same path.
      // This avoids deleting a newer registration by another plugin/runtime.
      for (const { id, path: p } of owned) {
        if (registry.get(id) === p) {
          registry.delete(id);
        }
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
