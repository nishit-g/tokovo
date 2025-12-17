/**
 * Engine Module - Public API
 * 
 * @description Exports handlers and utilities for the engine.
 * Note: Do NOT import this from engine.ts to avoid circular deps.
 */

// Config and Logger
export { EngineConfig } from "./config";
export { EngineLogger } from "./logger";

// Registry
export { ReducerRegistry } from "./registry";
export type { DeviceReducer, AppReducer, FeatureReducer } from "./registry";

// Handlers
export * from "./handlers";
