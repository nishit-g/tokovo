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

// Validation (v4 architecture) - exported as namespace to avoid conflicts with passes/validate
export * as validators from "./validation";
export type { ValidationMode, Diagnostic, ValidationResult, PluginRegistry, AppCapability } from "./validation/scene-validator";

// ID Generator
export { createIdGenerator, shortHash, createShortId } from "./id-generator";
export type { IdGenerator } from "./id-generator";
