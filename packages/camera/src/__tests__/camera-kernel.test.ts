import { describe, expect, it } from "vitest";
import type { CameraPlanIR, CinematicSubjectRefIR } from "@tokovo/ir";
import {
  CameraEvaluationError,
  CameraPreparationError,
  applyMatrix3,
  cameraPoseToViewMatrix,
  cameraQualitySample,
  cinematicSubjectKey,
  createBuiltinCameraRegistries,
  evaluateCameraOutput,
  interpolateCameraPose,
  invertMatrix3,
  minimumJerk,
  multiplyMatrix3,
  prepareCameraPlan,
  prepareCameraTracking,
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
    version: 2,
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
        coveragePolicy: "allow-default",
        compositionProfileId: "hero-device",
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
        travel: {
          mode: "stabilized",
          mount: {
            subject: deviceSubject,
            screenPosition: [0.5, 0.5],
            maxDriftPx: [54, 72],
          },
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
        travel: {
          mode: "stabilized",
          mount: {
            subject: deviceSubject,
            screenPosition: [0.5, 0.5],
            maxDriftPx: [54, 72],
          },
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

describe("explicit shot direction", () => {
  function directedPlan(): CameraPlanIR {
    const plan = createPlan();
    return {
      ...plan,
      rigs: plan.rigs.map(({ lensId: _lensId, ...rig }) => ({
        ...rig,
        travel: { mode: "intentional" as const, reason: "Follow the message" },
        motion: { type: "critically-damped" as const, responseFrames: 30 },
      })),
      shots: [
        {
          ...plan.shots[0],
          direction: {
            entrance: { type: "cut" },
            movement: {
              interpolation: "minimum-jerk",
              keyframes: [
                { frame: 0, offsetX: 0, offsetY: 0, scaleMultiplier: 1, rotationOffsetDeg: 0 },
                { frame: 20, offsetX: 0, offsetY: 0, scaleMultiplier: 1, rotationOffsetDeg: 0 },
                { frame: 80, offsetX: 0, offsetY: 0, scaleMultiplier: 1.5, rotationOffsetDeg: 0 },
                { frame: 119, offsetX: 0, offsetY: 0, scaleMultiplier: 1.5, rotationOffsetDeg: 0 },
              ],
            },
          },
        },
      ],
    };
  }

  it("prepares half-life tracking once and evaluates shuffled frames without replaying the track", () => {
    const plan = directedPlan();
    plan.shots[0].direction = {
      entrance: { type: "cut" },
      framing: "follow-position",
      tracking: { halfLifeSeconds: 0.5 },
    };
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(plan, registries);
    let samples = 0;
    const geometry = (frame: number) => {
      samples++;
      const original = createSubjectFrame(frame);
      return {
        ...original,
        subjects: original.subjects.map((subject, index) =>
          index === 1 && frame > 60
            ? {
                ...subject,
                worldRect: { ...subject.worldRect, y: subject.worldRect.y + 200, height: 300 },
              }
            : subject,
        ),
      };
    };
    const tracking = prepareCameraTracking(program, geometry);
    expect(samples).toBe(120);
    const centers = tracking.centersByShot[plan.shots[0].id];
    // 60 fps: after 30 steps, half the displacement remains.
    const targetY = 810 + 200 + 150;
    expect(centers[30][1]).toBeCloseTo((centers[0][1] + targetY) / 2, 8);
    const evaluate = (frame: number) =>
      evaluateCameraOutput(
        {
          program,
          outputId: "main",
          frame,
          subjectFrame: geometry(frame),
          subjectFrameAt: geometry,
          tracking,
          mode: "render",
        },
        registries,
      );
    const initial = evaluate(60);
    const shuffled = [179, 90, 61, 120].map(evaluate);
    const count = samples;
    expect(evaluate(90)).toEqual(shuffled[1]);
    expect(samples - count).toBe(2); // Current geometry and the fixed reference, not the history.
    for (const output of shuffled) expect(output.pose.scale).toBe(initial.pose.scale);
    expect(shuffled[2].pose.centerY).toBeLessThan(shuffled[1].pose.centerY);
    expect(() =>
      evaluateCameraOutput(
        {
          program,
          outputId: "main",
          frame: 90,
          subjectFrame: geometry(90),
          subjectFrameAt: geometry,
          mode: "render",
        },
        registries,
      ),
    ).toThrow("matching prepared position track");
  });

  it("keeps a shared fit still inside the reading window and only follows overflow", () => {
    const plan = directedPlan();
    plan.rigs[0].composer = { ...plan.rigs[0].composer, minScale: 1, maxScale: 1 };
    plan.shots[0].direction = {
      entrance: { type: "cut" },
      framing: "follow-position",
      framingSubject: deviceSubject,
      tracking: {
        halfLifeSeconds: 0.2,
        readingRegion: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
      },
    };
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(plan, registries);
    let reads = 0;
    const geometry = (frame: number) => {
      reads++;
      const value = createSubjectFrame(frame);
      value.subjects = value.subjects.map((subject, index) =>
        index === 1
          ? {
              ...subject,
              worldRect: {
                ...subject.worldRect,
                y: subject.worldRect.y + (frame < 90 ? (frame % 2) * 20 : 1000),
              },
            }
          : subject,
      );
      return value;
    };
    const tracking = prepareCameraTracking(program, geometry);
    expect(reads).toBe(120);
    const evaluate = (frame: number) =>
      evaluateCameraOutput(
        {
          program,
          outputId: "main",
          frame,
          subjectFrame: geometry(frame),
          subjectFrameAt: geometry,
          tracking,
          mode: "render",
        },
        registries,
      );
    expect(evaluate(61).pose).toEqual(evaluate(60).pose);
    expect(evaluate(89).pose).toEqual(evaluate(60).pose);
    expect(evaluate(91).pose.centerY).toBeGreaterThan(evaluate(90).pose.centerY);
    expect(evaluate(179).pose.scale).toBe(1);
    const later = evaluate(179);
    evaluate(60);
    evaluate(110);
    expect(evaluate(179)).toEqual(later);
    expect(() =>
      prepareCameraTracking(program, (frame) => {
        const value = geometry(frame);
        value.subjects[1] = {
          ...value.subjects[1],
          worldRect: { ...value.subjects[1].worldRect, width: 2000 },
        };
        return value;
      }),
    ).toThrow("Subject does not fit the reading region");
  });

  it("preflights a stable safe reading scale, contains overflow, and rejects unreadable fits", () => {
    const plan = directedPlan();
    plan.outputs[0].editorialInsets = { top: 100, bottom: 200, left: 50, right: 50 };
    plan.rigs[0].composer = { ...plan.rigs[0].composer, minScale: 1, maxScale: 1 };
    plan.shots[0].direction = {
      entrance: { type: "cut" },
      framing: "follow-position",
      framingSubject: deviceSubject,
      tracking: {
        halfLifeSeconds: 0.2,
        readingRegion: { x: 0, y: 0, width: 1, height: 1 },
        minimumReadingScale: 0.4,
      },
    };
    const geometry = (frame: number) => {
      const value = createSubjectFrame(frame);
      value.subjects[1] = {
        ...value.subjects[1],
        worldRect: {
          x: 100,
          y: frame < 100 ? 200 : 1800,
          width: frame < 100 ? 400 : 1800,
          height: 200,
        },
      };
      return value;
    };
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(plan, registries);
    const tracking = prepareCameraTracking(program, geometry);
    expect(tracking.scaleByShot?.[plan.shots[0].id]).toBeCloseTo(980 / 1800);
    const evaluate = (frame: number) =>
      evaluateCameraOutput(
        {
          program,
          frame,
          outputId: "main",
          subjectFrame: geometry(frame),
          subjectFrameAt: geometry,
          tracking,
          mode: "render",
        },
        registries,
      );
    for (const frame of [179, 60, 100, 99, 120]) {
      const output = evaluate(frame);
      expect(output.pose.scale).toBeCloseTo(980 / 1800);
      expect(
        cameraQualitySample(output, { checkFraming: true }).framing?.clippedSubjectKeys,
      ).toEqual([]);
    }
    plan.shots[0].direction.tracking!.minimumReadingScale = 0.8;
    expect(() => prepareCameraTracking(prepareCameraPlan(plan, registries), geometry)).toThrow(
      /minimumReadingScale/,
    );
    plan.shots[0].direction.tracking!.minimumReadingScale = 0.4;
    plan.shots[0].direction.tracking!.minimumTextPx = 24;
    const textProgram = prepareCameraPlan(plan, registries);
    expect(() => prepareCameraTracking(textProgram, geometry)).toThrow(/layout-owned text metrics/);
    const textGeometry = (frame: number) => {
      const value = geometry(frame);
      value.subjects[1] = { ...value.subjects[1], worldTextSizePx: 50 };
      return value;
    };
    expect(() => prepareCameraTracking(textProgram, textGeometry)).not.toThrow();
    plan.shots[0].direction.tracking!.minimumTextPx = 30;
    expect(() => prepareCameraTracking(prepareCameraPlan(plan, registries), textGeometry)).toThrow(
      /minimumTextPx/,
    );
    plan.shots[0].direction.tracking!.minimumTextPx = 24;
    plan.shots[0].direction.tracking!.avoidSubjects = [deviceSubject];
    expect(() => prepareCameraTracking(prepareCameraPlan(plan, registries), textGeometry)).toThrow(
      /overlaps/,
    );
  });

  it("bounds tracking speed and vector acceleration through a long move and reversal", () => {
    const plan = directedPlan();
    plan.rigs[0].composer = { ...plan.rigs[0].composer, minScale: 1, maxScale: 1 };
    plan.shots[0].direction = {
      entrance: { type: "cut" },
      framing: "follow-position",
      tracking: {
        halfLifeSeconds: 0.01,
        panLimits: { speedPxPerSecond: 300, accelerationPxPerSecondSquared: 600 },
      },
    };
    const geometry = (frame: number) => {
      const value = createSubjectFrame(frame);
      value.subjects[1] = {
        ...value.subjects[1],
        worldRect: {
          ...value.subjects[1].worldRect,
          x: frame < 65 ? 100 : frame < 110 ? 3000 : -3000,
        },
      };
      return value;
    };
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(plan, registries);
    const tracking = prepareCameraTracking(program, geometry);
    const centers = tracking.centersByShot[plan.shots[0].id];
    let previousVelocity = [0, 0];
    for (let index = 1; index < centers.length; index++) {
      const velocity = centers[index].map(
        (value, axis) => (value - centers[index - 1][axis]) * plan.fps,
      );
      expect(Math.hypot(...velocity)).toBeLessThanOrEqual(300 + 1e-7);
      expect(
        Math.hypot(...velocity.map((value, axis) => (value - previousVelocity[axis]) * plan.fps)),
      ).toBeLessThanOrEqual(600 + 1e-7);
      previousVelocity = velocity;
    }
    // The reversal brakes before changing direction; it does not teleport to the new target.
    expect(centers[51][0]).toBeGreaterThan(centers[50][0]);
    expect(centers.at(-1)![0]).toBeLessThan(centers[80][0]);
  });

  it("rejects missing tracking geometry instead of silently inventing a path", () => {
    const plan = directedPlan();
    plan.shots[0].direction = {
      entrance: { type: "cut" },
      framing: "follow-position",
      tracking: { halfLifeSeconds: 0.2 },
    };
    const program = prepareCameraPlan(plan, createBuiltinCameraRegistries());
    expect(() => prepareCameraTracking(program, (frame) => ({ frame, subjects: [] }))).toThrow(
      "frame-matched geometry",
    );
  });

  it("freezes the actual outgoing frame even when its subject disappears", () => {
    const plan = directedPlan();
    plan.shots = [
      ...plan.shots,
      {
        ...plan.shots[0],
        id: "handoff",
        rigId: "establishing",
        startFrame: 180,
        endFrame: 240,
        declarationOrder: 1,
        direction: { entrance: { type: "minimum-jerk", durationFrames: 12 }, source: "freeze" },
      },
    ];
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(plan, registries);
    const geometry = (frame: number) => {
      const value = createSubjectFrame(frame);
      return frame < 180 ? value : { ...value, subjects: value.subjects.slice(0, 1) };
    };
    const evaluate = (frame: number) =>
      evaluateCameraOutput(
        {
          program,
          outputId: "main",
          frame,
          subjectFrame: geometry(frame),
          subjectFrameAt: geometry,
          mode: "render",
        },
        registries,
      );
    const direct = evaluate(186);
    expect(evaluate(180).pose).toEqual(evaluate(179).pose);
    for (let frame = 175; frame < 190; frame++) evaluate(frame);
    expect(evaluate(186)).toEqual(direct);
    expect(() =>
      evaluateCameraOutput(
        { program, outputId: "main", frame: 181, subjectFrame: geometry(181), mode: "render" },
        registries,
      ),
    ).toThrow("requires historical geometry");
  });

  it("freezes an interrupted blend rather than snapping to its destination rig", () => {
    const plan = directedPlan();
    plan.shots[0].direction = { entrance: { type: "minimum-jerk", durationFrames: 60 } };
    plan.shots = [
      ...plan.shots,
      {
        ...plan.shots[0],
        id: "interrupt",
        rigId: "establishing",
        startFrame: 80,
        endFrame: 120,
        priority: 20,
        declarationOrder: 1,
        direction: { entrance: { type: "minimum-jerk", durationFrames: 12 }, source: "freeze" },
      },
    ];
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(plan, registries);
    const evaluate = (frame: number) =>
      evaluateCameraOutput(
        {
          program,
          outputId: "main",
          frame,
          subjectFrame: createSubjectFrame(frame),
          subjectFrameAt: createSubjectFrame,
          mode: "render",
        },
        registries,
      );
    expect(evaluate(80).pose).toEqual(evaluate(79).pose);
  });

  it("bounds impact shake in output pixels and returns exactly to the base pose", () => {
    const registries = createBuiltinCameraRegistries();
    const model = registries.modifiers.get("impact-shake", 1)!;
    const pose = solveComposer({
      subjectBounds: { x: 0, y: 0, width: 100, height: 100 },
      viewport: { x: 0, y: 0, width: 1080, height: 1920 },
      composer: { screenPosition: [0.5, 0.5], targetFill: 0.8, fillMode: "contain" },
    });
    const evaluate = (frame: number, scale = pose.scale) =>
      model.evaluate({
        frame,
        fps: 60,
        pose: { ...pose, scale },
        projectionPasses: [],
        parameters: {
          startFrame: 10,
          durationFrames: 24,
          amplitudePx: 16,
          rotationDeg: 1,
          seed: 42,
        },
      }).pose;
    for (const frame of [0, 10, 34, 80]) expect(evaluate(frame)).toEqual(pose);
    for (let frame = 11; frame < 34; frame++) {
      expect(Math.abs(evaluate(frame).centerX - pose.centerX) * pose.scale).toBeLessThanOrEqual(16);
      expect(Math.abs(evaluate(frame).rotationDeg - pose.rotationDeg)).toBeLessThanOrEqual(1);
      expect((evaluate(frame, 2).centerX - pose.centerX) * 2).toBeCloseTo(
        (evaluate(frame).centerX - pose.centerX) * pose.scale,
      );
    }
    expect(evaluate(20)).toEqual(evaluate(20));
    expect(model.validate({ amplitudePx: 100 }).length).toBeGreaterThan(0);
  });

  it("derives whip smear direction from camera travel", () => {
    const plan = directedPlan();
    plan.shots[0].direction = {
      entrance: { type: "whip", direction: "travel", durationFrames: 30 },
      source: "freeze",
      framing: "hold",
    };
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(plan, registries);
    const evaluate = (frame: number) =>
      evaluateCameraOutput(
        {
          program,
          outputId: "main",
          frame,
          subjectFrame: createSubjectFrame(frame),
          subjectFrameAt: createSubjectFrame,
          mode: "render",
        },
        registries,
      );
    const smear = evaluate(75).projectionPasses.find((pass) => pass.kind === "directional-smear");
    expect(smear?.kind).toBe("directional-smear");
    if (smear?.kind !== "directional-smear") throw new Error("Expected travel smear");
    expect(Math.hypot(...smear.direction)).toBeCloseTo(1);
    expect(Math.abs(smear.direction[1])).toBeGreaterThan(Math.abs(smear.direction[0]));
    expect(smear.spreadPx).toBeGreaterThan(0);
    expect(smear.spreadPx).toBeLessThanOrEqual(64);
    expect(evaluate(90).projectionPasses).toEqual([]);
  });

  it("carries velocity across an interruption and settles exactly, independent of seek order", () => {
    const plan = directedPlan();
    plan.shots[0].direction = {
      entrance: { type: "cut" },
      framing: "hold",
      movement: {
        interpolation: "linear",
        keyframes: [
          { frame: 0, offsetX: 0, offsetY: 0, scaleMultiplier: 1, rotationOffsetDeg: 0 },
          { frame: 119, offsetX: 119, offsetY: 238, scaleMultiplier: 1.1, rotationOffsetDeg: 10 },
        ],
      },
    };
    plan.shots.push({
      ...plan.shots[0],
      id: "velocity",
      startFrame: 80,
      endFrame: 180,
      priority: 20,
      declarationOrder: 1,
      direction: {
        entrance: { type: "minimum-jerk", durationFrames: 60 },
        source: "freeze",
        framing: "hold",
        continuity: "velocity",
      },
    });
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(plan, registries);
    const evaluate = (frame: number) =>
      evaluateCameraOutput(
        {
          program,
          outputId: "main",
          frame,
          subjectFrame: createSubjectFrame(frame),
          subjectFrameAt: createSubjectFrame,
          mode: "render",
        },
        registries,
      );
    const before = evaluate(79).pose;
    const entrance = evaluate(80).pose;
    expect(entrance.centerX - before.centerX).toBeCloseTo(1, 1);
    expect(entrance.centerY - before.centerY).toBeCloseTo(2, 1);
    expect(evaluate(139).pose).toEqual(evaluate(140).pose);
    const sequential = Array.from({ length: 61 }, (_, index) => evaluate(79 + index).pose);
    for (const frame of [139, 81, 110, 79, 80, 100])
      expect(evaluate(frame).pose).toEqual(sequential[frame - 79]);
    expect(
      cameraQualitySample(
        { ...evaluate(140), pose: { ...evaluate(140).pose, centerX: 100000 } },
        { checkFraming: true },
      ).framing?.clippedSubjectKeys,
    ).not.toEqual([]);
    plan.shots[1].direction!.framing = "live";
    expect(() => prepareCameraPlan(plan, registries)).toThrow(/Velocity handoffs/);
  });

  it("arrives at a moving destination without freezing its position or ending velocity", () => {
    const plan = directedPlan();
    plan.shots[0].direction = {
      entrance: { type: "minimum-jerk", durationFrames: 60 },
      source: "freeze",
      continuity: "velocity",
      framing: "follow-position",
    };
    const geometry = (frame: number) => {
      const value = createSubjectFrame(frame);
      value.subjects[1] = {
        ...value.subjects[1],
        worldRect: { ...value.subjects[1].worldRect, y: 500 + frame * 2 },
      };
      return value;
    };
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(plan, registries);
    const evaluate = (frame: number) =>
      evaluateCameraOutput(
        {
          program,
          frame,
          outputId: "main",
          subjectFrame: geometry(frame),
          subjectFrameAt: geometry,
          mode: "render",
        },
        registries,
      );
    expect(evaluate(120).pose.centerY - evaluate(119).pose.centerY).toBeCloseTo(2, 7);
    expect(evaluate(119).pose.centerY - evaluate(118).pose.centerY).toBeCloseTo(2, 1);
    const result = evaluate(90);
    evaluate(119);
    evaluate(60);
    expect(evaluate(90)).toEqual(result);
  });

  it("resolves a long chain of interrupted handoffs without recursive stack growth", () => {
    const plan = directedPlan();
    const count = 2000;
    plan.durationInFrames = count + 1;
    plan.shots = Array.from({ length: count }, (_, index) => ({
      ...plan.shots[0],
      id: `interrupt-${index}`,
      startFrame: index,
      endFrame: index + 2,
      priority: index,
      declarationOrder: index,
      direction: {
        entrance: { type: "minimum-jerk" as const, durationFrames: 2 },
        source: "freeze" as const,
      },
    }));
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(plan, registries);
    let historyReads = 0;
    const evaluate = (frame: number) =>
      evaluateCameraOutput(
        {
          program,
          outputId: "main",
          frame,
          subjectFrame: createSubjectFrame(frame),
          mode: "render",
          subjectFrameAt: (at) => {
            historyReads++;
            return createSubjectFrame(at);
          },
        },
        registries,
      );
    const last = evaluate(count - 1);
    expect(historyReads).toBe(count - 1);
    expect(last.pose).toEqual(evaluate(0).pose);
  });

  it("keeps velocity interruption history work linear rather than branching", () => {
    const plan = directedPlan();
    const count = 500;
    plan.durationInFrames = count + 2;
    plan.shots = Array.from({ length: count }, (_, index) => ({
      ...plan.shots[0],
      id: `velocity-${index}`,
      startFrame: index,
      endFrame: index + 3,
      priority: index,
      declarationOrder: index,
      direction: {
        entrance: { type: "minimum-jerk" as const, durationFrames: 3 },
        source: "freeze" as const,
        framing: "hold" as const,
        continuity: "velocity" as const,
      },
    }));
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(plan, registries);
    let reads = 0;
    const result = evaluateCameraOutput(
      {
        program,
        frame: count - 1,
        outputId: "main",
        subjectFrame: createSubjectFrame(count - 1),
        subjectFrameAt: (frame) => {
          reads++;
          return createSubjectFrame(frame);
        },
        mode: "render",
      },
      registries,
    );
    expect(Number.isFinite(result.pose.scale)).toBe(true);
    expect(reads).toBeLessThan(count * 4);
  });

  it.each(["hold", "follow-position"] as const)(
    "%s ignores resizing and clipping when fitting",
    (framing) => {
      const plan = directedPlan();
      plan.shots[0].direction = { entrance: { type: "cut" }, framing };
      const registries = createBuiltinCameraRegistries();
      const program = prepareCameraPlan(plan, registries);
      const geometry = (frame: number) => {
        const value = createSubjectFrame(frame);
        if (frame > 60)
          value.subjects = value.subjects.map((subject, index) =>
            index === 0
              ? subject
              : {
                  ...subject,
                  worldRect: { x: 292, y: 900, width: 360, height: 180 },
                  clippedWorldRect: { x: 292, y: 900, width: 360, height: 20 },
                },
          );
        return value;
      };
      const evaluate = (frame: number) =>
        evaluateCameraOutput(
          {
            program,
            outputId: "main",
            frame,
            subjectFrame: geometry(frame),
            subjectFrameAt: geometry,
            mode: "render",
          },
          registries,
        );
      const later = evaluate(100);
      const initial = evaluate(60);
      expect(later.pose.scale).toBe(initial.pose.scale);
      if (framing === "hold") expect(later.pose).toEqual(initial.pose);
      else {
        expect(later.pose.centerX).toBe(472);
        expect(later.pose.centerY - initial.pose.centerY).toBeCloseTo(990 - 852);
      }
      expect(evaluate(100)).toEqual(later);
    },
  );

  it("rejects phone mounts that would defeat stable framing", () => {
    const plan = createPlan();
    plan.shots[0].direction = { entrance: { type: "cut" }, framing: "hold" };
    expect(() => prepareCameraPlan(plan, createBuiltinCameraRegistries())).toThrow(
      "CAM_STABLE_FRAMING_CONSTRAINT_CONFLICT",
    );
    plan.shots[0].direction = {
      entrance: { type: "minimum-jerk", durationFrames: 12 },
      source: "freeze",
    };
    expect(() => prepareCameraPlan(plan, createBuiltinCameraRegistries())).toThrow(
      "CAM_FROZEN_SOURCE_CONSTRAINT_CONFLICT",
    );
  });

  it("cuts, holds, pushes, then holds on a shot-local clock, independent of render order", () => {
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(directedPlan(), registries);
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
    const frames = [60, 70, 80, 110, 140, 170, 179];
    const sequential = frames.map(evaluate);
    for (const frame of [179, 80, 60, 170, 110, 70, 140]) {
      expect(evaluate(frame)).toEqual(sequential[frames.indexOf(frame)]);
    }
    expect(sequential[0].pose).toEqual(sequential[2].pose);
    expect(sequential[3].pose.scale / sequential[0].pose.scale).toBeCloseTo(Math.sqrt(1.5));
    expect(sequential[4].pose.scale / sequential[0].pose.scale).toBeCloseTo(1.5);
    expect(sequential[4].pose).toEqual(sequential[6].pose);
    expect(sequential[0].trace.transition?.durationFrames).toBe(0);
    expect(cameraQualitySample(sequential[0]).intentionalDiscontinuity).toBe(true);
    expect(cameraQualitySample(sequential[1]).intentionalDiscontinuity).toBe(false);
  });

  it("preserves an explicit critically damped entrance independently of the push", () => {
    const plan = directedPlan();
    plan.shots[0].direction!.entrance = { type: "critically-damped", responseFrames: 12 };
    const registries = createBuiltinCameraRegistries();
    const program = prepareCameraPlan(plan, registries);
    const result = evaluateCameraOutput(
      {
        program,
        outputId: "main",
        frame: 66,
        subjectFrame: createSubjectFrame(66),
        mode: "render",
      },
      registries,
    );
    expect(result.trace.transition?.curve).toBe("critically-damped");
    expect(result.trace.transition?.durationFrames).toBe(12);
    expect(result.trace.bakedTrajectory?.progress).toBeGreaterThan(0);
  });

  it("selects the texture backend for an explicit whip entrance", () => {
    const plan = directedPlan();
    plan.shots[0].direction!.entrance = { type: "whip", direction: "left", durationFrames: 12 };
    expect(
      prepareCameraPlan(plan, createBuiltinCameraRegistries()).projectionBackendRequirement,
    ).toBe("texture");
  });

  it("starts the next blend from the outgoing shot's completed local movement", () => {
    const plan = directedPlan();
    plan.shots = [
      ...plan.shots,
      {
        ...plan.shots[0],
        id: "return",
        startFrame: 180,
        endFrame: 240,
        rigId: "establishing",
        declarationOrder: 1,
        direction: { entrance: { type: "minimum-jerk", durationFrames: 12 } },
      },
    ];
    const registries = createBuiltinCameraRegistries();
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
    expect(evaluate(180).pose).toEqual(evaluate(179).pose);
    expect(evaluate(186).pose.scale).toBeLessThan(evaluate(180).pose.scale);
  });

  it("rejects ambiguous or invalid shot-local movement", () => {
    const registries = createBuiltinCameraRegistries();
    for (const frames of [
      [1, 20],
      [0, 0],
      [0, 120],
      [0, 50, 20],
    ]) {
      const plan = directedPlan();
      plan.shots[0].direction!.movement = {
        interpolation: "linear",
        keyframes: frames.map((frame) => ({
          frame,
          offsetX: 0,
          offsetY: 0,
          scaleMultiplier: 1,
          rotationOffsetDeg: 0,
        })),
      };
      expect(() => prepareCameraPlan(plan, registries)).toThrow("CAM_MOVEMENT_TIMELINE_INVALID");
    }
    const conflict = directedPlan();
    conflict.shots[0].blendIn = { durationFrames: 10, curve: "linear" };
    expect(() => prepareCameraPlan(conflict, registries)).toThrow("CAM_DIRECTION_LEGACY_CONFLICT");
    const oversized = directedPlan();
    oversized.shots[0].direction!.entrance = { type: "minimum-jerk", durationFrames: 121 };
    expect(() => prepareCameraPlan(oversized, registries)).toThrow("CAM_ENTRANCE_OUT_OF_RANGE");
  });
});

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
  it("fits rotated padded subjects inside the editorial viewport", () => {
    const viewport = { x: 100, y: 200, width: 1080, height: 1920 };
    const bounds = { x: 300, y: 400, width: 200, height: 1200 };
    for (const rotationDeg of [0, 30, 90, -135, 270, 720]) {
      const pose = solveComposer({
        subjectBounds: bounds,
        viewport,
        editorialInsets: { top: 80, right: 60, bottom: 120, left: 40 },
        rotationDeg,
        composer: {
          screenPosition: [0.5, 0.5],
          targetFill: 1,
          fillMode: "contain",
          paddingPx: 20,
        },
      });
      const matrix = cameraPoseToViewMatrix(pose);
      for (const x of [bounds.x - 20, bounds.x + bounds.width + 20]) {
        for (const y of [bounds.y - 20, bounds.y + bounds.height + 20]) {
          const point = applyMatrix3(matrix, { x, y });
          expect(point.x).toBeGreaterThanOrEqual(140 - 1e-8);
          expect(point.x).toBeLessThanOrEqual(1120 + 1e-8);
          expect(point.y).toBeGreaterThanOrEqual(280 - 1e-8);
          expect(point.y).toBeLessThanOrEqual(2000 + 1e-8);
        }
      }
    }
  });

  it("takes the shortest rotation path after multiple signed turns", () => {
    const pose = {
      centerX: 0,
      centerY: 0,
      scale: 1,
      rotationDeg: 0,
      opacity: 1,
      clipRect: { x: 0, y: 0, width: 1080, height: 1920 },
    };
    for (const [from, to, delta] of [
      [1080, 10, 10],
      [0, -710, 10],
      [-1080, -10, -10],
    ]) {
      const mid = interpolateCameraPose(
        { ...pose, rotationDeg: from },
        { ...pose, rotationDeg: to },
        0.5,
        "linear",
      );
      expect(mid.rotationDeg).toBeCloseTo(from + delta / 2, 8);
    }
  });

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

  it("follows a detail target without dragging its physical device beyond the mount dead zone", () => {
    const viewport = { x: 0, y: 0, width: 1080, height: 1920 };
    const device = { x: 270, y: 360, width: 540, height: 1172 };
    const pose = solveComposer({
      subjectBounds: { x: 330, y: 1220, width: 410, height: 88 },
      mountBounds: device,
      mountScreenPosition: [0.5, 0.5],
      mountMaxDriftPx: [54, 72],
      viewport,
      composer: {
        screenPosition: [0.5, 0.62],
        targetFill: 0.68,
        fillMode: "width",
        maxScale: 1.4,
      },
      rotationDeg: 2,
    });
    const projectedDeviceCenter = applyMatrix3(cameraPoseToViewMatrix(pose), {
      x: device.x + device.width / 2,
      y: device.y + device.height / 2,
    });

    expect(Math.abs(projectedDeviceCenter.x - 540)).toBeLessThanOrEqual(54 + 1e-8);
    expect(Math.abs(projectedDeviceCenter.y - 960)).toBeLessThanOrEqual(72 + 1e-8);
    expect(pose.scale).toBeGreaterThan(1);
  });

  it("composes inside explicit output editorial-frame insets", () => {
    const viewport = { x: 0, y: 0, width: 1080, height: 1920 };
    const subject = { x: 100, y: 200, width: 400, height: 800 };
    const pose = solveComposer({
      subjectBounds: subject,
      viewport,
      editorialInsets: { top: 120, right: 80, bottom: 160, left: 80 },
      composer: {
        screenPosition: [0.5, 0.5],
        targetFill: 1,
        fillMode: "contain",
      },
    });
    const projectedCenter = applyMatrix3(cameraPoseToViewMatrix(pose), {
      x: subject.x + subject.width / 2,
      y: subject.y + subject.height / 2,
    });

    expect(projectedCenter.x).toBeCloseTo(540, 8);
    expect(projectedCenter.y).toBeCloseTo(940, 8);
    expect(pose.clipRect).toEqual(viewport);
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

  it("precomputes compact JSON-safe definition and interval indexes", () => {
    const program = prepareCameraPlan(createPlan(), createBuiltinCameraRegistries());

    expect(program.version).toBe(2);
    expect(program.outputIndexById).toEqual({ main: 0 });
    expect(program.rigIndexById).toEqual({
      establishing: 0,
      "message-close": 1,
    });
    expect(program.lensIndexById).toEqual({ "typing-fisheye": 0 });
    expect(program.shotSegmentsByOutput.main).toEqual([
      { startFrame: 0, endFrame: 60, shotIndexes: [] },
      { startFrame: 60, endFrame: 180, shotIndexes: [0] },
      { startFrame: 180, endFrame: 240, shotIndexes: [] },
    ]);
    expect(program.coverageByOutput.main).toEqual({
      policy: "allow-default",
      gaps: [
        { startFrame: 0, endFrame: 60 },
        { startFrame: 180, endFrame: 240 },
      ],
    });
    expect(JSON.parse(JSON.stringify(program))).toEqual(program);
  });

  it("fails preparation when an output requires complete shot coverage", () => {
    const plan = createPlan();
    plan.outputs = plan.outputs.map((output) => ({
      ...output,
      coveragePolicy: "require-shots",
      compositionProfileId: "hero-device",
    }));

    expect(() => prepareCameraPlan(plan, createBuiltinCameraRegistries())).toThrowError(
      /CAM_OUTPUT_COVERAGE_GAP/,
    );
  });

  it("uses collision-safe subject identities and rejects duplicate group members", () => {
    expect(
      cinematicSubjectKey({
        kind: "semantic",
        deviceId: "a:b",
        appId: "c",
        subjectId: "d",
      }),
    ).not.toBe(
      cinematicSubjectKey({
        kind: "semantic",
        deviceId: "a",
        appId: "b:c",
        subjectId: "d",
      }),
    );

    const source = createPlan();
    const invalid: CameraPlanIR = {
      ...source,
      rigs: source.rigs.map((rig) =>
        rig.id === "message-close"
          ? {
              ...rig,
              subject: {
                kind: "group" as const,
                members: [messageSubject, messageSubject],
              },
            }
          : rig,
      ),
    };
    try {
      prepareCameraPlan(invalid, createBuiltinCameraRegistries());
      throw new Error("Expected duplicate group member validation to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(CameraPreparationError);
      expect((error as CameraPreparationError).diagnostics[0]?.code).toBe(
        "CAM_SUBJECT_GROUP_MEMBER_DUPLICATE",
      );
    }
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

  it("evaluates compact baked trajectories without previous-frame state", () => {
    const registries = createBuiltinCameraRegistries();
    const baselinePlan = createPlan();
    const trajectoryPlan = createPlan();
    baselinePlan.rigs = baselinePlan.rigs.map((rig) =>
      rig.id === "message-close"
        ? {
            ...rig,
            travel: {
              mode: "intentional" as const,
              reason: "Trajectory fixture verifies authored device travel.",
            },
          }
        : rig,
    );
    trajectoryPlan.rigs = trajectoryPlan.rigs.map((rig) =>
      rig.id === "message-close"
        ? {
            ...rig,
            travel: {
              mode: "intentional" as const,
              reason: "Trajectory fixture verifies authored device travel.",
            },
            bakedTrajectory: {
              interpolation: "minimum-jerk" as const,
              keyframes: [
                {
                  frame: 60,
                  offsetX: 0,
                  offsetY: 0,
                  scaleMultiplier: 1,
                  rotationOffsetDeg: 0,
                },
                {
                  frame: 120,
                  offsetX: 100,
                  offsetY: -40,
                  scaleMultiplier: 2,
                  rotationOffsetDeg: 10,
                },
              ],
            },
          }
        : rig,
    );
    const baseline = evaluateCameraOutput(
      {
        program: prepareCameraPlan(baselinePlan, registries),
        outputId: "main",
        frame: 90,
        subjectFrame: createSubjectFrame(90),
        mode: "render",
      },
      registries,
    );
    const evaluated = evaluateCameraOutput(
      {
        program: prepareCameraPlan(trajectoryPlan, registries),
        outputId: "main",
        frame: 90,
        subjectFrame: createSubjectFrame(90),
        mode: "render",
      },
      registries,
    );

    expect(evaluated.pose.centerX).toBeCloseTo(baseline.pose.centerX + 50, 8);
    expect(evaluated.pose.centerY).toBeCloseTo(baseline.pose.centerY - 20, 8);
    expect(evaluated.pose.scale).toBeCloseTo(baseline.pose.scale * Math.sqrt(2), 8);
    expect(evaluated.pose.rotationDeg).toBeCloseTo(baseline.pose.rotationDeg + 5, 8);
    expect(evaluated.trace.bakedTrajectory).toEqual({
      interpolation: "minimum-jerk",
      fromFrame: 60,
      toFrame: 120,
      progress: 0.5,
    });
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

  it("reports a missing framing guard through a stable evaluation diagnostic", () => {
    const registries = createBuiltinCameraRegistries();
    const source = createPlan();
    const program = prepareCameraPlan(
      {
        ...source,
        rigs: source.rigs.map((rig) =>
          rig.id === "message-close"
            ? {
                ...rig,
                framingGuard: {
                  subject: {
                    kind: "device" as const,
                    deviceId: "phone",
                    subjectId: "body",
                  },
                },
              }
            : rig,
        ),
      },
      registries,
    );

    try {
      evaluateCameraOutput(
        {
          program,
          outputId: "main",
          frame: 90,
          subjectFrame: createSubjectFrame(90),
          mode: "render",
        },
        registries,
      );
      throw new Error("Expected camera evaluation to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(CameraEvaluationError);
      expect((error as CameraEvaluationError).diagnostics[0]?.code).toBe(
        "CAM_FRAMING_GUARD_SUBJECT_MISSING",
      );
    }
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
