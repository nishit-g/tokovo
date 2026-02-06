/**
 * Engine Logger - Structured logging for debugging
 *
 * @description Provides dev-mode logging that can be toggled at runtime.
 *
 * Usage in browser console:
 *   window.__TOKOVO_LOG_EVENTS = true;  // See all events
 *   window.__TOKOVO_LOG_PERF = true;    // See timing
 */
/* eslint-disable no-console */

import { EngineConfig } from "./config.js";
import type { TimelineEvent } from "../types.js";
import type { AudioBus } from "../types.js";

export const EngineLogger = {
  event: (kind: string, type: string, frame: number): void => {
    if (EngineConfig.logEvents) {
      console.log(`[Engine:${frame}] ${kind}:${type}`);
    }
  },

  perf: (label: string, ms: number): void => {
    if (EngineConfig.logPerformance) {
      console.log(`[Perf] ${label}: ${ms.toFixed(2)}ms`);
    }
  },

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

  warn: (msg: string): void => {
    if (EngineConfig.devMode) {
      console.warn(`[Engine] ${msg}`);
    }
  },
};

export type PolicyDropReason =
  | "spam_gate"
  | "spam_softened"
  | "concurrency_limit"
  | "priority_too_low";

export interface PolicyDropEvent {
  soundId: string;
  bus: AudioBus;
  frame: number;
  reason: PolicyDropReason;
  alternateSound?: string;
  replacedBy?: string;
}

export const AudioLogger = {
  policyDrop: (event: PolicyDropEvent): void => {
    if (EngineConfig.logAudio) {
      const details = [
        `sound=${event.soundId}`,
        `bus=${event.bus}`,
        `frame=${event.frame}`,
        `reason=${event.reason}`,
      ];
      if (event.alternateSound) {
        details.push(`alternate=${event.alternateSound}`);
      }
      if (event.replacedBy) {
        details.push(`replacedBy=${event.replacedBy}`);
      }
      console.log(`[Audio:PolicyDrop] ${details.join(" ")}`);
    }
  },

  soundPathFallback: (soundId: string, resolvedPath: string): void => {
    if (EngineConfig.devMode) {
      console.warn(
        `[Audio:SoundPath] Unregistered sound "${soundId}" → fallback: ${resolvedPath}`,
      );
    }
  },

  play: (soundId: string, bus: AudioBus, frame: number): void => {
    if (EngineConfig.logAudio) {
      console.log(`[Audio:Play] ${soundId} on ${bus} at frame ${frame}`);
    }
  },

  stop: (soundId: string, frame: number): void => {
    if (EngineConfig.logAudio) {
      console.log(`[Audio:Stop] ${soundId} at frame ${frame}`);
    }
  },

  crossfade: (
    from: string,
    to: string,
    durationFrames: number,
    frame: number,
  ): void => {
    if (EngineConfig.logAudio) {
      console.log(
        `[Audio:Crossfade] ${from} → ${to} over ${durationFrames} frames at ${frame}`,
      );
    }
  },

  ducking: (
    targetBus: AudioBus,
    duckAmount: number,
    sourceBus: AudioBus,
    frame: number,
  ): void => {
    if (EngineConfig.logAudio) {
      console.log(
        `[Audio:Duck] ${targetBus} ducked to ${(duckAmount * 100).toFixed(0)}% by ${sourceBus} at frame ${frame}`,
      );
    }
  },
};
