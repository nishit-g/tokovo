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

// Author API (high-level builders)
export * from "./author";

// Events API (low-level factories) - selective exports to avoid conflicts
export {
    keyboard,
    messages,
    camera,
    audioEvents,
    dsl,
    generateTyping,
    getTypingEndFrame,
    TYPING_SPEEDS,
    type TypingSpeed,
    type TypingOptions,
    type PlayOptions,
    type FadeOptions,
} from "./events";

// Renamed camera options to avoid conflicts with author/camera-builder
export type {
    ZoomOptions as EventZoomOptions,
    PanOptions as EventPanOptions,
    ShakeOptions as EventShakeOptions
} from "./events";
