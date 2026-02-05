import { describe, expect, it } from "vitest";
import { cameraV2Lowering } from "../lowering";

describe("cameraV2Lowering v1", () => {
  it("maps TRACK_START to canonical track params", () => {
    const events = cameraV2Lowering(
      {
        at: 10,
        kind: "CAMERA",
        type: "TRACK_START",
        payload: {
          anchorId: "lastMessage",
          scale: 1.1,
          smoothing: 0.2,
          deadZonePx: 12,
          maxVelocityPxPerSec: 840,
          predictiveLookaheadFrames: 2,
        },
      } as any,
      { fps: 30 },
    );

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      kind: "CAMERA",
      type: "track",
      anchorId: "lastMessage",
      scale: 1.1,
      smoothing: 0.2,
      deadZonePx: 12,
      maxVelocityPxPerSec: 840,
      predictiveLookaheadFrames: 2,
    });
  });

  it("applies preset defaults when explicit track controls are not provided", () => {
    const events = cameraV2Lowering(
      {
        at: 12,
        kind: "CAMERA",
        type: "TRACK_START",
        payload: {
          anchorId: "lastMessage",
          preset: "drama",
        },
      } as any,
      { fps: 30 },
    );

    expect(events[0]).toMatchObject({
      kind: "CAMERA",
      type: "track",
      preset: "drama",
      scale: 1.17,
      smoothing: 0.16,
      deadZonePx: 10,
      maxVelocityPxPerSec: 1080,
      predictiveLookaheadFrames: 3,
    });
  });

  it("drops *_END control events", () => {
    const events = cameraV2Lowering(
      {
        at: 60,
        kind: "CAMERA",
        type: "TRACK_END",
        payload: {},
      } as any,
      { fps: 30 },
    );
    expect(events).toEqual([]);
  });

  it("throws on unknown camera event types", () => {
    expect(() =>
      cameraV2Lowering(
        {
          at: 0,
          kind: "CAMERA",
          type: "NOT_A_REAL_EVENT",
          payload: {},
        } as any,
        { fps: 30 },
      ),
    ).toThrow(/Unknown CAMERA event type/);
  });
});
