/**
 * @tokovo/ir
 * 
 * Intermediate Representations for Tokovo DSL.
 * 
 * Two layers:
 * - Scene IR: Semantic truth (no frames, no platform)
 * - Timeline IR: Execution contract (frames, deterministic)
 */

// Trace model
export * from "./trace";

// Scene IR (semantic)
export * from "./scene";

// Timeline IR (execution)
export * from "./timeline";

// Ordering contract
export * from "./ordering";

// Validation
export * from "./validate";
