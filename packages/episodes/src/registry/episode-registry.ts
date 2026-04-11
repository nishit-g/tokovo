/**
 * Episode Registry
 *
 * Explicit registry used by runtimes (video-runner, studio, tests).
 * Episodes are pure definitions; registration must be explicit.
 *
 * @see docs/architecture/episodes.md
 */

import type {
  EpisodeCategory,
  EpisodeCatalogType,
  EpisodeDefinition,
  EpisodeVisibility,
} from "../types/episode-definition.js";
import { createScopedLogger } from "@tokovo/core";
import {
  EpisodeDefinitionSchema,
  isShowcaseCatalogType,
  resolveEpisodeCatalogType,
  resolveEpisodeCategory,
} from "../types/episode-definition.js";

const log = createScopedLogger("app").withContext({
  event: "episode.registry",
});

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

export function validateEpisodeForRegistry(definition: EpisodeDefinition): EpisodeDefinition {
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
      log.debug(`Registered episode ${validated.meta.id}`, {
        episodeId: validated.meta.id,
        category: resolveEpisodeCategory(validated.meta),
        catalogType: resolveEpisodeCatalogType(validated.meta),
      });
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
  filter(opts?: {
    category?: EpisodeCategory;
    catalogType?: EpisodeCatalogType | EpisodeCatalogType[];
    appId?: string;
    visibility?: EpisodeVisibility | EpisodeVisibility[];
    tags?: string[];
  }): EpisodeDefinition[] {
    let episodes = this.all();

    if (opts?.category) {
      episodes = episodes.filter((e) => {
        const resolvedCategory = resolveEpisodeCategory(e.meta);
        if (opts.category === "showcase") {
          return isShowcaseCatalogType(resolveEpisodeCatalogType(e.meta));
        }
        return resolvedCategory === opts.category;
      });
    }
    if (opts?.catalogType) {
      const allowed = Array.isArray(opts.catalogType) ? opts.catalogType : [opts.catalogType];
      episodes = episodes.filter((e) => allowed.includes(resolveEpisodeCatalogType(e.meta)));
    }
    if (opts?.appId) {
      episodes = episodes.filter((e) => e.meta.appId === opts.appId);
    }
    if (opts?.visibility) {
      const allowed = Array.isArray(opts.visibility) ? opts.visibility : [opts.visibility];
      episodes = episodes.filter((e) => allowed.includes(e.meta.visibility ?? "public"));
    }
    if (opts?.tags?.length) {
      const tags = opts.tags;
      episodes = episodes.filter((e) => tags.some((tag) => e.meta.tags?.includes(tag)));
    }

    return episodes.sort((left, right) => {
      const sortLeft = left.meta.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const sortRight = right.meta.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (sortLeft !== sortRight) {
        return sortLeft - sortRight;
      }
      return left.meta.title.localeCompare(right.meta.title);
    });
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
    typeof process !== "undefined" && process.env?.TOKOVO_EPISODE_REGISTRY_DEBUG === "1";
  return new EpisodeRegistry({ debug });
}

/**
 * Get a snapshot of the provided registry.
 */
export function getEpisodeRegistrySnapshot(registry: EpisodeRegistry): EpisodeDefinition[] {
  return registry.snapshot();
}
