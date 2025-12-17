/**
 * @tokovo/compiler
 * 
 * Scene IR → Timeline IR transformation.
 * 
 * Usage:
 * ```ts
 * import { compile } from "@tokovo/compiler";
 * import { episode } from "@tokovo/dsl";
 * 
 * const sceneIR = episode("my-story", ep => { ... });
 * const { timeline, validation } = compile(sceneIR);
 * ```
 */

// Context
export { CompilerContext, CompilerConfig, Cursor } from "./context";

// Main entry point
export { compile, CompileResult, CompileOptions } from "./compile";

// Passes (for advanced usage)
export * from "./passes";

// V2 Track Episode Preparation
export { prepareTrackEpisode, PreparedTrackEpisode } from "./prepare-track";
