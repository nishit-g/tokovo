import { z } from "zod";
import { EpisodeSchema, EpisodeSchemaV1, TimelineEventSchema } from "./schema";
import { formatValidationIssues, ValidationIssue } from "@tokovo/core";

export interface DryRunResult {
  valid: boolean;
  version: number;
  duration: number | null;
  durationInFrames: number | null;
  fps: number;
  sceneCount: number;
  eventCount: number;
  eventsByKind: Record<string, number>;
  issues: ValidationIssue[];
  warnings: string[];
  estimatedRenderTime: string | null;
}

export interface DryRunOptions {
  strict?: boolean;
  collectWarnings?: boolean;
}

const DEFAULT_FPS = 30;
const SECONDS_PER_FRAME_RENDER_ESTIMATE = 0.5;

type EpisodeV1 = z.infer<typeof EpisodeSchemaV1>;

function zodErrorToIssues(error: z.ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "<root>",
    message: issue.message,
    code: issue.code,
    severity: "error" as const,
    received: "received" in issue ? issue.received : undefined,
    expected: "expected" in issue ? String(issue.expected) : undefined,
  }));
}

function countEventsByKind(
  events: Array<{ kind: string }>,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const event of events) {
    counts[event.kind] = (counts[event.kind] || 0) + 1;
  }
  return counts;
}

function calculateDuration(
  events: Array<{ at: number }>,
  fps: number,
): { frames: number; seconds: number } | null {
  if (events.length === 0) return null;

  const maxFrame = Math.max(...events.map((e) => e.at));
  return {
    frames: maxFrame,
    seconds: maxFrame / fps,
  };
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function collectWarnings(episode: EpisodeV1): string[] {
  const warnings: string[] = [];

  if (!episode.meta?.title) {
    warnings.push("Episode has no title");
  }

  if (episode.events.length === 0) {
    warnings.push("Episode has no events");
  }

  const audioEvents = episode.events.filter((e) => e.kind === "AUDIO");
  if (audioEvents.length === 0) {
    warnings.push("Episode has no audio events - video will be silent");
  }

  const deviceIds = Object.keys(episode.initialWorld.devices);
  if (deviceIds.length === 0) {
    warnings.push("No devices defined in initialWorld");
  }

  const appEvents = episode.events.filter((e) => e.kind === "APP");
  const appIds = new Set(
    appEvents.map((e) => (e as { appId?: string }).appId).filter(Boolean),
  );
  for (const appId of appIds) {
    const appDeviceEvents = episode.events.filter(
      (e) => e.kind === "DEVICE" && (e as { appId?: string }).appId === appId,
    );
    if (appDeviceEvents.length === 0) {
      warnings.push(`App "${appId}" has events but no DEVICE events`);
    }
  }

  return warnings;
}

export function dryRun(
  input: unknown,
  options: DryRunOptions = {},
): DryRunResult {
  const result = EpisodeSchema.safeParse(input);

  if (!result.success) {
    return {
      valid: false,
      version: 1,
      duration: null,
      durationInFrames: null,
      fps: DEFAULT_FPS,
      sceneCount: 0,
      eventCount: 0,
      eventsByKind: {},
      issues: zodErrorToIssues(result.error),
      warnings: [],
      estimatedRenderTime: null,
    };
  }

  const episode = result.data;
  const fps = episode.meta?.fps || DEFAULT_FPS;
  const events = episode.events;

  const durationInfo = calculateDuration(events, fps);
  const eventsByKind = countEventsByKind(events);
  const warnings =
    options.collectWarnings !== false ? collectWarnings(episode) : [];

  const estimatedRenderTime = durationInfo
    ? formatTime(durationInfo.frames * SECONDS_PER_FRAME_RENDER_ESTIMATE)
    : null;

  return {
    valid: true,
    version: 1,
    duration: durationInfo?.seconds || null,
    durationInFrames: durationInfo?.frames || null,
    fps,
    sceneCount: Object.keys(episode.initialWorld.devices).length,
    eventCount: events.length,
    eventsByKind,
    issues: [],
    warnings,
    estimatedRenderTime,
  };
}

export function formatDryRunResult(result: DryRunResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push("✓ Episode is valid");
    lines.push("");
    lines.push(`Version: ${result.version}`);
    lines.push(`FPS: ${result.fps}`);
    lines.push(
      `Duration: ${result.duration ? formatTime(result.duration) : "N/A"} (${result.durationInFrames || 0} frames)`,
    );
    lines.push(`Events: ${result.eventCount}`);
    lines.push(`Scenes: ${result.sceneCount}`);

    if (Object.keys(result.eventsByKind).length > 0) {
      lines.push("");
      lines.push("Events by kind:");
      for (const [kind, count] of Object.entries(result.eventsByKind)) {
        lines.push(`  ${kind}: ${count}`);
      }
    }

    if (result.estimatedRenderTime) {
      lines.push("");
      lines.push(`Estimated render time: ~${result.estimatedRenderTime}`);
    }

    if (result.warnings.length > 0) {
      lines.push("");
      lines.push("⚠ Warnings:");
      for (const warning of result.warnings) {
        lines.push(`  - ${warning}`);
      }
    }
  } else {
    lines.push("✗ Episode validation failed");
    lines.push("");
    lines.push(`${result.issues.length} issue(s) found:`);
    lines.push(formatValidationIssues(result.issues));
  }

  return lines.join("\n");
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  issues: ValidationIssue[];
}

export function validateEpisode(input: unknown): ValidationResult<EpisodeV1> {
  const result = EpisodeSchema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      issues: [],
    };
  }

  return {
    success: false,
    issues: zodErrorToIssues(result.error),
  };
}

export function validateEvents(events: unknown[]): {
  validItems: z.infer<typeof TimelineEventSchema>[];
  invalidItems: Array<{
    index: number;
    input: unknown;
    issues: ValidationIssue[];
  }>;
  totalCount: number;
  validCount: number;
  invalidCount: number;
} {
  const validItems: z.infer<typeof TimelineEventSchema>[] = [];
  const invalidItems: Array<{
    index: number;
    input: unknown;
    issues: ValidationIssue[];
  }> = [];

  for (let i = 0; i < events.length; i++) {
    const result = TimelineEventSchema.safeParse(events[i]);
    if (result.success) {
      validItems.push(result.data);
    } else {
      invalidItems.push({
        index: i,
        input: events[i],
        issues: zodErrorToIssues(result.error),
      });
    }
  }

  return {
    validItems,
    invalidItems,
    totalCount: events.length,
    validCount: validItems.length,
    invalidCount: invalidItems.length,
  };
}
