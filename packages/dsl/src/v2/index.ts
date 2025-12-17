/**
 * V2 DSL - Track-based episode authoring
 *
 * BACKWARD COMPATIBILITY: This module re-exports from core.
 * New code should import from "@tokovo/dsl" directly.
 *
 * @deprecated Import from "@tokovo/dsl" instead
 */

// Re-export everything from core
export * from "../core";

// Re-export utilities
export {
    parseTimeToFrames,
    parseDurationToFrames,
    framesToSeconds,
    framesToTimeString,
} from "../utils";

