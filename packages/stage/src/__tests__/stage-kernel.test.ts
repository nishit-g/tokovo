import { describe, expect, it } from "vitest";
import type { StageProgramIR } from "@tokovo/ir";
import {
  StagePreparationError,
  evaluateStageFrame,
  prepareStageProgram,
  projectCinematicSubjects,
} from "../index.js";

function createProgram(): StageProgramIR {
  return {
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
      {
        id: "phone",
        parentId: "root",
        source: { kind: "device", deviceId: "phone" },
        localBounds: { x: 0, y: 0, width: 393, height: 852 },
        initialTransform: { a: 1, b: 0, c: 0, d: 1, tx: 100, ty: 200 },
        zIndex: 1,
      },
    ],
    transformKeyframes: [
      {
        frame: 60,
        nodeId: "phone",
        transform: { a: 0.8, b: 0, c: 0, d: 0.8, tx: 500, ty: 400 },
        interpolation: "minimum-jerk",
      },
    ],
  };
}

describe("stage preparation", () => {
  it("sorts declarations into a stable signature and rejects parent cycles", () => {
    const source = createProgram();
    const reordered = { ...source, nodes: [...source.nodes].reverse() };
    expect(prepareStageProgram(source).signature).toBe(prepareStageProgram(reordered).signature);

    const cyclic: StageProgramIR = {
      ...source,
      nodes: source.nodes.map((node) =>
        node.id === "root" ? { ...node, parentId: "phone" } : node,
      ),
    };
    expect(() => prepareStageProgram(cyclic)).toThrow(StagePreparationError);
  });

  it("does not treat inherited record keys as declared stage nodes", () => {
    const source = createProgram();
    expect(() =>
      prepareStageProgram({
        ...source,
        rootNodeId: "constructor",
      }),
    ).toThrowError(
      expect.objectContaining({
        diagnostics: expect.arrayContaining([
          expect.objectContaining({ code: "STAGE_ROOT_MISSING" }),
        ]),
      }),
    );
  });

  it("precomputes compact keyframe and paint indexes as JSON-safe data", () => {
    const prepared = prepareStageProgram(createProgram());
    expect(prepared.version).toBe(2);
    expect(prepared.keyframeIndexesByNode).toEqual({ phone: [0], root: [] });
    expect(prepared.paintOrder).toEqual(["root", "phone"]);
    expect(JSON.parse(JSON.stringify(prepared))).toEqual(prepared);
  });
});

describe("stage evaluation", () => {
  it("interpolates independently of frame evaluation order", () => {
    const prepared = prepareStageProgram(createProgram());
    const sequential = [0, 15, 30, 45, 60].map((frame) => evaluateStageFrame(prepared, frame));
    for (const frame of [60, 15, 45, 0, 30]) {
      expect(evaluateStageFrame(prepared, frame)).toEqual(
        sequential.find((entry) => entry.frame === frame),
      );
    }
    const midpoint = evaluateStageFrame(prepared, 30).nodes.find((node) => node.id === "phone");
    expect(midpoint?.localTransform.tx).toBeCloseTo(300, 8);
    expect(midpoint?.localTransform.ty).toBeCloseTo(300, 8);
  });

  it("projects exact local subject geometry through the evaluated stage", () => {
    const frame = evaluateStageFrame(prepareStageProgram(createProgram()), 0);
    const [subject] = projectCinematicSubjects(frame, [
      {
        ref: {
          kind: "entity",
          deviceId: "phone",
          appId: "app_whatsapp",
          entityType: "message",
          entityId: "m1",
          region: "bubble",
        },
        localRect: { x: 20, y: 30, width: 200, height: 80 },
        textSizePx: 17,
        nodeId: "phone",
        visible: true,
        sourceVersion: 1,
        provenance: { ownerId: "test", regionId: "message" },
      },
    ]);
    expect(subject.worldRect).toEqual({
      x: 120,
      y: 230,
      width: 200,
      height: 80,
    });
    expect(subject.worldTextSizePx).toBe(17);
    const scaled = {
      ...frame,
      nodes: frame.nodes.map((node) => ({
        ...node,
        worldTransform: { a: 0, b: 2, c: -0.5, d: 0, tx: 0, ty: 0 },
      })),
    };
    expect(projectCinematicSubjects(scaled, [subject])[0].worldTextSizePx).toBe(8.5);
  });

  it("clips subjects through the same stage node geometry used for painting", () => {
    const source = createProgram();
    const prepared = prepareStageProgram({
      ...source,
      nodes: source.nodes.map((node) =>
        node.id === "phone" ? { ...node, clip: { x: 0, y: 0, width: 100, height: 100 } } : node,
      ),
    });
    const frame = evaluateStageFrame(prepared, 0);
    const [partial, hidden] = projectCinematicSubjects(frame, [
      {
        ref: { kind: "device", deviceId: "phone", subjectId: "partial" },
        localRect: { x: 80, y: 80, width: 50, height: 50 },
        nodeId: "phone",
        visible: true,
        sourceVersion: 1,
        provenance: { ownerId: "test", regionId: "partial" },
      },
      {
        ref: { kind: "device", deviceId: "phone", subjectId: "hidden" },
        localRect: { x: 120, y: 120, width: 20, height: 20 },
        nodeId: "phone",
        visible: true,
        sourceVersion: 1,
        provenance: { ownerId: "test", regionId: "hidden" },
      },
    ]);

    expect(partial.visible).toBe(true);
    expect(partial.clippedWorldRect).toEqual({
      x: 180,
      y: 280,
      width: 20,
      height: 20,
    });
    expect(hidden.visible).toBe(false);
    expect(hidden.clippedWorldRect).toBeUndefined();
  });
});
