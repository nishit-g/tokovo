/**
 * Episode Registry
 * 
 * Global singleton for auto-discovery of episodes.
 * Episodes register themselves via defineEpisode().
 * 
 * @see docs-v2/EPISODE-ARCH.md
 */

import type { EpisodeDefinition } from "../types/episode-definition.js";

/**
 * Enterprise Episode Registry
 * 
 * Manages all registered episodes with filtering capabilities.
 */
export class EpisodeRegistry {
    private episodes: Map<string, EpisodeDefinition> = new Map();

    /**
     * Register an episode.
     * Called automatically by defineEpisode().
     */
    register(episode: EpisodeDefinition): void {
        if (this.episodes.has(episode.meta.id)) {
            console.warn(`[EpisodeRegistry] Overwriting: ${episode.meta.id}`);
        }
        this.episodes.set(episode.meta.id, episode);
        console.warn(`[EpisodeRegistry] ✓ Registered: ${episode.meta.id}`);
    }

    /**
     * Get all registered episodes.
     */
    all(): EpisodeDefinition[] {
        return Array.from(this.episodes.values());
    }

    /**
     * Snapshot the current registry contents.
     * Useful for multi-process rendering pipelines.
     */
    snapshot(): EpisodeDefinition[] {
        return this.all();
    }
    /**
     * Filter episodes by category or tags.
     */
    filter(opts?: { category?: string; tags?: string[] }): EpisodeDefinition[] {
        let episodes = this.all();

        if (opts?.category) {
            episodes = episodes.filter(e => e.meta.category === opts.category);
        }
        if (opts?.tags?.length) {
            const tags = opts.tags;
            episodes = episodes.filter(e =>
                tags.some(tag => e.meta.tags?.includes(tag))
            );
        }

        return episodes;
    }

    /**
     * Get a specific episode by ID.
     */
    get(id: string): EpisodeDefinition | undefined {
        return this.episodes.get(id);
    }

    /**
     * Check if an episode exists.
     */
    has(id: string): boolean {
        return this.episodes.has(id);
    }

    /**
     * Get count of registered episodes.
     */
    count(): number {
        return this.episodes.size;
    }

    /**
     * Clear all episodes (for testing).
     */
    clear(): void {
        this.episodes.clear();
    }
}

/**
 * Global episode registry singleton.
 */
export const episodeRegistry = new EpisodeRegistry();

/**
 * Create an explicit episode registry instance.
 * Prefer this for batch rendering or tests.
 */
export function createEpisodeRegistry(): EpisodeRegistry {
    return new EpisodeRegistry();
}

/**
 * Get a snapshot of the provided registry (or the global registry by default).
 */
export function getEpisodeRegistrySnapshot(
    registry: EpisodeRegistry = episodeRegistry,
): EpisodeDefinition[] {
    return registry.snapshot();
}
