/**
 * Sound Registry - Manages mapping between Sound IDs and file paths
 * 
 * @description Uses createRegistry factory for DRY pattern.
 * Paths should be relative to the public/ folder.
 */

import { createRegistry } from "./factory";

// Create the registry using factory
const _registry = createRegistry<string, string>("Sound");

/**
 * SoundRegistry - Maps sound IDs to file paths
 */
export const SoundRegistry = {
    /**
     * Register a sound ID to a file path
     * @param soundId Unique identifier (e.g., "whatsapp_sent")
     * @param path Relative path in public folder (e.g., "sounds/whatsapp/sent.mp3")
     */
    register: _registry.register,

    /**
     * Register multiple sounds at once
     */
    registerMany(sounds: Record<string, string>): void {
        Object.entries(sounds).forEach(([id, path]) => _registry.register(id, path));
    },

    /**
     * Get the file path for a sound ID
     */
    getPath: _registry.get,

    /**
     * Check if a sound is registered
     */
    has: _registry.has,

    /**
     * Get all registered sounds
     */
    getAll: _registry.entries,

    /**
     * Get all sound IDs
     */
    keys: _registry.keys,

    /**
     * Clear all sounds (for testing)
     */
    clear: _registry.clear,

    /**
     * Get count of registered sounds
     */
    get size() {
        return _registry.size;
    },
};
