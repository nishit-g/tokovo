/**
 * @tokovo/ir
 *
 * Intermediate Representations for Tokovo DSL.
 *
 * V2 Track-based IR (RECOMMENDED):
 * - TrackEvent: Typed track event union
 * - TrackEpisodeIR: Episode intermediate representation
 * - Payloads: Strongly-typed payload maps
 *
 * Legacy (DEPRECATED):
 * - SceneIR: Beat-based semantic IR
 * - TimelineOp: Timeline operations
 */

// =============================================================================
// TRACE (Always available)
// =============================================================================

export * from "./trace";

// =============================================================================
// V2 TRACK-BASED IR (RECOMMENDED)
// =============================================================================

export * from "./v2";

// =============================================================================
// UTILITIES
// =============================================================================

export * from "./utils";

// =============================================================================
// LEGACY (DEPRECATED - Will be removed in v3)
// =============================================================================

// Re-export legacy for backward compatibility
// These can be imported from "@tokovo/ir/legacy" when we add subpath exports
export * from "./legacy";
