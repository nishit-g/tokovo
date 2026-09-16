import { describe, expect, it } from "vitest";
import { cameraSubject, CinematicShotBuilder } from "./cinematics.js";
import { cinematicShot } from "./cinematic-plan-family.js";
import type { CameraShotDirectionIR } from "@tokovo/ir";

describe("shot direction authoring", () => {
  const direction: CameraShotDirectionIR = {
    entrance: { type: "cut" },
    movement: {
      interpolation: "minimum-jerk",
      keyframes: [
        { frame: 0, offsetX: 0, offsetY: 0, scaleMultiplier: 1, rotationOffsetDeg: 0 },
        { frame: 30, offsetX: 0, offsetY: 0, scaleMultiplier: 1.2, rotationOffsetDeg: 0 },
      ],
    },
  };
  const target = { kind: "device", deviceId: "phone", subjectId: "screen" } as const;

  it("targets the renderer's actual notification banner subject", () => {
    expect(cameraSubject.scope("phone").notification).toEqual({
      kind: "device",
      deviceId: "phone",
      subjectId: "notification.banner",
    });
  });

  it("authors opt-in velocity handoffs without changing legacy handoffs", () => {
    expect(
      cinematicShot("follow", 90, target)
        .handoff(30, { continuity: "velocity", framing: "follow-position" })
        .toDefinition().direction?.framing,
    ).toBe("follow-position");
    expect(
      cinematicShot("velocity", 90, target).handoff(30, { continuity: "velocity" }).toDefinition()
        .direction,
    ).toMatchObject({
      continuity: "velocity",
      source: "freeze",
      framing: "hold",
      entrance: { type: "minimum-jerk", durationFrames: 30 },
    });
    expect(
      cinematicShot("legacy", 90, target).handoff(30).toDefinition().direction?.continuity,
    ).toBeUndefined();
  });

  it("reuses directing styles without sharing mutable direction data", () => {
    const recipe = {
      frame: "phone",
      direction: { entrance: { type: "cut" as const }, framing: "hold" as const },
    };
    const first = cinematicShot("first", 90, target).style(recipe);
    const second = cinematicShot("second", 90, target)
      .style(recipe)
      .handoff(12)
      .pushIn(1.1, 20, 70);
    recipe.frame = "message";
    expect(first.toDefinition().frame).toBe("phone");
    expect(first.toDefinition().direction?.entrance.type).toBe("cut");
    expect(second.toDefinition().direction?.entrance.type).toBe("minimum-jerk");
    expect(first.toDefinition().direction?.movement).toBeUndefined();
    expect(
      cinematicShot("read", 90, target)
        .readWithin(target, {
          scale: 1.3,
          region: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
          minimumReadingScale: 1,
          minimumTextPx: 24,
        })
        .toDefinition().direction?.tracking,
    ).toMatchObject({ minimumReadingScale: 1, minimumTextPx: 24 });
  });

  it("does not let legacy blend inference override explicit direction", () => {
    const result = new CinematicShotBuilder({
      fps: 30,
      id: "reveal",
      outputId: "main",
      defaultDurationFrames: 20,
      registerLens: () => {},
    })
      .target(target)
      .allowDeviceTravel("Reveal context")
      .settle(20)
      .direct(direction)
      .build({ startFrame: 90, endFrame: 150, declarationOrder: 0 });
    expect(result.shot.direction).toEqual(direction);
    expect(result.shot.blendIn).toBeUndefined();
    expect(result.shot.direction?.movement?.keyframes[0].frame).toBe(0);
  });

  it("preserves direction in the plan-family authoring surface", () => {
    expect(cinematicShot("reveal", 60, target).direct(direction).toDefinition().direction).toEqual(
      direction,
    );
  });

  it("authors independent framing with a shared reading scale", () => {
    const result = cinematicShot("read", 90, target)
      .frame("dialogue")
      .handoff(12)
      .readWithin(target, { scale: 1.4, region: { x: 0.1, y: 0.3, width: 0.8, height: 0.5 } })
      .toDefinition();
    expect(result.frame).toEqual({ preset: "dialogue", min: 1.4, max: 1.4 });
    expect(result.direction).toMatchObject({
      source: "freeze",
      framing: "follow-position",
      framingSubject: target,
      tracking: { halfLifeSeconds: 0.18 },
    });
    expect(() =>
      cinematicShot("bad", 90, target).readWithin(target, {
        scale: NaN,
        region: { x: 0, y: 0, width: 1, height: 1 },
      }),
    ).toThrow();
  });

  it("composes a frozen handoff and local hold/push without boilerplate", () => {
    const shot = cinematicShot("reveal", 90, target).handoff(10).pushIn(1.1, 20, 70).toDefinition();
    expect(shot.direction).toMatchObject({
      source: "freeze",
      entrance: { type: "minimum-jerk", durationFrames: 10 },
    });
    expect(
      shot.direction?.movement?.keyframes.map(({ frame, scaleMultiplier }) => [
        frame,
        scaleMultiplier,
      ]),
    ).toEqual([
      [0, 1],
      [20, 1],
      [70, 1.1],
    ]);
    expect(
      cinematicShot("now", 90, target).pushIn(1.1, 0, 60).handoff().toDefinition().direction
        ?.movement?.keyframes,
    ).toHaveLength(2);
    expect(() => cinematicShot("bad", 90, target).pushIn(1.1, 20, 20)).toThrow();
    expect(() => cinematicShot("bad", 90, target).handoff(NaN)).toThrow();
  });
});
