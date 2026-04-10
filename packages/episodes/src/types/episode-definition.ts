/**
 * Episode Definition Types
 *
 * Type-safe definitions for the episode registry system.
 *
 * @see docs-v2/EPISODE-ARCH.md
 */

import { z } from "zod";
import {
  type EpisodeRegistry,
} from "../registry/episode-registry.js";
import type { TrackEpisodeIR } from "@tokovo/ir";

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
export type EpisodeCategory = "production" | "showcase" | "test";

export type EpisodeCatalogType =
  | "app_showcase_flagship"
  | "app_showcase_exhaustive"
  | "app_showcase_theme"
  | "system_showcase"
  | "story"
  | "test"
  | "legacy";

export type EpisodeVisibility = "public" | "internal";

export const SHOWCASE_CATALOG_TYPES = [
  "app_showcase_flagship",
  "app_showcase_exhaustive",
  "app_showcase_theme",
  "system_showcase",
] as const satisfies readonly EpisodeCatalogType[];

export interface EpisodeMeta {
  /** Unique ID (kebab-case, e.g., "whatsapp-drama") */
  id: string;

  /** Display title */
  title: string;

  /** Description of what this episode shows */
  description?: string;

  /**
   * Compatibility category used by older callers.
   * New catalog browsing should use `catalogType`.
   */
  category: EpisodeCategory;

  /** Canonical enterprise catalog type */
  catalogType?: EpisodeCatalogType;

  /** Primary app surfaced by the episode, when applicable */
  appId?: string;

  /** Theme identifier for theme-specific showcases */
  themeId?: string;

  /** Whether this episode belongs to the legacy migration catalog */
  isLegacy?: boolean;

  /** UI/runtime visibility hint */
  visibility?: EpisodeVisibility;

  /** Stable ordering inside a folder/catalog */
  sortOrder?: number;

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

export interface SegmentSchedule {
  segmentId: string;
  at: number;
  volume?: number;
  speed?: number;
}

export interface VoiceConfig {
  manifestPath: string;
  audioPath: string;
  startFrame?: number;
  volume?: number;
  usePerSegmentControl?: boolean;
  segmentSchedule?: SegmentSchedule[];
}

export interface EpisodeConfig {
  format: FormatId | CustomFormat;
  durationInFrames: number;
  apps: string[];
  voice?: VoiceConfig;
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
  catalogType: z
    .enum([
      "app_showcase_flagship",
      "app_showcase_exhaustive",
      "app_showcase_theme",
      "system_showcase",
      "story",
      "test",
      "legacy",
    ])
    .optional(),
  appId: z.string().optional(),
  themeId: z.string().optional(),
  isLegacy: z.boolean().optional(),
  visibility: z.enum(["public", "internal"]).optional(),
  sortOrder: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
  thumbnail: z.string().optional(),
  author: z.string().optional(),
  createdAt: z.string().optional(),
});

const SegmentScheduleSchema = z.object({
  segmentId: z.string(),
  at: z.number(),
  volume: z.number().min(0).max(1).optional(),
  speed: z.number().positive().optional(),
});

const VoiceConfigSchema = z.object({
  manifestPath: z.string(),
  audioPath: z.string(),
  startFrame: z.number().optional(),
  volume: z.number().min(0).max(1).optional(),
  usePerSegmentControl: z.boolean().optional(),
  segmentSchedule: z.array(SegmentScheduleSchema).optional(),
});

export const EpisodeConfigSchema = z.object({
  format: z.union([
    z.enum([
      "1080x1920",
      "1080x1920@60",
      "1080x1080",
      "1920x1080",
      "3840x2160",
      "iphone-16-pro",
      "iphone-15",
      "pixel-8",
    ]),
    z.object({
      width: z.number().positive(),
      height: z.number().positive(),
      fps: z.number().positive(),
    }),
  ]),
  durationInFrames: z.number().positive(),
  apps: z.array(z.string()),
  voice: VoiceConfigSchema.optional(),
});

export const EpisodeDefinitionSchema = z.object({
  meta: EpisodeMetaSchema,
  config: EpisodeConfigSchema,
  build: z.function(),
});

export function isShowcaseCatalogType(
  catalogType: EpisodeCatalogType,
): boolean {
  return (SHOWCASE_CATALOG_TYPES as readonly string[]).includes(catalogType);
}

export function resolveEpisodeCatalogType(
  meta: Pick<EpisodeMeta, "category" | "catalogType" | "appId" | "isLegacy">,
): EpisodeCatalogType {
  if (meta.catalogType) {
    return meta.catalogType;
  }

  if (meta.isLegacy) {
    return "legacy";
  }

  if (meta.category === "test") {
    return "test";
  }

  if (meta.category === "production") {
    return "story";
  }

  return meta.appId ? "app_showcase_flagship" : "system_showcase";
}

export function resolveEpisodeCategory(
  meta: Pick<EpisodeMeta, "category" | "catalogType" | "appId" | "isLegacy">,
): EpisodeCategory {
  const catalogType = resolveEpisodeCatalogType(meta);
  if (catalogType === "story") {
    return "production";
  }
  if (catalogType === "test") {
    return "test";
  }
  return "showcase";
}

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
export function defineEpisode(
  definition: EpisodeDefinition,
  options?: { registry?: EpisodeRegistry },
): EpisodeDefinition {
  // Validate at define-time
  const result = EpisodeDefinitionSchema.safeParse(definition);
  if (!result.success) {
    console.error(
      `[defineEpisode] Validation failed for "${definition.meta?.id}":`,
      result.error.issues,
    );
    throw new Error(`Invalid episode definition: ${result.error.message}`);
  }

  // Enterprise rule: definitions are pure by default.
  // Registration must be explicit via `options.registry` (e.g., app/runtime boot).
  if (options?.registry) {
    options.registry.register(definition);
  }

  return definition;
}
