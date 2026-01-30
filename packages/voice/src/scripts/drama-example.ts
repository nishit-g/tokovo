/**
 * Auto-generated voice script types for "drama-example"
 * DO NOT EDIT - regenerate with: pnpm voice:generate
 */

export type drama_example_SegmentId = "seg_0" | "seg_1" | "seg_2" | "seg_3";

export const drama_example_segments = {
  "seg_0": { id: "seg_0", startMs: 0, endMs: 2176, speaker: "narrator" },
  "seg_1": { id: "seg_1", startMs: 2176, endMs: 5279, speaker: "sarah" },
  "seg_2": { id: "seg_2", startMs: 5279, endMs: 7896, speaker: "narrator" },
  "seg_3": { id: "seg_3", startMs: 7896, endMs: 10443, speaker: "sarah" }
} as const;

export const drama_example = {
  id: "drama-example",
  manifestPath: "/voice/drama-example-manifest.json",
  audioPath: "/voice/drama-example.mp3",
  durationMs: 10443,
  segments: drama_example_segments,
  
  start(segmentId: drama_example_SegmentId, fps: number = 30): number {
    return Math.round((drama_example_segments[segmentId].startMs / 1000) * fps);
  },
  
  end(segmentId: drama_example_SegmentId, fps: number = 30): number {
    return Math.round((drama_example_segments[segmentId].endMs / 1000) * fps);
  },
  
  duration(segmentId: drama_example_SegmentId, fps: number = 30): number {
    const seg = drama_example_segments[segmentId];
    return Math.round(((seg.endMs - seg.startMs) / 1000) * fps);
  },
} as const;

export type drama_example_Script = typeof drama_example;
