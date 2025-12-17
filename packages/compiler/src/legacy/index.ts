/**
 * Legacy Beat-based Compiler
 *
 * DEPRECATED: Use V2 track-based compiler (prepareTrackEpisode).
 * This module compiles V1 beat-based SceneIR to TimelineIR.
 *
 * @deprecated
 */

// Context
export { CompilerContext, Cursor } from "./context";
export type { CompilerConfig } from "./context";

// Main entry point
export { compile } from "./compile";
export type { CompileResult, CompileOptions } from "./compile";

// Passes
export * from "./passes";
