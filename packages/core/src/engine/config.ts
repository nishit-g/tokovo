/**
 * Engine Config - Runtime configuration and feature flags
 *
 * @description Provides dev mode toggles for logging and debugging.
 */

/**
 * Engine configuration.
 *
 * In development, you can override these via browser console:
 * - `window.__TOKOVO_LOG_EVENTS = true` - Log all processed events
 * - `window.__TOKOVO_LOG_PERF = true` - Log performance timing
 */
interface TokovoGlobals {
  __TOKOVO_LOG_EVENTS?: boolean;
  __TOKOVO_LOG_PERF?: boolean;
}

const tokovoGlobals = globalThis as typeof globalThis & TokovoGlobals;

export const EngineConfig = {
  devMode:
    typeof process !== "undefined" && process.env?.NODE_ENV !== "production",

  get logEvents(): boolean {
    return tokovoGlobals.__TOKOVO_LOG_EVENTS === true;
  },

  get logPerformance(): boolean {
    return tokovoGlobals.__TOKOVO_LOG_PERF === true;
  },
};
