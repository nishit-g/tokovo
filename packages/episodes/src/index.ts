/**
 * @tokovo/episodes
 *
 * Production episode management with explicit registration.
 *
 * @example
 * // Create episodes using defineEpisode (pure definition)
 * import { defineEpisode } from "@tokovo/episodes";
 *
 * export default defineEpisode({
 *     meta: { id: "demo", title: "Demo", category: "production" },
 *     config: { format: "1080x1920", durationInFrames: 300, apps: [] },
 *     build: () => episode(...).build(),
 * });
 *
 * // Register episodes into a registry in your runtime
 * import { createEpisodeRegistry } from "@tokovo/episodes";
 * const registry = createEpisodeRegistry();
 * registry.register(myEpisode);
 *
 * @see docs/architecture/episodes.md
 */

// =============================================================================
// REGISTRY
// =============================================================================
export {
  EpisodeRegistry,
  EpisodeRegistryDuplicateError,
  EpisodeRegistryValidationError,
  createEpisodeRegistry,
  getEpisodeRegistrySnapshot,
  validateEpisodeForRegistry,
} from "./registry/index.js";

// =============================================================================
// TYPES & HELPERS
// =============================================================================
export { defineEpisode } from "./types/index.js";
export type {
  EpisodeMeta,
  EpisodeCategory,
  EpisodeCatalogType,
  EpisodeVisibility,
  EpisodeConfig,
  EpisodeDefinition,
  FormatId,
  CustomFormat,
} from "./types/index.js";
export {
  EpisodeMetaSchema,
  EpisodeConfigSchema,
  EpisodeDefinitionSchema,
  SHOWCASE_CATALOG_TYPES,
  isShowcaseCatalogType,
  resolveEpisodeCatalogType,
  resolveEpisodeCategory,
} from "./types/index.js";
export {
  withEpisodeMeta,
} from "./catalog/index.js";
export {
  createEpisodeRegistryForProfile,
  createEpisodeRegistryForProfiles,
  createTokovoRuntime,
  createTokovoRuntime as createReleaseRuntime,
  getEpisodeCatalog,
  getEpisodeCatalogForProfiles,
  getSharedTokovoRuntime,
  registerTokovoPlugins,
  resolveCatalogProfile,
} from "./runtime-bootstrap.js";
export type { TokovoCatalogProfile, TokovoRuntime } from "./runtime-bootstrap.js";
export {
  releaseEpisodes,
  studioEpisodes,
} from "./runtime/catalogs/index.js";

// =============================================================================
// FORMAT TEMPLATES
// =============================================================================
export {
  FORMATS,
  getFormat,
  listFormats,
  getFormatsByAspectRatio,
} from "./templates/index.js";
export type { VideoFormat } from "./templates/index.js";

// =============================================================================
// SCHEMA (Zod validators for episode content)
// =============================================================================
export * from "./schema.js";

// =============================================================================
// DRY-RUN & VALIDATION
// =============================================================================
export {
  dryRun,
  formatDryRunResult,
  validateEpisode,
  validateEvents,
} from "./dry-run.js";
export type { DryRunResult, DryRunOptions } from "./dry-run.js";

// =============================================================================
// JSON SCHEMA EXPORT (For AI prompt documentation)
// =============================================================================
export {
  generateJsonSchemas,
  getEpisodeJsonSchema,
  getTimelineEventJsonSchema,
  formatSchemaForPrompt,
  generatePromptDocumentation,
} from "./json-schema.js";
export type { SchemaExport } from "./json-schema.js";
