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
export const EngineConfig = {
    /** Whether we're in development mode */
    devMode: typeof process !== "undefined" && process.env?.NODE_ENV !== "production",

    /** Log all events being processed (can be toggled at runtime) */
    get logEvents(): boolean {
        return (globalThis as any).__TOKOVO_LOG_EVENTS === true;
    },

    /** Log performance metrics (can be toggled at runtime) */
    get logPerformance(): boolean {
        return (globalThis as any).__TOKOVO_LOG_PERF === true;
    },
};
