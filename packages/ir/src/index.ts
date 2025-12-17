/**
 * @tokovo/ir
 * 
 * Intermediate Representations for Tokovo DSL.
 * 
 * Three layers:
 * - Scene IR: Semantic truth (no frames, no platform)
 * - Timeline IR: Execution contract (frames, deterministic)
 * - Semantic: Story intelligence (mood, intensity, pacing)
 */

// Semantic types (import first - used by scene.ts)
export * from "./semantic";

// Trace model
export * from "./trace";
export * from "./schemas";

// Scene IR (semantic)
export * from "./scene";

// Timeline IR (execution)
export * from "./timeline";

// Ordering contract
export * from "./ordering";

// Validation
export * from "./validate";

// Narrative constraints
export * from "./constraints";

// =============================================================================
// V2 Track Types
// =============================================================================

// Track payloads (typed payload maps)
export * from "./track-payloads";

// Track events (typed event union)
export * from "./track-event";

// Track episode IR (DSL output)
export * from "./track-episode-ir";
