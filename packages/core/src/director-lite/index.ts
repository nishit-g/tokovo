/**
 * DirectorLite
 *
 * Minimal, shippable camera director.
 * One baked style (ViralDramaV1), no framework.
 */

export * from "./types";
export { deriveDirectorEffects } from "./derive";
export type { DeriveContext } from "./derive";
export { extractSignals } from "./signals";
export { RULES, RULES_BY_SIGNAL } from "./rules";
export type { Rule } from "./rules";

