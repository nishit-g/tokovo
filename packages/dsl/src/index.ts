/**
 * @tokovo/dsl
 * 
 * Author DSL for writing cinematic chat stories.
 * 
 * Usage:
 * ```ts
 * import { episode } from "@tokovo/dsl";
 * 
 * const sceneIR = episode("my-story", ep => {
 *   ep.device("Phone", d => {
 *     d.conversation("dm_alice")
 *     d.beat("intro", b => {
 *       b.receive("Alice", "Hey!")
 *     })
 *   })
 * })
 * ```
 */

// Types
export * from "./types";

// Author API
export * from "./author";
