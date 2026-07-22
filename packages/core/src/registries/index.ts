/**
 * Core Registries - Non-UI registries only
 *
 * @description Kept in @tokovo/core for headless/runtime usage.
 */

// Factory for creating type-safe registries
export { createRegistry } from "./factory.js";
export type { Registry } from "./factory.js";

// Sound Registry
export { createSoundRegistry } from "./sound.js";
export type { SoundRegistryAPI } from "./sound.js";
