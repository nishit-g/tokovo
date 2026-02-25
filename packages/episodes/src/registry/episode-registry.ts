/**
 * Episode Registry
 *
 * Explicit registry used by runtimes (video-runner, studio, tests).
 * Episodes are pure definitions; registration must be explicit.
 *
 * @see docs-v2/EPISODE-ARCH.md
 */

import type { EpisodeDefinition } from "../types/episode-definition.js";
import { EpisodeDefinitionSchema } from "../types/episode-definition.js";

export class EpisodeRegistryDuplicateError extends Error {
    constructor(public readonly episodeId: string) {
        super(`Episode "${episodeId}" is already registered`);
        this.name = "EpisodeRegistryDuplicateError";
    }
}

export class EpisodeRegistryValidationError extends Error {
    constructor(
        public readonly episodeId: string,
        public readonly details: string,
    ) {
        super(`Episode "${episodeId}" failed registry validation: ${details}`);
        this.name = "EpisodeRegistryValidationError";
    }
}

export function validateEpisodeForRegistry(
    definition: EpisodeDefinition,
): EpisodeDefinition {
    const parsed = EpisodeDefinitionSchema.safeParse(definition);
    if (!parsed.success) {
        const id = definition.meta?.id ?? "<unknown>";
        throw new EpisodeRegistryValidationError(id, parsed.error.message);
    }
    return definition;
}

/**
 * Enterprise Episode Registry
 * 
 * Manages all registered episodes with filtering capabilities.
 */
export class EpisodeRegistry {
    private debug: boolean;
    private episodes: Map<string, EpisodeDefinition> = new Map();

    constructor(opts?: { debug?: boolean }) {
        this.debug = opts?.debug ?? false;
    }

    /**
     * Register an episode.
     * Called automatically by defineEpisode().
     */
    register(episode: EpisodeDefinition): void {
        const validated = validateEpisodeForRegistry(episode);
        if (this.episodes.has(validated.meta.id)) {
            throw new EpisodeRegistryDuplicateError(validated.meta.id);
        }
        this.episodes.set(validated.meta.id, validated);
        if (this.debug) {
            console.warn(`[EpisodeRegistry] ✓ Registered: ${validated.meta.id}`);
        }
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
 * Create an explicit episode registry instance.
 * Prefer this for batch rendering or tests.
 */
export function createEpisodeRegistry(): EpisodeRegistry {
    const debug =
        typeof process !== "undefined" &&
        process.env?.TOKOVO_EPISODE_REGISTRY_DEBUG === "1";
    return new EpisodeRegistry({ debug });
}

/**
 * Get a snapshot of the provided registry.
 */
export function getEpisodeRegistrySnapshot(
    registry: EpisodeRegistry,
): EpisodeDefinition[] {
    return registry.snapshot();
}
