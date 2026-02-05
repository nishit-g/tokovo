import { describe, expect, test } from "vitest";
import { processActiveEffects } from "../processors/index.js";
import type { CameraEffect } from "../types/index.js";

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx] ?? 0;
}

function runPerf(fps: number): { avg: number; p95: number } {
  const frames = fps * 15;
  const effects: CameraEffect[] = [
    {
      type: "track",
      id: "p_track_1",
      startFrame: 0,
      endFrame: frames,
      anchorId: "lastMessage",
      scale: 1.12,
      smoothing: 0.2,
      deadZonePx: 12,
      maxVelocityPxPerSec: 900,
      predictiveLookaheadFrames: 2,
    },
    {
      type: "focus",
      id: "p_focus_n",
      startFrame: Math.floor(frames * 0.5),
      endFrame: Math.floor(frames * 0.55),
      anchorId: "headsUpNotification",
      scale: 1.2,
    },
  ];

  const snapshot = {
    appId: "app_whatsapp",
    deviceId: "phone",
    anchors: {
      device: { x: 0, y: 0, width: 393, height: 852 },
      app: { x: 0, y: 80, width: 393, height: 772 },
      lastMessage: { x: 20, y: 620, width: 280, height: 64 },
      headsUpNotification: { x: 20, y: 94, width: 353, height: 84 },
    },
  };

  const viewport = { width: 393, height: 852 };
  const durations: number[] = [];
  for (let t = 0; t < frames; t++) {
    const start = performance.now();
    processActiveEffects(t, effects, undefined, snapshot, viewport);
    durations.push(performance.now() - start);
  }
  return {
    avg: durations.reduce((sum, v) => sum + v, 0) / durations.length,
    p95: percentile(durations, 0.95),
  };
}

describe("camera performance budgets", () => {
  test("meets 30fps camera solve budget", () => {
    const { avg, p95 } = runPerf(30);
    expect(avg).toBeLessThanOrEqual(2.2);
    expect(p95).toBeLessThanOrEqual(4.0);
  });

  test("meets 60fps camera solve budget", () => {
    const { avg, p95 } = runPerf(60);
    expect(avg).toBeLessThanOrEqual(1.6);
    expect(p95).toBeLessThanOrEqual(3.0);
  });
});
