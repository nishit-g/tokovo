/**
 * Engine Logger - Structured logging for debugging
 *
 * @description Provides dev-mode logging that can be toggled at runtime.
 *
 * Usage in browser console:
 *   window.__TOKOVO_LOG_EVENTS = true;  // See all events
 *   window.__TOKOVO_LOG_PERF = true;    // See timing
 */

import { EngineConfig } from "./config";
import type { TimelineEvent } from "../types";

/**
 * Engine logger with runtime-toggleable output.
 */
export const EngineLogger = {
  /**
   * Log an event being processed.
   */
  event: (kind: string, type: string, frame: number): void => {
    if (EngineConfig.logEvents) {
      console.log(`[Engine:${frame}] ${kind}:${type}`);
    }
  },

  /**
   * Log performance timing.
   */
  perf: (label: string, ms: number): void => {
    if (EngineConfig.logPerformance) {
      console.log(`[Perf] ${label}: ${ms.toFixed(2)}ms`);
    }
  },

  /**
   * Log an error (always shown).
   */
  error: (msg: string, event?: TimelineEvent): void => {
    const eventType =
      event && "type" in event ? (event as { type?: string }).type : undefined;
    console.error(
      `[Engine Error] ${msg}`,
      event
        ? { frame: event.at, kind: event.kind, type: eventType }
        : undefined,
    );
  },

  /**
   * Log a warning (dev mode only).
   */
  warn: (msg: string): void => {
    if (EngineConfig.devMode) {
      console.warn(`[Engine] ${msg}`);
    }
  },
};
