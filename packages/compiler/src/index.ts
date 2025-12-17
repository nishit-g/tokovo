/**
 * @tokovo/compiler
 *
 * Episode compilation - converts DSL output to runtime events.
 *
 * V2 Track-based (RECOMMENDED):
 * ```ts
 * import { prepareTrackEpisode } from "@tokovo/compiler";
 * const ir = episode(...).build();
 * const prepared = prepareTrackEpisode(ir, plugins);
 * ```
 *
 * V1 Beat-based (DEPRECATED):
 * ```ts
 * import { compile } from "@tokovo/compiler";
 * const { timeline } = compile(sceneIR);
 * ```
 */

// =============================================================================
// V2 TRACK-BASED (RECOMMENDED)
// =============================================================================

export {
    prepareTrackEpisode,
    lowerTrackEvent,
    lowerTrackEvents,
    lowerEpisode,
    createLoweringContext,
} from "./v2";

export type {
    PreparedTrackEpisode,
    PluginLowering,
    LoweringContext,
} from "./v2";

// =============================================================================
// LEGACY (DEPRECATED)
// =============================================================================

// Re-export for backward compatibility
export { compile, CompilerContext, Cursor } from "./legacy";
export type { CompileResult, CompileOptions, CompilerConfig } from "./legacy";
export * from "./legacy/passes";
