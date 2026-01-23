/**
 * Sound Registry - Manages mapping between Sound IDs and file paths
 *
 * @description Uses createRegistry factory for DRY pattern.
 * Paths should be relative to the public/ folder.
 */

import { createRegistry } from "./factory";

const _registry = createRegistry<string, string>("Sound");

export const SoundRegistry = {
  register: _registry.register,

  registerMany(sounds: Record<string, string>): void {
    Object.entries(sounds).forEach(([id, path]) =>
      _registry.register(id, path),
    );
  },

  registerNamespaced(appId: string, sounds: Record<string, string>): void {
    Object.entries(sounds).forEach(([id, path]) => {
      const namespacedId = `${appId}:${id}`;
      _registry.register(namespacedId, path);
    });
  },

  getPath: _registry.get,

  getNamespaced(appId: string, soundId: string): string | undefined {
    return _registry.get(`${appId}:${soundId}`);
  },

  has: _registry.has,

  getAll: _registry.entries,

  keys: _registry.keys,

  clear: _registry.clear,

  get size() {
    return _registry.size;
  },
};
