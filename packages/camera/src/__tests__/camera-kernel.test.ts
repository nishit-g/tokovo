import { describe, expect, it } from "vitest";
import type { CameraPlanIR, CinematicSubjectRefIR } from "@tokovo/ir";
import {
  CameraEvaluationError,
  CameraPreparationError,
  applyMatrix3,
  createBuiltinCameraRegistries,
  evaluateCameraOutput,
  interpolateCameraPose,
  invertMatrix3,
  minimumJerk,
  multiplyMatrix3,
  prepareCameraPlan,
  rotationMatrix3,
  scaleMatrix3,
  solveComposer,
  translationMatrix3,
  type CinematicSubjectFrame,
} from "../index.js";

const deviceSubject: CinematicSubjectRefIR = {
  kind: "device",
  deviceId: "phone",
  subjectId: "screen",
};

const messageSubject: CinematicSubjectRefIR = {
  kind: "entity",
  deviceId: "phone",
  appId: "app_whatsapp",
  entityType: "message",
  entityId: "m1",
  region: "bubble",
};

function createPlan(): CameraPlanIR {
  return {
    version: 1,
    id: "camera-test",
    fps: 60,
    durationInFrames: 240,
    outputs: [
      {
        id: "main",
        viewport: { x: 0, y: 0, width: 1080, height: 1920 },
        sourceStageNodeId: "stage.root",
        zIndex: 0,
        clipRadiusPx: 28,
        defaultRigId: "establishing",
      },
    ],
    rigs: [
      {
        id: "message-close",
        outputId: "main",
        subject: messageSubject,
        composer: {
          screenPosition: [0.5, 0.62],
          targetFill: 0.42,
          fillMode: "contain",
          paddingPx: 24,
          minScale: 0.5,
          maxScale: 4,
        },
        lensId: "typing-fisheye",
      },
      {
        id: "establishing",
        outputId: "main",
        subject: deviceSubject,
        composer: {
          screenPosition: [0.5, 0.5],
          targetFill: 0.88,
          fillMode: "contain",
          minScale: 0.25,
          maxScale: 2,
        },
      },
    ],
    shots: [
      {
        id: "message-shot",
        outputId: "main",
        startFrame: 60,
        endFrame: 180,
        rigId: "message-close",
        priority: 10,
        declarationOrder: 0,
        missingSubjectPolicy: { type: "error" },
        source: "authored",
      },
    ],
    lenses: [
      {
        id: "typing-fisheye",
        modelId: "fisheye",
        modelVersion: 1,
        parameters: {
          strength: 0.22,
          radius: 1,
          center: [0.5, 0.68],
          cropCompensation: 1.1,
        },
      },
    ],
    modifiers: [],
    filters: [],
  };
}

function createSubjectFrame(frame: number): CinematicSubjectFrame {
  return {
    frame,
    subjects: [
      {
        ref: deviceSubject,
        localRect: { x: 0, y: 0, width: 393, height: 852 },
        worldRect: { x: 220, y: 300, width: 393, height: 852 },
        nodeId: "device:phone:screen",
        visible: true,
        sourceVersion: 1,
        provenance: { ownerId: "device", regionId: "screen" },
      },
      {
        ref: messageSubject,
        localRect: { x: 72, y: 510, width: 244, height: 84 },
        worldRect: { x: 292, y: 810, width: 244, height: 84 },
        nodeId: "device:phone:screen",
        visible: true,
        sourceVersion: 1,
        provenance: { ownerId: "app_whatsapp", regionId: "message.bubble" },
      },
    ],
  };
}

describe("camera matrix primitives", () => {
  it("composes and inverts a deterministic projective transform", () => {
    const matrix = multiplyMatrix3(
      translationMatrix3(120, -45),
      multiplyMatrix3(rotationMatrix3(17), scaleMatrix3(1.7)),
    );
    const inverse = invertMatrix3(matrix);
    const point = { x: 42, y: 91 };
    const projected = applyMatrix3(matrix, point);
    const restored = applyMatrix3(inverse, projected);

    expect(restored.x).toBeCloseTo(point.x, 9);
    expect(restored.y).toBeCloseTo(point.y, 9);
  });
});

describe("camera composer", () => {
  it("places the subject center at the authored output position", () => {
    const viewport = { x: 0, y: 0, width: 1080, height: 1920 };
    const subjectBounds = { x: 300, y: 700, width: 240, height: 100 };
    const pose = solveComposer({
      subjectBounds,
      viewport,
      composer: {
        screenPosition: [0.5, 0.62],
        targetFill: 0.4,
        fillMode: "contain",
        paddingPx: 20,
      },
      rotationDeg: 7,
    });

    const output = applyMatrix3(
      // Import path is intentionally exercised through the public API.
      multiplyMatrix3(
        translationMatrix3(540, 960),
        multiplyMatrix3(
          rotationMatrix3(pose.rotationDeg),
          multiplyMatrix3(
            scaleMatrix3(pose.scale),
            translationMatrix3(-pose.centerX, -pose.centerY),
          ),
        ),
      ),
      {
        x: subjectBounds.x + subjectBounds.width / 2,
        y: subjectBounds.y + subjectBounds.height / 2,
      },
    );

    expect(output.x).toBeCloseTo(540, 8);
    expect(output.y).toBeCloseTo(1920 * 0.62, 8);
  });

  it("keeps an authored detail shot inside its semantic framing guard", () => {
    const viewport = { x: 0, y: 0, width: 1080, height: 1920 };
    const guard = { x: 0, y: 0, width: 1290, height: 2796 };
    const pose = solveComposer({
      subjectBounds: { x: 40, y: 1180, width: 680, height: 460 },
      framingGuardBounds: guard,
      framingGuardPaddingPx: 28,
      framingGuardScreenPosition: [0.5, 0.5],
      viewport,
      composer: {
        screenPosition: [0.5, 0.55],
        targetFill: 0.8,
        fillMode: "width",
        maxScale: 1.4,
      },
    });
    const matrix = multiplyMatrix3(
      translationMatrix3(viewport.width / 2, viewport.height / 2),
      multiplyMatrix3(scaleMatrix3(pose.scale), translationMatrix3(-pose.centerX, -pose.centerY)),
    );
    const topLeft = applyMatrix3(matrix, { x: guard.x, y: guard.y });
    const bottomRight = applyMatrix3(matrix, {
      x: guard.x + guard.width,
      y: guard.y + guard.height,
    });

    expect(pose.scale).toBeLessThan(0.7);
    expect(topLeft.x).toBeGreaterThanOrEqual(28 - 1e-8);
    expect(topLeft.y).toBeGreaterThanOrEqual(28 - 1e-8);
    expect(bottomRight.x).toBeLessThanOrEqual(1080 - 28 + 1e-8);
    expect(bottomRight.y).toBeLessThanOrEqual(1920 - 28 + 1e-8);
    expect((topLeft.x + bottomRight.x) / 2).toBeCloseTo(540, 8);
    expect((topLeft.y + bottomRight.y) / 2).toBeCloseTo(960, 8);
  });

  it("uses minimum-jerk endpoints and logarithmic scale interpolation", () => {
    expect(minimumJerk(0)).toBe(0);
    expect(minimumJerk(1)).toBe(1);
    const pose = interpolateCameraPose(
      {
        centerX: 0,
        centerY: 0,
        scale: 1,
        rotationDeg: 350,
        opacity: 1,
        clipRect: { x: 0, y: 0, width: 100, height: 200 },
      },
      {
        centerX: 100,
        centerY: 50,
        scale: 4,
        rotationDeg: 10,
        opacity: 0.5,
        clipRect: { x: 0, y: 0, width: 100, height: 200 },
      },
      0.5,
    );

    expect(pose.centerX).toBeCloseTo(50, 8);
    expect(pose.scale).toBeCloseTo(2, 8);
    expect(pose.rotationDeg).toBeCloseTo(360, 8);
  });
});

describe("camera projection backend routing", () => {
  it("declares texture requirements during preparation", () => {
    const registries = createBuiltinCameraRegistries();
    const textureProgram = prepareCameraPlan(createPlan(), registries);
    const compositedPlan = createPlan();
    compositedPlan.rigs = compositedPlan.rigs.map(({ lensId: _lensId, ...rig }) => rig);
    compositedPlan.lenses = [];
    const compositedProgram = prepareCameraPlan(compositedPlan, registries);

    expect(textureProgram.projectionBackendRequirement).toBe("texture");
    expect(compositedProgram.projectionBackendRequirement).toBe("composited");
  });

  it("routes whip transitions through the texture compositor", () => {
    const registries = createBuiltinCameraRegistries();
    const plan = createPlan();
    plan.rigs = plan.rigs.map(({ lensId: _lensId, ...rig }) => ({
      ...rig,
      ...(rig.id === "message-close"
        ? {
            motion: {
              type: "whip" as const,
              durationFrames: 12,
              direction: "left" as const,
            },
          }
        : {}),
    }));
    plan.lenses = [];

    expect(prepareCameraPlan(plan, registries).projectionBackendRequirement).toBe("texture");
  });

  it("does not route unused texture definitions through the compositor", () => {
    const registries = createBuiltinCameraRegistries();
    const plan = createPlan();
    plan.rigs = plan.rigs.map(({ lensId: _lensId, ...rig }) => rig);

    expect(prepareCameraPlan(plan, registries).projectionBackendRequirement).toBe("composited");
  });
});

describe("camera program preparation", () => {
  it("produces the same signature regardless of declaration array ordering", () => {
    const registries = createBuiltinCameraRegistries();
    const plan = createPlan();
    const reversed: CameraPlanIR = {
      ...plan,
      rigs: [...plan.rigs].reverse(),
    };

    expect(prepareCameraPlan(plan, registries).signature).toBe(
      prepareCameraPlan(reversed, registries).signature,
    );
  });

  it("fails on unknown lens models and ambiguous equal-priority overlaps", () => {
    const plan = createPlan();
    const invalid: CameraPlanIR = {
      ...plan,
      lenses: [
        {
          id: "typing-fisheye",
          modelId: "unknown-model",
          modelVersion: 1,
          parameters: {},
        },
      ],
      shots: [
        ...plan.shots,
        {
          ...plan.shots[0],
          id: "ambiguous",
          declarationOrder: 1,
        },
      ],
    };

    expect(() => prepareCameraPlan(invalid, createBuiltinCameraRegistries())).toThrow(
      CameraPreparationError,
    );
    try {
      prepareCameraPlan(invalid, createBuiltinCameraRegistries());
    } catch (error) {
      expect(error).toBeInstanceOf(CameraPreparationError);
      const codes = (error as CameraPreparationError).diagnostics.map((entry) => entry.code);
      expect(codes).toContain("CAM_LENS_MODEL_MISSING");
      expect(codes).toContain("CAM_SHOT_OVERLAP_AMBIGUOUS");
    }
  });

  it("rejects unknown lens parameters instead of silently using defaults", () => {
    const plan = createPlan();
    const invalid: CameraPlanIR = {
      ...plan,
      lenses: plan.lenses.map((lens) => ({
        ...lens,
        parameters: { ...lens.parameters, strenght: 0.9 },
      })),
    };

    expect(() => prepareCameraPlan(invalid, createBuiltinCameraRegistries())).toThrowError(
      /unknown parameter "strenght"/,
    );
  });
});

describe("camera output evaluation", () => {
  it("selects a shot, resolves its exact entity subject, and emits a fisheye pass", () => {
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(createPlan(), registries);
    const evaluated = evaluateCameraOutput(
      {
        program,
        outputId: "main",
        frame: 90,
        subjectFrame: createSubjectFrame(90),
        mode: "render",
      },
      registries,
    );

    expect(evaluated.activeShotId).toBe("message-shot");
    expect(evaluated.activeRigId).toBe("message-close");
    expect(evaluated.clipRadiusPx).toBe(28);
    expect(evaluated.resolvedSubjects[0].ref).toEqual(messageSubject);
    expect(evaluated.projectionPasses).toEqual([
      expect.objectContaining({ kind: "fisheye-warp", strength: 0.22 }),
    ]);
    expect(evaluated.pose.scale).toBeGreaterThan(1);
    expect(JSON.parse(JSON.stringify(evaluated.trace))).toEqual(evaluated.trace);
    expect(evaluated.trace).toEqual(
      expect.objectContaining({
        selection: "shot",
        shotId: "message-shot",
        rigId: "message-close",
        projectionPassKinds: ["fisheye-warp"],
        subjects: [
          expect.objectContaining({
            ownerId: "app_whatsapp",
            regionId: "message.bubble",
          }),
        ],
      }),
    );
  });

  it("is identical when evaluated in sequential, reverse, or arbitrary frame order", () => {
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(createPlan(), registries);
    const frames = [0, 59, 60, 90, 179, 180, 239];
    const evaluate = (frame: number) =>
      evaluateCameraOutput(
        {
          program,
          outputId: "main",
          frame,
          subjectFrame: createSubjectFrame(frame),
          mode: "render",
        },
        registries,
      );
    const sequential = new Map(frames.map((frame) => [frame, evaluate(frame)]));
    const arbitrary = [180, 60, 239, 0, 179, 90, 59];

    for (const frame of arbitrary) {
      expect(evaluate(frame)).toEqual(sequential.get(frame));
    }
  });

  it("fails loudly when an authored hero subject is absent", () => {
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(createPlan(), registries);
    const frame = createSubjectFrame(90);
    const withoutMessage: CinematicSubjectFrame = {
      frame: 90,
      subjects: frame.subjects.filter((subject) => subject.ref !== messageSubject),
    };

    expect(() =>
      evaluateCameraOutput(
        {
          program,
          outputId: "main",
          frame: 90,
          subjectFrame: withoutMessage,
          mode: "render",
        },
        registries,
      ),
    ).toThrow(CameraEvaluationError);
  });

  it("rejects out-of-range frames and duplicate exact subjects", () => {
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(createPlan(), registries);
    expect(() =>
      evaluateCameraOutput(
        {
          program,
          outputId: "main",
          frame: 240,
          subjectFrame: createSubjectFrame(240),
          mode: "render",
        },
        registries,
      ),
    ).toThrowError(/outside \[0, 240\)/);

    const subjectFrame = createSubjectFrame(90);
    expect(() =>
      evaluateCameraOutput(
        {
          program,
          outputId: "main",
          frame: 90,
          subjectFrame: {
            ...subjectFrame,
            subjects: [...subjectFrame.subjects, subjectFrame.subjects[0]],
          },
          mode: "render",
        },
        registries,
      ),
    ).toThrowError(/duplicate exact subject/);
  });

  it("blends complete poses and optical strength without previous-frame state", () => {
    const registries = createBuiltinCameraRegistries();
    const source = createPlan();
    const plan: CameraPlanIR = {
      ...source,
      shots: source.shots.map((shot) => ({
        ...shot,
        blendIn: { durationFrames: 60, curve: "minimum-jerk" as const },
      })),
    };
    const program = prepareCameraPlan(plan, registries);
    const evaluate = (frame: number) =>
      evaluateCameraOutput(
        {
          program,
          outputId: "main",
          frame,
          subjectFrame: createSubjectFrame(frame),
          mode: "render",
        },
        registries,
      );

    const start = evaluate(60);
    const middle = evaluate(90);
    const settled = evaluate(120);
    const reverseMiddle = evaluate(90);

    expect(start.projectionPasses).toEqual([]);
    expect(middle.projectionPasses).toEqual([
      expect.objectContaining({ kind: "fisheye-warp", strength: 0.11 }),
    ]);
    expect(settled.projectionPasses).toEqual([
      expect.objectContaining({ kind: "fisheye-warp", strength: 0.22 }),
    ]);
    expect(middle.pose.scale).toBeGreaterThan(Math.min(start.pose.scale, settled.pose.scale));
    expect(middle.pose.scale).toBeLessThan(Math.max(start.pose.scale, settled.pose.scale));
    expect(reverseMiddle).toEqual(middle);
  });

  it("applies registered deterministic modifiers and settles whips cleanly", () => {
    const registries = createBuiltinCameraRegistries();
    const source = createPlan();
    const plan: CameraPlanIR = {
      ...source,
      modifiers: [
        {
          id: "breathing",
          modelId: "lens-breathing",
          modelVersion: 1,
          parameters: { amount: 0.04, periodFrames: 120 },
        },
      ],
      filters: [],
      rigs: source.rigs.map((rig) =>
        rig.id === "message-close"
          ? {
              ...rig,
              modifierIds: ["breathing"],
              motion: {
                type: "whip" as const,
                durationFrames: 30,
                direction: "right" as const,
              },
            }
          : rig,
      ),
    };
    const program = prepareCameraPlan(plan, registries);
    const evaluate = (frame: number) =>
      evaluateCameraOutput(
        {
          program,
          outputId: "main",
          frame,
          subjectFrame: createSubjectFrame(frame),
          mode: "render",
        },
        registries,
      );

    const peak = evaluate(75);
    expect(peak.projectionPasses).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "directional-smear" })]),
    );
    expect(peak.trace.transition).toEqual(
      expect.objectContaining({
        sourceRigId: "establishing",
        targetRigId: "message-close",
        whipActive: true,
        movementIntent: null,
      }),
    );
    expect(evaluate(90).projectionPasses.some((pass) => pass.kind === "directional-smear")).toBe(
      false,
    );
    expect(evaluate(105)).toEqual(evaluate(105));
  });

  it("evaluates named color filters independently from lens geometry", () => {
    const registries = createBuiltinCameraRegistries();
    const source = createPlan();
    const plan: CameraPlanIR = {
      ...source,
      filters: [
        {
          id: "cool-night",
          modelId: "color-grade",
          modelVersion: 1,
          parameters: {
            brightness: -0.03,
            contrast: 1.12,
            saturation: 0.9,
            gamma: 0.96,
            temperature: -0.14,
            tint: 0.04,
          },
        },
      ],
      rigs: source.rigs.map((rig) =>
        rig.id === "message-close" ? { ...rig, filterIds: ["cool-night"] } : rig,
      ),
    };
    const program = prepareCameraPlan(plan, registries);
    const output = evaluateCameraOutput(
      {
        program,
        outputId: "main",
        frame: 120,
        subjectFrame: createSubjectFrame(120),
        mode: "render",
      },
      registries,
    );

    expect(output.projectionPasses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "color-grade",
          contrast: 1.12,
          temperature: -0.14,
        }),
      ]),
    );
  });
});
