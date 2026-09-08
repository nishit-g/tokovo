/**
 * Headless notification surface for compilers, render workers, and servers.
 *
 * Keep React painters out of this entry point. Consumers that render notification
 * UI should continue importing the package root (or the explicit `ui` entry).
 */
export * from "./contract/index.js";
export * from "./adapters/index.js";
export * from "./compile/index.js";
export * from "./runtime/index.js";
export * from "./projection/index.js";
export * from "./audio/index.js";
export * from "./theme/index.js";
