/**
 * Legacy IR Module
 *
 * DEPRECATED: This module contains beat-based IR types.
 * Use the V2 track-based IR from "@tokovo/ir" instead.
 *
 * This module will be removed once all episodes have been
 * migrated to the track-based DSL.
 *
 * @deprecated Use track-based IR from "@tokovo/ir"
 */

// Semantic types
export * from "./semantic";

// Scene IR
export * from "./scene";

// Timeline IR
export * from "./timeline";

// Zod schemas
export * from "./schemas";
