/**
 * Core Registries - Non-UI registries only
 *
 * @description Kept in @tokovo/core for headless/runtime usage.
 */

// Factory for creating type-safe registries
export { createRegistry } from "./factory";
export type { Registry } from "./factory";

// Sound Registry
export { createSoundRegistry } from "./sound";
export type { SoundRegistryAPI } from "./sound";

// Behavior Registry
export { createBehaviorRegistry } from "./behavior";
export type { CameraIntent, AppBehavior, BehaviorRegistryAPI } from "./behavior";
