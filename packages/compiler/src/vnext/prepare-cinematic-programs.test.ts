import { describe, expect, it } from "vitest";
import type { CameraPlanIR, StageProgramIR } from "@tokovo/ir";
import { createBuiltinCameraRegistries } from "@tokovo/camera";
import {
  CinematicProgramPreparationError,
  prepareCinematicPrograms,
} from "./prepare-cinematic-programs.js";

const stage: StageProgramIR = {
  version: 1,
  rootNodeId: "root",
  nodes: [
    {
      id: "root",
      source: { kind: "group" },
      localBounds: { x: 0, y: 0, width: 1080, height: 1920 },
      initialTransform: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
      zIndex: 0,
    },
  ],
  transformKeyframes: [],
};

function camera(id: string, targetFill: number): CameraPlanIR {
  return {
    version: 1,
    id,
    fps: 60,
    durationInFrames: 300,
    outputs: [
      {
        id: "main",
        viewport: { x: 0, y: 0, width: 1080, height: 1920 },
        sourceStageNodeId: "root",
        zIndex: 0,
        coveragePolicy: "allow-default",
        compositionProfileId: "hero-device",
        defaultRigId: "wide",
      },
    ],
    rigs: [
      {
        id: "wide",
        outputId: "main",
        subject: { kind: "device", deviceId: "phone", subjectId: "screen" },
        composer: {
          screenPosition: [0.5, 0.5],
          targetFill,
          fillMode: "contain",
        },
      },
    ],
    shots: [],
    lenses: [],
    modifiers: [],
    filters: [],
  };
}

describe("prepared cinematic envelope", () => {
  it("keeps story and stage signatures fixed when only cinematography changes", () => {
    const registries = createBuiltinCameraRegistries();
    const first = prepareCinematicPrograms(
      {
        fps: 60,
        durationInFrames: 300,
        storySignature: "story-deadbeef",
        stageProgram: stage,
        cameraPlans: [camera("calm", 0.8)],
        defaultCameraPlanId: "calm",
      },
      registries,
    );
    const second = prepareCinematicPrograms(
      {
        fps: 60,
        durationInFrames: 300,
        storySignature: "story-deadbeef",
        stageProgram: stage,
        cameraPlans: [camera("dramatic", 0.48)],
        defaultCameraPlanId: "dramatic",
      },
      registries,
    );

    expect(second.storySignature).toBe(first.storySignature);
    expect(second.stageSignature).toBe(first.stageSignature);
    expect(second.cameraSignatures.dramatic).not.toBe(first.cameraSignatures.calm);
    expect(first.version).toBe(2);
    expect(first.cameraProgramIndexById).toEqual({ calm: 0 });
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);
  });

  it("fails when an output observes a nonexistent stage node", () => {
    const source = camera("invalid", 0.8);
    const invalid: CameraPlanIR = {
      ...source,
      outputs: source.outputs.map((output) => ({
        ...output,
        sourceStageNodeId: "ghost",
      })),
    };
    expect(() =>
      prepareCinematicPrograms(
        {
          fps: 60,
          durationInFrames: 300,
          storySignature: "story-deadbeef",
          stageProgram: stage,
          cameraPlans: [invalid],
          defaultCameraPlanId: "invalid",
        },
        createBuiltinCameraRegistries(),
      ),
    ).toThrow(CinematicProgramPreparationError);
  });
});
