import { describe, expect, it } from "vitest";
import {
  CameraPlanSchema,
  CinematicSubjectRefSchema,
  StageProgramSchema,
  type CameraPlanIR,
  type StageProgramIR,
} from "../index.js";

describe("Camera VNext IR", () => {
  it("round-trips CameraPlan and StageProgram through JSON without Maps or functions", () => {
    const plan: CameraPlanIR = {
      version: 1,
      id: "json-contract",
      fps: 60,
      durationInFrames: 120,
      outputs: [
        {
          id: "main",
          viewport: { x: 0, y: 0, width: 1080, height: 1920 },
          sourceStageNodeId: "stage.root",
          zIndex: 0,
          defaultRigId: "wide",
        },
      ],
      rigs: [
        {
          id: "wide",
          outputId: "main",
          subject: { kind: "device", deviceId: "phone", subjectId: "body" },
          composer: {
            screenPosition: [0.5, 0.5],
            targetFill: 0.9,
            fillMode: "contain",
          },
          framingGuard: {
            subject: { kind: "device", deviceId: "phone", subjectId: "body" },
            paddingPx: 24,
            screenPosition: [0.5, 0.5],
          },
        },
      ],
      shots: [],
      lenses: [],
      modifiers: [],
    };
    const stage: StageProgramIR = {
      version: 1,
      rootNodeId: "stage.root",
      nodes: [
        {
          id: "stage.root",
          source: { kind: "group" },
          localBounds: { x: 0, y: 0, width: 1080, height: 1920 },
          initialTransform: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
          zIndex: 0,
        },
      ],
      transformKeyframes: [],
    };

    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan);
    expect(JSON.parse(JSON.stringify(stage))).toEqual(stage);
    expect(CameraPlanSchema.parse(plan)).toEqual(plan);
    expect(StageProgramSchema.parse(stage)).toEqual(stage);
    expect(CinematicSubjectRefSchema.parse(plan.rigs[0].subject)).toEqual(plan.rigs[0].subject);
  });

  it("rejects non-JSON lens data and empty subject groups", () => {
    expect(() => CinematicSubjectRefSchema.parse({ kind: "group", members: [] })).toThrow();

    const base = CameraPlanSchema.parse({
      version: 1,
      id: "validation",
      fps: 60,
      durationInFrames: 120,
      outputs: [
        {
          id: "main",
          viewport: { x: 0, y: 0, width: 1080, height: 1920 },
          sourceStageNodeId: "stage.root",
          zIndex: 0,
          defaultRigId: "wide",
        },
      ],
      rigs: [
        {
          id: "wide",
          outputId: "main",
          subject: { kind: "device", deviceId: "phone", subjectId: "body" },
          composer: {
            screenPosition: [0.5, 0.5],
            targetFill: 0.9,
            fillMode: "contain",
          },
        },
      ],
      shots: [],
      lenses: [],
      modifiers: [],
    });

    expect(() =>
      CameraPlanSchema.parse({
        ...base,
        lenses: [
          {
            id: "bad",
            modelId: "fisheye",
            modelVersion: 1,
            parameters: { strength: Number.NaN },
          },
        ],
      }),
    ).toThrow();

    expect(() =>
      CameraPlanSchema.parse({
        ...base,
        rigs: [
          {
            ...base.rigs[0],
            blendOut: { durationFrames: 12, curve: "minimum-jerk" },
          },
        ],
      }),
    ).toThrow();
  });
});
