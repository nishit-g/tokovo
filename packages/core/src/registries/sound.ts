/**
 * Sound Registry - Manages mapping between Sound IDs and file paths
 * 
 * Enables apps to register their own sound assets dynamically.
 * Paths should be relative to the public/ folder (e.g., "sounds/myapp/alert.mp3").
 */

class SoundRegistryClass {
    private _paths = new Map<string, string>();

    /**
     * Register a sound ID to a file path
     * @param soundId Unique identifier (e.g., "whatsapp_sent")
     * @param path Relative path in public folder (e.g., "sounds/whatsapp/sent.mp3")
     */
    register(soundId: string, path: string): void {
        if (this._paths.has(soundId)) {
            console.warn(`[SoundRegistry] Overwriting sound path for: ${soundId}`);
        }
        this._paths.set(soundId, path);
    }

    /**
     * Register multiple sounds at once
     */
    registerMany(sounds: Record<string, string>): void {
        Object.entries(sounds).forEach(([id, path]) => this.register(id, path));
    }

    /**
     * Get the file path for a sound ID
     */
    getPath(soundId: string): string | undefined {
        return this._paths.get(soundId);
    }

    /**
     * Check if a sound is registered
     */
    has(soundId: string): boolean {
        return this._paths.has(soundId);
    }

    /**
     * Debug: Get all registered sounds
     */
    getAll(): Record<string, string> {
        return Object.fromEntries(this._paths);
    }
}

export const SoundRegistry = new SoundRegistryClass();
