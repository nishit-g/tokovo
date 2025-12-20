/**
 * @tokovo/episodes
 * 
 * Enterprise episode management with auto-discovery.
 * 
 * @example
 * // Create episodes using defineEpisode (auto-registers)
 * import { defineEpisode } from "@tokovo/episodes";
 * 
 * export default defineEpisode({
 *     meta: { id: "demo", title: "Demo", category: "production" },
 *     config: { format: "1080x1920", durationInFrames: 300, apps: [] },
 *     build: () => episode(...).build(),
 * });
 * 
 * // Access all registered episodes
 * import { episodeRegistry } from "@tokovo/episodes";
 * const all = episodeRegistry.all();
 * 
 * @see docs-v2/EPISODE-ARCH.md
 */

// =============================================================================
// REGISTRY (Auto-discovery)
// =============================================================================
export { episodeRegistry, EpisodeRegistry } from "./registry/index";

// =============================================================================
// TYPES & HELPERS
// =============================================================================
export { defineEpisode } from "./types/index";
export type {
    EpisodeMeta,
    EpisodeConfig,
    EpisodeDefinition,
    FormatId,
    CustomFormat,
} from "./types/index";
export {
    EpisodeMetaSchema,
    EpisodeConfigSchema,
    EpisodeDefinitionSchema,
} from "./types/index";

// =============================================================================
// FORMAT TEMPLATES
// =============================================================================
export {
    FORMATS,
    getFormat,
    listFormats,
    getFormatsByAspectRatio
} from "./templates/index";
export type { VideoFormat } from "./templates/index";

// =============================================================================
// SCHEMA (Zod validators for episode content)
// =============================================================================
export * from "./schema";

// =============================================================================
// LEGACY EPISODES
// =============================================================================
// Note: Legacy V1 episodes are NOT exported - they use old DSL patterns
// and will cause runtime errors. Access them directly if needed:
//   import { bakchodiGangEpisode } from "@tokovo/episodes/src/episodes/bakchodi-gang"
//
// To create new episodes, use the V2 pattern with defineEpisode():
//   import { defineEpisode } from "@tokovo/episodes";
