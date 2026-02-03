/**
 * Auto-Sound Rules - Automatically derive sounds from app/device events
 *
 * Converts semantic events (MESSAGE_RECEIVED, TYPING_START) into sound cues or actions.
 * This is what makes the audio feel "automatic" and cinematic.
 */

import { TimelineEvent, SoundCue, AudioBus } from "../types";
import { createSoundCue, createUISoundCue } from "./mixer";

// =============================================================================
// TYPE GUARDS FOR EVENT PROPERTIES
// =============================================================================

type EventWithType = TimelineEvent & { type: string };
type EventWithAppId = TimelineEvent & { appId: string };
type EventWithFrom = TimelineEvent & { from: string };
type EventWithDeviceId = TimelineEvent & { deviceId: string };
type EventWithSilent = TimelineEvent & { silent: boolean };

function hasType(event: TimelineEvent): event is EventWithType {
  return (
    "type" in event &&
    typeof (event as Record<string, unknown>).type === "string"
  );
}

function hasAppId(event: TimelineEvent): event is EventWithAppId {
  return (
    "appId" in event &&
    typeof (event as Record<string, unknown>).appId === "string"
  );
}

function hasFrom(event: TimelineEvent): event is EventWithFrom {
  return (
    "from" in event &&
    typeof (event as Record<string, unknown>).from === "string"
  );
}

function hasDeviceId(event: TimelineEvent): event is EventWithDeviceId {
  return (
    "deviceId" in event &&
    typeof (event as Record<string, unknown>).deviceId === "string"
  );
}

function hasSilent(event: TimelineEvent): event is EventWithSilent {
  return (
    "silent" in event && (event as Record<string, unknown>).silent === true
  );
}

function getEventProperty<T>(event: TimelineEvent, key: string): T | undefined {
  return (event as Record<string, unknown>)[key] as T | undefined;
}

// =============================================================================
// TYPES
// =============================================================================

export type AutoSoundAction = "PLAY_ONE_SHOT" | "START_LOOP" | "STOP_SOUND";

export interface AutoSoundRule {
  // Match conditions
  match: {
    kind: string;
    type?: string;
    appId?: string;
    from?: string | "*"; // "*" = any sender
  };

  // Action config
  action: AutoSoundAction;

  // For PLAY/START action
  sound?: string;
  bus?: AudioBus;

  // For STOP action (references the ID created by START_LOOP)
  stopId?: string;

  // Dynamic ID Template (e.g., "typing_{conversationId}_{from}")
  // Useful for linking START and STOP actions
  idTemplate?: string;

  // Optional overrides
  volume?: number;
  loop?: boolean;
  // Dynamic Duration (e.g. for typing loops based on text length)
  durationFrom?: {
    key: string; // Event property to read (e.g. "text.length")
    factor?: number; // Multiplier (default 1)
    min?: number; // Minimum duration
  };
  duration?: number;
  duckMusic?: boolean;
  priority?: number;
}

// =============================================================================
// REGISTRY
// =============================================================================

export class AutoSoundRegistryClass {
  private rulesByKind = new Map<string, AutoSoundRule[]>();
  private rulesByAppId = new Map<string, AutoSoundRule[]>();
  private allRules: AutoSoundRule[] = [];

  register(newRules: AutoSoundRule[]) {
    for (const rule of newRules) {
      const kind = rule.match.kind;
      let kindRules = this.rulesByKind.get(kind);
      if (!kindRules) {
        kindRules = [];
        this.rulesByKind.set(kind, kindRules);
      }
      kindRules.push(rule);

      if (rule.match.appId) {
        let appRules = this.rulesByAppId.get(rule.match.appId);
        if (!appRules) {
          appRules = [];
          this.rulesByAppId.set(rule.match.appId, appRules);
        }
        appRules.push(rule);
      }
    }
    this.allRules.push(...newRules);
  }

  unregisterByAppId(appId: string): void {
    const appRules = this.rulesByAppId.get(appId) || [];
    for (const rule of appRules) {
      const kindRules = this.rulesByKind.get(rule.match.kind);
      if (kindRules) {
        const idx = kindRules.indexOf(rule);
        if (idx !== -1) kindRules.splice(idx, 1);
      }
      const allIdx = this.allRules.indexOf(rule);
      if (allIdx !== -1) this.allRules.splice(allIdx, 1);
    }
    this.rulesByAppId.delete(appId);
  }

  getRulesForKind(kind: string): AutoSoundRule[] {
    return this.rulesByKind.get(kind) || [];
  }

  getAll(): AutoSoundRule[] {
    return this.allRules;
  }

  clear() {
    this.rulesByKind.clear();
    this.rulesByAppId.clear();
    this.allRules = [];
  }
}

export function createAutoSoundRegistry(): AutoSoundRegistryClass {
  return new AutoSoundRegistryClass();
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a rule matches an event
 */
function matchesRule(event: TimelineEvent, rule: AutoSoundRule): boolean {
  if (event.kind !== rule.match.kind) {
    return false;
  }

  if (rule.match.type) {
    if (!hasType(event) || event.type !== rule.match.type) {
      return false;
    }
  }

  if (rule.match.appId) {
    if (!hasAppId(event) || event.appId !== rule.match.appId) {
      return false;
    }
  }

  if (rule.match.from) {
    if (!hasFrom(event)) {
      return false;
    }
    if (rule.match.from === "*") {
      if (event.from === "me") return false;
    } else if (event.from !== rule.match.from) {
      return false;
    }
  }

  return true;
}

/**
 * Resolve dynamic ID template
 */
function resolveIdTemplate(template: string, event: TimelineEvent): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = getEventProperty<string | number>(event, key);
    return value !== undefined ? String(value) : "unknown";
  });
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((o, key) => {
    if (o && typeof o === "object" && key in o) {
      return (o as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// =============================================================================
// DERIVATION FUNCTIONS
// =============================================================================

export interface AudioInstruction {
  action: AutoSoundAction;
  soundId?: string; // The asset ID
  instanceId?: string; // The runtime ID (for stopping)
  cue?: SoundCue; // The full cue object (for playing)
}

/**
 * Derive audio instructions from an event
 */
export function deriveAudioInstructions(
  event: TimelineEvent,
  rules: AutoSoundRule[] = [],
): AudioInstruction[] {
  const instructions: AudioInstruction[] = [];

  // Check SILENT override from DSL
  if (hasSilent(event)) {
    return [];
  }

  for (const rule of rules) {
    if (matchesRule(event, rule)) {
      // dynamic ID resolution
      const instanceId = rule.idTemplate
        ? resolveIdTemplate(rule.idTemplate, event)
        : rule.stopId // For STOP actions, use the target ID
          ? resolveIdTemplate(rule.stopId, event)
          : `auto_${event.at}_${rule.sound}`;

      if (rule.action === "STOP_SOUND") {
        instructions.push({
          action: "STOP_SOUND",
          instanceId: instanceId,
        });
        continue;
      }

      // For PLAY or START_LOOP
      if (!rule.sound) continue;

      // Calculate Duration
      let duration = rule.duration;
      if (rule.durationFrom) {
        const val = getNestedValue(
          event as Record<string, unknown>,
          rule.durationFrom.key,
        );
        if (typeof val === "number") {
          duration = Math.max(
            rule.durationFrom.min || 0,
            val * (rule.durationFrom.factor || 1),
          );
        } else if (typeof val === "string") {
          duration = Math.max(
            rule.durationFrom.min || 0,
            val.length * (rule.durationFrom.factor || 1),
          );
        }
      }

      const deviceId = hasDeviceId(event) ? event.deviceId : undefined;

      const baseCue = rule.duckMusic
        ? createUISoundCue(rule.sound, event.at, {
            volume: rule.volume,
            loop: rule.action === "START_LOOP" || rule.loop,
            duration: duration,
            priority: rule.priority,
            deviceId,
          })
        : createSoundCue(rule.sound, event.at, {
            bus: rule.bus || "sfx",
            volume: rule.volume,
            loop: rule.action === "START_LOOP" || rule.loop,
            duration: duration,
            priority: rule.priority,
            deviceId,
          });

      instructions.push({
        action: rule.action,
        soundId: rule.sound,
        instanceId: instanceId,
        cue: baseCue,
      });
    }
  }

  return instructions;
}
