/**
 * Engine Config - Runtime logging and debug flags.
 */

import { resolveLogProfile, type LogProfile } from "../logger/index.js";

interface TokovoGlobals {
  __TOKOVO_LOG_PROFILE?: LogProfile;
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

function readGlobalBoolean(value: boolean | undefined): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  return undefined;
}

function getResolvedProfile(): LogProfile | undefined {
  return resolveLogProfile(process.env?.TOKOVO_LOG_PROFILE ?? tokovoGlobals.__TOKOVO_LOG_PROFILE);
}

function getProfileFlagDefault(
  profile: LogProfile | undefined,
  key: "events" | "performance" | "audio",
): boolean | undefined {
  if (profile === "full") {
    return true;
  }

  if (profile === "quiet" || profile === "operator") {
    return false;
  }

  void key;
  return undefined;
}

function getProfileTimingThreshold(profile: LogProfile | undefined): number | undefined {
  if (profile === "full") {
    return 1;
  }

  if (profile === "operator") {
    return 8;
  }

  if (profile === "quiet") {
    return 16;
  }

  return undefined;
}

export const EngineConfig = {
  devMode:
    typeof process !== "undefined" && process.env?.NODE_ENV !== "production",

  get logEvents(): boolean {
    const profile = getResolvedProfile();
    return (
      parseBoolean(process.env?.TOKOVO_LOG_EVENTS) ??
      readGlobalBoolean(tokovoGlobals.__TOKOVO_LOG_EVENTS) ??
      getProfileFlagDefault(profile, "events") ??
      false
    );
  },

  get logPerformance(): boolean {
    const profile = getResolvedProfile();
    return (
      parseBoolean(process.env?.TOKOVO_LOG_PERF) ??
      readGlobalBoolean(tokovoGlobals.__TOKOVO_LOG_PERF) ??
      getProfileFlagDefault(profile, "performance") ??
      false
    );
  },

  get logAudio(): boolean {
    const profile = getResolvedProfile();
    return (
      parseBoolean(process.env?.TOKOVO_LOG_AUDIO) ??
      readGlobalBoolean(tokovoGlobals.__TOKOVO_LOG_AUDIO) ??
      getProfileFlagDefault(profile, "audio") ??
      false
    );
  },

  get timingThresholdMs(): number {
    const profile = getResolvedProfile();
    return (
      parseNumber(process.env?.TOKOVO_LOG_TIMING_THRESHOLD_MS) ??
      tokovoGlobals.__TOKOVO_LOG_TIMING_THRESHOLD_MS ??
      getProfileTimingThreshold(profile) ??
      1
    );
  },
};
