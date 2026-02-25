import type { z } from "zod";
import type { TrackEpisodeIR } from "./episode-ir.js";

type ZodIssueShape = Pick<z.ZodIssue, "code" | "path" | "message">;

export function normalizeZodIssues(issues: readonly z.ZodIssue[]): ZodIssueShape[] {
  return issues.map((issue) => ({
    code: issue.code,
    path: issue.path,
    message: issue.message,
  }));
}

export function normalizeTrackEpisodeIR(ir: TrackEpisodeIR): string {
  const normalized = {
    ...ir,
    events: [...ir.events].sort((a, b) => {
      if (a.at !== b.at) return a.at - b.at;
      return (a._declarationOrder ?? 0) - (b._declarationOrder ?? 0);
    }),
    markers: [...ir.markers].sort((a, b) => a.frame - b.frame),
    sections: [...ir.sections].sort((a, b) => a.startFrame - b.startFrame),
  };
  return JSON.stringify(normalized);
}
