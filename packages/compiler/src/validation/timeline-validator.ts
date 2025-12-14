/**
 * Timeline Validation Pass
 *
 * Validates TimelineIR after compilation, before lowering.
 * Catches issues like missing actors, negative frames, frame overflow.
 *
 * @module @tokovo/compiler/validation/timeline-validator
 */

import type { ValidationMode, Diagnostic, ValidationResult } from "./scene-validator";

// Local helpers
function error(code: string, message: string, opts?: Partial<Diagnostic>): Diagnostic {
    return { code, message, severity: "error", ...opts };
}

function warning(code: string, message: string, opts?: Partial<Diagnostic>): Diagnostic {
    return { code, message, severity: "warning", ...opts };
}

function categorize(diagnostics: Diagnostic[]): ValidationResult {
    const errors = diagnostics.filter((d) => d.severity === "error");
    const warnings = diagnostics.filter((d) => d.severity === "warning");
    const infos = diagnostics.filter((d) => d.severity === "info");
    return { valid: errors.length === 0, errors, warnings, infos };
}

// =============================================================================
// TIMELINE IR TYPES
// =============================================================================

export interface TimelineIRForValidation {
    episodeId: string;
    fps: number;
    durationInFrames: number;
    actors: { id: string }[];
    ops: TimelineOpForValidation[];
}

export interface TimelineOpForValidation {
    at: number;
    kind: string;
    fromId?: string;
    duration?: number;
    trace: {
        episodeId: string;
        deviceId: string;
        beatName: string;
        opIndex: number;
    };
}

// Actor registry interface
export interface ActorRegistry {
    has(id: string): boolean;
}

// =============================================================================
// TIMELINE VALIDATION
// =============================================================================

export function validateTimeline(
    timeline: TimelineIRForValidation,
    actors: ActorRegistry,
    mode: ValidationMode
): ValidationResult {
    const diagnostics: Diagnostic[] = [];
    const seenIds = new Set<string>();
    const timelineActorIds = new Set(timeline.actors.map((a) => a.id));

    for (const op of timeline.ops) {
        if (op.fromId && !timelineActorIds.has(op.fromId) && !actors.has(op.fromId)) {
            diagnostics.push(
                error("MISSING_ACTOR", `Actor "${op.fromId}" not in actor registry`, {
                    trace: op.trace,
                    hint: `Register the actor with episode.actor("${op.fromId}", { displayName: "..." })`,
                })
            );
        }

        if (op.at < 0) {
            diagnostics.push(
                error("NEGATIVE_FRAME", `Operation at negative frame: ${op.at}`, {
                    trace: op.trace,
                    hint: "Check duration calculations in beats",
                })
            );
        }

        if (op.at > timeline.durationInFrames) {
            diagnostics.push(
                warning(
                    "FRAME_OVERFLOW",
                    `Operation at frame ${op.at} exceeds duration ${timeline.durationInFrames}`,
                    {
                        trace: op.trace,
                        hint: "Increase episode duration or shorten beats",
                    }
                )
            );
        }

        if ("id" in op && typeof (op as any).id === "string") {
            const id = (op as any).id;
            if (seenIds.has(id)) {
                diagnostics.push(
                    error("DUPLICATE_ID", `Duplicate ID: ${id}`, {
                        trace: op.trace,
                        hint: "Ensure IdGenerator produces unique IDs",
                    })
                );
            }
            seenIds.add(id);
        }
    }

    return categorize(diagnostics);
}

export function validateDeterministicTiming(
    timeline: TimelineIRForValidation
): ValidationResult {
    const diagnostics: Diagnostic[] = [];

    for (const op of timeline.ops) {
        if (!Number.isInteger(op.at)) {
            diagnostics.push(
                warning(
                    "FRAME_OVERFLOW",
                    `Non-integer frame: ${op.at}. This may cause determinism issues.`,
                    {
                        trace: op.trace,
                        hint: "Ensure all timings resolve to integer frames",
                    }
                )
            );
        }

        if (op.duration !== undefined && !Number.isInteger(op.duration)) {
            diagnostics.push(
                warning(
                    "FRAME_OVERFLOW",
                    `Non-integer duration: ${op.duration}. This may cause determinism issues.`,
                    {
                        trace: op.trace,
                    }
                )
            );
        }
    }

    return categorize(diagnostics);
}
