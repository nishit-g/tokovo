/**
 * Engine Config - Runtime logging and debug flags.
 */

interface TokovoGlobals {
  __TOKOVO_LOG_EVENTS?: boolean;
  __TOKOVO_LOG_PERF?: boolean;
  __TOKOVO_LOG_AUDIO?: boolean;
  __TOKOVO_LOG_TIMING_THRESHOLD_MS?: number;
}

const tokovoGlobals = globalThis as typeof globalThis & TokovoGlobals;

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (["1", "true", "yes", "on"].includes(value.toLowerCase())) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(value.toLowerCase())) {
    return false;
  }

  return undefined;
}

function parseNumber(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export const EngineConfig = {
  devMode:
    typeof process !== "undefined" && process.env?.NODE_ENV !== "production",

  get logEvents(): boolean {
    return (
      parseBoolean(process.env?.TOKOVO_LOG_EVENTS) ??
      (tokovoGlobals.__TOKOVO_LOG_EVENTS === true)
    );
  },

  get logPerformance(): boolean {
    return (
      parseBoolean(process.env?.TOKOVO_LOG_PERF) ??
      (tokovoGlobals.__TOKOVO_LOG_PERF === true)
    );
  },

  get logAudio(): boolean {
    return (
      parseBoolean(process.env?.TOKOVO_LOG_AUDIO) ??
      (tokovoGlobals.__TOKOVO_LOG_AUDIO === true)
    );
  },

  get timingThresholdMs(): number {
    return (
      parseNumber(process.env?.TOKOVO_LOG_TIMING_THRESHOLD_MS) ??
      tokovoGlobals.__TOKOVO_LOG_TIMING_THRESHOLD_MS ??
      1
    );
  },
};
