/**
 * Episode Definition Types
 * 
 * Type-safe definitions for the episode registry system.
 * 
 * @see docs-v2/EPISODE-ARCH.md
 */

import { z } from "zod";
import { episodeRegistry } from "../registry/episode-registry";
import type { TrackEpisodeIR } from "@tokovo/dsl/src/v2/types";

// =============================================================================
// FORMAT TYPES
// =============================================================================

/**
 * Predefined format identifiers.
 */
export type FormatId =
    | "1080x1920"
    | "1080x1920@60"
    | "1080x1080"
    | "1920x1080"
    | "3840x2160"
    | "iphone-16-pro"
    | "iphone-15"
    | "pixel-8";

/**
 * Custom format definition.
 */
export interface CustomFormat {
    width: number;
    height: number;
    fps: number;
}

// =============================================================================
// EPISODE META
// =============================================================================

/**
 * Episode metadata - describes the episode for UI and discovery.
 */
export interface EpisodeMeta {
    /** Unique ID (kebab-case, e.g., "whatsapp-drama") */
    id: string;

    /** Display title */
    title: string;

    /** Description of what this episode shows */
    description?: string;

    /** Category for organization */
    category: "production" | "showcase" | "test";

    /** Tags for filtering (e.g., ["whatsapp", "drama"]) */
    tags?: string[];

    /** Preview thumbnail path */
    thumbnail?: string;

    /** Author name */
    author?: string;

    /** Creation date */
    createdAt?: string;
}

// =============================================================================
// EPISODE CONFIG
// =============================================================================

/**
 * Episode configuration - video dimensions and requirements.
 */
export interface EpisodeConfig {
    /** Video format template or custom dimensions */
    format: FormatId | CustomFormat;

    /** Total duration in frames */
    durationInFrames: number;

    /** Required app plugins (e.g., ["app_whatsapp"]) */
    apps: string[];
}

// =============================================================================
// EPISODE DEFINITION
// =============================================================================

/**
 * Complete episode definition for the registry.
 */
export interface EpisodeDefinition {
    /** Episode metadata */
    meta: EpisodeMeta;

    /** Video configuration */
    config: EpisodeConfig;

    /** Build function that returns TrackEpisodeIR */
    build: () => TrackEpisodeIR;
}

// =============================================================================
// ZOD SCHEMAS (for validation)
// =============================================================================

export const EpisodeMetaSchema = z.object({
    id: z.string().regex(/^[a-z][a-z0-9-]*$/, "ID must be kebab-case"),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    category: z.enum(["production", "showcase", "test"]),
    tags: z.array(z.string()).optional(),
    thumbnail: z.string().optional(),
    author: z.string().optional(),
    createdAt: z.string().optional(),
});

export const EpisodeConfigSchema = z.object({
    format: z.union([
        z.enum(["1080x1920", "1080x1920@60", "1080x1080", "1920x1080", "3840x2160", "iphone-16-pro", "iphone-15", "pixel-8"]),
        z.object({
            width: z.number().positive(),
            height: z.number().positive(),
            fps: z.number().positive(),
        }),
    ]),
    durationInFrames: z.number().positive(),
    apps: z.array(z.string()),
});

export const EpisodeDefinitionSchema = z.object({
    meta: EpisodeMetaSchema,
    config: EpisodeConfigSchema,
    build: z.function(),
});

// =============================================================================
// DEFINE EPISODE HELPER
// =============================================================================

/**
 * Define and auto-register an episode.
 * 
 * This is the canonical way to create episodes. It:
 * 1. Validates the definition with Zod
 * 2. Auto-registers with the global registry
 * 3. Returns the definition for exports
 * 
 * @example
 * export default defineEpisode({
 *     meta: {
 *         id: "whatsapp-demo",
 *         title: "WhatsApp Demo",
 *         category: "production",
 *     },
 *     config: {
 *         format: "1080x1920",
 *         durationInFrames: 900,
 *         apps: ["app_whatsapp"],
 *     },
 *     build: () => episode("whatsapp-demo", { ... }).build(),
 * });
 */
export function defineEpisode(definition: EpisodeDefinition): EpisodeDefinition {
    // Validate at define-time
    const result = EpisodeDefinitionSchema.safeParse(definition);
    if (!result.success) {
        console.error(`[defineEpisode] Validation failed for "${definition.meta?.id}":`, result.error.issues);
        throw new Error(`Invalid episode definition: ${result.error.message}`);
    }

    // Auto-register with global registry
    episodeRegistry.register(definition);

    return definition;
}
